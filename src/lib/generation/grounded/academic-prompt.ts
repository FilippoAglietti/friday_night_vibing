/**
 * Grounded module-detail prompt for the academic style.
 *
 * Phase 1.1 changes:
 *   • Multi-type source list (papers + books + arXiv preprints).
 *   • Force-cite-all rule: Claude MUST use every verified source at least
 *     once unless it is genuinely irrelevant to all lessons.
 *   • Per-type bibliography formatting (DOI for papers, ISBN for books,
 *     arXiv id for preprints).
 */

import type { GenerateRequest, Module } from "@/types/curriculum";
import type { VerifiedSource } from "./types";

const GROUNDED_SYSTEM_PROMPT =
  "You are generating an academic, citation-rigorous module for an online course. " +
  "You MUST cite every non-trivial factual claim using numeric brackets like [1], [2], " +
  "drawing ONLY from the VERIFIED SOURCES list supplied in the user message. " +
  "Never invent citations, never cite sources not in the list. " +
  "\n\n" +
  "MANDATORY: Across the whole module you MUST use EVERY verified source at least once, " +
  "unless a source is genuinely irrelevant to all lessons in this module. If you skip a " +
  "source, you are silently signalling it should not appear in the lesson's References. " +
  "When in doubt, cite. " +
  "\n\n" +
  "Each lesson's `content` field MUST end with a References section formatted as:\n" +
  "\n" +
  "## References\n" +
  "[1] (paper) Authors. Title. Journal, Year. doi:...\n" +
  "[2] (book) Authors. Title. Publisher, Year. ISBN: ...\n" +
  "[3] (arXiv) Authors. Title. arXiv:..., Year.\n" +
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
      switch (s.type) {
        case "paper": {
          const journal = s.journal ? `, ${s.journal}` : "";
          const doi = s.doi ? `, doi:${s.doi}` : "";
          return `[${n}] (paper) ${s.authors}. ${s.title}${journal}, ${s.year}${doi}`;
        }
        case "book": {
          const pub = s.publisher ? `, ${s.publisher}` : "";
          const isbn = s.isbn ? `, ISBN ${s.isbn}` : "";
          return `[${n}] (book) ${s.authors}. ${s.title}${pub}, ${s.year}${isbn}`;
        }
        case "arxiv": {
          return `[${n}] (arXiv) ${s.authors}. ${s.title}. arXiv:${s.arxivId}, ${s.year}`;
        }
        default:
          return `[${n}] ${(s as VerifiedSource).authors}. ${(s as VerifiedSource).title}, ${(s as VerifiedSource).year}`;
      }
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
VERIFIED SOURCES (${verifiedSources.length} total — cite ONLY from this list, using [n] by the bracketed number).
You MUST use EVERY entry below at least once across the lessons of this module unless an entry is genuinely irrelevant.
──────────────────────────────────────────────
${sourcesListing}
──────────────────────────────────────────────

CITATION DENSITY: aim for ${densityTarget.min}–${densityTarget.max} inline citations per lesson content block.

If the verified pool above has FEWER than ${densityTarget.min} sources, you may and should cite the SAME source multiple times across the lesson — especially for canonical books, which are dense reference works that legitimately cover many points. Citing Goodfellow Deep Learning [3] in 5 separate paragraphs of an ML lesson is appropriate, not redundant. Do not fabricate citations to hit the density target; use what you have, well.

If the pool is large (≥${densityTarget.max}), each source should typically appear no more than 3 times to keep variety high.

For EACH lesson above, produce:
- "keyPoints": 4–6 string takeaways. Citations optional here.
- "content": dense markdown body (${length} length) with inline [n] citations and a trailing "## References" block listing only the [n] actually used in this lesson, numbered from 1 in the order of first citation. Use the per-type formatting shown in the system prompt.
- "suggestedResources": 2–3 objects { title, url, type } pointing to real resources (may include the sources you already cite).
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
