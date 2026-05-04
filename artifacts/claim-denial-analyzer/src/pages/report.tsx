import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  Loader2,
  AlertCircle,
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
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

interface PolicyLanguage {
  quote: string;
  why_it_matters: string;
}
interface CoverageArgument {
  title: string;
  argument: string;
  supporting_policy_language: string;
  strength_level: string;
}
interface Exclusion {
  issue: string;
  why_it_may_hurt_the_claim: string;
}
interface FullReport {
  denial_summary: string;
  key_policy_language: PolicyLanguage[];
  possible_coverage_arguments: CoverageArgument[];
  insurer_exclusions_or_limitations: Exclusion[];
  weaknesses_or_missing_information: string[];
  questions_to_ask_adjuster: string[];
  draft_message_to_insurer: string;
  educational_disclaimer: string;
}

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
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
        data-testid={`section-toggle-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-base">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border">{children}</div>}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const reportId = params.id;
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<FullReport | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/reports/${reportId}/full`)
      .then(async (r) => {
        if (r.status === 402) {
          navigate(`/preview/${reportId}`);
          return null;
        }
        if (!r.ok) throw new Error("Could not load report");
        return r.json();
      })
      .then((data) => {
        if (data) {
          setReport(data.report as FullReport);
          setPaymentStatus(data.paymentStatus);
        }
      })
      .catch(() => setError("Could not load report"))
      .finally(() => setLoading(false));
  }, [reportId, navigate]);

  async function handleDownload() {
    if (!reportRef.current) return;
    const { default: html2pdf } = await import("html2pdf.js");
    html2pdf()
      .set({ margin: 10, filename: `claim-denial-report-${reportId}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4" } })
      .from(reportRef.current)
      .save();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold">Report Not Available</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold" data-testid="report-heading">Your Full Coverage Analysis</h1>
          {paymentStatus === "paid" && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
              <CheckCircle className="h-3.5 w-3.5" /> Payment Confirmed
            </div>
          )}
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/30 transition-colors"
            data-testid="btn-download-report"
          >
            <Download className="h-4 w-4" />
            Download Report as PDF
          </button>
        </div>

        <div ref={reportRef} className="space-y-4">
          <Disclaimer />

          {/* Denial Summary */}
          <Section title="Denial Summary" icon={FileText}>
            <p className="text-sm leading-relaxed" data-testid="report-denial-summary">{report.denial_summary}</p>
          </Section>

          {/* Key Policy Language */}
          <Section title="Key Policy Language Found" icon={Target}>
            {report.key_policy_language.length === 0 ? (
              <p className="text-sm text-muted-foreground">No specific policy language identified.</p>
            ) : (
              <div className="space-y-4">
                {report.key_policy_language.map((item, i) => (
                  <div key={i} className="rounded-lg bg-blue-50 border border-blue-200 p-4" data-testid={`policy-language-${i}`}>
                    <blockquote className="text-sm font-medium text-blue-900 border-l-4 border-blue-400 pl-3 italic">
                      "{item.quote}"
                    </blockquote>
                    <p className="mt-2 text-xs text-blue-800">{item.why_it_matters}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Coverage Arguments */}
          <Section title="Possible Coverage Arguments" icon={ShieldCheck}>
            {report.possible_coverage_arguments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No coverage arguments identified.</p>
            ) : (
              <div className="space-y-4">
                {report.possible_coverage_arguments.map((arg, i) => (
                  <div key={i} className="rounded-lg border border-border p-4" data-testid={`coverage-argument-${i}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{arg.title}</p>
                      <StrengthBadge level={arg.strength_level} />
                    </div>
                    <p className="text-sm text-foreground mb-2">{arg.argument}</p>
                    {arg.supporting_policy_language && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                        {arg.supporting_policy_language}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Exclusions */}
          <Section title="Exclusions or Limitations the Insurer May Rely On" icon={AlertTriangle}>
            {report.insurer_exclusions_or_limitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exclusions identified.</p>
            ) : (
              <div className="space-y-3">
                {report.insurer_exclusions_or_limitations.map((item, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-4" data-testid={`exclusion-${i}`}>
                    <p className="font-semibold text-sm text-amber-900">{item.issue}</p>
                    <p className="text-xs text-amber-800 mt-1">{item.why_it_may_hurt_the_claim}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Weaknesses */}
          <Section title="Weaknesses or Missing Information" icon={AlertCircle}>
            {report.weaknesses_or_missing_information.length === 0 ? (
              <p className="text-sm text-muted-foreground">No major weaknesses identified.</p>
            ) : (
              <ul className="space-y-2">
                {report.weaknesses_or_missing_information.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" data-testid={`weakness-${i}`}>
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Questions to Ask */}
          <Section title="Questions to Ask Your Adjuster" icon={HelpCircle}>
            {report.questions_to_ask_adjuster.length === 0 ? (
              <p className="text-sm text-muted-foreground">No specific questions generated.</p>
            ) : (
              <ol className="space-y-2 list-decimal list-inside">
                {report.questions_to_ask_adjuster.map((q, i) => (
                  <li key={i} className="text-sm" data-testid={`question-${i}`}>{q}</li>
                ))}
              </ol>
            )}
          </Section>

          {/* Draft Message */}
          <Section title="Draft Message to the Insurance Company" icon={MessageSquare}>
            <div className="rounded-lg bg-muted/40 border border-border p-4">
              <pre className="text-sm whitespace-pre-wrap font-sans" data-testid="draft-message">
                {report.draft_message_to_insurer}
              </pre>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(report.draft_message_to_insurer)}
              className="mt-3 text-xs text-primary hover:underline"
              data-testid="btn-copy-draft"
            >
              Copy to clipboard
            </button>
          </Section>

          {/* Final Disclaimer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800" data-testid="final-disclaimer">
            <strong>Disclaimer: </strong>
            {report.educational_disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
