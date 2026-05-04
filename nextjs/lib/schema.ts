import { pgTable, text, uuid, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const reportsTable = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  claimType: text("claim_type").notNull(),
  claimDescription: text("claim_description").notNull(),
  denialFileUrl: text("denial_file_url"),
  policyFileUrl: text("policy_file_url"),
  denialText: text("denial_text"),
  policyText: text("policy_text"),
  aiPreview: jsonb("ai_preview"),
  aiFullReport: jsonb("ai_full_report"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull(),
  stripeSessionId: text("stripe_session_id"),
  amount: integer("amount"),
  currency: text("currency"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Report = typeof reportsTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
