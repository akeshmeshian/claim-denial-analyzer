import Link from "next/link";
import {
  Shield,
  Upload,
  Brain,
  FileText,
  CheckCircle,
  ChevronRight,
  Lock,
  Star,
} from "lucide-react";
import Disclaimer from "@/components/Disclaimer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 py-20 px-4">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 mb-6 border border-white/20">
            <Star className="h-4 w-4 text-yellow-400" />
            AI-Powered Coverage Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Insurance claim denied? Upload your denial letter and policy to get possible coverage
            arguments in minutes.
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
            Get a structured report with policy language, possible appeal points, weaknesses, and a
            draft message to your adjuster.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-lg"
            >
              Analyze My Denial
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">$29 per full report · No subscription required</p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 pt-10">
        <Disclaimer />
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-gray-500">Three simple steps to understand your denial</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                step: "1",
                title: "Upload Your Denial Letter",
                desc: "Upload the denial letter you received from your insurer as a PDF or image (JPEG, PNG, WebP, and more).",
              },
              {
                icon: FileText,
                step: "2",
                title: "Upload Your Insurance Policy",
                desc: "Upload your full insurance policy document so we can cross-reference the denial.",
              },
              {
                icon: Brain,
                step: "3",
                title: "Get a Structured Report",
                desc: "Receive an AI-generated analysis with coverage arguments, policy citations, and a draft response.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="mt-3 text-gray-500">One report, one price. No subscriptions.</p>
          <div className="mt-8 rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg">
            <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">Launch Price</div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">$29</span>
              <span className="text-gray-500">/ report</span>
            </div>
            <ul className="mt-6 space-y-3 text-left">
              {[
                "AI analysis of your denial letter & policy",
                "Possible coverage arguments with strength ratings",
                "Exact policy language citations",
                "Weaknesses & questions to ask your adjuster",
                "Draft message to your insurance company",
                "Downloadable PDF report",
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/upload"
              className="mt-8 block w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors text-center"
            >
              Get Started for $29
            </Link>
          </div>
        </div>
      </section>

      {/* What's in the report */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">What&apos;s in Your Report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Denial Summary", desc: "Plain-English explanation of why your claim was denied." },
              { title: "Key Policy Language", desc: "Exact quotes from your policy that may be relevant." },
              {
                title: "Possible Coverage Arguments",
                desc: "Potential arguments in your favor, rated Weak / Moderate / Strong.",
              },
              {
                title: "Insurer Exclusions & Limitations",
                desc: "What the insurer may rely on to uphold the denial.",
              },
              {
                title: "Weaknesses & Missing Information",
                desc: "Gaps in your claim that could hurt your case.",
              },
              {
                title: "Questions to Ask Your Adjuster",
                desc: "Specific questions to get clearer answers from your insurer.",
              },
              {
                title: "Draft Response Message",
                desc: "A ready-to-send message to your insurance company.",
              },
              {
                title: "Downloadable PDF",
                desc: "Export your full report to share with an attorney or adjuster.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this legal or insurance advice?",
                a: "No. This is educational document analysis only. It is not legal advice, insurance advice, or a substitute for a licensed attorney, public adjuster, or insurance professional. Always consult a qualified professional before taking action.",
              },
              {
                q: "What types of insurance claims are supported?",
                a: "We support Homeowners, Auto, Health, Commercial Property, General Liability, and other insurance claim types.",
              },
              {
                q: "What file formats are accepted?",
                a: "We accept PDF files and images — JPEG, PNG, WebP, GIF, and TIFF — up to 25MB each. You can upload a scanned document, a phone photo of a paper letter, or any standard image format.",
              },
              {
                q: "How long does the analysis take?",
                a: "Usually 1–3 minutes depending on document length. We'll show you a preview immediately after analysis, then you unlock the full report.",
              },
              {
                q: "Is my data secure?",
                a: "Yes. Your documents are stored securely and your information is never shared with third parties.",
              },
              {
                q: "What if I'm not satisfied?",
                a: "Contact us and we'll do our best to address your concerns. Because of the nature of AI analysis, we cannot guarantee specific outcomes.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-gray-200 bg-white p-5 group"
              >
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-gray-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Fight Your Denial?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Upload your documents now and get an AI-powered analysis in minutes.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-lg"
        >
          Analyze My Denial <Lock className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Claim Denial Analyzer. Educational purposes only.</p>
        <p className="mt-1">
          Not legal advice. Not insurance advice. Not a substitute for a licensed professional.
        </p>
      </footer>
    </div>
  );
}
