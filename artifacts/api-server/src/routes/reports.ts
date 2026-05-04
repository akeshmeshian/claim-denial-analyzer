import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import {
  CreateReportBody,
  GetReportParams,
  AnalyzeReportParams,
  GetFullReportParams,
} from "@workspace/api-zod";
import { extractDocumentText } from "../lib/documentExtract";
import { analyzeClaimDenial, buildPreview } from "../lib/openaiAnalysis";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({
      email: parsed.data.email,
      claimType: parsed.data.claimType,
      claimDescription: parsed.data.claimDescription,
      denialFileUrl: parsed.data.denialFileUrl,
      policyFileUrl: parsed.data.policyFileUrl,
    })
    .returning();

  res.status(201).json(report);
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetReportParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

router.post("/reports/:id/analyze", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AnalyzeReportParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  if (report.aiPreview) {
    res.json({ reportId: report.id, preview: report.aiPreview });
    return;
  }

  try {
    let denialText = report.denialText;
    let policyText = report.policyText;

    if (!denialText && report.denialFileUrl) {
      const denialFile = await storage.getObjectEntityFile(report.denialFileUrl);
      const denialResp = await storage.downloadObject(denialFile);
      const buffer = Buffer.from(await denialResp.arrayBuffer());
      denialText = await extractDocumentText(buffer);
    }

    if (!policyText && report.policyFileUrl) {
      const policyFile = await storage.getObjectEntityFile(report.policyFileUrl);
      const policyResp = await storage.downloadObject(policyFile);
      const buffer = Buffer.from(await policyResp.arrayBuffer());
      policyText = await extractDocumentText(buffer);
    }

    if (!denialText || !policyText) {
      res.status(400).json({ error: "Documents could not be processed" });
      return;
    }

    const fullReport = await analyzeClaimDenial(
      report.claimType,
      report.claimDescription,
      denialText,
      policyText
    );

    const preview = buildPreview(fullReport);

    await db
      .update(reportsTable)
      .set({
        denialText,
        policyText,
        aiPreview: preview as unknown as Record<string, unknown>,
        aiFullReport: fullReport as unknown as Record<string, unknown>,
      })
      .where(eq(reportsTable.id, report.id));

    res.json({ reportId: report.id, preview });
  } catch (err) {
    req.log.error({ err }, "Analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

router.get("/reports/:id/full", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFullReportParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  if (report.paymentStatus !== "paid") {
    res.status(402).json({ error: "Payment required to access full report" });
    return;
  }

  res.json({
    reportId: report.id,
    paymentStatus: report.paymentStatus,
    report: report.aiFullReport,
  });
});

export default router;
