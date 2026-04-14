/**
 * Grounded module-detail prompt for the academic style.
 *
 * Produces the same JSON output shape as the standard module-detail
 * prompt so downstream parsing stays unchanged. The difference is in
 * the system instructions and the injected verified-sources context:
 * Claude is forced to cite ONLY from the provided list using inline
 * [n] brackets, and to end each lesson with a numbered References
 * block.
 */

import type { GenerateRequest, Module } from "@/types/curriculum";
import type { VerifiedSource } from "./types";

const GROUNDED_SYSTEM_PROMPT =
  "You are generating an academic, citation-rigorous module for an online course. " +
  "You MUST cite every non-trivial factual claim using numeric brackets like [1], [2], " +
  "drawing ONLY from the VERIFIED SOURCES list supplied in the user message. " +
  "Never invent citations, never cite sources not in the list. Never use [n] for a source you did not consult in that specific sentence. " +
  "\n\n" +
  "Each lesson's `content` field MUST end with a References section formatted as:\n" +
  "\n" +
  "## References\n" +
  "[1] Full bibliographic entry: Authors. Title. Journal, Year. doi:...\n" +
  "[2] ...\n" +
  "\n" +
  "Number references in the order they are cited in the lesson (restart numbering per lesson). " +
  "Only include References that are actually cited inline. " +
  "\n\n" +
  "Return ONLY valid JSON with the exact shape requested. No preamble, no code fences.";

export interface BuildGroundedPromptInput {
  request: GenerateRequest;
  courseTitle: string;
  courseDescription: string;
  moduleData: {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    lessons: Module["lessons"];
  };
  moduleIndex: number;
  totalModules: number;
  verifiedSources: VerifiedSource[];
  densityTarget: { min: number; max: number };
}

export function buildGroundedModuleDetailPrompt(
  input: BuildGroundedPromptInput,
): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  const {
    request,
    courseTitle,
    courseDescription,
    moduleData,
    moduleIndex,
    totalModules,
    verifiedSources,
    densityTarget,
  } = input;

  const {
    audience,
    length,
    language = "en",
    includeQuizzes = true,
    learnerProfile,
  } = request;

  const sourcesListing = verifiedSources
    .map((s, i) => {
      const n = i + 1;
      const doi = s.doi ? `, doi:${s.doi}` : "";
      const journal = s.journal ? `, ${s.journal}` : "";
      return `[${n}] ${s.authors}. ${s.title}${journal}, ${s.year}${doi}`;
    })
    .join("\n");

  const languageBlock =
    language !== "en"
      ? `\nLANGUAGE: Generate lesson content in ${language} (ISO 639-1). The citations and References block stay as-is (English bibliographic entries). JSON keys stay English.`
      : "";

  const learnerBlock = learnerProfile
    ? `\nTARGET LEARNER: "${learnerProfile}"\nCalibrate terminology, examples, and exercises to this learner's context.`
    : "";

  const quizBlock = includeQuizzes
    ? `\nGenerate 2-3 quiz questions for this module. Questions must test applied understanding at ${audience} level. Quiz questions may also cite [n] where appropriate but are not required to.`
    : `\nDo NOT include any quiz questions. Set "quiz" to an empty array [].`;

  const user = `
You are generating detailed content for MODULE ${moduleIndex + 1} of ${totalModules} in the course "${courseTitle}".

COURSE CONTEXT: ${courseDescription}
AUDIENCE: ${audience}
TEACHING STYLE: academic (grounded, citation-rigorous)${languageBlock}${learnerBlock}

MODULE: "${moduleData.title}"
MODULE DESCRIPTION: ${moduleData.description}
MODULE OBJECTIVES: ${moduleData.objectives.join("; ")}

LESSON STUBS:
${JSON.stringify(moduleData.lessons, null, 2)}

──────────────────────────────────────────────
VERIFIED SOURCES (cite ONLY from this list, using [n] by the bracketed number):
${sourcesListing}
──────────────────────────────────────────────

CITATION DENSITY: aim for ${densityTarget.min}–${densityTarget.max} inline citations per lesson content block. Some lessons may exceed this if the topic genuinely demands it; none should fall below ${densityTarget.min}.

For EACH lesson above, produce:
- "keyPoints": 4–6 string takeaways. Citations optional here.
- "content": dense markdown body (${length} length) with inline [n] citations and a trailing "## References" block listing only the [n] actually used in this lesson, numbered from 1 in the order of first citation.
- "suggestedResources": 2–3 objects { title, url, type } pointing to real resources (may include the papers you already cite).
${quizBlock}

SIZE DISCIPLINE: Your entire response must be COMPLETE, VALID JSON. If you are running long, compress later lessons rather than cutting mid-JSON.

Return ONLY this JSON structure:

{
  "lessons": [
    {
      "id": "<unchanged from stub>",
      "title": "<unchanged from stub>",
      "description": "<unchanged from stub>",
      "format": "<unchanged from stub>",
      "durationMinutes": <unchanged from stub>,
      "objectives": [...],
      "order": <unchanged from stub>,
      "keyPoints": [...],
      "content": "<markdown body with inline [n] citations and trailing ## References block>",
      "suggestedResources": [...]
    }
  ],
  "quiz": [...]
}
`.trim();

  return {
    system: GROUNDED_SYSTEM_PROMPT,
    messages: [{ role: "user", content: user }],
  };
}
