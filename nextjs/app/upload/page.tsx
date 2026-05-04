"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import { cn } from "@/lib/utils";

const CLAIM_TYPES = [
  "Homeowners Insurance",
  "Auto Insurance",
  "Health Insurance",
  "Commercial Property",
  "General Liability",
  "Life Insurance",
  "Disability Insurance",
  "Workers' Compensation",
  "Other",
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.gif,.tiff,.tif";

function FileDropzone({
  label,
  file,
  onFile,
  id,
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
  id: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-6 transition-colors",
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
        file ? "border-green-400 bg-green-50" : ""
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
      {file ? (
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm text-green-800 truncate">{file.name}</p>
            <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="font-medium text-sm text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, WebP, GIF, TIFF · max 25MB</p>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [claimType, setClaimType] = useState("");
  const [description, setDescription] = useState("");
  const [denialFile, setDenialFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !claimType || !description) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!denialFile) {
      setError("Please upload your denial letter.");
      return;
    }
    if (!policyFile) {
      setError("Please upload your insurance policy.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("email", email);
      form.append("claimType", claimType);
      form.append("claimDescription", description);
      form.append("denialFile", denialFile);
      form.append("policyFile", policyFile);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      router.push(`/result/${data.reportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Analyze Your Denial</h1>
          <p className="mt-2 text-gray-500">Upload your documents and let our AI find coverage arguments.</p>
        </div>

        <Disclaimer compact />

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-gray-400">Used to retrieve your report if you lose the link.</p>
          </div>

          {/* Claim Type */}
          <div>
            <label htmlFor="claimType" className="block text-sm font-semibold mb-1.5">
              Claim Type <span className="text-red-500">*</span>
            </label>
            <select
              id="claimType"
              required
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select claim type…</option>
              {CLAIM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-1.5">
              Briefly Describe Your Claim <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Water damage to my living room ceiling after a storm. Insurer denied citing normal wear and tear."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Denial File */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Denial Letter <span className="text-red-500">*</span>
            </label>
            <FileDropzone
              id="denial-file"
              label="Click or drag your denial letter here"
              file={denialFile}
              onFile={setDenialFile}
            />
            {denialFile && (
              <button
                type="button"
                onClick={() => setDenialFile(null)}
                className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" /> Remove file
              </button>
            )}
          </div>

          {/* Policy File */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Insurance Policy <span className="text-red-500">*</span>
            </label>
            <FileDropzone
              id="policy-file"
              label="Click or drag your insurance policy here"
              file={policyFile}
              onFile={setPolicyFile}
            />
            {policyFile && (
              <button
                type="button"
                onClick={() => setPolicyFile(null)}
                className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" /> Remove file
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing your documents…
              </>
            ) : (
              <>
                Analyze My Denial
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
          {loading && (
            <p className="text-center text-xs text-gray-400">
              This usually takes 1–3 minutes. Please don&apos;t close this tab.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
