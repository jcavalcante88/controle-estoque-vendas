import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// Cria uma sessão de assinatura no Stripe.
// O trial de 60 dias é controlado pela nossa própria Subscription
// (ver lib/auth.ts); aqui o cliente assina para continuar após o período.
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: "STRIPE_PRICE_ID não configurado" }, { status: 500 });
    }

    let subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
    }

    let stripeCustomerId = subscription.stripeCustomerId;

    // O cliente salvo pode nao existir na conta atual: os catalogos de teste e
    // de producao sao separados, entao um ID criado em teste deixa de valer ao
    // migrar para live (e o cliente tambem pode ter sido removido no Stripe).
    if (stripeCustomerId) {
      try {
        const existente = await stripe.customers.retrieve(stripeCustomerId);
        if ((existente as Stripe.DeletedCustomer).deleted) stripeCustomerId = null;
      } catch {
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.subscription.update({
        where: { userId },
        // Zera tambem a assinatura antiga: ela pertencia ao cliente anterior.
        data: { stripeCustomerId, stripeSubscriptionId: null },
      });
    }

    // URL base para onde o Stripe devolve o cliente. NEXTAUTH_URL já aponta
    // para o ambiente correto (localhost em dev, domínio em produção); a origem
    // da requisição serve de rede de segurança se ela não estiver definida.
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    if (!/^https?:\/\//.test(baseUrl)) {
      return NextResponse.json(
        { error: "URL da aplicação inválida. Configure NEXTAUTH_URL com o endereço completo (https://...)" },
        { status: 500 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: { userId },
      // O Stripe nao copia a metadata acima para a assinatura criada;
      // sem isto o webhook nao consegue identificar o dono da assinatura.
      subscription_data: { metadata: { userId } },
      success_url: `${baseUrl}/dashboard?assinatura=sucesso`,
      cancel_url: `${baseUrl}/dashboard?assinatura=cancelada`,
    });

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar checkout" }, { status: 500 });
  }
}
