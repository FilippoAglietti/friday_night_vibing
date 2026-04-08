/**
 * lib/claude/edit.ts
 * ─────────────────────────────────────────────────────────────
 * Shared helpers for the course-editing endpoints.
 *
 * These endpoints (regenerate-module, add-module, adjust-depth, etc.)
 * all need to call Claude with a focused prompt and parse a JSON
 * response back. The big /api/generate route already has this logic
 * but it is tightly coupled to the full async generation pipeline, so
 * we deliberately keep a small, dependency-free helper here instead.
 * ─────────────────────────────────────────────────────────────
 */

import Anthropic from "@anthropic-ai/sdk";

/** Default model used by all editing helpers. Keeps one source of truth. */
export const EDIT_MODEL = "claude-sonnet-4-6";

/**
 * Calls Claude with a retry + abort-on-timeout wrapper.
 *
 * Mirrors the behaviour of callClaudeWithRetry in /api/generate but is
 * intentionally smaller and self-contained so that editing endpoints
 * can import it without pulling in the whole generation pipeline.
 */
export async function callClaudeEdit({
  anthropic,
  system,
  messages,
  maxTokens = 16_384,
  label = "edit",
  timeoutMs = 140_000,
  attempts = 2,
}: {
  anthropic: Anthropic;
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  label?: string;
  timeoutMs?: number;
  attempts?: number;
}): Promise<Anthropic.Message> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // AbortController prevents silent hangs: we cancel the stream if the
    // round-trip takes longer than `timeoutMs`.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(
        `[claude-edit] [${label}] attempt ${attempt}/${attempts}, max_tokens=${maxTokens}, timeout=${timeoutMs}ms`
      );

      // The Anthropic SDK requires stream() for claude-sonnet-4-6.
      const stream = anthropic.messages.stream(
        { model: EDIT_MODEL, max_tokens: maxTokens, system, messages },
        { signal: controller.signal }
      );

      const response = await stream.finalMessage();
      clearTimeout(timer);

      console.log(
        `[claude-edit] [${label}] ok (stop=${response.stop_reason}, usage=${JSON.stringify(
          response.usage
        )})`
      );
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const isAbort = err instanceof Error && err.name === "AbortError";
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[claude-edit] [${label}] attempt ${attempt} failed: ${isAbort ? "TIMEOUT" : msg}`
      );
      if (attempt < attempts) {
        // Short backoff between attempts
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`[claude-edit] [${label}] all ${attempts} attempts failed: ${msg}`);
}

/**
 * Extracts the concatenated text from an Anthropic response.
 * Ignores any non-text blocks (tool_use, etc.) which should not
 * appear in these flows but are handled defensively.
 */
export function extractText(response: Anthropic.Message): string {
  return response.content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.type === "text" ? b.text : ""))
    .join("");
}

/**
 * Parses a JSON object out of Claude's text response.
 * Handles markdown fences and stray prose before/after the object.
 */
export function parseClaudeJson<T>(rawText: string, label = "edit"): T {
  let clean = rawText;

  // Strip ```json fences if present
  const fence = clean.match(/^```(?:json)?\s*\n?/);
  if (fence) {
    clean = clean.slice(fence[0].length);
    const end = clean.lastIndexOf("```");
    if (end !== -1) clean = clean.slice(0, end).trim();
  }

  // Direct parse
  try {
    return JSON.parse(clean) as T;
  } catch {
    /* fall through */
  }

  // Extract the outermost JSON object
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(clean.slice(first, last + 1)) as T;
    } catch {
      /* fall through */
    }
  }

  const preview = rawText.substring(0, 200).replace(/\n/g, "\\n");
  throw new Error(`[${label}] JSON parse failed. Preview: ${preview}...`);
}
