// src/lib/validators/url-check.ts
// ─────────────────────────────────────────────────────────────
// Pure, framework-agnostic URL validator. Used by the async
// validateCourseUrls Inngest function to post-check every URL in
// a generated curriculum. Intentionally has no Inngest / Supabase
// imports so it can be unit-tested in isolation later without a
// test infrastructure bootstrap (see plan note in spec §6).
// ─────────────────────────────────────────────────────────────

import type { UrlStatus } from "@/types/curriculum";

/**
 * Check whether a URL is reachable.
 *
 * Strategy:
 *   1. HEAD with redirect follow and a hard timeout (default 5s).
 *   2. If HEAD returns 405/501 (method not allowed), retry with
 *      GET + Range: bytes=0-0 to avoid downloading the body.
 *   3. Classify the final response status:
 *        2xx, 3xx            → "ok"
 *        401, 403, 429       → "blocked" (server answered but denied)
 *        anything else / throw → "unreachable"
 *
 * Never throws — failures become "unreachable".
 */
export async function checkUrl(url: string, timeoutMs = 5000): Promise<UrlStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
    } catch {
      return "unreachable";
    }

    if (response.status === 405 || response.status === 501) {
      try {
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { Range: "bytes=0-0" },
        });
      } catch {
        return "unreachable";
      }
    }

    if (response.ok || (response.status >= 300 && response.status < 400)) return "ok";
    if (response.status === 401 || response.status === 403 || response.status === 429) return "blocked";
    return "unreachable";
  } finally {
    clearTimeout(timer);
  }
}
