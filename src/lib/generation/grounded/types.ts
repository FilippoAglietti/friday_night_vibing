/**
 * Shared types for the grounded-content pipeline.
 *
 * Phase 1 ships PaperSource + the StyleConfig shape. Later phases extend
 * the GroundedSource union with VideoSource, RepoSource, WebArticleSource
 * — same StyleConfig, different source_type and validator choice.
 */

import type {
  AudienceLevel,
  CourseLength,
  TeachingStyle,
} from "@/types/curriculum";

// ─── Source types ────────────────────────────────────────────

export interface PaperSource {
  type: "paper";
  title: string;
  authors: string;
  year: number;
  journal?: string;
  doi?: string;
  url: string;
  isPreprint: boolean;
}

// Placeholders for later phases — not used in Phase 1 but kept in the union
// so the discriminator is stable from day 1.
export interface VideoSource {
  type: "video";
  title: string;
  channel: string;
  year?: number;
  url: string;
  durationSeconds?: number;
}

export interface RepoSource {
  type: "repo";
  title: string;
  owner: string;
  version?: string;
  url: string;
}

export interface WebArticleSource {
  type: "web_article";
  title: string;
  publisher: string;
  year?: number;
  url: string;
}

export type GroundedSource =
  | PaperSource
  | VideoSource
  | RepoSource
  | WebArticleSource;

// ─── Style config (per-style routing rules) ──────────────────

export type ValidatorKind = "crossref" | "http_head" | "youtube_api";

export interface StyleConfig {
  /** Whether this style should ground content at all */
  enabled: boolean;
  /** Which source type this style produces */
  sourceType: GroundedSource["type"];
  /** Citation count target per lesson — inclusive range */
  density: { min: number; max: number };
  /** How to validate discovered sources */
  validator: ValidatorKind;
  /** Optional domain allowlist (Phase 2+); Phase 1 academic leaves empty */
  allowedDomains?: string[];
}

// ─── Routing input/output ────────────────────────────────────

export interface StyleRoutingInput {
  teachingStyle?: TeachingStyle;
  audience: AudienceLevel;
  length: CourseLength;
}

// ─── Verified source after DOI/URL check ─────────────────────

export interface VerifiedSource extends PaperSource {
  verified: true;
  verifiedAt: string; // ISO
  verifiedBy: ValidatorKind;
}
