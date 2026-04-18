/**
 * app/api/generate/route.ts
 * ─────────────────────────────────────────────────────────────
 * Next.js App Router API route: POST /api/generate
 *
 * Async course generation endpoint. Returns courseId immediately (HTTP 202),
 * then runs generation in the background via after(). Uses stream() +
 * finalMessage() (SDK requires streaming for claude-sonnet-4-6) with
 * capped max_tokens for fast responses.
 *
 * Request body:  { topic, difficulty, courseLength, niche?, abstract?, learnerProfile? }
 * Success:       { success: true, courseId: string } [HTTP 202 Accepted]
 * Error:         { success: false, error: string, details?: string }
 *
 * The frontend receives courseId immediately and polls GET /api/courses/[id]/status
 * every 3 seconds until generation completes (status="ready" or "failed").
 *
 * Rate limit:    5 requests per IP per hour (in-memory, resets on restart)
 * Auth:          Required — Supabase session cookie (user must be authenticated)
 * Max tokens:    Scaled by course length (mini=8k, beginner=16k, intermediate=24k, advanced=32k)
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse, after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";
// Upstash-backed sliding-window rate limiter. Replaces the in-memory
// Map<> below, which silently reset on every Vercel cold start and
// let the same IP blow past 5/hour by hopping across isolates. Root
// cause of the April 8-9 Anthropic cost blow-up.
import { generateRateLimit } from "@/lib/rate-limiter";
// Inngest client for queue-based chunked generation. ALL course
// lengths now route through Inngest for a unified pipeline. The
// prompt controls output size (crash=1-2 modules, masterclass=6-10),
// not the generation architecture. The after() fallback only fires
// if inngest.send() itself throws (e.g. Inngest outage).
import { inngest } from "@/lib/inngest/client";
import { canGenerate } from "@/lib/pricing/cap-enforcement";
import { tierOrFallback } from "@/lib/pricing/tiers";
import type { CapResult } from "@/types/pricing";

export const dynamic = "force-dynamic";

/**
 * maxDuration extends the Vercel serverless function timeout.
 * The after() callback runs the Claude API call AFTER the 202 response,
 * but still within the same function invocation. 300s (5 min) is the
 * max for Vercel Pro plan — enough for masterclass courses (32k tokens).
 */
export const maxDuration = 300;

import {
  buildSkeletonCurriculumPrompt,
  buildModuleDetailCurriculumPrompt,
} from "@/lib/prompts/curriculum";
import type {
  GenerateRequest,
  GenerateAsyncResponse,
  GenerateErrorResponse,
  Curriculum,
  Module,
  AudienceLevel,
  CourseLength,
  TeachingStyle,
  OutputStructure,
  CourseLanguage,
  ContentDepth,
} from "@/types/curriculum";

// ─── Rate limiter ─────────────────────────────────────────────
//
// The previous in-memory Map<string, RateLimitEntry> rate limiter
// lived here. It was fatally broken on serverless: each Vercel cold
// start gave the calling IP a fresh empty Map, so the same client
// could launch arbitrary generations across isolates and burn the
// Anthropic API budget. The fix lives in src/lib/rate-limiter.ts —
// an Upstash-backed sliding window limiter whose counters survive
// cold starts. It's imported at the top of this file as
// `generateRateLimit` and invoked in the route handler below.
//
// The route handler still enforces 5/hour per IP (unchanged UX) —
// see step 1 of the POST handler.

// ─── Input validation ─────────────────────────────────────────

/** Valid values for the audience field */
const VALID_AUDIENCES: AudienceLevel[] = ["beginner", "intermediate", "advanced"];

/** Valid values for the length field */
const VALID_LENGTHS: CourseLength[] = ["crash", "short", "full", "masterclass"];
const VALID_TEACHING_STYLES: TeachingStyle[] = ["academic", "conversational", "hands-on", "storytelling"];
const VALID_OUTPUT_STRUCTURES: OutputStructure[] = ["modules", "workshop", "bootcamp"];
const VALID_LANGUAGES: CourseLanguage[] = ["en", "es", "pt", "fr", "de", "it", "nl", "pl", "ja", "ko", "zh", "ar", "hi", "ru", "tr", "sv"];
const VALID_CONTENT_DEPTHS: ContentDepth[] = ["structure_only", "full_content"];

/**
 * Validates and parses the incoming request body.
 * Returns a typed GenerateRequest or throws with a descriptive error message.
 *
 * @param body - Raw parsed JSON from the request
 * @returns Validated GenerateRequest
 * @throws Error with a user-facing message if validation fails
 */
function validateRequest(body: unknown): GenerateRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const b = body as Record<string, unknown>;

  // topic — required, string, min 3 chars
  if (!b.topic || typeof b.topic !== "string" || b.topic.trim().length < 3) {
    throw new Error("'topic' is required and must be at least 3 characters.");
  }

  // difficulty (audience) — accept both field names for compatibility
  const audience = (b.difficulty ?? b.audience) as AudienceLevel | undefined;
  if (!audience || !VALID_AUDIENCES.includes(audience)) {
    throw new Error(`'difficulty' must be one of: ${VALID_AUDIENCES.join(", ")}.`);
  }

  // courseLength (length) — accept both field names for compatibility
  const length = (b.courseLength ?? b.length) as CourseLength | undefined;
  if (!length || !VALID_LENGTHS.includes(length)) {
    throw new Error(`'courseLength' must be one of: ${VALID_LENGTHS.join(", ")}.`);
  }

  // niche — optional, string or undefined
  if (b.niche !== undefined && typeof b.niche !== "string") {
    throw new Error("'niche' must be a string if provided.");
  }

  // abstract — optional, string or undefined, max 4000 chars
  if (b.abstract !== undefined && typeof b.abstract !== "string") {
    throw new Error("'abstract' must be a string if provided.");
  }

  // learnerProfile — optional, string or undefined, max 500 chars
  if (b.learnerProfile !== undefined && typeof b.learnerProfile !== "string") {
    throw new Error("'learnerProfile' must be a string if provided.");
  }

  // language — optional, defaults to "en"
  const language = (b.language as CourseLanguage | undefined) ?? "en";
  if (!VALID_LANGUAGES.includes(language)) {
    throw new Error(`'language' must be one of: ${VALID_LANGUAGES.join(", ")}.`);
  }

  // includeQuizzes — optional boolean, defaults to true
  const includeQuizzes = b.includeQuizzes !== undefined ? Boolean(b.includeQuizzes) : true;

  // teachingStyle — optional, defaults to "conversational"
  const teachingStyle = (b.teachingStyle as TeachingStyle | undefined) ?? "conversational";
  if (!VALID_TEACHING_STYLES.includes(teachingStyle)) {
    throw new Error(`'teachingStyle' must be one of: ${VALID_TEACHING_STYLES.join(", ")}.`);
  }

  // outputStructure — optional, defaults to "modules"
  const outputStructure = (b.outputStructure as OutputStructure | undefined) ?? "modules";
  if (!VALID_OUTPUT_STRUCTURES.includes(outputStructure)) {
    throw new Error(`'outputStructure' must be one of: ${VALID_OUTPUT_STRUCTURES.join(", ")}.`);
  }

  // hasAttachments — optional boolean, defaults to false
  const hasAttachments = b.hasAttachments !== undefined ? Boolean(b.hasAttachments) : false;

  // contentDepth — optional, defaults to "full_content"
  const contentDepth = (b.contentDepth as ContentDepth | undefined) ?? "full_content";
  if (!VALID_CONTENT_DEPTHS.includes(contentDepth)) {
    throw new Error(`'contentDepth' must be one of: ${VALID_CONTENT_DEPTHS.join(", ")}.`);
  }

  // Sanitize: strip HTML tags and limit length
  const sanitizedTopic = b.topic
    .trim()
    .replace(/<[^>]*>/g, "")
    .substring(0, 200);

  return {
    topic: sanitizedTopic,
    audience,
    length,
    niche: b.niche
      ? (b.niche as string).trim().replace(/<[^>]*>/g, "").substring(0, 100)
      : undefined,
    abstract: b.abstract ? (b.abstract as string).trim().slice(0, 4000) : undefined,
    learnerProfile: b.learnerProfile ? (b.learnerProfile as string).trim().slice(0, 500) : undefined,
    language,
    includeQuizzes,
    teachingStyle,
    outputStructure,
    hasAttachments,
    contentDepth,
  };
}

