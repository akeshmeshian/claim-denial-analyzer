import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, paymentsTable } from "@workspace/db";
import Stripe from "stripe";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const REPORT_PRICE_CENTS = 2900;

function getSiteUrl(): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domains) return `https://${domains}`;
  return "http://localhost:80";
}

router.post("/reports/:id/checkout", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, raw));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  if (report.paymentStatus === "paid") {
    const siteUrl = getSiteUrl();
    res.json({ url: `${siteUrl}/report/${report.id}` });
    return;
  }

  const siteUrl = getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Claim Denial Analysis Report",
              description: `Full AI-powered coverage analysis for ${report.claimType} claim`,
            },
            unit_amount: REPORT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: report.email,
      success_url: `${siteUrl}/report/${report.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/preview/${report.id}`,
      metadata: {
        reportId: report.id,
      },
    });

    await db
      .update(reportsTable)
      .set({ stripeSessionId: session.id })
      .where(eq(reportsTable.id, report.id));

    await db.insert(paymentsTable).values({
      reportId: report.id,
      stripeSessionId: session.id,
      amount: REPORT_PRICE_CENTS,
      currency: "usd",
      status: "pending",
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Stripe checkout creation failed");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post(
  "/stripe/webhook",
  async (req, res): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig,
          webhookSecret
        );
      } else {
        event = req.body as Stripe.Event;
        logger.warn("No webhook secret set — skipping signature verification");
      }
    } catch (err) {
      req.log.error({ err }, "Webhook signature verification failed");
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reportId = session.metadata?.reportId;

      if (reportId) {
        await db
          .update(reportsTable)
          .set({ paymentStatus: "paid" })
          .where(eq(reportsTable.id, reportId));

        await db
          .update(paymentsTable)
          .set({ status: "paid" })
          .where(eq(paymentsTable.stripeSessionId, session.id));

        logger.info({ reportId }, "Payment completed — report unlocked");
      }
    }

    res.json({ received: true });
  }
);

export default router;
