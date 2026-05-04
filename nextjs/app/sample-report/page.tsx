import Link from "next/link";
import {
  FileText,
  Target,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Download,
} from "lucide-react";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <span className="font-semibold text-base">{title}</span>
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}

function StrengthBadge({ level }: { level: "Strong" | "Moderate" | "Weak" }) {
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

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-sm font-semibold text-amber-800 mb-4">
            Example Report — Not a Real Claim
          </div>
          <h1 className="text-3xl font-bold">Sample Coverage Analysis Report</h1>
          <p className="mt-2 text-gray-500">
            This is a fictional example showing what a full report looks like.
          </p>
        </div>

        {/* Claim context */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Claim Type</span>
              <p className="font-semibold mt-0.5">Homeowners Insurance</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Denial Reason</span>
              <p className="font-semibold mt-0.5">Normal Wear and Tear</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Status</span>
              <p className="font-semibold mt-0.5 text-amber-700">Example Only</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Denial Summary" icon={FileText}>
            <p className="text-sm leading-relaxed text-gray-700">
              Your homeowners insurance claim for water damage to the living room ceiling was denied
              by ABC Insurance Company on the basis that the damage resulted from normal wear and
              tear rather than a sudden and accidental event. The insurer cited Policy Section 4(b),
              which excludes coverage for deterioration, rot, and repeated seepage over time. The
              denial letter states that an inspector found evidence of long-term water intrusion
              inconsistent with a single storm event.
            </p>
          </Section>

          <Section title="Key Policy Language Found" icon={Target}>
            <div className="space-y-4">
              {[
                {
                  quote:
                    "We cover direct physical loss to property described in Coverages A and B only if that loss is a sudden and accidental direct physical loss.",
                  why: "This is the core coverage trigger. Whether your loss qualifies as 'sudden and accidental' is the central dispute in your denial.",
                },
                {
                  quote:
                    "We do not cover loss caused by wear, tear, deterioration, or inherent vice.",
                  why: "This is the exclusion the insurer is relying on. Your argument must show the loss was sudden, not gradual deterioration.",
                },
                {
                  quote:
                    "If loss covered under this policy is made worse by an excluded event, we will pay only the portion of the loss caused by the covered event.",
                  why: "This apportionment clause may require the insurer to cover at least the portion of damage caused by the storm itself, even if some deterioration existed beforehand.",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <blockquote className="text-sm font-medium text-blue-900 border-l-4 border-blue-400 pl-3 italic">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-xs text-blue-800">{item.why}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Possible Coverage Arguments" icon={ShieldCheck}>
            <div className="space-y-4">
              {[
                {
                  title: "Storm Event Was the Efficient Proximate Cause",
                  strength: "Strong" as const,
                  argument:
                    "Under the efficient proximate cause doctrine, if a covered peril (the storm) was the primary cause of the loss, coverage may apply even if a non-covered condition (prior wear) contributed. Courts in many states require insurers to cover losses where the dominant cause is a covered event.",
                  supporting:
                    "The covered cause of loss — windstorm — triggered the water intrusion. The pre-existing wear and tear was a passive condition, not an active cause.",
                },
                {
                  title: "Inspector's Findings Are Inconsistent With Policy Language",
                  strength: "Moderate" as const,
                  argument:
                    "The inspector's report describes 'long-term water intrusion' without specifying how long or what evidence supports that conclusion. A single storm event can create damage patterns that appear gradual to an untrained eye. An independent inspection may produce a different conclusion.",
                  supporting:
                    "Requesting the full inspection report and methodology may reveal assumptions that can be challenged.",
                },
                {
                  title: "Apportionment of Covered vs. Non-Covered Loss",
                  strength: "Moderate" as const,
                  argument:
                    "Even if some pre-existing deterioration exists, the policy's apportionment clause may require the insurer to pay for the portion of damage directly caused by the storm. The insurer's wholesale denial may not comply with this clause.",
                  supporting: "Policy Section 8(c) on concurrent causation and apportionment.",
                },
                {
                  title: "Definition of 'Sudden' Was Not Applied Correctly",
                  strength: "Weak" as const,
                  argument:
                    "The insurer's denial does not define 'sudden' as used in the policy. Many courts interpret 'sudden' to mean unexpected or unforeseen, not necessarily instantaneous. If the homeowner was unaware of any leak, the event was 'sudden' from their perspective.",
                  supporting: null,
                },
              ].map((arg, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{arg.title}</p>
                    <StrengthBadge level={arg.strength} />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{arg.argument}</p>
                  {arg.supporting && (
                    <p className="text-xs text-gray-400 italic border-l-2 border-gray-200 pl-2">
                      {arg.supporting}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Exclusions or Limitations the Insurer May Rely On" icon={AlertTriangle}>
            <div className="space-y-3">
              {[
                {
                  issue: "Wear and Tear Exclusion (Section 4(b))",
                  why: "The insurer's primary basis for denial. They will argue the damage accumulated over time, placing it squarely within this exclusion.",
                },
                {
                  issue: "Repeated Seepage or Leakage Exclusion",
                  why: "Many policies exclude damage from water that seeps or leaks repeatedly over a period of time. The inspector's language about 'long-term intrusion' targets this exclusion.",
                },
                {
                  issue: "Failure to Maintain Exclusion",
                  why: "If the insurer can show that proper roof maintenance would have prevented the loss, they may argue the homeowner failed to maintain the property as required.",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <p className="font-semibold text-sm text-amber-900">{item.issue}</p>
                  <p className="text-xs text-amber-800 mt-1">{item.why}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Weaknesses and Missing Information" icon={AlertCircle}>
            <ul className="space-y-2">
              {[
                "No independent inspector has reviewed the damage. The insurer's inspector is not a neutral party.",
                "Photographs of the damage taken immediately after the storm would strengthen the claim of sudden onset.",
                "Maintenance records for the roof are not documented, which leaves the 'failure to maintain' angle open.",
                "No weather service records have been obtained to confirm storm severity on the date of loss.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Questions to Ask Your Adjuster" icon={HelpCircle}>
            <ol className="space-y-2 list-decimal list-inside">
              {[
                "Can you provide the full inspection report, including the inspector's credentials and the specific evidence used to conclude the damage was long-term?",
                "What definition of 'sudden' is the company applying, and where is that definition found in the policy?",
                "Does the company's decision account for the apportionment clause in Section 8(c), and if so, how was the covered portion calculated?",
                "Has the company considered the efficient proximate cause doctrine applicable in this state?",
                "What documentation would cause the company to reconsider or reopen the claim?",
              ].map((q, i) => (
                <li key={i} className="text-sm text-gray-700">
                  {q}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Draft Message to the Insurance Company" icon={MessageSquare}>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{`Dear ABC Insurance Company Claims Department,

I am writing to formally appeal the denial of my homeowners insurance claim [Claim #: XXXX], dated [Date of Denial], for water damage to my property at [Address].

I respectfully disagree with the determination that this loss resulted from normal wear and tear. The damage occurred following a severe storm on [Date of Storm], and I believe the evidence supports that this was a sudden and accidental direct physical loss, as required by my policy.

Specifically, I am requesting reconsideration based on the following:

1. The storm on [Date] caused direct physical damage to my roof, which was the triggering event for the water intrusion. Under the efficient proximate cause doctrine, the dominant cause of loss was a covered peril.

2. The inspector's conclusion that the damage was "long-term" is not supported by any documented evidence in the denial letter. I request the full inspection report and the basis for this conclusion.

3. To the extent that any pre-existing conditions existed, Policy Section 8(c) requires apportionment of covered versus non-covered losses. The denial does not address this provision.

I am prepared to provide photographs, weather records, and an independent inspection report. I request a written response within 30 days identifying any additional documentation required to process this appeal.

Sincerely,
[Your Name]
[Policy Number]
[Contact Information]`}</pre>
            </div>
            <p className="mt-3 text-xs text-gray-400 italic">
              Customize this template with your actual claim number, dates, and policy details.
            </p>
          </Section>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <strong>Disclaimer: </strong>
            This is a fictional example for illustrative purposes only. It is not legal advice,
            insurance advice, or a guarantee of any outcome. Coverage determinations depend on your
            specific policy language, jurisdiction, and facts. Always consult a licensed attorney,
            public adjuster, or insurance professional before taking action.
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to analyze your real claim?</h2>
            <p className="text-blue-100 mb-6 text-sm">
              Upload your actual denial letter and policy to get a report tailored to your situation.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-lg"
            >
              Analyze My Denial for $29
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
