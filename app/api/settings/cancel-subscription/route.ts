import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa" }, { status: 400 });
  }

  try {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "canceled" },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    return NextResponse.json({ error: "Erro ao cancelar assinatura" }, { status: 500 });
  }
}