// ─── JSON repair helper ──────────────────────────────────────

/**
 * Attempts to repair truncated JSON by closing any unclosed brackets/braces
 * and removing trailing incomplete key-value pairs.
 *
 * This is a best-effort approach for when Claude's response is cut off
 * mid-JSON due to hitting the max_tokens limit.
 *
 * @param json - Potentially truncated JSON string
 * @returns Repaired JSON string, or the original if repair fails
 */
function repairTruncatedJson(json: string): string {
  // Remove any trailing incomplete string (cut off mid-value)
  // Look for the last complete key-value pair
  let repaired = json;

  // Remove trailing incomplete string value (e.g., "key": "value that got cut)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*"[^"]*$/, "");
  // Remove trailing incomplete number/boolean (e.g., "key": 12)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*[\d.tfn][^,}\]]*$/, "");
  // Remove trailing incomplete key (e.g., , "incomplet)
  repaired = repaired.replace(/,\s*"[^"]*$/, "");

  // Count unclosed brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (const char of repaired) {
    if (escapeNext) { escapeNext = false; continue; }
    if (char === "\\") { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") openBraces++;
    if (char === "}") openBraces--;
    if (char === "[") openBrackets++;
    if (char === "]") openBrackets--;
  }

  // Close any unclosed brackets and braces (brackets first, then braces)
  while (openBrackets > 0) { repaired += "]"; openBrackets--; }
  while (openBraces > 0) { repaired += "}"; openBraces--; }

  return repaired;
}

// ─── Claude API call with retry logic ─────────────────────────

/**
 * Determines the appropriate max_tokens limit based on the requested course length.
 * Longer courses need more tokens to generate complete curricula.
 *
 * @param length - CourseLength: crash | short | full | masterclass
 * @returns max_tokens value to use in Claude API call
 */
function getMaxTokensForLength(length: CourseLength): number {
  // Budget table. CRITICAL CONSTRAINT: Claude Sonnet 4.6 streams at
  // ~50-80 tokens/sec sustained. Any max_tokens × timeout combination
  // that requires more than ~70 tok/s is a silent timeout bomb.
  //
  // Historical bug (Tentativi 1-9): the previous 32k/16k values paired
  // with 120s timeouts required 133-273 tok/s — literally impossible —
  // which is why every single-shot short/full/masterclass attempt
  // quietly failed with `AbortError: Request was aborted` after 120s.
  //
  // New budget math (60 tok/s baseline, with headroom):
  //   crash   : 5120  / 120s single-shot → needs 43 tok/s (safe)
  //   short   : 10240 / 180s single-shot → needs 57 tok/s (fits happy path)
  //   full/masterclass: these values are IGNORED — chunked path passes
  //     explicit overrideMaxTokens for skeleton (24576) and modules (24576)
  //     and uses Haiku 4.5 (~150 tok/s), not Sonnet.
  switch (length) {
    case "crash": return 5120;
    case "short": return 10240;
    case "full": return 16384;          // unused — chunked overrides
    case "masterclass": return 16384;   // unused — chunked overrides
    default: return 5120;
  }
}

/**
 * Calls the Claude API with retry logic and timeout.
 * - Retries once with exponential backoff (2s delay) on API failure
 * - Includes 60-second timeout per API call
 * - Logs all retry attempts to console
 * - Scales max_tokens based on requested course length
 *
 * @param anthropic - Anthropic SDK instance
 * @param system - System prompt
 * @param messages - User messages
 * @param length - CourseLength to determine token budget
 * @param attempt - Current attempt number (1 or 2)
 * @returns Claude API response
 * @throws Error if both attempts fail
 */
async function callClaudeWithRetry(
  anthropic: Anthropic,
  system: string,
  messages: Anthropic.MessageParam[],
  length: CourseLength,
  attempt: number = 1,
  overrideMaxTokens?: number,
  label: string = "unknown",
  timeoutMs: number = 120_000, // default 2-min timeout per call
  // `model` is explicitly overridable so the skeleton phase can use Haiku
  // (which is ~3× faster for structured JSON outputs) while the expensive
  // per-module content generation keeps using Sonnet for quality.
  model: string = "claude-sonnet-4-6",
  // `maxAttempts` = hard cap on the total number of attempts (including
  // the first one). Retries DOUBLE the wall-clock cost, so on tight-budget
  // paths (single-shot, per-module chunked calls) we pass 1 to disable the
  // retry. Phase 2 module failures are already recoverable via the
  // skeleton-stub backfill, so retrying per-call is pure downside.
  maxAttempts: number = 2,
): Promise<Anthropic.Message> {
  try {
    const maxTokens = overrideMaxTokens ?? getMaxTokensForLength(length);

    // AbortController prevents silent hangs — if the stream stalls,
    // we abort after timeoutMs instead of waiting for Vercel to kill us.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      console.error(`[/api/generate] [${label}] Aborting — timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    console.log(`[/api/generate] [${label}] Calling Claude (model=${model}, attempt ${attempt}, max_tokens=${maxTokens}, timeout=${timeoutMs}ms)...`);

    // Use stream() + finalMessage() instead of direct create().
    // The Anthropic SDK requires streaming for claude-sonnet-4-6 because
    // it predicts the request "may take longer than 10 minutes".
    // With capped max_tokens (8k-16k), streaming overhead is negligible
    // and each call completes in ~30-60s. Haiku is streaming-safe too.
    const stream = anthropic.messages.stream({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }, {
      signal: controller.signal,
    });

    // finalMessage() waits for the full response — same result as create()
    // but satisfies the SDK's streaming requirement.
    const response = await stream.finalMessage();

    clearTimeout(timer);
    console.log(`[/api/generate] [${label}] Claude responded (attempt ${attempt}, stop=${response.stop_reason}, usage=${JSON.stringify(response.usage)})`);
    return response;
  } catch (err) {
    // Distinguish abort (timeout) from other errors for better diagnostics
    const isAbort = err instanceof Error && err.name === "AbortError";
    const errMsg = err instanceof Error ? err.message : String(err);

    if (attempt < maxAttempts) {
      console.warn(
        `[/api/generate] [${label}] Attempt ${attempt}/${maxAttempts} failed (${isAbort ? "TIMEOUT" : errMsg}), retrying in 2s...`
      );
      await new Promise((r) => setTimeout(r, 2000));
      return callClaudeWithRetry(
        anthropic, system, messages, length, attempt + 1, overrideMaxTokens,
        label, timeoutMs, model, maxAttempts,
      );
    }

    // All allowed attempts exhausted — throw a descriptive error
    throw new Error(
      `[${label}] Claude call failed after ${attempt} attempts: ${isAbort ? `Timed out after ${timeoutMs}ms` : errMsg}`
    );
  }
}

