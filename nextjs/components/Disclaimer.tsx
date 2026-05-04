import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 flex gap-3",
        compact ? "p-3 text-xs" : "p-4 text-sm"
      )}
    >
      <AlertTriangle className={cn("text-amber-500 shrink-0 mt-0.5", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <p className="text-amber-800">
        <strong>Educational Use Only.</strong> This analysis is not legal advice. It does not guarantee
        coverage or a successful appeal. Always consult a licensed attorney or public adjuster for
        professional guidance.
      </p>
    </div>
  );
}
