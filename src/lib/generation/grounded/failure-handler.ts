/**
 * Threshold-based failure handling for grounded lessons.
 *   invalidRatio <= 0.20 → silent remove (strip invalid [n] + bib entries)
 *   invalidRatio  > 0.20 → caller should trigger LLM repair
 *   repair fails         → caller should mark the lesson partial
 *
 * This module only encodes policy; the LLM repair and partial-marking
 * live in the Inngest function that knows how to call Claude and write
 * to generation_jobs.
 */

import type { ValidateCitationsResult } from "./citation-parser";

export type FailurePolicy =
  | { action: "keep" }
  | { action: "silent_remove"; dropIndices: number[] }
  | { action: "repair" }; // caller triggers repair call, then re-validates

const SILENT_REMOVE_MAX_RATIO = 0.2;

export function decideFailurePolicy(
  result: ValidateCitationsResult,
): FailurePolicy {
  if (result.invalidCitations.length === 0) {
    return { action: "keep" };
  }
  if (result.invalidRatio <= SILENT_REMOVE_MAX_RATIO) {
    return {
      action: "silent_remove",
      dropIndices: result.invalidCitations.map((c) => c.index),
    };
  }
  return { action: "repair" };
}

/**
 * Removes every [n] occurrence where n is in dropIndices, and strips
 * matching bibliography entries. Does not renumber surviving citations —
 * renumbering would require re-parsing and re-emitting the whole block;
 * leaving gaps is cheap and not visually disruptive.
 */
export function stripInvalidCitations(
  markdown: string,
  dropIndices: number[],
): string {
  if (dropIndices.length === 0) return markdown;
  const dropSet = new Set(dropIndices);

  // Strip inline [n] and [n,m] where every element is dropped.
  const stripped = markdown.replace(
    /\[(\d+(?:\s*,\s*\d+)*)\]/g,
    (full, group: string) => {
      const nums = group.split(/\s*,\s*/).map((x) => parseInt(x, 10));
      const kept = nums.filter((n) => !dropSet.has(n));
      if (kept.length === 0) return "";
      return `[${kept.join(",")}]`;
    },
  );

  // Strip matching bibliography lines.
  return stripped.replace(
    /^\s*\[(\d+)\][^\n]*\n?/gm,
    (full, num: string) => (dropSet.has(parseInt(num, 10)) ? "" : full),
  );
}
