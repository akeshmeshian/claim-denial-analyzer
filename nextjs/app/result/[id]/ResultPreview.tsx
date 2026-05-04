"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import type { AnalysisPreview } from "@/lib/openai";

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

export default function ResultPreview({
  reportId,
  claimType,
  preview,
}: {
  reportId: string;
  claimType: string;
  preview: AnalysisPreview | null;
}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  async function handleUnlock() {
    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Your Analysis Preview</h1>
          <p className="mt-2 text-gray-500">
            Claim type: <strong>{claimType}</strong>
          </p>
        </div>

        <Disclaimer compact />

        <div className="mt-6 space-y-4">
          {/* Denial Summary */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Denial Summary</h2>
            <p className="text-sm leading-relaxed">
              {preview?.denial_summary ?? "Analysis complete. Unlock to view."}
            </p>
          </div>

          {/* First Argument */}
          {preview?.first_argument && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Possible Coverage Argument #1</h2>
                <StrengthBadge level={preview.first_argument.strength_level} />
              </div>
              <p className="font-medium text-sm mb-1">{preview.first_argument.title}</p>
              <p className="text-sm text-gray-500 line-clamp-3">{preview.first_argument.argument}</p>
              {preview.total_arguments > 1 && (
                <p className="mt-2 text-xs text-blue-600 font-medium">
                  + {preview.total_arguments - 1} more argument{preview.total_arguments > 2 ? "s" : ""} in full report
                </p>
              )}
            </div>
          )}

          {/* Locked sections */}
          <div className="relative rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden">
            <div className="p-6 space-y-3 blur-sm select-none pointer-events-none">
              {["Key Policy Language", "All Coverage Arguments", "Exclusions & Limitations", "Questions to Ask", "Draft Response Message"].map((s) => (
                <div key={s} className="h-16 rounded-xl bg-gray-100 flex items-center px-4">
                  <p className="text-sm font-medium text-gray-400">{s}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <Lock className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-bold mb-1">Full Report Locked</h3>
              <p className="text-sm text-gray-500 mb-5 text-center px-6">
                Unlock your complete analysis including all arguments, policy citations, and your draft response message.
              </p>
              <button
                onClick={handleUnlock}
                disabled={paying}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-lg"
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
              <p className="mt-3 text-xs text-gray-400">Secure payment via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
