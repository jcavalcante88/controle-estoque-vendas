import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Cria uma sessão de assinatura no Stripe.
// O cartão é coletado AGORA, mas a primeira cobrança só acontece
// depois de 15 dias (trial_period_days), exatamente como Netflix/Spotify fazem.
export async function POST() {
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
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId },
      });
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?assinatura=sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?assinatura=cancelada`,
    });

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar checkout" }, { status: 500 });
  }
}
