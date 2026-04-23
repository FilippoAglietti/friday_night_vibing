/**
 * Feature flags — read from env vars at call time.
 *
 * Why a dedicated reader: env var checks are easy to typo and hard to grep.
 * Keep them in one module with named exports so feature flags have a single
 * source of truth the entire app reads.
 *
 * Export v2 flag toggles the new HTML → Playwright → PDF pipeline. Default
 * OFF; the old jsPDF path stays active until we explicitly turn it on in
 * Vercel + Cloud Run env.
 */
export function isExportV2Enabled(): boolean {
  return process.env.EXPORT_V2_ENABLED === "true";
}