// ─── JSON parsing helper ─────────────────────────────────────

/**
 * Parses a raw Claude response string into a JSON object.
 * Handles code fences, preamble text, and truncated JSON.
 *
 * @param rawText - Raw text from Claude's response
 * @param stopReason - Claude's stop_reason for logging
 * @param label - Label for log messages (e.g. "skeleton", "module mod-1")
 * @returns Parsed JSON object
 * @throws Error if parsing fails after all strategies
 */
function parseClaudeJson<T>(rawText: string, stopReason: string | null, label: string): T {
  if (stopReason === "max_tokens") {
    console.warn(`[/api/generate] [${label}] Response truncated (hit max_tokens). Attempting repair...`);
  }

  // Pre-process: strip markdown code fences
  let cleanText = rawText;
  const fenceStart = cleanText.match(/^```(?:json)?\s*\n?/);
  if (fenceStart) {
    cleanText = cleanText.slice(fenceStart[0].length);
    const fenceEnd = cleanText.lastIndexOf("```");
    if (fenceEnd !== -1) {
      cleanText = cleanText.slice(0, fenceEnd).trim();
    }
  }

  // Strategy 1: Direct parse
  try {
    return JSON.parse(cleanText) as T;
  } catch { /* continue */ }

  // Strategy 2: Extract JSON object between first { and last }
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1)) as T;
    } catch { /* continue */ }
  }

  // Strategy 3: Repair truncated JSON
  if (firstBrace !== -1) {
    const repairedJson = repairTruncatedJson(cleanText.slice(firstBrace));
    try {
      const result = JSON.parse(repairedJson) as T;
      console.warn(`[/api/generate] [${label}] JSON repaired after truncation — content may be incomplete.`);
      return result;
    } catch { /* continue */ }
  }

  // All strategies failed
  const preview = rawText.substring(0, 300).replace(/\n/g, "\\n");
  const tail = rawText.substring(Math.max(0, rawText.length - 150)).replace(/\n/g, "\\n");
  console.error(`[/api/generate] [${label}] Raw response (first 300):`, preview);
  console.error(`[/api/generate] [${label}] Raw response (last 150):`, tail);
  console.error(`[/api/generate] [${label}] Length: ${rawText.length}, stop: ${stopReason}`);
  throw new Error(
    `[${label}] JSON parse failed (len=${rawText.length}, stop=${stopReason}). Start: ${preview.substring(0, 120)}...`
  );
}

// ─── Single-shot generation (REMOVED) ───────────────────────
//
// The single-shot path (generateCurriculumSingleShot) has been removed.
// ALL course lengths now use the chunked pipeline (skeleton → per-module
// → finalize) routed through Inngest. The prompt's LENGTH_DESCRIPTIONS
// controls output size: crash="1-2 modules with 4-6 lessons total",
// masterclass="6-10 modules with 20-30 lessons total". Each individual
// Claude call stays well within token budget regardless of course length.
//
// The after() fallback still uses generateCurriculumChunked (not single-shot)
// if Inngest dispatch fails, so even the disaster-recovery path benefits
// from the robust per-module error handling.

// ─── Structured per-module failure records ──────────────────

/**
 * One structured record of a module- or phase-level failure during
 * chunked generation. Persisted to courses.generation_errors (JSONB).
 *
 * This closes the observability gap exposed by Tentativo 13 (Italian
 * masterclass 8/10 cliff, 2026-04-09): when the overall success ratio
 * stays above MIN_SUCCESS_RATIO (0.6), the course ships as status='ready'
 * and the per-module rejection reasons used to only land in console.warn()
 * — which Vercel runtime logs MCP can't retrieve. Now they land in the
 * DB as structured records regardless of overall outcome.
 *
 * phase values:
 *   "skeleton" — Phase 1 (outline) failure
 *   "module"   — Phase 2 (per-module) failure
 *   "global"   — global watchdog / timeout hit
 *
 * category values (normalized buckets, keep in sync with the
 * categorizeGenerationError function below):
 *   truncation  — Claude hit max_tokens mid-output (stop_reason=max_tokens)
 *   timeout     — per-call AbortController fired (individual 180s timeout)
 *   deadline    — Phase 2 hard deadline (Promise.race) preempted us
 *   parse_error — JSON.parse failed even after repair (malformed output)
 *   rate_limit  — Anthropic 429 (tokens/minute or requests/minute)
 *   api_error   — other 5xx/4xx from Anthropic API
 *   unknown     — didn't match any bucket; fall-through
 */
type GenerationErrorCategory =
  | "truncation"
  | "timeout"
  | "deadline"
  | "parse_error"
  | "rate_limit"
  | "api_error"
  | "unknown";

type GenerationErrorPhase = "skeleton" | "module" | "global";

interface GenerationError {
  moduleId: string;       // "mod-7" or "skeleton" or "global"
  moduleIndex: number;    // 0-based; -1 for skeleton/global
  phase: GenerationErrorPhase;
  category: GenerationErrorCategory;
  reason: string;         // original error text, truncated to 500 chars
  ts: string;             // ISO 8601
}

/**
 * Classify a raw error message into a normalized bucket, so analytics
 * queries and future auto-retry logic have something structured to key off.
 *
 * Heuristics follow the strings this codebase actually produces:
 *   • parseClaudeJson throws "JSON parse failed (len=..., stop=max_tokens)"
 *     when Claude filled the token budget mid-object — this is the
 *     Tentativo 11 smoking gun. We key on "stop=max_tokens" for that.
 *   • callClaudeWithRetry throws "... timed out after Xms" on AbortController
 *   • Phase 2 race throws "PHASE2_DEADLINE" or "Phase 2 deadline reached..."
 *   • The global watchdog throws "Global timeout: ..."
 *   • Anthropic SDK rate limits surface as HTTP 429 / "rate_limit_error"
 *   • Anthropic SDK other API errors usually include "APIError" or "status"
 *
 * Ordering matters: check the most specific patterns first.
 */
