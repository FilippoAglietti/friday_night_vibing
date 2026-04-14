/**
 * Multi-source verifier. Dispatches each candidate to the right registry
 * based on its `type` field:
 *   paper → CrossRef DOI lookup
 *   arxiv → arXiv API id_list lookup
 *   book  → Google Books API ISBN or title lookup
 *
 * A candidate is kept only if its registry returns a confirmed match.
 * Title fuzzy-match (≥0.8 Levenshtein similarity) protects against
 * Claude inventing a real DOI/ISBN/arXivId for a different paper.
 */

import type { SourceCandidate, VerifiedSource } from "./types";

const CROSSREF_ENDPOINT = "https://api.crossref.org/works/";
const ARXIV_ENDPOINT = "https://export.arxiv.org/api/query?id_list=";
const GOOGLE_BOOKS_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";
const TITLE_SIMILARITY_THRESHOLD = 0.8;

export async function verifySources(
  candidates: SourceCandidate[],
): Promise<VerifiedSource[]> {
  const results = await Promise.all(
    candidates.map((c) => verifyOne(c).catch(() => null)),
  );
  return results.filter((r): r is VerifiedSource => r !== null);
}

async function verifyOne(c: SourceCandidate): Promise<VerifiedSource | null> {
  switch (c.type) {
    case "paper":
      return verifyPaper(c);
    case "arxiv":
      return verifyArxiv(c);
    case "book":
      return verifyBook(c);
    default:
      return null;
  }
}

// ─── Paper (CrossRef) ────────────────────────────────────────

async function verifyPaper(c: SourceCandidate): Promise<VerifiedSource | null> {
  if (!c.doi) return null;
  const url = CROSSREF_ENDPOINT + encodeURIComponent(c.doi);
  const res = await fetchWithTimeout(url, 8000, "Syllabi.ai (mailto:hello@syllabi.online)");
  if (!res.ok) return null;
  const data = (await res.json()) as { message?: { title?: string[] } };
  const registered = data.message?.title?.[0];
  if (!registered) return null;
  if (titleSimilarity(c.title, registered) < TITLE_SIMILARITY_THRESHOLD) return null;
  return { ...c, verified: true, verifiedAt: new Date().toISOString(), verifiedBy: "crossref" };
}

// ─── arXiv ───────────────────────────────────────────────────

async function verifyArxiv(c: SourceCandidate): Promise<VerifiedSource | null> {
  if (!c.arxivId) return null;
  // arXiv IDs come in the forms "2401.12345" (newer) or "cs.LG/0501001" (older).
  const cleanId = c.arxivId.replace(/^arxiv:/i, "").trim();
  const url = ARXIV_ENDPOINT + encodeURIComponent(cleanId);
  const res = await fetchWithTimeout(url, 8000);
  if (!res.ok) return null;
  const xml = await res.text();
  // arXiv returns Atom feed. Look for <title> inside the entry; the feed-level
  // <title> contains the query, the entry-level title is the paper.
  const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
  if (!titleMatch) return null;
  const registered = titleMatch[1].replace(/\s+/g, " ").trim();
  if (!registered) return null;
  if (titleSimilarity(c.title, registered) < TITLE_SIMILARITY_THRESHOLD) return null;
  return { ...c, verified: true, verifiedAt: new Date().toISOString(), verifiedBy: "arxiv" };
}

// ─── Book (Google Books) ─────────────────────────────────────

async function verifyBook(c: SourceCandidate): Promise<VerifiedSource | null> {
  // Prefer ISBN lookup (most precise). Fall back to title+author search.
  let url: string;
  if (c.isbn && c.isbn.replace(/[^0-9X]/gi, "").length >= 10) {
    const isbn = c.isbn.replace(/[^0-9X]/gi, "");
    url = `${GOOGLE_BOOKS_ENDPOINT}?q=isbn:${encodeURIComponent(isbn)}&maxResults=1`;
  } else {
    const q = `intitle:${encodeURIComponent(c.title)}+inauthor:${encodeURIComponent(c.authors.split(",")[0] ?? c.authors)}`;
    url = `${GOOGLE_BOOKS_ENDPOINT}?q=${q}&maxResults=1`;
  }
  const res = await fetchWithTimeout(url, 8000);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    totalItems?: number;
    items?: Array<{ volumeInfo?: { title?: string; subtitle?: string; industryIdentifiers?: Array<{ type: string; identifier: string }> } }>;
  };
  if (!data.items || data.items.length === 0) return null;
  const vol = data.items[0].volumeInfo;
  const registered = [vol?.title, vol?.subtitle].filter(Boolean).join(": ");
  if (!registered) return null;
  if (titleSimilarity(c.title, registered) < TITLE_SIMILARITY_THRESHOLD) return null;
  // If we found ISBN-13 from the lookup, prefer storing that.
  const isbn13 = vol?.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier;
  return {
    ...c,
    isbn: isbn13 ?? c.isbn,
    verified: true,
    verifiedAt: new Date().toISOString(),
    verifiedBy: "google_books",
  };
}

// ─── Helpers ─────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  userAgent?: string,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, application/atom+xml, */*",
        ...(userAgent ? { "User-Agent": userAgent } : {}),
      },
    });
  } finally {
    clearTimeout(t);
  }
}

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
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}
