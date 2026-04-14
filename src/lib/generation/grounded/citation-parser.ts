/**
 * Post-generation validation of a lesson's inline [n] citations and
 * trailing References block against the verified-sources list.
 *
 * Contract: every [n] MUST have a matching entry in the References block
 * AND the entry MUST match a verified source (by DOI or title). Orphans,
 * missing entries, and fabricated references all flag as invalid.
 */

import type { VerifiedSource } from "./types";

export interface ValidateCitationsInput {
  /** Lesson markdown text as returned by Claude */
  lessonMarkdown: string;
  /** Source of truth for what can legitimately be cited */
  verifiedSources: VerifiedSource[];
}

export interface ValidateCitationsResult {
  /** Citations the lesson uses that resolve to a verified source */
  validCitations: { index: number; source: VerifiedSource }[];
  /** Citations present in the lesson but not resolvable */
  invalidCitations: { index: number; reason: string }[];
  /** Bibliography entries that exist in the References block but are never cited */
  orphanReferences: string[];
  /** Fraction of invalid / total citations */
  invalidRatio: number;
}

const CITATION_RX = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
const REFERENCES_HEADING_RX = /^#{1,3}\s+references\s*$/im;

export function validateCitations(
  input: ValidateCitationsInput,
): ValidateCitationsResult {
  const inlineIndices = extractInlineCitationIndices(input.lessonMarkdown);
  const bibliography = extractBibliography(input.lessonMarkdown);

  const valid: ValidateCitationsResult["validCitations"] = [];
  const invalid: ValidateCitationsResult["invalidCitations"] = [];
  const usedBibIndices = new Set<number>();

  for (const idx of inlineIndices) {
    const bibEntry = bibliography.get(idx);
    if (!bibEntry) {
      invalid.push({ index: idx, reason: "no-bibliography-entry" });
      continue;
    }
    usedBibIndices.add(idx);

    const match = findVerifiedMatch(bibEntry, input.verifiedSources);
    if (!match) {
      invalid.push({ index: idx, reason: "not-in-verified-list" });
      continue;
    }
    valid.push({ index: idx, source: match });
  }

  const orphan: string[] = [];
  for (const [idx, entry] of bibliography) {
    if (!usedBibIndices.has(idx)) orphan.push(entry);
  }

  const total = valid.length + invalid.length;
  const invalidRatio = total === 0 ? 0 : invalid.length / total;

  return {
    validCitations: valid,
    invalidCitations: invalid,
    orphanReferences: orphan,
    invalidRatio,
  };
}

function extractInlineCitationIndices(md: string): number[] {
  // Exclude citations inside the References block itself (which also uses [1] style).
  const refSplit = md.split(REFERENCES_HEADING_RX);
  const body = refSplit[0] ?? md;

  const found = new Set<number>();
  for (const match of body.matchAll(CITATION_RX)) {
    const group = match[1];
    for (const n of group.split(/\s*,\s*/)) {
      const parsed = parseInt(n, 10);
      if (!Number.isNaN(parsed)) found.add(parsed);
    }
  }
  return [...found].sort((a, b) => a - b);
}

/**
 * Parses the References block looking for lines like:
 *   [1] Moss AJ et al. Prophylactic implantation..., NEJM, 2002. doi:10.1056/NEJMoa013474
 */
function extractBibliography(md: string): Map<number, string> {
  const result = new Map<number, string>();
  const refSplit = md.split(REFERENCES_HEADING_RX);
  if (refSplit.length < 2) return result;

  const block = refSplit.slice(1).join("\n");
  const lineRx = /^\s*\[(\d+)\]\s*(.+?)\s*$/gm;
  for (const match of block.matchAll(lineRx)) {
    const idx = parseInt(match[1], 10);
    if (!Number.isNaN(idx)) result.set(idx, match[2]);
  }
  return result;
}

function findVerifiedMatch(
  bibEntry: string,
  verified: VerifiedSource[],
): VerifiedSource | undefined {
  const normalized = bibEntry.toLowerCase();
  // Prefer identifier match (DOI for papers, arXiv id, ISBN for books)
  for (const src of verified) {
    if (src.doi && normalized.includes(src.doi.toLowerCase())) return src;
    if (src.arxivId && normalized.includes(src.arxivId.toLowerCase())) return src;
    if (src.isbn && normalized.includes(src.isbn.toLowerCase())) return src;
  }
  // Fall back to title contains (tolerant of citation-format variations)
  for (const src of verified) {
    const titleKey = src.title.toLowerCase().slice(0, 40);
    if (titleKey && normalized.includes(titleKey)) return src;
  }
  return undefined;
}