function categorizeGenerationError(reason: string): GenerationErrorCategory {
  const r = reason.toLowerCase();

  // Token budget exhausted mid-output — the Tentativo 11 diagnosis.
  // We check this BEFORE parse_error because a truncation ALSO produces
  // a parse failure, but the root cause is the token cap, not malformed JSON.
  if (r.includes("stop=max_tokens") || r.includes("stop_reason=max_tokens")) {
    return "truncation";
  }

  // Deadline preemption fires with a specific sentinel string.
  if (
    r.includes("phase2_deadline") ||
    r.includes("phase 2 deadline") ||
    r.includes("global timeout")
  ) {
    return "deadline";
  }

  // Per-call AbortController timeout (individual module).
  if (r.includes("timed out after") || r.includes("aborterror") || r.includes("request was aborted")) {
    return "timeout";
  }

  // Anthropic rate limiting — tokens-per-minute or requests-per-minute.
  if (r.includes("429") || r.includes("rate_limit") || r.includes("rate limit")) {
    return "rate_limit";
  }

  // JSON parse failure without the truncation signature above = malformed
  // output that wasn't just a chopped tail. Rare in practice but worth
  // separating so we can tell prompt-quality bugs from budget bugs.
  if (r.includes("json parse failed") || r.includes("json.parse") || r.includes("unexpected token")) {
    return "parse_error";
  }

  // Generic Anthropic API errors — 5xx, 400s that aren't rate limits, etc.
  if (r.includes("apierror") || r.includes("status code") || r.includes("status ")) {
    return "api_error";
  }

  return "unknown";
}

/**
 * Build a GenerationError record from a raw rejection reason.
 * Keeps `reason` bounded to 500 chars so a single rogue error can't
 * blow up the JSONB column size.
 */
function buildGenerationError(params: {
  moduleId: string;
  moduleIndex: number;
  phase: GenerationErrorPhase;
  rawReason: unknown;
}): GenerationError {
  const rawString =
    params.rawReason instanceof Error
      ? params.rawReason.message
      : String(params.rawReason);
  const reason = rawString.replace(/\s+/g, " ").slice(0, 500);
  return {
    moduleId: params.moduleId,
    moduleIndex: params.moduleIndex,
    phase: params.phase,
    category: categorizeGenerationError(reason),
    reason,
    ts: new Date().toISOString(),
  };
}

/**
 * Custom Error subclass that carries a structured generationErrors payload
 * through the throw/catch boundary between generateCurriculumChunked and
 * the top-level after() handler. Without this, hard failures would lose
 * all their per-module context by the time updateCourseRecord is called.
 *
 * The after() catch block does an `instanceof GenerationPipelineError`
 * check and forwards the .generationErrors array to updateCourseRecord,
 * which persists it alongside the hard-failure error_message.
 */
class GenerationPipelineError extends Error {
  generationErrors: GenerationError[];
  constructor(message: string, generationErrors: GenerationError[]) {
    super(message);
    this.name = "GenerationPipelineError";
    this.generationErrors = generationErrors;
  }
}

// ─── Chunked generation (for full/masterclass courses) ───────

/**
 * Generates a curriculum in two phases:
 *   Phase 1: Generate skeleton (outline with module/lesson stubs) — ~2-4k tokens, ~30-60s
 *   Phase 2: Generate full content for each module in parallel — ~5-8k tokens each, ~1-2 min
 *
 * This keeps every individual Claude call under 2 minutes, well within
 * Vercel Pro's 300s timeout even for masterclass courses with 10 modules.
 *
 * Progress is written to the course record after each module completes,
 * so the frontend can show "Generating module 3 of 6..." in real-time.
 *
 * @param request - Validated generation request
 * @param courseId - The course ID for progress updates
 * @returns Assembled Curriculum object
 */
