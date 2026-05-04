import { openai } from "./openaiClient";
import { logger } from "./logger";

export interface AnalysisResult {
  denial_summary: string;
  key_policy_language: Array<{ quote: string; why_it_matters: string }>;
  possible_coverage_arguments: Array<{
    title: string;
    argument: string;
    supporting_policy_language: string;
    strength_level: string;
  }>;
  insurer_exclusions_or_limitations: Array<{
    issue: string;
    why_it_may_hurt_the_claim: string;
  }>;
  weaknesses_or_missing_information: string[];
  questions_to_ask_adjuster: string[];
  draft_message_to_insurer: string;
  educational_disclaimer: string;
}

export interface AnalysisPreview {
  denial_summary: string;
  first_argument: {
    title: string;
    argument: string;
    strength_level: string;
  } | null;
  total_arguments: number;
}

export async function analyzeClaimDenial(
  claimType: string,
  claimDescription: string,
  denialText: string,
  policyText: string
): Promise<AnalysisResult> {
  const prompt = `You are an insurance document analysis assistant.

You are analyzing an insurance denial letter and insurance policy for educational purposes only.

Rules:
- Only use the denial letter and policy text provided.
- Do not invent policy language.
- Do not claim something is covered unless the provided policy language supports the possibility.
- If policy wording is missing, unclear, or incomplete, say so.
- Do not give legal advice.
- Do not tell the user they definitely have coverage.
- Use cautious language such as "possible argument," "may support," "could be relevant," and "needs review."
- Cite exact wording from the uploaded policy whenever possible.
- Identify both strengths and weaknesses.
- Write in plain English.

User claim type:
${claimType}

User claim description:
${claimDescription}

Denial letter text:
${denialText}

Policy text:
${policyText}

Return JSON with this exact structure:
{
  "denial_summary": "",
  "key_policy_language": [
    {
      "quote": "",
      "why_it_matters": ""
    }
  ],
  "possible_coverage_arguments": [
    {
      "title": "",
      "argument": "",
      "supporting_policy_language": "",
      "strength_level": "Weak / Moderate / Strong"
    }
  ],
  "insurer_exclusions_or_limitations": [
    {
      "issue": "",
      "why_it_may_hurt_the_claim": ""
    }
  ],
  "weaknesses_or_missing_information": [
    ""
  ],
  "questions_to_ask_adjuster": [
    ""
  ],
  "draft_message_to_insurer": "",
  "educational_disclaimer": "This report is educational document analysis only. It is not legal advice, insurance advice, or a substitute for a licensed attorney, public adjuster, or insurance professional."
}

Respond with ONLY the JSON object. No markdown, no explanation.`;

  logger.info({ claimType }, "Starting OpenAI analysis");

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    let raw = content.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const result = JSON.parse(raw) as AnalysisResult;
    logger.info({ claimType }, "OpenAI analysis complete");
    return result;
  } catch {
    logger.error({ content }, "Failed to parse OpenAI JSON response");
    throw new Error("Failed to parse analysis response");
  }
}

export function buildPreview(result: AnalysisResult): AnalysisPreview {
  return {
    denial_summary: result.denial_summary,
    first_argument: result.possible_coverage_arguments[0]
      ? {
          title: result.possible_coverage_arguments[0].title,
          argument: result.possible_coverage_arguments[0].argument,
          strength_level: result.possible_coverage_arguments[0].strength_level,
        }
      : null,
    total_arguments: result.possible_coverage_arguments.length,
  };
}
