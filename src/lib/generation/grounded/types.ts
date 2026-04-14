/**
 * Shared types for the grounded-content pipeline.
 *
 * Phase 1.1 broadens VerifiedSource beyond papers: books (verified via
 * Google Books) and arXiv preprints (verified via arXiv API) are now
 * first-class citizens. Claude picks the appropriate mix per topic.
 */

import type {
  AudienceLevel,
  CourseLength,
  TeachingStyle,
} from "@/types/curriculum";

// ─── Source kinds ────────────────────────────────────────────

export type SourceKind = "paper" | "book" | "arxiv";

export type ValidatorKind =
  | "crossref"
  | "google_books"
  | "arxiv"
  | "http_head"
  | "youtube_api";

/**
 * Candidate returned by Call 1 (web_search). Type-specific fields are
 * optional at parse time; the validator promotes them to VerifiedSource
 * once the registry confirms existence.
 */
export interface SourceCandidate {
  type: SourceKind;
  title: string;
  authors: string;
  year: number;
  url: string;

  // paper-specific
  journal?: string;
  doi?: string;

  // book-specific
  publisher?: string;
  isbn?: string;

  // arxiv-specific
  arxivId?: string;

  // common metadata
  isPreprint?: boolean;
}

/** A SourceCandidate that has been confirmed against an authoritative registry. */
export interface VerifiedSource extends SourceCandidate {
  verified: true;
  verifiedAt: string; // ISO
  verifiedBy: ValidatorKind;
}

// ─── Style config (per-style routing rules) ──────────────────

export interface StyleConfig {
  enabled: boolean;
  /** Which kinds of sources this style accepts; first item is the preferred kind */
  sourceKinds: SourceKind[];
  /** Citation count target per lesson — inclusive range */
  density: { min: number; max: number };
}

// ─── Routing input/output ────────────────────────────────────

export interface StyleRoutingInput {
  teachingStyle?: TeachingStyle;
  audience: AudienceLevel;
  length: CourseLength;
}
