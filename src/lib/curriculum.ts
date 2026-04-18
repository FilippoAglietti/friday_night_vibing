/**
 * lib/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Helpers for working with curriculum data structures.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Returns true if any lesson in the curriculum has a non-empty body string.
 * Used to decide whether to show the BodyUnlockButton.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function courseHasModuleBodies(curriculum: any): boolean {
  if (!curriculum?.modules) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return curriculum.modules.some((m: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    m.lessons?.some((l: any) => typeof l.body === "string" && l.body.length > 0)
  );
}
