/**
 * Call 1 of the grounded pipeline: Claude + web_search returns a
 * structured list of candidate sources. Phase 1.1 widens the source
 * mix beyond papers — Claude is asked to pick the most authoritative
 * sources for the topic (papers, foundational books, arXiv preprints).
 *
 * Output is always a JSON array of typed source objects. Each object
 * has a `type` discriminator that tells the validator which registry
 * to query (CrossRef, Google Books, or arXiv).
 */

import Anthropic from "@anthropic-ai/sdk";
import type { SourceCandidate, StyleConfig } from "./types";

export interface DiscoverSourcesInput {
  moduleTitle: string;
  moduleObjectives: string[];
  courseTopic: string;
  audience: "beginner" | "intermediate" | "advanced";
  language: string;
  styleConfig: StyleConfig;
}

export async function discoverSources(
  input: DiscoverSourcesInput,
): Promise<SourceCandidate[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const targetCount = input.styleConfig.density.max * 2;
  const acceptedKinds = input.styleConfig.sourceKinds;
  const preferredKind = acceptedKinds[0];

  const system = buildSystemPrompt(acceptedKinds, preferredKind, targetCount);
  const user =
    `Course topic: ${input.courseTopic}\n` +
    `Module: ${input.moduleTitle}\n` +
    `Module learning objectives: ${input.moduleObjectives.join("; ")}\n` +
    `Audience level: ${input.audience}\n` +
    `Use the web_search tool to gather authoritative sources. Return ONLY the JSON array.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
    tools: [
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: "web_search_20250305" as any,
        name: "web_search",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        max_uses: 4 as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
  });

  const textBlocks = response.content.filter(
    (b): b is Extract<(typeof response.content)[number], { type: "text" }> =>
      b.type === "text",
  );
  const finalText = textBlocks.map((b) => b.text).join("\n").trim();
  if (!finalText) {
    throw new Error("[discover-sources] Claude returned no text output");
  }

  const candidates = parseSourceJson(finalText, acceptedKinds);
  if (candidates.length === 0) {
    throw new Error(
      `[discover-sources] parsed 0 candidates from response (len=${finalText.length})`,
    );
  }
  return candidates;
}

function buildSystemPrompt(
  acceptedKinds: ("paper" | "book" | "arxiv")[],
  preferredKind: "paper" | "book" | "arxiv",
  targetCount: number,
): string {
  const kindList = acceptedKinds.join(", ");

  return [
    `You are a research librarian. Your task is to find the most authoritative real, verifiable sources for a specific course module topic.`,
    ``,
    `You may return any combination of these source types: ${kindList}. Prefer ${preferredKind} when the topic has strong peer-reviewed coverage; switch to books for topics where canonical textbooks are the field's standard reference (e.g. Goodfellow et al. "Deep Learning" 2016 for neural networks, Russell & Norvig "AI: A Modern Approach", Hastie et al. "Elements of Statistical Learning"); use arXiv preprints for active CS/ML research areas where peer review lags publication (e.g. transformer architectures pre-2020).`,
    ``,
    `Pick what is genuinely authoritative for THIS topic. Do not include both a textbook chapter and the same chapter's preprint — choose one.`,
    ``,
    `Recency rule: prefer sources published 2018+. If the field is inherently historical (architecture history, classical philosophy, foundational medicine) or the canonical literature predates 2018 (e.g. MADIT II 2002 for ICDs), prioritize foundational works regardless of age.`,
    ``,
    `Target: ~${targetCount} candidates. Return MORE rather than fewer; the validator will drop unverifiable ones downstream.`,
    ``,
    `Output ONLY a raw JSON array. No prose, no markdown code fences. Each element MUST have a "type" field set to one of: ${kindList}.`,
    ``,
    `Schema by type:`,
    ``,
    `  paper:  {"type": "paper",  "title": str, "authors": str, "year": int, "journal": str, "doi": str, "url": str}`,
    `          - "doi" must be a real DOI (lowercase, no "https://doi.org/" prefix). If you cannot find a DOI, do not return this as type=paper; consider returning it as type=book or type=arxiv if applicable, otherwise omit.`,
    ``,
    `  book:   {"type": "book",   "title": str, "authors": str, "year": int, "publisher": str, "isbn": str, "url": str}`,
    `          - "isbn" can be ISBN-10 or ISBN-13. Empty string allowed if you only know title+author.`,
    ``,
    `  arxiv:  {"type": "arxiv",  "title": str, "authors": str, "year": int, "arxivId": str, "url": str, "isPreprint": true}`,
    `          - "arxivId" is the bare id like "2401.12345" or "cs.LG/0501001". No "arXiv:" prefix.`,
    ``,
    `"authors" is always a comma-separated list of names ("First Last, First Last, ..."). For >5 authors, use "First Last et al.".`,
  ].join("\n");
}

function parseSourceJson(
  raw: string,
  acceptedKinds: ("paper" | "book" | "arxiv")[],
): SourceCandidate[] {
  let cleaned = raw;
  const fence = cleaned.match(/^```(?:json)?\s*/);
  if (fence) {
    cleaned = cleaned.slice(fence[0].length);
    const end = cleaned.lastIndexOf("```");
    if (end !== -1) cleaned = cleaned.slice(0, end).trim();
  }

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("[discover-sources] response is not a JSON array");
  }

  const accepted = new Set(acceptedKinds);
  return parsed
    .map((p): SourceCandidate | null => {
      if (!p || typeof p !== "object") return null;
      const obj = p as Record<string, unknown>;
      const type = obj.type;
      if (typeof type !== "string" || !accepted.has(type as "paper" | "book" | "arxiv")) return null;

      const title = typeof obj.title === "string" ? obj.title : null;
      const authors = typeof obj.authors === "string" ? obj.authors : null;
      const year = typeof obj.year === "number" ? obj.year : null;
      const url = typeof obj.url === "string" ? obj.url : null;
      if (!title || !authors || !year || !url) return null;

      const base: SourceCandidate = {
        type: type as "paper" | "book" | "arxiv",
        title,
        authors,
        year,
        url,
      };

      if (type === "paper") {
        const doi = typeof obj.doi === "string"
          ? obj.doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "").trim()
          : "";
        if (!doi) return null;
        base.doi = doi;
        if (typeof obj.journal === "string") base.journal = obj.journal;
      } else if (type === "book") {
        if (typeof obj.isbn === "string") base.isbn = obj.isbn;
        if (typeof obj.publisher === "string") base.publisher = obj.publisher;
      } else if (type === "arxiv") {
        const arxivId = typeof obj.arxivId === "string"
          ? obj.arxivId.replace(/^arxiv:/i, "").trim()
          : "";
        if (!arxivId) return null;
        base.arxivId = arxivId;
        base.isPreprint = true;
      }

      return base;
    })
    .filter((p): p is SourceCandidate => p !== null);
}
