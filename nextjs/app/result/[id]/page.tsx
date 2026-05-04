import { notFound } from "next/navigation";
import { db, reportsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { AnalysisResult, AnalysisPreview } from "@/lib/openai";
import Disclaimer from "@/components/Disclaimer";
import ResultPreview from "./ResultPreview";
import ResultFull from "./ResultFull";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, id))
    .limit(1);

  if (!report) notFound();

  if (report.paymentStatus !== "paid" && report.paymentStatus !== "test") {
    return (
      <ResultPreview
        reportId={id}
        claimType={report.claimType}
        preview={report.aiPreview as AnalysisPreview | null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <Disclaimer />
        <ResultFull
          reportId={id}
          report={report.aiFullReport as AnalysisResult}
          paymentStatus={report.paymentStatus}
        />
      </div>
    </div>
  );
}