async function generateCurriculumChunked(
  request: GenerateRequest,
  courseId: string,
): Promise<{ curriculum: Curriculum; generationErrors: GenerationError[] }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = getSupabaseAdmin();

  // Accumulator for structured per-module failure records. Populated by
  // the backfill loop below AND — on hard failure — attached to the
  // GenerationPipelineError so the catch at the top of after() can
  // persist them alongside the hard-failure error_message.
  const generationErrors: GenerationError[] = [];

  // Global safety: track total elapsed time. Vercel Pro kills at 300s.
  // We abort at 280s to leave ~20s for DB cleanup + after() bookkeeping.
  // Previous 270s was overly conservative: after the Haiku skeleton fix,
  // Phase 2 needs ≥180s of runway to stream 5k-token modules comfortably.
  const globalStart = Date.now();
  const GLOBAL_TIMEOUT_MS = 280_000;

  function checkGlobalTimeout(phase: string): void {
    const elapsed = Date.now() - globalStart;
    if (elapsed > GLOBAL_TIMEOUT_MS) {
      throw new Error(`Global timeout: ${phase} at ${(elapsed / 1000).toFixed(0)}s (limit ${GLOBAL_TIMEOUT_MS / 1000}s). Vercel would kill us at 300s.`);
    }
    console.log(`[/api/generate] [${courseId}] [${phase}] Elapsed: ${(elapsed / 1000).toFixed(1)}s of ${GLOBAL_TIMEOUT_MS / 1000}s`);
  }

  // ── Phase 1: Generate skeleton ─────────────────────────────
  console.log(`[/api/generate] [${courseId}] Phase 1: Generating course skeleton...`);

  await supabase.from("courses").update({
    generation_progress: "Designing course structure...",
    generation_total_modules: 0,
    generation_completed_modules: 0,
  }).eq("id", courseId);

  const { system: skelSystem, messages: skelMessages } = buildSkeletonCurriculumPrompt(request);

  // Skeleton is pure structure (module/lesson stubs) — a task at which
  // Haiku 4.5 excels and runs ~3× faster than Sonnet 4.6. Empirically a
  // 10-module masterclass skeleton on Sonnet took ~170s, which left no
  // runway for Phase 2 within Vercel's 300s hard cap. Haiku does the
  // same work in ~50-70s, freeing ~100s for the expensive per-module
  // content generation (which stays on Sonnet for quality).
  //
  // 24k max_tokens and 100s timeout comfortably fit a full 10-module
  // non-English academic outline with generous streaming headroom.
  // Haiku 4.5 supports 64k output tokens natively, and Italian/other
  // non-English languages tokenize ~20-30% heavier than English, so we
  // carry the headroom all the way to the skeleton phase too. At ~150
  // tok/s that's a worst-case ~164s stream — still inside the 100s
  // typical window because skeletons rarely exceed 8k tokens in practice.
  // The extra ceiling is insurance, not the expected path.
  //
  // Skeleton retries are allowed (maxAttempts=2 default) because this is
  // the one phase cheap enough to pay for one — ~60s × 2 = 120s budget,
  // which fits in 280s global deadline even if the retry fires.
  const skelResponse = await callClaudeWithRetry(
    anthropic, skelSystem, skelMessages, request.length, 1, 24576,
    `${courseId}/skeleton`, 100_000, "claude-haiku-4-5-20251001",
  );

  const skelTextBlock = skelResponse.content.find((block) => block.type === "text");
  if (!skelTextBlock || skelTextBlock.type !== "text") {
    throw new Error("Skeleton: Claude returned an empty or non-text response.");
  }

  const skeleton = parseClaudeJson<Curriculum>(skelTextBlock.text.trim(), skelResponse.stop_reason, "skeleton");

  const totalModules = skeleton.modules.length;
  console.log(`[/api/generate] [${courseId}] Phase 1 complete: ${totalModules} modules, ${skeleton.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons`);
  checkGlobalTimeout("after skeleton");

  // Update progress with module count
  await supabase.from("courses").update({
    generation_progress: `Generating module 1 of ${totalModules}...`,
    generation_total_modules: totalModules,
    generation_completed_modules: 0,
  }).eq("id", courseId);

  // ── Phase 2: Generate ALL module details in parallel ─────────
  // Run ALL modules concurrently. With Vercel Pro's 300s hard cap and
  // a Haiku skeleton averaging ~50-70s, Phase 2 has ~200-220s of runway.
  // Running modules in parallel means total time = max(single module) ≈
  // 90-120s, not the sum of all. The Anthropic API comfortably handles
  // 10 concurrent requests.
  //
  // Fault-tolerance (unchanged from before):
  //   • allSettled + skeleton-stub fallback for individual module failures.
  //   • MIN_SUCCESS_RATIO gate so a broadly broken batch still surfaces as
  //     an error instead of shipping 90% empty modules.
  //
  // NEW: hard deadline preemption. Before this, a single stalled module
  // would keep Phase 2 waiting until Vercel nuke-killed the whole function
  // at 300s — leaving the course in a permanent "generating" zombie state
  // with 0 completed modules persisted. Now we race Phase 2 against a
  // computed deadline (= remaining budget until the 270s global watchdog).
  // When the deadline wins, we harvest whatever modules already landed in
  // `detailedModules` (populated incrementally inside each promise) and
  // fall through to the normal backfill-with-skeleton-stubs path, so the
  // user ALWAYS gets a navigable course rather than a zombie.
  console.log(`[/api/generate] [${courseId}] Phase 2: Generating ALL ${totalModules} modules in parallel...`);

  const MIN_SUCCESS_RATIO = 0.6; // keep going even if 40% of modules fail
  const detailedModules: Module[] = new Array(totalModules);
  let completedModules = 0;

  // Kickoff stagger DISABLED (was 150ms per module → mod-10 lost ~1.5s
  // of runway vs mod-1 and frequently fell to the skeleton-stub backfill
  // in Tentativo 12). Haiku 4.5 on Anthropic's edge has independent rate
  // buckets from Sonnet and comfortably handles 10 concurrent streams
  // without the "initial burst throttled" phenomenon that motivated the
  // original stagger on Sonnet. Zero stagger = every module gets the
  // full 280s global budget and we get 10/10 clean instead of 9/10 with
  // a stub on the last slot.
  const KICKOFF_STAGGER_MS = 0;

  const modulePromises = skeleton.modules.map(async (moduleData, moduleIndex) => {
    // Stagger kept for defensiveness (guard against future regressions
    // if we re-enable). Currently a no-op because KICKOFF_STAGGER_MS = 0.
    if (moduleIndex > 0 && KICKOFF_STAGGER_MS > 0) {
      await new Promise((r) => setTimeout(r, moduleIndex * KICKOFF_STAGGER_MS));
    }
    const { system: modSystem, messages: modMessages } = buildModuleDetailCurriculumPrompt(
      request,
      skeleton.title,
      skeleton.description,
      moduleData,
      moduleIndex,
      totalModules,
    );

    // Module budget: 24k tokens / 180s timeout / NO retry / HAIKU 4.5.
    //
    // Post-Tentativo 11 pivot (the diagnostic breakthrough):
    //   Tentativo 11 surfaced the TRUE failure via per-module error
    //   reasons in courses.error_message:
    //     "[module mod-1] JSON parse failed (len=29283, stop=max_tokens)"
    //   That is NOT a timeout. Haiku successfully streamed ~7300 tokens
    //   (~29k chars) in well under the 180s window and then hit the 8192
    //   max_tokens ceiling with the JSON still mid-object. Every prior
    //   Tentativo that blamed timeouts was actually hitting token-budget
    //   truncation — the prompt asked for "2-4 paragraphs of rich
    //   markdown" per lesson with no upper bound, which a capable model
    //   happily expands into 8k+ tokens of prose per module.
    //
    // Current stacked defense:
    //   1. Bumped to 24576 tokens (from 16384) — Haiku 4.5 supports up to
    //      64k output tokens, so 24k is safe and gives us comfortable
    //      ~50% headroom on top of the 16k that already worked in the
    //      English Tentativi. This is specifically for non-English (IT,
    //      ES, DE, FR) which tokenize ~20-30% heavier and were the last
    //      failure surface after the Tentativo 12 English validation.
    //      Per Filippo's explicit ask: "metti di default più token per
    //      haiku tanto il limite è alto". At ~150 tok/s that's a
    //      worst-case ~164s stream — still inside the 180s timeout.
    //   2. Tightened prompt in MODULE_DETAIL_SYSTEM_PROMPT / builder to
    //      enforce strict per-lesson word budgets (280-400 words, 4
    //      keyPoints, 2 resources). This keeps actual generated output
    //      in the 5-8k token range with massive ceiling margin.
    //
    // Retry stays DISABLED: same reasoning as before (retry doubles
    // budget, blows Vercel cap, and backfill already recovers).
    const modResponse = await callClaudeWithRetry(
      anthropic, modSystem, modMessages, request.length,
      /* attempt */ 1,
      /* overrideMaxTokens */ 24576,
      /* label */ `${courseId}/module-${moduleData.id}`,
      /* timeoutMs */ 180_000,
      /* model */ "claude-haiku-4-5-20251001",
      /* maxAttempts */ 1,
    );

    const modTextBlock = modResponse.content.find((block) => block.type === "text");
    if (!modTextBlock || modTextBlock.type !== "text") {
      throw new Error(`Module ${moduleData.id}: Claude returned an empty response.`);
    }

    const moduleDetail = parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(
      modTextBlock.text.trim(),
      modResponse.stop_reason,
      `module ${moduleData.id}`,
    );

    // Merge the detailed lessons/quiz into the skeleton module
    const result = {
      ...moduleData,
      lessons: moduleDetail.lessons,
      quiz: moduleDetail.quiz || [],
    } as Module;

    // Update progress as each module completes (atomic increment)
    detailedModules[moduleIndex] = result;
    completedModules++;

    const progressMsg = completedModules < totalModules
      ? `Generated ${completedModules} of ${totalModules} modules...`
      : "Finalizing course...";

    await supabase.from("courses").update({
      generation_progress: progressMsg,
      generation_completed_modules: completedModules,
    }).eq("id", courseId);

    console.log(`[/api/generate] [${courseId}] Module ${moduleData.id} complete (${completedModules}/${totalModules})`);
    return result;
  });

  // Hard deadline = remaining budget until the 270s global watchdog,
  // minus 10s of safety runway for final DB writes. Never less than 30s
  // (if we're this late already we need the Promise.race to fire ASAP).
  const phase2RemainingMs = Math.max(
    30_000,
    GLOBAL_TIMEOUT_MS - (Date.now() - globalStart) - 10_000,
  );
  console.log(
    `[/api/generate] [${courseId}] Phase 2 hard deadline: ${(phase2RemainingMs / 1000).toFixed(0)}s`,
  );

  // Marker promise that rejects when Phase 2 has run out of time.
  // We race it against allSettled so we can preempt a stalled batch
  // instead of waiting for Vercel's nuclear kill at 300s.
  let phase2Timer: ReturnType<typeof setTimeout> | undefined;
  const phase2Deadline = new Promise<never>((_, reject) => {
    phase2Timer = setTimeout(
      () => reject(new Error("PHASE2_DEADLINE")),
      phase2RemainingMs,
    );
  });

  // Wait for ALL modules to settle OR the deadline to fire, whichever
  // comes first. allSettled never rejects by itself, so any rejection
  // from this race must be the deadline.
  let settled: PromiseSettledResult<Module>[];
  let phase2TimedOut = false;
  try {
    settled = (await Promise.race([
      Promise.allSettled(modulePromises),
      phase2Deadline,
    ])) as PromiseSettledResult<Module>[];
  } catch (raceErr) {
    if (raceErr instanceof Error && raceErr.message === "PHASE2_DEADLINE") {
      phase2TimedOut = true;
      console.warn(
        `[/api/generate] [${courseId}] Phase 2 hit hard deadline (${(phase2RemainingMs / 1000).toFixed(0)}s) — harvesting ${completedModules}/${totalModules} completed modules and backfilling the rest.`,
      );
      // Synthesize a settled array from whatever's done. Anything still
      // in-flight becomes a synthetic rejection so the backfill loop
      // picks up the skeleton stub for it.
      settled = skeleton.modules.map((_, i) =>
        detailedModules[i]
          ? ({ status: "fulfilled", value: detailedModules[i] } as PromiseFulfilledResult<Module>)
          : ({
              status: "rejected",
              reason: new Error(`Phase 2 deadline reached before module ${i + 1} completed`),
            } as PromiseRejectedResult),
      );
    } else {
      // Anything else is a real bug — rethrow so after() catches it
      clearTimeout(phase2Timer);
      throw raceErr;
    }
  } finally {
    clearTimeout(phase2Timer);
  }

  // Backfill any failed modules (or deadline-cancelled ones) with their
  // skeleton stub so the user still receives a complete, navigable course.
  //
  // Structured observability (post-Tentativo 13, 2026-04-09):
  //   Every rejection here now produces a GenerationError record in the
  //   `generationErrors` accumulator, regardless of whether we end up
  //   throwing (hard failure) or returning (partial success). Callers
  //   then persist the whole array to courses.generation_errors (JSONB)
  //   so analytics / retry UX / next-debug have a real forensic trail
  //   instead of lost console.warn() output.
  //
  // `failureReasons` (the legacy first-3-distinct text list) is kept
  // because the hard-failure path still embeds it in the thrown Error
  // message — that text ends up in courses.error_message where the
  // frontend expects it on status='failed'.
  let failureCount = 0;
  const failureReasons: string[] = [];
  settled.forEach((outcome, i) => {
    if (outcome.status === "rejected") {
      failureCount++;
      const err = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      console.warn(
        `[/api/generate] [${courseId}] Module ${skeleton.modules[i].id} FAILED — using skeleton stub. Reason: ${err}`
      );
      // Keep only the first 3 distinct reasons to keep error_message bounded.
      if (failureReasons.length < 3 && !failureReasons.includes(err)) {
        failureReasons.push(err);
      }
      // Always append the full structured record. No dedup here — each
      // module gets its own entry even if the reason text is identical,
      // because `moduleId` + `moduleIndex` are the primary keys for
      // future retry UX.
      generationErrors.push(
        buildGenerationError({
          moduleId: skeleton.modules[i].id,
          moduleIndex: i,
          phase: "module",
          rawReason: outcome.reason,
        }),
      );
      if (!detailedModules[i]) {
        // Promote the skeleton module as-is; the viewer handles missing
        // lesson.content by showing a "regenerate" prompt.
        detailedModules[i] = {
          ...skeleton.modules[i],
          lessons: skeleton.modules[i].lessons.map((l) => ({ ...l })),
          quiz: [],
        } as Module;
      }
    }
  });

  // If Phase 2 deadlined AND we have some completed modules, accept the
  // partial result — the course is still usable and the user can trigger
  // per-module regeneration from the dashboard. The normal MIN_SUCCESS_RATIO
  // guard below will still reject a mostly-empty result.
  if (phase2TimedOut) {
    console.warn(
      `[/api/generate] [${courseId}] Phase 2 deadline: delivered ${totalModules - failureCount}/${totalModules} detailed modules, ${failureCount} fell back to skeleton stubs.`,
    );
  }

  const successRatio = 1 - failureCount / totalModules;
  if (successRatio < MIN_SUCCESS_RATIO) {
    // Include the first distinct rejection reasons in the thrown message
    // so they end up in courses.error_message. The Vercel runtime logs MCP
    // has been silently broken through Tentativi 7-10, so the DB is the
    // only place we can post-mortem why modules actually failed.
    const reasonSummary = failureReasons.length > 0
      ? ` Reasons: ${failureReasons.map((r) => r.replace(/\s+/g, " ").slice(0, 220)).join(" | ")}`
      : "";
    // GenerationPipelineError carries the full structured `generationErrors`
    // array through the catch boundary in after() so updateCourseRecord can
    // persist both the free-text error_message AND the JSONB detail.
    throw new GenerationPipelineError(
      `Too many modules failed (${failureCount}/${totalModules} — ${(successRatio * 100).toFixed(0)}% success).${reasonSummary}`,
      generationErrors,
    );
  }
  if (failureCount > 0) {
    console.warn(
      `[/api/generate] [${courseId}] Phase 2 partially complete: ${failureCount}/${totalModules} module(s) fell back to skeleton stub.`
    );
  } else {
    console.log(`[/api/generate] [${courseId}] Phase 2 complete: all ${totalModules} modules generated`);
  }
  checkGlobalTimeout("after all modules");

  // ── Phase 3: Assemble final curriculum ─────────────────────
  const finalCurriculum: Curriculum = {
    ...skeleton,
    modules: detailedModules,
  };

  console.log(
    `[/api/generate] [${courseId}] Chunked generation complete: ${totalModules} modules assembled` +
      (generationErrors.length > 0
        ? ` (${generationErrors.length} module(s) degraded to skeleton stub — persisted to generation_errors)`
        : ""),
  );
  return { curriculum: finalCurriculum, generationErrors };
}

