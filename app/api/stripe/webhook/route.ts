import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// A verificação de assinatura do Stripe depende do corpo cru e do crypto do
// Node; fixamos o runtime para o deploy nunca inferir edge por engano.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// O Stripe não copia a metadata da sessão de checkout para a assinatura.
// Por isso resolvemos o usuário por dois caminhos: a metadata (quando existe)
// e, como garantia, o stripeCustomerId que já gravamos ao criar o cliente.
async function resolverUserId(
  metadataUserId: string | undefined,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;

  const customerId = typeof customer === "string" ? customer : customer?.id;
  if (!customerId) return null;

  const registro = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return registro?.userId ?? null;
}

// Versões recentes da API movem current_period_end para o item da assinatura.
function fimDoPeriodo(sub: Stripe.Subscription): Date | undefined {
  const raiz = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = (sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)
    ?.current_period_end;
  const ts = raiz ?? item;
  return ts ? new Date(ts * 1000) : undefined;
}

// Erros que reenviar não resolve: o evento veio de outro ambiente (teste x live),
// o recurso não existe mais, ou o registro colide com outro. Devolver 500 nesses
// casos faz o Stripe repetir o mesmo evento até desativar o endpoint.
function ehErroPermanente(err: any): boolean {
  if (err?.type === "StripeInvalidRequestError") return true;
  if (err?.code === "P2025" || err?.code === "P2002") return true;
  return false;
}

async function salvarAssinatura(sub: Stripe.Subscription, metadataUserId?: string) {
  const userId = await resolverUserId(metadataUserId ?? sub.metadata?.userId, sub.customer);
  if (!userId) {
    console.error("Webhook: nao foi possivel identificar o usuario da assinatura", sub.id);
    return;
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const dados = {
    stripeSubscriptionId: sub.id,
    stripePriceId: sub.items?.data?.[0]?.price?.id,
    status: sub.status,
    currentPeriodEnd: fimDoPeriodo(sub),
  };

  // upsert em vez de update: se a linha ainda não existe (conta criada antes do
  // trial, base recriada), o update lançava P2025 e o webhook devolvia 500.
  await prisma.subscription.upsert({
    where: { userId },
    update: dados,
    create: { userId, stripeCustomerId: customerId ?? null, ...dados },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const segredo = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segredo) {
    console.error("Webhook: STRIPE_WEBHOOK_SECRET nao configurado neste ambiente");
    return NextResponse.json({ error: "Webhook nao configurado" }, { status: 500 });
  }
  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, segredo);
  } catch (err: any) {
    console.error("Webhook: assinatura invalida.", err?.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Disparado assim que o cliente conclui o pagamento. É aqui que a
      // metadata com o userId realmente existe.
      case "checkout.session.completed": {
        const sessao = event.data.object as Stripe.Checkout.Session;
        if (sessao.subscription) {
          const sub = await stripe.subscriptions.retrieve(sessao.subscription as string);
          await salvarAssinatura(sub, sessao.metadata?.userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await salvarAssinatura(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolverUserId(sub.metadata?.userId, sub.customer);
        if (userId) {
          // updateMany não estoura quando o registro não existe.
          await prisma.subscription.updateMany({
            where: { userId },
            data: { status: "canceled" },
          });
        }
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const fatura = event.data.object as Stripe.Invoice;
        const subId = (fatura as unknown as { subscription?: string | null }).subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const userId = await resolverUserId(sub.metadata?.userId, sub.customer);
          if (userId) {
            await prisma.subscription.updateMany({
              where: { userId },
              data: { status: event.type === "invoice.payment_failed" ? "past_due" : sub.status },
            });
          }
        }
        break;
      }
    }
  } catch (err: any) {
    if (ehErroPermanente(err)) {
      // Confirmamos o recebimento para o Stripe parar de reenviar: o problema
      // está no dado, não na entrega. Fica registrado no log para investigação.
      console.error("Webhook: evento descartado", event.id, event.type, err?.message);
      return NextResponse.json({ received: true, ignored: true });
    }
    // Falha transitória (banco fora do ar, timeout): 500 faz o Stripe reenviar.
    console.error("Webhook: falha ao processar", event.id, event.type, err?.message);
    return NextResponse.json({ error: "Falha ao processar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
