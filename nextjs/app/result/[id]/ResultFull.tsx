"use client";

import { useState, useRef } from "react";
import {
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Target,
  AlertCircle,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/openai";

function StrengthBadge({ level }: { level: string }) {
  const colors =
    level === "Strong"
      ? "bg-green-100 text-green-700 border-green-200"
      : level === "Moderate"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors}`}>
      {level}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-semibold text-base">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export default function ResultFull({
  reportId,
  report,
  paymentStatus,
}: {
  reportId: string;
  report: AnalysisResult;
  paymentStatus: string;
}) {
  const reportRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!reportRef.current) return;
    const { default: html2pdf } = await import("html2pdf.js");
    html2pdf()
      .set({
        margin: 10,
        filename: `claim-denial-report-${reportId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" },
      })
      .from(reportRef.current)
      .save();
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <ShieldCheck className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Your Full Coverage Analysis</h1>
        {paymentStatus === "paid" && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-3.5 w-3.5" /> Payment Confirmed
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Report as PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-4">
        <Section title="Denial Summary" icon={FileText}>
          <p className="text-sm leading-relaxed">{report.denial_summary}</p>
        </Section>

        <Section title="Key Policy Language Found" icon={Target}>
          {report.key_policy_language.length === 0 ? (
            <p className="text-sm text-gray-500">No specific policy language identified.</p>
          ) : (
            <div className="space-y-4">
              {report.key_policy_language.map((item, i) => (
                <div key={i} className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <blockquote className="text-sm font-medium text-blue-900 border-l-4 border-blue-400 pl-3 italic">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-xs text-blue-800">{item.why_it_matters}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Possible Coverage Arguments" icon={ShieldCheck}>
          {report.possible_coverage_arguments.length === 0 ? (
            <p className="text-sm text-gray-500">No coverage arguments identified.</p>
          ) : (
            <div className="space-y-4">
              {report.possible_coverage_arguments.map((arg, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{arg.title}</p>
                    <StrengthBadge level={arg.strength_level} />
                  </div>
                  <p className="text-sm mb-2">{arg.argument}</p>
                  {arg.supporting_policy_language && (
                    <p className="text-xs text-gray-400 italic border-l-2 border-gray-200 pl-2">
                      {arg.supporting_policy_language}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Exclusions or Limitations the Insurer May Rely On" icon={AlertTriangle}>
          {report.insurer_exclusions_or_limitations.length === 0 ? (
            <p className="text-sm text-gray-500">No exclusions identified.</p>
          ) : (
            <div className="space-y-3">
              {report.insurer_exclusions_or_limitations.map((item, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <p className="font-semibold text-sm text-amber-900">{item.issue}</p>
                  <p className="text-xs text-amber-800 mt-1">{item.why_it_may_hurt_the_claim}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Weaknesses or Missing Information" icon={AlertCircle}>
          {report.weaknesses_or_missing_information.length === 0 ? (
            <p className="text-sm text-gray-500">No major weaknesses identified.</p>
          ) : (
            <ul className="space-y-2">
              {report.weaknesses_or_missing_information.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Questions to Ask Your Adjuster" icon={HelpCircle}>
          {report.questions_to_ask_adjuster.length === 0 ? (
            <p className="text-sm text-gray-500">No specific questions generated.</p>
          ) : (
            <ol className="space-y-2 list-decimal list-inside">
              {report.questions_to_ask_adjuster.map((q, i) => (
                <li key={i} className="text-sm">{q}</li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Draft Message to the Insurance Company" icon={MessageSquare}>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <pre className="text-sm whitespace-pre-wrap font-sans">{report.draft_message_to_insurer}</pre>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(report.draft_message_to_insurer)}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Copy to clipboard
          </button>
        </Section>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <strong>Disclaimer: </strong>
          {report.educational_disclaimer}
        </div>
      </div>
    </>
  );
}
