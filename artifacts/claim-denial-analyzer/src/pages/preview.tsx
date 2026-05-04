import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Lock, Loader2, AlertCircle, ShieldCheck, ChevronRight } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

interface Preview {
  denial_summary: string;
  first_argument: { title: string; argument: string; strength_level: string } | null;
  total_arguments: number;
}

interface ReportData {
  id: string;
  email: string;
  claimType: string;
  paymentStatus: string;
  aiPreview: Preview | null;
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

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const reportId = params.id;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/reports/${reportId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paymentStatus === "paid") {
          navigate(`/report/${reportId}`);
        } else {
          setReport(data);
        }
      })
      .catch(() => setError("Could not load report"))
      .finally(() => setLoading(false));
  }, [reportId, navigate]);

  async function handleUnlock() {
    if (!reportId) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/checkout`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch {
      setPaying(false);
    }
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
          <h1 className="text-xl font-bold">Report Not Found</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const preview = report.aiPreview;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold" data-testid="preview-heading">Your Analysis Preview</h1>
          <p className="mt-2 text-muted-foreground">
            Claim type: <strong>{report.claimType}</strong>
          </p>
        </div>

        <Disclaimer compact />

        <div className="mt-6 space-y-4">
          {/* Denial Summary — visible */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm" data-testid="preview-summary">
            <h2 className="text-lg font-semibold mb-3">Denial Summary</h2>
            <p className="text-sm text-foreground leading-relaxed">
              {preview?.denial_summary ?? "Analysis complete. Unlock to view."}
            </p>
          </div>

          {/* First argument — partially visible */}
          {preview?.first_argument && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm" data-testid="preview-first-argument">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Possible Coverage Argument #1</h2>
                <StrengthBadge level={preview.first_argument.strength_level} />
              </div>
              <p className="font-medium text-sm mb-1">{preview.first_argument.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{preview.first_argument.argument}</p>
              {preview.total_arguments > 1 && (
                <p className="mt-2 text-xs text-primary font-medium">
                  + {preview.total_arguments - 1} more argument{preview.total_arguments > 2 ? "s" : ""} in full report
                </p>
              )}
            </div>
          )}

          {/* Locked sections */}
          <div className="relative rounded-2xl border-2 border-dashed border-border overflow-hidden" data-testid="locked-sections">
            <div className="p-6 space-y-3 blur-sm select-none pointer-events-none">
              {["Key Policy Language", "All Coverage Arguments", "Exclusions & Limitations", "Questions to Ask", "Draft Response Message"].map((s) => (
                <div key={s} className="h-16 rounded-xl bg-muted/60 flex items-center px-4">
                  <p className="text-sm font-medium text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <Lock className="h-10 w-10 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-1">Full Report Locked</h3>
              <p className="text-sm text-muted-foreground mb-5 text-center px-6">
                Unlock your complete analysis including all arguments, policy citations, and your draft response message.
              </p>
              <button
                onClick={handleUnlock}
                disabled={paying}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-lg"
                data-testid="btn-unlock-report"
              >
                {paying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Unlock Full Report for $29
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-muted-foreground">Secure payment via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
