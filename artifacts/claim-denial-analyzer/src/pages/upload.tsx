import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, X, CheckCircle, Loader2, Image } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { useToast } from "@/hooks/use-toast";

const CLAIM_TYPES = [
  "Homeowners",
  "Auto",
  "Health",
  "Commercial Property",
  "General Liability",
  "Other",
];

interface UploadedFile {
  file: File;
  objectPath?: string;
  uploading?: boolean;
  done?: boolean;
  error?: string;
}

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

async function uploadToGcs(uploadURL: string, file: File, onProgress: (p: number) => void): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

function FileDropzone({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  testId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const ACCEPTED_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/tiff",
  ]);

  async function handleFile(file: File) {
    const mimeType = file.type || "";
    if (!ACCEPTED_TYPES.has(mimeType)) {
      onChange({ file, error: "Only PDF or image files (JPEG, PNG, WebP) are accepted" });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      onChange({ file, error: "File must be under 25MB" });
      return;
    }

    onChange({ file, uploading: true });
    setProgress(0);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      await uploadToGcs(uploadURL, file, setProgress);
      onChange({ file, objectPath, done: true });
    } catch (err) {
      onChange({ file, error: "Upload failed. Please try again." });
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        data-testid={testId}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.tiff,.tif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          data-testid={`${testId}-input`}
        />
        {!value ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-7 w-7" />
              <span className="text-muted-foreground/50 text-lg font-light">|</span>
              <Image className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium">Drop file here or click to browse</p>
            <p className="text-xs text-muted-foreground">PDF or image (JPEG, PNG, WebP) · Max 25MB</p>
          </div>
        ) : value.error ? (
          <div className="flex flex-col items-center gap-2 text-destructive">
            <X className="h-8 w-8" />
            <p className="text-sm font-medium">{value.error}</p>
            <button
              type="button"
              className="text-xs underline"
              onClick={(e) => { e.stopPropagation(); onChange(null); setProgress(0); }}
            >
              Try again
            </button>
          </div>
        ) : value.uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium">Uploading... {progress}%</p>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary">
            <CheckCircle className="h-8 w-8" />
            <p className="text-sm font-medium">{value.file.name}</p>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={(e) => { e.stopPropagation(); onChange(null); setProgress(0); }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [claimType, setClaimType] = useState("");
  const [claimDescription, setClaimDescription] = useState("");
  const [denialFile, setDenialFile] = useState<UploadedFile | null>(null);
  const [policyFile, setPolicyFile] = useState<UploadedFile | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !claimType || !claimDescription) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!denialFile?.done || !policyFile?.done) {
      toast({ title: "Files required", description: "Please upload both documents before continuing.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Agreement required", description: "Please agree to the disclaimer to continue.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          claimType,
          claimDescription,
          denialFileUrl: denialFile.objectPath,
          policyFileUrl: policyFile.objectPath,
        }),
      });

      if (!reportRes.ok) throw new Error("Failed to create report");
      const report = await reportRes.json();

      const analyzeRes = await fetch(`/api/reports/${report.id}/analyze`, { method: "POST" });
      if (!analyzeRes.ok) throw new Error("Analysis failed");

      navigate(`/preview/${report.id}`);
    } catch (err) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold" data-testid="upload-heading">Analyze Your Denial</h1>
          <p className="mt-2 text-muted-foreground">Upload your documents to get an AI-powered coverage review</p>
        </div>

        <Disclaimer compact />

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address <span className="text-destructive">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="claimType">Claim Type <span className="text-destructive">*</span></label>
            <select
              id="claimType"
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
              data-testid="select-claim-type"
            >
              <option value="">Select claim type...</option>
              {CLAIM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="claimDescription">Claim Description <span className="text-destructive">*</span></label>
            <textarea
              id="claimDescription"
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              placeholder="Briefly describe your claim — what happened, when it occurred, and why you believe it should be covered."
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
              data-testid="textarea-description"
            />
          </div>

          <FileDropzone
            label="Denial Letter (PDF or image) *"
            value={denialFile}
            onChange={setDenialFile}
            testId="dropzone-denial"
          />

          <FileDropzone
            label="Insurance Policy (PDF or image) *"
            value={policyFile}
            onChange={setPolicyFile}
            testId="dropzone-policy"
          />

          <div className="flex items-start gap-3">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              data-testid="checkbox-agree"
            />
            <label htmlFor="agree" className="text-sm text-muted-foreground">
              I understand this is <strong className="text-foreground">educational document analysis only</strong> — not legal advice, not insurance advice, and not a substitute for a licensed attorney, public adjuster, or insurance professional.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            data-testid="btn-generate-preview"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing your documents...
              </>
            ) : (
              "Generate Preview"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
