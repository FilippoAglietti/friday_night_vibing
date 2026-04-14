/**
 * Decides whether a generation request should run through the grounded
 * pipeline and, if so, what StyleConfig to use. Pure function — no I/O,
 * no Anthropic, no Supabase.
 */

import type { GenerateRequest } from "@/types/curriculum";
import type { StyleConfig } from "./types";

export function isGroundedGenerationEnabled(): boolean {
  return process.env.GROUNDED_GENERATION_ENABLED === "true";
}

/**
 * Returns a StyleConfig if the request qualifies for the grounded
 * pipeline, or null to fall through to the current (un-grounded) path.
 */
export function shouldGroundStyle(request: GenerateRequest): StyleConfig | null {
  if (!isGroundedGenerationEnabled()) return null;

  const style = request.teachingStyle ?? "conversational";

  switch (style) {
    case "academic":
      return academicStyleConfig(request);
    default:
      return null;
  }
}

// ─── Academic (Phase 1) ──────────────────────────────────────

function academicStyleConfig(request: GenerateRequest): StyleConfig {
  return {
    enabled: true,
    // Order matters: paper is preferred but books and arXiv are first-class.
    // The discovery prompt picks the right mix per topic.
    sourceKinds: ["paper", "book", "arxiv"],
    density: academicDensity(request),
  };
}

function academicDensity(
  request: GenerateRequest,
): { min: number; max: number } {
  const { length, audience } = request;
  const matrix: Record<string, Record<string, [number, number]>> = {
    beginner: {
      crash: [2, 3],
      short: [3, 4],
      full: [4, 5],
      masterclass: [5, 6],
    },
    intermediate: {
      crash: [3, 5],
      short: [5, 7],
      full: [6, 9],
      masterclass: [8, 11],
    },
    advanced: {
      crash: [4, 6],
      short: [6, 8],
      full: [8, 11],
      masterclass: [10, 15],
    },
  };
  const [min, max] = matrix[audience]?.[length] ?? [4, 6];
  return { min, max };
}
