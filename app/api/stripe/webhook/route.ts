import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

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

async function salvarAssinatura(sub: Stripe.Subscription, metadataUserId?: string) {
  const userId = await resolverUserId(metadataUserId ?? sub.metadata?.userId, sub.customer);
  if (!userId) {
    console.error("Webhook: nao foi possivel identificar o usuario da assinatura", sub.id);
    return;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items?.data?.[0]?.price?.id,
      status: sub.status,
      currentPeriodEnd: fimDoPeriodo(sub),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
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
          await prisma.subscription.update({
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
            await prisma.subscription.update({
              where: { userId },
              data: { status: event.type === "invoice.payment_failed" ? "past_due" : sub.status },
            });
          }
        }
        break;
      }
    }
  } catch (err: any) {
    // Devolver 500 faz o Stripe reenviar o evento, evitando perda silenciosa.
    console.error("Webhook: falha ao processar", event.type, err?.message);
    return NextResponse.json({ error: "Falha ao processar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
