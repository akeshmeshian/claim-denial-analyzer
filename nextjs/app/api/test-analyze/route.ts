import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, reportsTable } from "@/lib/db";
import { extractDocumentText } from "@/lib/document-extract";
import { analyzeClaimDenial, buildPreview } from "@/lib/openai";

export const maxDuration = 60;

const MAX_SIZE = 25 * 1024 * 1024;

async function readFileBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getTestToken(req: NextRequest): string | undefined {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/test_mode_auth=([^;]+)/);
  return match?.[1];
}

export async function POST(req: NextRequest) {
  const testPassword = process.env.TEST_MODE_PASSWORD;
  if (!testPassword) {
    return NextResponse.json({ error: "Test mode is not enabled." }, { status: 403 });
  }

  const token = getTestToken(req);
  if (!token || token !== testPassword) {
    return NextResponse.json({ error: "Unauthorized. Test mode authentication required." }, { status: 401 });
  }

  try {
    const form = await req.formData();

    const email = (form.get("email") as string | null)?.trim();
    const claimType = (form.get("claimType") as string | null)?.trim();
    const claimDescription = (form.get("claimDescription") as string | null)?.trim();
    const denialFile = form.get("denialFile") as File | null;
    const policyFile = form.get("policyFile") as File | null;

    if (!email || !claimType || !claimDescription) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!denialFile || !policyFile) {
      return NextResponse.json({ error: "Both files are required." }, { status: 400 });
    }
    if (denialFile.size > MAX_SIZE || policyFile.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be under 25MB." }, { status: 400 });
    }

    const [denialBuffer, policyBuffer] = await Promise.all([
      readFileBuffer(denialFile),
      readFileBuffer(policyFile),
    ]);

    const [denialText, policyText] = await Promise.all([
      extractDocumentText(denialBuffer),
      extractDocumentText(policyBuffer),
    ]);

    if (!denialText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the denial letter." }, { status: 400 });
    }
    if (!policyText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the policy document." }, { status: 400 });
    }

    const [report] = await db
      .insert(reportsTable)
      .values({
        email,
        claimType,
        claimDescription,
        denialText,
        policyText,
        paymentStatus: "test",
      })
      .returning({ id: reportsTable.id });

    const reportId = report.id;

    const analysisResult = await analyzeClaimDenial(claimType, claimDescription, denialText, policyText);
    const preview = buildPreview(analysisResult);

    await db
      .update(reportsTable)
      .set({ aiFullReport: analysisResult, aiPreview: preview })
      .where(eq(reportsTable.id, reportId));

    return NextResponse.json({ reportId, preview });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