/**
 * Main entry point for curriculum generation (fallback path only).
 *
 * ALL course lengths now use the chunked pipeline (skeleton → per-module
 * → finalize). This function is only called from the after() fallback
 * when Inngest dispatch fails. The normal path is Inngest-driven.
 *
 * @param request - Validated generation request
 * @param courseId - The course ID for progress updates
 * @returns { curriculum, generationErrors }
 */
async function generateCurriculum(
  request: GenerateRequest,
  courseId: string,
): Promise<{ curriculum: Curriculum; generationErrors: GenerationError[] }> {
  console.log(`[/api/generate] [${courseId}] Using chunked generation for ${request.length} course (fallback path)`);
  return generateCurriculumChunked(request, courseId);
}

// ─── Supabase helpers ─────────────────────────────────────────

/**
 * Creates a Supabase server client using Next.js cookies.
 * Used to read the user session and save generations.
 */
async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // set() can throw in read-only contexts (e.g. during static generation)
            // This is safe to ignore — the session refresh will be retried on next request
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Same as above — safe to ignore in read-only contexts
          }
        },
      },
    }
  );
}

/**
 * Checks whether the authenticated user is allowed to generate a curriculum.
 * Free plan: 3 mini-course generations.
 * Pro plan: 15 generations/month.
 * Checks whether the authenticated user is allowed to generate a curriculum
 * against their tier's monthly cap. Returns a structured CapResult so the
 * route can surface tier/cap/resetAt to the client for the paywall modal.
 */
