import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

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

  const subscription = event.data.object as Stripe.Subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const userId = subscription.metadata.userId;
      if (userId) {
        const status = subscription.status === "active" ? "active" : subscription.status;
        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;

    case "customer.subscription.deleted":
      const userIdDeleted = subscription.metadata.userId;
      if (userIdDeleted) {
        await prisma.subscription.update({
          where: { userId: userIdDeleted },
          data: { status: "canceled" },
        });
      }
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userIdInvoice = sub.metadata.userId;
        if (userIdInvoice) {
          await prisma.subscription.update({
            where: { userId: userIdInvoice },
            data: { status: "active" },
          });
        }
      }
      break;

    case "invoice.payment_failed":
      const invoiceFailed = event.data.object as Stripe.Invoice;
      if (invoiceFailed.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoiceFailed.subscription as string);
        const userIdFailed = sub.metadata.userId;
        if (userIdFailed) {
          await prisma.subscription.update({
            where: { userId: userIdFailed },
            data: { status: "past_due" },
          });
        }
      }
      break;
  }

  return NextResponse.json({ received: true });
}
