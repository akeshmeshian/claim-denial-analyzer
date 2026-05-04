import { NextRequest, NextResponse } from "next/server";
import { db, reportsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [report] = await db
      .select({
        id: reportsTable.id,
        email: reportsTable.email,
        claimType: reportsTable.claimType,
        paymentStatus: reportsTable.paymentStatus,
        aiPreview: reportsTable.aiPreview,
        aiFullReport: reportsTable.aiFullReport,
        createdAt: reportsTable.createdAt,
      })
      .from(reportsTable)
      .where(eq(reportsTable.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.paymentStatus !== "paid") {
      return NextResponse.json({
        id: report.id,
        email: report.email,
        claimType: report.claimType,
        paymentStatus: report.paymentStatus,
        aiPreview: report.aiPreview,
      });
    }

    return NextResponse.json({
      id: report.id,
      claimType: report.claimType,
      paymentStatus: report.paymentStatus,
      report: report.aiFullReport,
    });
  } catch (err) {
    console.error("Get report error:", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