async function checkGenerationLimit(userId: string): Promise<CapResult> {
  const supabase = await createSupabaseServer();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, generations_used, enterprise_gen_cap")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { allowed: true };
  }

  return canGenerate({
    tier: tierOrFallback(profile.plan),
    generationsUsedThisMonth: profile.generations_used,
    enterpriseGenCap: profile.enterprise_gen_cap,
  });
}

/**
 * Creates a new course record with status="generating" in Supabase.
 * Returns the course ID which is used for polling the generation status.
 *
 * @param userId - The authenticated user's UUID (or null for anonymous)
 * @param request - The original generation request
 * @returns The newly created course ID
 * @throws Error if the database insert fails
 */
async function createCourseRecord(
  userId: string | null,
  request: GenerateRequest
): Promise<string> {
  if (!userId) {
    throw new Error("Cannot create course record without a user ID");
  }

  console.log("[/api/generate] Creating course record with status=generating for user:", userId);
  const supabase = await createSupabaseServer();

  // Create course record with status="generating" and ALL generation settings
  const { data: course, error } = await supabase.from("courses").insert({
    user_id: userId,
    title: request.topic,
    topic: request.topic,
    audience: request.audience,
    length: request.length,
    niche: request.niche ?? null,
    language: request.language ?? "en",
    level: request.audience as "beginner" | "intermediate" | "advanced",
    content_type: "text",
    curriculum: null,
    description: null,
    status: "generating", // Start with generating state
    error_message: null,
    // Generation settings — saved so we can show/reproduce what the user chose
    teaching_style: request.teachingStyle ?? "conversational",
    output_structure: request.outputStructure ?? "modules",
    include_quizzes: request.includeQuizzes ?? true,
    learner_profile: request.learnerProfile ?? null,
    course_abstract: request.abstract ?? null,
    has_attachments: request.hasAttachments ?? false,
  }).select("id").single();

  if (error) {
    console.error("[/api/generate] Failed to create course record:", error.message, error.details);
    throw new Error("Failed to create course record");
  }

  if (!course?.id) {
    throw new Error("No course ID returned from insert");
  }

  console.log("[/api/generate] Course record created with ID:", course.id);
  return course.id;
}

/**
 * Updates an existing course record with the generated curriculum or error.
 * Sets status to "ready" on success or "failed" on error.
 * Also increments the user's generation counter on success.
 *
 * `generationErrors` is persisted in both paths (success and failure) so
 * partial-success cases (e.g. 8/10 modules, success_ratio >= 0.6) have a
 * structured forensic trail. An empty array is the honest signal for
 * "generation completed with zero issues".
 *
 * @param userId - The authenticated user's UUID
 * @param courseId - The course ID to update
 * @param curriculum - The generated curriculum (if successful)
 * @param error - The error message (if generation failed)
 * @param generationErrors - Structured per-module failure records; always
 *                           persisted, defaults to [] when undefined
 */
async function updateCourseRecord(
  userId: string,
  courseId: string,
  curriculum?: Curriculum,
  error?: string,
  generationErrors: GenerationError[] = [],
): Promise<void> {
  // Use supabaseAdmin (service role) for background operations inside after().
  // The cookies-based createSupabaseServer() is unreliable after the response
  // has been sent — the cookie context may be gone.
  const supabase = getSupabaseAdmin();

  // Supabase client types generation_errors as Json (see database.types.ts).
  // We coerce via JSON.parse(JSON.stringify(...)) to (a) enforce that the
  // runtime payload is a pure JSON value and (b) silence any structural
  // type mismatches between the GenerationError interface and the Json
  // alias — same pattern used for curriculum on line ~1013.
  const generationErrorsJson = JSON.parse(JSON.stringify(generationErrors));

  if (curriculum) {
    // Update with successful curriculum
    console.log(
      `[/api/generate] Updating course ${courseId} with generated curriculum` +
        (generationErrors.length > 0
          ? ` (+${generationErrors.length} partial failure record(s))`
          : ""),
    );
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        curriculum: JSON.parse(JSON.stringify(curriculum)),
        status: "ready",
        title: curriculum.title ?? curriculum.id,
        description: curriculum.subtitle ?? null,
        generation_errors: generationErrorsJson,
      })
      .eq("id", courseId);

    if (updateError) {
      console.error("[/api/generate] Failed to update course record:", updateError.message, updateError.details);
      return;
    }

    console.log("[/api/generate] Course record updated successfully");

    // Increment generation counter and log usage event atomically
    const { error: rpcError } = await supabase.rpc("increment_generation_usage", {
      p_user_id: userId,
      p_course_id: courseId,
      p_event_type: "course_generated",
    });
    if (rpcError) {
      console.error("[/api/generate] increment_generation_usage RPC failed:", rpcError.message);
    } else {
      console.log("[/api/generate] Generation counter incremented for user:", userId);
    }
  } else if (error) {
    // Update with error state
    console.log(
      `[/api/generate] Updating course ${courseId} with error:`,
      error,
      generationErrors.length > 0 ? `(+${generationErrors.length} structured record(s))` : "",
    );
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "failed",
        error_message: error,
        generation_errors: generationErrorsJson,
      })
      .eq("id", courseId);

    if (updateError) {
      console.error("[/api/generate] Failed to update course error state:", updateError.message, updateError.details);
    }
  }
}

