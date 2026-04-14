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
    `You may return any combination of these source types: ${kindList}. Be flexible and pick the right mix for the field — what matters is that every source is REAL and VERIFIABLE.`,
    ``,
    `Source-type playbook (domain-agnostic — adapt to the field of the topic):`,
    `  • Use "paper" for any peer-reviewed venue: journal articles, society conferences, professional society proceedings (medical journals like NEJM/Lancet/JAMA; conference proceedings like NeurIPS/ICML/CVPR/ACL or AHA/ESC for cardiology or AAA for anthropology; humanities journals like Speculum or American Historical Review). Many such venues register DOIs with CrossRef — use them.`,
    `  • Use "arxiv" when the canonical version is on arXiv OR when a paper has no CrossRef DOI but is on arXiv. This is mostly relevant for CS, math, physics, statistics, quantitative biology. Prefer arxiv over omitting the source.`,
    `  • Use "book" for canonical textbooks, monographs, or foundational works in the field. Every mature field has 1–3 standard reference works. Examples by domain (illustrative, not exhaustive): medicine — Harrison's, Robbins; CS/ML — Goodfellow Deep Learning, Russell & Norvig; humanities — domain-specific monographs (Lynch's Image of the City for urban planning, Said's Orientalism for postcolonial studies); sciences — relevant graduate-level textbooks. If the topic has a canonical textbook, include AT LEAST 1.`,
    ``,
    `Adapt the mix to the field. A medicine module is mostly papers; a CS/ML module is mostly papers + 1-2 books + arxiv; a humanities module is often books + journal papers; an engineering module is often standards + textbooks + papers.`,
    ``,
    `Avoid duplication: don't include both a textbook and a paper that essentially restates the same chapter; pick the more authoritative one. Don't include the same paper twice (once as DOI-paper, once as arXiv).`,
    ``,
    `Recency rule: prefer sources published 2018+. If the field is inherently historical (architecture history, classical philosophy, foundational medicine, mathematical foundations) or the canonical literature predates 2018, prioritize foundational works regardless of age.`,
    ``,
    `Target: ~${targetCount} candidates. Return MORE rather than fewer; the validator drops unverifiable ones. If you genuinely cannot find ${targetCount}, return what you have — even 2-3 great sources are infinitely better than padding with weak ones.`,
    ``,
    `Output ONLY a raw JSON array. No prose, no markdown code fences. Each element MUST have a "type" field set to one of: ${kindList}.`,
    ``,
    `Schema by type:`,
    ``,
    `  paper:  {"type": "paper",  "title": str, "authors": str, "year": int, "journal": str, "doi": str, "url": str}`,
    `          - "journal" can be a journal name OR a conference / proceedings name.`,
    `          - "doi" must be a real DOI (lowercase, no "https://doi.org/" prefix). If you can't find a DOI but the paper IS peer-reviewed, try arxiv instead when applicable.`,
    ``,
    `  book:   {"type": "book",   "title": str, "authors": str, "year": int, "publisher": str, "isbn": str, "url": str}`,
    `          - "isbn" can be ISBN-10 or ISBN-13. Empty string allowed if you only know title+author — the validator can resolve via title+author.`,
    ``,
    `  arxiv:  {"type": "arxiv",  "title": str, "authors": str, "year": int, "arxivId": str, "url": str, "isPreprint": true|false}`,
    `          - "arxivId" is the bare id like "2401.12345" or "cs.LG/0501001". No "arXiv:" prefix.`,
    `          - Set "isPreprint": false if the paper was subsequently published in a peer-reviewed venue.`,
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
