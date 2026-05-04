import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, reportsTable, paymentsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.reportId;

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId in metadata" }, { status: 400 });
    }

    if (session.payment_status === "paid") {
      await db
        .update(reportsTable)
        .set({ paymentStatus: "paid", stripeSessionId: session.id })
        .where(eq(reportsTable.id, reportId));

      await db.insert(paymentsTable).values({
        reportId,
        stripeSessionId: session.id,
        amount: session.amount_total ?? 2900,
        currency: session.currency ?? "usd",
        status: "paid",
      });
    }
  }

  return NextResponse.json({ received: true });
}
