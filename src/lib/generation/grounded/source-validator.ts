/**
 * Verifies discovered sources against an authoritative registry.
 * Phase 1 handles papers via CrossRef DOI lookup; Phase 2+ will plug
 * other validators (http_head, youtube_api) via the same contract.
 *
 * Keep a candidate if CrossRef returns 200 AND the stored title fuzzy-
 * matches (Levenshtein similarity >= 0.8). Drop otherwise.
 */

import type { PaperSource, VerifiedSource } from "./types";

const CROSSREF_ENDPOINT = "https://api.crossref.org/works/";
const TITLE_SIMILARITY_THRESHOLD = 0.8;

export async function verifyPapers(
  candidates: PaperSource[],
): Promise<VerifiedSource[]> {
  const results = await Promise.all(
    candidates.map((c) => verifyPaper(c).catch(() => null)),
  );
  return results.filter((r): r is VerifiedSource => r !== null);
}

async function verifyPaper(p: PaperSource): Promise<VerifiedSource | null> {
  if (!p.doi) return null;

  const url = CROSSREF_ENDPOINT + encodeURIComponent(p.doi);
  const res = await fetchWithTimeout(url, 8000);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    message?: { title?: string[] };
  };
  const registeredTitle = data.message?.title?.[0];
  if (!registeredTitle) return null;

  if (titleSimilarity(p.title, registeredTitle) < TITLE_SIMILARITY_THRESHOLD) {
    return null;
  }

  return {
    ...p,
    verified: true,
    verifiedAt: new Date().toISOString(),
    verifiedBy: "crossref",
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // CrossRef strongly recommends a User-Agent with contact info.
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Syllabi.ai (mailto:hello@syllabi.online)",
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Levenshtein-based similarity ratio in [0, 1]. 1 = identical.
 * Case-insensitive, whitespace-normalized. Good enough for catching
 * "The MADIT II Trial" vs "MADIT II trial" or minor punctuation drift.
 */
export function titleSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Space-optimized: single row rolled.
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}