// ─── Route handler ────────────────────────────────────────────

/**
 * POST /api/generate
 *
 * Main request handler. Implements async course generation:
 *   1. Rate limit check by IP
 *   2. Input validation
 *   3. Auth check + generation limit enforcement
 *   4. Create course record with status="generating"
 *   5. Return courseId immediately (HTTP 202)
 *   6. Run generation in background via after()
 *   7. Update course record with curriculum or error
 *
 * Uses stream() + finalMessage() (SDK requires streaming) with capped max_tokens.
 * Vercel Pro maxDuration=300 gives 5 minutes for after() to complete.
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateAsyncResponse | GenerateErrorResponse>> {
  // ── Step 1: Rate limit ──────────────────────────────────────
  // IP extraction: Vercel always sets x-forwarded-for with the real
  // client IP as the leftmost entry. Fall back to x-real-ip for any
  // proxy chain that uses the older header. "unknown" is the final
  // fallback — all requests that hit it share one bucket, which is
  // intentional: an IP-less request is suspicious and should be
  // aggressively rate-limited together.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Upstash sliding window: 5 requests / 1 hour per IP. See
  // src/lib/rate-limiter.ts for why this replaces the previous
  // in-memory Map-based limiter (short answer: cold-start amnesia).
  // Fails open on Upstash errors so a Redis outage can't take the
  // generate endpoint down — the ratelimiter logs the issue and we
  // monitor for it.
  const rateLimitResult = await generateRateLimit.limit(ip);
  if (!rateLimitResult.success) {
    console.warn(
      `[/api/generate] Rate limit hit for ip=${ip} limit=${rateLimitResult.limit} reset=${rateLimitResult.reset}`,
    );
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait before generating again." },
      {
        status: 429,
        headers: {
          // Standard rate limit headers so the frontend can surface
          // a useful message ("retry in 42 minutes") without guessing.
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(Math.max(0, rateLimitResult.remaining)),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      },
    );
  }

  // ── Step 2: Parse + validate request body ──────────────────
  let generateRequest: GenerateRequest;
  try {
    const body = await req.json();
    generateRequest = validateRequest(body);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request.",
        details: err instanceof Error ? err.message : "Unknown validation error.",
      },
      { status: 400 }
    );
  }

  // ── Step 3: Auth + generation limit check ──────────────────
  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.warn("[/api/generate] auth.getUser() returned error:", authError.message);
    }

    if (user) {
      userId = user.id;
      console.log("[/api/generate] Authenticated user:", userId, user.email);
      const capResult = await checkGenerationLimit(userId);
      if (!capResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "cap_exceeded",
            tier: capResult.tier,
            cap: capResult.cap,
            resetAt: capResult.resetAt,
          },
          { status: 402 }
        );
      }
    } else {
      console.warn("[/api/generate] No user session found — cannot generate without authentication");
      // For async generation, we require authentication because we need to save to a user's course
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
          details: "You must be signed in to generate a course.",
        },
        { status: 401 }
      );
    }
  } catch (err) {
    // Auth errors are non-fatal — proceed without user context
    console.error("[/api/generate] Auth check exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication check failed.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  // ── Step 4: Create course record with status="generating" ────
  let courseId: string;
  try {
    courseId = await createCourseRecord(userId, generateRequest);
  } catch (err) {
    console.error("[/api/generate] Failed to create course record:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course record.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  // ── Step 5: Return courseId immediately ─────────────────────
  const res = NextResponse.json(
    { success: true as const, courseId },
    { status: 202 }
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");

  // ── Step 6: Background generation via Inngest ──────────────
  //
  // Unified pipeline: ALL course lengths (crash, short, full,
  // masterclass) route through Inngest. The prompt controls output
  // size — crash produces 1-2 modules, masterclass produces 6-10.
  // Each module gets its own Inngest function invocation with its
  // own 300s Vercel budget, eliminating the max_tokens truncation
  // bug that plagued the old single-shot path for crash/short.
  //
  // Fallback: if inngest.send() itself throws (Inngest outage,
  // invalid event key), we fall through to the after() path which
  // runs the same chunked pipeline in-process. The course still
  // generates — just constrained by a single 280s global deadline
  // instead of per-module independent budgets.

  // Fallback closure defined first (before the Inngest try/catch)
  // to avoid TDZ issues with const declarations.
  const runInProcessGeneration = async () => {
    const startTime = Date.now();
    try {
      console.log(`[/api/generate] [${courseId}] after() fallback started at ${new Date().toISOString()}`);
      const { curriculum, generationErrors } = await generateCurriculum(generateRequest, courseId);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `[/api/generate] [${courseId}] Generation complete in ${elapsed}s — saving to DB...` +
          (generationErrors.length > 0
            ? ` [${generationErrors.length} partial failure record(s) will be persisted]`
            : ""),
      );
      await updateCourseRecord(userId!, courseId, curriculum, undefined, generationErrors);
      console.log(`[/api/generate] [${courseId}] Course saved successfully. Total: ${elapsed}s`);
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const errorMessage = err instanceof Error ? err.message : "Unknown error during generation";
      console.error(`[/api/generate] [${courseId}] FAILED after ${elapsed}s:`, errorMessage);
      if (err instanceof Error && err.stack) {
        console.error(`[/api/generate] [${courseId}] Stack:`, err.stack);
      }
      const structuredErrors =
        err instanceof GenerationPipelineError ? err.generationErrors : [];
      try {
        await updateCourseRecord(userId!, courseId, undefined, errorMessage, structuredErrors);
        console.log(
          `[/api/generate] [${courseId}] Error state saved to DB` +
            (structuredErrors.length > 0
              ? ` with ${structuredErrors.length} structured record(s)`
              : ""),
        );
      } catch (updateErr) {
        console.error(`[/api/generate] [${courseId}] CRITICAL: Failed to update error state:`, updateErr);
      }
    }
  };

  // ── Primary path: Inngest queue ──
  try {
    await inngest.send({
      name: "course/generate.requested",
      data: {
        courseId,
        request: generateRequest,
        userId: userId ?? null,
      },
    });
    console.log(
      `[/api/generate] [${courseId}] Dispatched to Inngest queue (length=${generateRequest.length})`,
    );
    // Successful dispatch — Inngest drives the rest. No after() needed.
    return res;
  } catch (inngestErr) {
    // Inngest is down — fall through to the chunked after() fallback.
    // The course still generates, just within a single 280s budget.
    console.error(
      `[/api/generate] [${courseId}] Inngest dispatch FAILED, falling back to after() path:`,
      inngestErr,
    );
  }

  // ── Fallback: in-process after() ──
  // Only reached if inngest.send() threw above.
  after(runInProcessGeneration);

  return res;
}
