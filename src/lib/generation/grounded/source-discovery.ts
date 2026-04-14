/**
 * Call 1 of the grounded pipeline: Claude + web_search tool returns a
 * structured list of candidate sources. No content generation here —
 * this step exists purely to gather external material that Call 2 will
 * cite from.
 *
 * Output is always JSON; Claude is instructed not to write prose.
 * Failure modes (empty result, malformed JSON) bubble up so Inngest
 * can retry the step.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { PaperSource, StyleConfig } from "./types";

export interface DiscoverSourcesInput {
  /** Module title + objectives give Claude specificity */
  moduleTitle: string;
  moduleObjectives: string[];
  /** Optional user-supplied abstract/profile for context */
  courseTopic: string;
  audience: "beginner" | "intermediate" | "advanced";
  language: string; // ISO 639-1; sources are English regardless (spec: out-of-scope multi-lingual)
  styleConfig: StyleConfig;
}

export async function discoverPaperSources(
  input: DiscoverSourcesInput,
): Promise<PaperSource[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Ask for 2x the max density so we have headroom after DOI validation drops
  // invalid candidates.
  const targetCount = input.styleConfig.density.max * 2;

  const system =
    "You are a research librarian. Your task is to find real, peer-reviewed academic papers " +
    "that are directly relevant to a specific course module topic. " +
    "Prefer papers published 2018 or later for currency. " +
    "If the field is inherently historical, or its canonical literature predates 2018, " +
    "prioritize foundational/canonical works regardless of age. " +
    "You may include 2 to 3 pre-2018 foundational references per module when a modern field " +
    "has a clear canonical literature (e.g., MADIT II 2002 for implantable defibrillators). " +
    "Reject preprints unless no peer-reviewed equivalent exists. When included, mark with isPreprint=true. " +
    "\n\n" +
    "Output ONLY a raw JSON array of paper objects. No preamble, no markdown code fences, no prose. " +
    'Each object MUST have these fields: {"title": str, "authors": str, "year": int, "journal": str|null, "doi": str, "url": str, "isPreprint": bool}. ' +
    "The 'authors' field is a comma-separated author list. The 'doi' field must be a real DOI (lowercase, no 'https://doi.org/' prefix). " +
    "If you cannot find a DOI, set doi to an empty string.";

  const userPrompt =
    `Course topic: ${input.courseTopic}\n` +
    `Module: ${input.moduleTitle}\n` +
    `Module learning objectives: ${input.moduleObjectives.join("; ")}\n` +
    `Audience level: ${input.audience}\n` +
    `Target: find ~${targetCount} peer-reviewed papers directly relevant to this module. ` +
    `Use the web_search tool to gather them. Return only the JSON array.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userPrompt }],
    tools: [
      {
        // Typed as `any` because the Anthropic SDK types for server tools
        // lag behind the actual API. The shape is stable per the docs.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: "web_search_20250305" as any,
        name: "web_search",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        max_uses: 3 as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
  });

  // Find the final text block — this is where the JSON lives.
  const textBlocks = response.content.filter(
    (b): b is Extract<(typeof response.content)[number], { type: "text" }> =>
      b.type === "text",
  );
  const finalText = textBlocks.map((b) => b.text).join("\n").trim();
  if (!finalText) {
    throw new Error("[discover-sources] Claude returned no text output");
  }

  const papers = parsePaperJson(finalText);
  if (papers.length === 0) {
    throw new Error(
      `[discover-sources] parsed 0 papers from response (len=${finalText.length})`,
    );
  }
  return papers;
}

/**
 * Robust JSON extraction for Claude responses. Handles: bare JSON,
 * markdown code fences, leading/trailing prose. Throws on unparseable.
 */
function parsePaperJson(raw: string): PaperSource[] {
  let cleaned = raw;
  const fence = cleaned.match(/^```(?:json)?\s*/);
  if (fence) {
    cleaned = cleaned.slice(fence[0].length);
    const end = cleaned.lastIndexOf("```");
    if (end !== -1) cleaned = cleaned.slice(0, end).trim();
  }

  // Extract from first [ to last ]
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("[discover-sources] response is not a JSON array");
  }

  return parsed
    .map((p): PaperSource | null => {
      if (!p || typeof p !== "object") return null;
      const obj = p as Record<string, unknown>;
      const title = typeof obj.title === "string" ? obj.title : null;
      const authors = typeof obj.authors === "string" ? obj.authors : null;
      const year = typeof obj.year === "number" ? obj.year : null;
      const url = typeof obj.url === "string" ? obj.url : null;
      if (!title || !authors || !year || !url) return null;
      const doi = typeof obj.doi === "string" ? obj.doi.toLowerCase().replace(/^https?:\/\/doi\.org\//, "").trim() : "";
      return {
        type: "paper",
        title,
        authors,
        year,
        journal: typeof obj.journal === "string" ? obj.journal : undefined,
        doi: doi || undefined,
        url,
        isPreprint: obj.isPreprint === true,
      };
    })
    .filter((p): p is PaperSource => p !== null);
}
