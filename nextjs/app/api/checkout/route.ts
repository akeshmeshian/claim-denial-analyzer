import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, reportsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSiteUrl } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json() as { reportId: string };

    if (!reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (report.paymentStatus === "paid") {
      const siteUrl = getSiteUrl();
      return NextResponse.json({ url: `${siteUrl}/result/${reportId}` });
    }

    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: report.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 2900,
            product_data: {
              name: "Claim Denial Analysis Report",
              description: `Full AI-powered coverage analysis for your ${report.claimType} claim`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { reportId },
      success_url: `${siteUrl}/result/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/result/${reportId}`,
    });

    await db
      .update(reportsTable)
      .set({ stripeSessionId: session.id })
      .where(eq(reportsTable.id, reportId));

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
