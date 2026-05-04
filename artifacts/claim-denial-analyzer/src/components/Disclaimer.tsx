import { AlertTriangle } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800" data-testid="disclaimer-compact">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          <strong>Not legal advice.</strong> This is educational document analysis only — not a substitute for a licensed attorney, public adjuster, or insurance professional.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5" data-testid="disclaimer-full">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-900">Important Disclaimer</p>
          <p className="mt-1 text-sm text-amber-800">
            This tool provides <strong>educational document analysis only</strong>. It is <strong>not legal advice</strong>, not insurance advice, and not a substitute for a licensed attorney, public adjuster, or insurance professional. Results are based solely on the documents you upload and should be reviewed by a qualified professional before taking any action.
          </p>
        </div>
      </div>
    </div>
  );
}
