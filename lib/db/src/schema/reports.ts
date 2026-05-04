import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  aiPreview: true,
  aiFullReport: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
