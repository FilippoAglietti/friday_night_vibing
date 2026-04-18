/**
 * src/lib/inngest/functions.ts
 * ─────────────────────────────────────────────────────────────
 * Inngest functions for the chunked course generation pipeline.
 *
 * Three functions chained via events:
 *
 *   course.generate       — Phase 1 (skeleton) + fan-out
 *     Triggered by: course/generate.requested
 *     Emits:        module/generate.requested  (N times)
 *
 *   module.generate       — Phase 2 (per-module, runs in parallel)
 *     Triggered by: module/generate.requested
 *     Emits:        course/finalize.requested  (once, when last module done)
 *
 *   course.finalize       — merges all module results, marks ready
 *     Triggered by: course/finalize.requested
 *     Emits:        nothing
 *
 * Why split this way:
 *   • Each function runs as its own Vercel invocation with its own
 *     300s budget. A 10-module masterclass → 12 independent budgets,
 *     instead of one monolithic budget that was the Tentativo 13 wall.
 *   • Inngest retries each function independently on failure. If
 *     mod-7 fails, mod-1..6 and mod-8..10 keep going.
 *   • Concurrency is throttled by Inngest (see `concurrency` option
 *     on module.generate) so Anthropic's rate limits don't matter —
 *     Inngest queues the excess instead of throwing 429s.
 *   • If the user closes their laptop after kicking off the course,
 *     Inngest keeps running on its own infrastructure. That's the
 *     target UX: "launch generation, close laptop, come back to a
 *     finished course."
 *
 * NOTE: This file is only imported by /api/inngest/route.ts which
 * runs server-side. Never import it from client components.
 * ─────────────────────────────────────────────────────────────
 */

import Anthropic from "@anthropic-ai/sdk";
import { inngest } from "./client";
import { validateCourseUrls } from "./validate-urls";
import { reviewSkeleton } from "@/lib/inngest/reviewer";
import { selectLessonsToPolish, polishLesson } from "@/lib/inngest/polish";
import { tierOrFallback, TIERS } from "@/lib/pricing/tiers";
import { getSupabaseAdmin } from "@/lib/supabase";
import { recordEvent } from "@/lib/observability/metrics";
import {
  buildSkeletonCurriculumPrompt,
  buildModuleDetailCurriculumPrompt,
} from "@/lib/prompts/curriculum";
import {
  shouldGroundStyle,
  discoverSources,
  verifySources,
  validateCitations,
  decideFailurePolicy,
  stripInvalidCitations,
} from "@/lib/generation/grounded";
import type { VerifiedSource } from "@/lib/generation/grounded";
import { buildGroundedModuleDetailPrompt } from "@/lib/generation/grounded/academic-prompt";
import type {
  GenerateRequest,
  Curriculum,
  Module,
} from "@/types/curriculum";

// ─── Model selection ────────────────────────────────────────
//
// Configurable via GENERATION_MODEL env var. Defaults to Haiku 4.5
// for cost efficiency. Set to "claude-sonnet-4-6" for higher quality.
const GENERATION_MODEL = process.env.GENERATION_MODEL || "claude-haiku-4-5-20251001";

// ─── Anthropic pricing (USD per 1M tokens) ──────────────────
//
// Used only for observability metadata — never for billing logic.
// Public Anthropic pricing as of 2026-04-12. If Anthropic changes
// prices, update this table and the commit history will record when.
const CLAUDE_PRICING_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.00, output: 5.00 },
  "claude-sonnet-4-6":         { input: 3.00, output: 15.00 },
};

// ─── Shared helpers ─────────────────────────────────────────

/**
 * Call Claude via the Anthropic SDK streaming interface.
 *
 * We duplicate this helper (instead of importing from /api/generate)
 * because the route file is huge and importing from a Next.js route
 * into a library file creates circular-bundling weirdness. This
 * version is simpler — no in-process retries, because Inngest
 * itself retries on throw via its `retries` option.
 */
async function callClaude(params: {
  system: string;
  messages: Anthropic.MessageParam[];
  model: string;
  maxTokens: number;
  label: string;
  timeoutMs: number;
  courseId: string;
  phase: "skeleton" | "module_detail";
}): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startTime = Date.now();

  // CRITICAL: The Anthropic SDK's AbortController integration does NOT
  // reliably kill an in-flight stream.finalMessage() call. Once the
  // HTTP connection is established, controller.abort() may fire the
  // signal but finalMessage() doesn't reject — the promise hangs
  // indefinitely as a zombie.
  //
  // Fix: Use Promise.race() with an explicit timeout rejection.
  // This guarantees the function throws after timeoutMs regardless
  // of what the SDK's stream is doing. AbortController is kept as
  // belt-and-suspenders to also close the underlying TCP socket.
  const controller = new AbortController();

  const stream = anthropic.messages.stream(
    {
      model: params.model,
      max_tokens: params.maxTokens,
      system: params.system,
      messages: params.messages,
    },
    { signal: controller.signal },
  );

  // Race the stream against a hard timeout. This is the ONLY reliable
  // way to enforce time limits with the Anthropic streaming SDK.
  //
  // CRITICAL: The timeout timer MUST be cleared on both success and
  // failure. If left running, it creates an unhandled promise rejection
  // when it fires after Promise.race() has already settled — which
  // crashes the Node.js process and kills all in-flight DB operations.
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort(); // also close the socket
      reject(new Error(
        `[${params.label}] Claude stream timed out after ${params.timeoutMs}ms`,
      ));
    }, params.timeoutMs);
  });

  let response: Anthropic.Message;
  try {
    response = await Promise.race([
      stream.finalMessage(),
      timeoutPromise,
    ]);
    clearTimeout(timeoutId!); // Success: prevent dangling timer
  } catch (err) {
    clearTimeout(timeoutId!); // Failure: prevent dangling timer
    try { stream.abort(); } catch { /* ignore cleanup errors */ }
    const errMsg = err instanceof Error ? err.message : String(err);
    await recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_failure",
      phase: params.phase,
      durationMs: Date.now() - startTime,
      metadata: {
        model: params.model,
        reason: errMsg,
        rateLimited: errMsg.includes("429") || errMsg.toLowerCase().includes("rate"),
        timedOut: errMsg.toLowerCase().includes("timed out"),
      },
    });
    throw err;
  }

  const pricing = CLAUDE_PRICING_USD_PER_MTOK[params.model] ?? { input: 0, output: 0 };
  const tokensIn  = response.usage?.input_tokens  ?? 0;
  const tokensOut = response.usage?.output_tokens ?? 0;
  const costUsd =
    (tokensIn  / 1_000_000) * pricing.input +
    (tokensOut / 1_000_000) * pricing.output;

  await recordEvent({
    courseId: params.courseId,
    eventType: "claude_call_success",
    phase: params.phase,
    durationMs: Date.now() - startTime,
    metadata: {
      model: params.model,
      tokensIn,
      tokensOut,
      costUsd: Number(costUsd.toFixed(6)),
      stopReason: response.stop_reason,
      truncated: response.stop_reason === "max_tokens",
    },
  });

  // Extract the first text block. Claude always returns at least
  // one text block for these prompts.
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`[${params.label}] Claude returned empty response`);
  }

  if (response.stop_reason === "max_tokens") {
    console.warn(
      `[inngest/callClaude] [${params.label}] Response truncated (max_tokens=${params.maxTokens}). Will attempt JSON repair.`,
    );
  }

  return textBlock.text.trim();
}

/**
 * Repair truncated JSON by removing incomplete trailing key-value
 * pairs and closing unclosed brackets/braces. Ported from route.ts
 * where it has been battle-tested across 13+ iterations.
 *
 * This recovers valid (but potentially incomplete) JSON from Claude
 * responses that hit the max_tokens ceiling. A truncated course
 * with 3/5 lessons is infinitely better than a thrown error.
 */
function repairTruncatedJson(json: string): string {
  let repaired = json;

  // Remove trailing incomplete string value (e.g., "key": "value that got cut)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*"[^"]*$/, "");
  // Remove trailing incomplete number/boolean (e.g., "key": 12)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*[\d.tfn][^,}\]]*$/, "");
  // Remove trailing incomplete key (e.g., , "incomplet)
  repaired = repaired.replace(/,\s*"[^"]*$/, "");
  // Remove trailing comma before we close brackets (invalid JSON)
  repaired = repaired.replace(/,\s*$/, "");

  // Count unclosed brackets and braces (respecting string context)
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

/**
 * In-memory parse strategies 1–3. Returns the parsed value and the
 * winning strategy number, or null if all three fail. Pure function:
 * no telemetry, no LLM calls. Used both on the original Claude
 * response and on the LLM-repaired response (strategy 4).
 */
function tryLocalParseStrategies<T>(raw: string): { value: T; strategy: 1 | 2 | 3 } | null {
  let cleaned = raw;

  // Strip markdown code fences if present
  const fenceStart = cleaned.match(/^```(?:json)?\s*\n?/);
  if (fenceStart) {
    cleaned = cleaned.slice(fenceStart[0].length);
    const fenceEnd = cleaned.lastIndexOf("```");
    if (fenceEnd !== -1) cleaned = cleaned.slice(0, fenceEnd).trim();
  }

  // Strategy 1: Direct parse (happy path — works ~80% of the time)
  try {
    return { value: JSON.parse(cleaned) as T, strategy: 1 };
  } catch { /* fall through */ }

  // Strategy 2: Extract JSON between first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return { value: JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T, strategy: 2 };
    } catch { /* fall through */ }
  }

  // Strategy 3: Repair truncated JSON (max_tokens truncation recovery)
  if (firstBrace !== -1) {
    try {
      return { value: JSON.parse(repairTruncatedJson(cleaned.slice(firstBrace))) as T, strategy: 3 };
    } catch { /* fall through */ }
  }

  return null;
}

/**
 * Strategy 4: LLM-assisted JSON repair.
 *
 * When all three local strategies fail, hand the malformed text back
 * to Haiku with a strict "fix syntax only, do not change content"
 * system prompt. Then re-run the local strategies on the response.
 *
 * Bounded by maxTokens 8192 + timeoutMs 60_000 — well under the
 * 290s Vercel ceiling so it cannot starve the surrounding step.
 *
 * Returns null if the LLM fails to produce parseable JSON, in which
 * case the caller throws and Inngest retries the whole step. Never
 * throws itself — repair must be best-effort.
 */
async function llmRepairJson<T>(
  raw: string,
  label: string,
  courseId: string | undefined,
): Promise<{ value: T; innerStrategy: 1 | 2 | 3 } | null> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startTime = Date.now();

  await recordEvent({
    courseId,
    eventType: "json_parse_repair_attempt",
    metadata: { label, rawLength: raw.length },
  });

  const system =
    "You are a JSON repair tool. The user will give you a malformed JSON document. " +
    "Output ONLY the corrected JSON — no preamble, no explanation, no markdown code fences. " +
    "Fix syntax errors only: unescaped quotes, missing commas, missing brackets/braces, " +
    "trailing commas, truncated values. DO NOT change, summarize, or invent any content. " +
    "If a value is truncated mid-string, terminate it with the closing quote at the cut point. " +
    "If trailing keys are incomplete, drop them. Preserve all complete keys and values verbatim.";

  let repaired: string;
  try {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`[${label}] llmRepairJson timed out after 60000ms`));
      }, 60_000);
    });

    const stream = anthropic.messages.stream(
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        system,
        messages: [{ role: "user", content: raw }],
      },
      { signal: controller.signal },
    );

    let response: Anthropic.Message;
    try {
      response = await Promise.race([stream.finalMessage(), timeoutPromise]);
      clearTimeout(timeoutId!);
    } catch (err) {
      clearTimeout(timeoutId!);
      try { stream.abort(); } catch { /* ignore */ }
      throw err;
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.warn(`[inngest/llmRepairJson] [${label}] empty response from repair call`);
      return null;
    }
    repaired = textBlock.text.trim();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[inngest/llmRepairJson] [${label}] repair call failed: ${errMsg}`);
    return null;
  }

  const result = tryLocalParseStrategies<T>(repaired);
  if (!result) {
    console.warn(
      `[inngest/llmRepairJson] [${label}] repair output still unparseable (repairedLen=${repaired.length})`,
    );
    return null;
  }

  await recordEvent({
    courseId,
    eventType: "json_parse_repair_success",
    durationMs: Date.now() - startTime,
    metadata: {
      label,
      rawLength: raw.length,
      repairedLength: repaired.length,
      innerStrategy: result.strategy,
    },
  });

  console.warn(
    `[inngest/llmRepairJson] [${label}] LLM-repaired JSON parsed via inner strategy ${result.strategy}`,
  );

  return { value: result.value, innerStrategy: result.strategy };
}

/**
 * Parse a Claude JSON response with 4 strategies:
 *   1. Direct JSON.parse (happy path)
 *   2. Extract between first { and last } (markdown/preamble stripping)
 *   3. repairTruncatedJson (recover from max_tokens truncation)
 *   4. LLM-assisted repair (strict syntax-only Haiku call)
 *
 * Throws on unparseable input so Inngest's retry logic kicks in,
 * but only after all 4 strategies have been exhausted.
 */
async function parseClaudeJson<T>(raw: string, label: string, courseId?: string): Promise<T> {
  const local = tryLocalParseStrategies<T>(raw);
  if (local) {
    await recordEvent({
      courseId,
      eventType: "json_parse_success",
      metadata: {
        strategy: local.strategy,
        label,
        rawLength: raw.length,
        repaired: local.strategy === 3,
      },
    });
    if (local.strategy === 3) {
      console.warn(
        `[inngest/parseClaudeJson] [${label}] JSON repaired after truncation — content may be incomplete but usable.`,
      );
    }
    return local.value;
  }

  // Strategy 4: hand the malformed text to Haiku and ask it to fix the syntax.
  const repaired = await llmRepairJson<T>(raw, label, courseId);
  if (repaired) {
    await recordEvent({
      courseId,
      eventType: "json_parse_success",
      metadata: {
        strategy: 4,
        label,
        rawLength: raw.length,
        repairedByLlm: true,
        innerStrategy: repaired.innerStrategy,
      },
    });
    return repaired.value;
  }

  await recordEvent({
    courseId,
    eventType: "json_parse_failure",
    metadata: { label, rawLength: raw.length, llmRepairAttempted: true },
  });
  throw new Error(
    `[${label}] JSON parse failed after 4 strategies (len=${raw.length}). Response may be severely malformed.`,
  );
}

type SkeletonErrorCategory = "timeout" | "rate_limit" | "parse_failure" | "unknown";

function classifySkeletonError(message: string): SkeletonErrorCategory {
  const lower = message.toLowerCase();
  if (lower.includes("timed out") || lower.includes("timeout")) return "timeout";
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("rate_limit")) return "rate_limit";
  if (lower.includes("json parse failed") || lower.includes("unexpected token")) return "parse_failure";
  return "unknown";
}

// ─── Function 1: course.generate (skeleton + fan-out) ────────

/**
 * Triggered by `course/generate.requested`. This is the entry point
 * for the Inngest path. It:
 *   1. Generates the skeleton curriculum via Claude (Haiku)
 *   2. Persists the skeleton to courses.curriculum (for the
 *      frontend progress UI)
 *   3. Inserts N rows into generation_jobs (one per module)
 *   4. Sends N module/generate.requested events to Inngest, which
 *      fans out to parallel module.generate function invocations
 *
 * Retries: 2 (default). Skeleton is cheap enough to pay for one.
 *
 * Timeouts: Inngest default step timeout is sufficient — we bound
 * the individual Claude call to 100s internally.
 */
export const courseGenerate = inngest.createFunction(
  {
    id: "course-generate",
    name: "Course: Skeleton + Fan-out",
    // Haiku 4.5 skeleton takes ~50-70s for a 10-module masterclass.
    // With retries: 1, worst case is 70s × 2 = 140s — well within
    // Vercel's 300s budget. This protects against transient Anthropic
    // API errors that would otherwise kill the entire course.
    retries: 1,
    // CRITICAL: onFailure runs AFTER all retries are exhausted.
    // Without this, the skeleton path zombies — courses sit in
    // 'generating' with total_modules=0 until pg_cron cleans them
    // up with the generic "stuck in generating" error. Mirrors
    // moduleGenerate.onFailure but adapted for the pre-fan-out
    // state (no generation_jobs rows exist yet).
    onFailure: async ({ event: failureEvent }) => {
      const { courseId } = failureEvent.data.event.data;
      const supabase = getSupabaseAdmin();

      const rawMessage =
        failureEvent.data.error?.message ?? "Unknown error after all retries";
      const category = classifySkeletonError(rawMessage);

      console.error(
        `[inngest/courseGenerate/onFailure] [${courseId}] ` +
        `Skeleton failed permanently (${category}): ${rawMessage}`,
      );

      await supabase
        .from("courses")
        .update({
          status: "failed",
          error_message: `[skeleton/${category}] ${rawMessage}`,
          generation_progress: null,
          generation_errors: [
            {
              moduleId: "skeleton",
              moduleIndex: -1,
              phase: "skeleton",
              category,
              reason: rawMessage,
              ts: new Date().toISOString(),
            },
          ],
        })
        .eq("id", courseId);

      await recordEvent({
        courseId,
        eventType: "course_finalize_failed",
        phase: "skeleton",
        metadata: { category, reason: rawMessage },
      });
    },
  },
  { event: "course/generate.requested" },
  async ({ event, step }) => {
    const { courseId, request: rawRequest } = event.data;
    const request = rawRequest as GenerateRequest;
    const supabase = getSupabaseAdmin();

    // Idempotency guard: reject if another generation for the same
    // (user_id, topic, length, language) tuple is already in-flight.
    // Catches rage-click double-submits before any Claude spend. Loads
    // user_id from the DB rather than the event payload because the
    // DB is canonical — a re-fired event could drift.
    const { data: thisCourse } = await supabase
      .from("courses")
      .select("user_id, topic, length, language")
      .eq("id", courseId)
      .single();

    if (thisCourse && thisCourse.user_id !== null && thisCourse.language !== null) {
      const { data: inFlight } = await supabase
        .from("courses")
        .select("id, status")
        .eq("user_id", thisCourse.user_id)
        .eq("topic", thisCourse.topic)
        .eq("length", thisCourse.length)
        .eq("language", thisCourse.language)
        .in("status", ["pending", "generating"])
        .neq("id", courseId)
        .limit(1)
        .maybeSingle();

      if (inFlight) {
        console.log(
          `[inngest/courseGenerate] [${courseId}] Idempotency: in-flight course ${inFlight.id} (${inFlight.status}) blocks duplicate`,
        );
        await supabase
          .from("courses")
          .update({
            status: "failed",
            error_message: `A generation for the same topic/length/language is already in progress (existing course id: ${inFlight.id}). This duplicate was rejected to prevent parallel spending.`,
            generation_errors: [
              {
                moduleId: "global",
                moduleIndex: -1,
                phase: "global",
                category: "duplicate",
                reason: `duplicate of ${inFlight.id}`,
                ts: new Date().toISOString(),
              },
            ],
          })
          .eq("id", courseId);

        await recordEvent({
          courseId,
          eventType: "course_finalize_failed",
          phase: "global",
          metadata: { category: "duplicate", duplicateOf: inFlight.id },
        });

        return { duplicated: true, originalCourseId: inFlight.id };
      }
    }

    // Step 1: generate skeleton. Wrapped in step.run() so Inngest
    // can resume from here if later steps fail — skeleton won't
    // be re-generated on retry (it's memoized by step ID).
    const skeleton = await step.run("generate-skeleton", async () => {
      await supabase.from("courses").update({
        generation_progress: "Designing course structure...",
        generation_total_modules: 0,
        generation_completed_modules: 0,
      }).eq("id", courseId);

      const { system, messages } = buildSkeletonCurriculumPrompt(request);
      // Length-aware skeleton timeout. Standard lengths complete in
      // 100–180s on Haiku 4.5; 240s is comfortable. Masterclass
      // skeletons are denser (8–10 modules with richer descriptions)
      // and were observed timing out at exactly 240002ms on the
      // 2026-04-12 smoke run — bumping to 290s gives tail-case
      // headroom while staying 10s under Vercel's 300s function max.
      // Per-length skeleton timeout. Phase 1.3 (2026-04-14): previously
      // binary (masterclass 900s else 240s). Full hit rising timeout
      // pressure with grounded prompt — 450s covers the observed p95 on
      // dense academic full skeletons.
      const skeletonTimeout = {
        crash: 180_000,
        short: 240_000,
        full: 450_000,
        masterclass: 900_000,
      }[request.length] ?? 240_000;
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/skeleton`,
        courseId,
        phase: "skeleton",
        timeoutMs: skeletonTimeout,
      });

      return parseClaudeJson<Curriculum>(rawText, "skeleton", courseId);
    });

    // Step 2: persist skeleton to courses.curriculum so the
    // frontend can already show the module list while Phase 2
    // fills in lesson bodies. This is a UX win over the monolithic
    // path which only wrote to the DB at the very end.
    await step.run("persist-skeleton", async () => {
      await supabase.from("courses").update({
        curriculum: skeleton,
        generation_progress: `Generating module 1 of ${skeleton.modules.length}...`,
        generation_total_modules: skeleton.modules.length,
        generation_completed_modules: 0,
      }).eq("id", courseId);
    });

    // Opus reviewer quality gate (flag-gated + tier-gated). Per spec
    // §5.3, reviewer feedback never blocks publish — we only annotate
    // courses.quality_warnings so the UI can surface it. Called OUTSIDE
    // step.run per AGENTS.md guidance for recordEvent().
    if (thisCourse?.user_id) {
      const { data: reviewerProfile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", thisCourse.user_id)
        .single();
      const reviewerTier = tierOrFallback(reviewerProfile?.plan ?? "free");
      if (TIERS[reviewerTier].hasReviewer) {
        const review = await reviewSkeleton({ courseId, skeleton });
        if (review.verdict === "needs_revision") {
          console.warn(
            `[courseGenerate] skeleton reviewer flagged ${courseId}: ${review.feedback.join("; ")}`,
          );
          await supabase
            .from("courses")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ quality_warnings: review.feedback as any })
            .eq("id", courseId);
        }
      }
    }

    // Step 3: insert generation_jobs rows. ON CONFLICT DO NOTHING
    // because Inngest retries could otherwise create duplicates
    // (the UNIQUE(course_id, module_index) constraint catches this
    // but we want a clean no-op instead of a throw).
    await step.run("insert-job-rows", async () => {
      const jobs = skeleton.modules.map((m, i) => ({
        course_id: courseId,
        module_index: i,
        module_id: m.id,
        status: "pending" as const,
        model: GENERATION_MODEL,
        max_tokens: 24576,
      }));
      const { error } = await supabase
        .from("generation_jobs")
        .upsert(jobs, { onConflict: "course_id,module_index", ignoreDuplicates: true });
      if (error) throw new Error(`generation_jobs insert failed: ${error.message}`);
    });

    // Step 4: check contentDepth. If "structure_only", the user only
    // wants the skeleton/syllabus — skip fan-out and mark ready now.
    const contentDepth = (request.contentDepth as string | undefined) ?? "full_content";
    if (contentDepth === "structure_only") {
      await step.run("mark-ready-structure-only", async () => {
        // Fetch user_id for generation counter increment
        const { data: course } = await supabase
          .from("courses")
          .select("user_id")
          .eq("id", courseId)
          .single();

        await supabase
          .from("courses")
          .update({
            status: "ready",
            generation_progress: null,
            generation_completed_modules: skeleton.modules.length,
          })
          .eq("id", courseId);

        // Increment generation counter
        if (course?.user_id) {
          await supabase.rpc("increment_generation_usage", {
            p_user_id: course.user_id,
            p_course_id: courseId,
            p_event_type: "course_generated",
          });
        }
      });

      return { courseId, totalModules: skeleton.modules.length, contentDepth: "structure_only" };
    }

    // Step 5: fan out for full content. Each sendEvent is its own
    // Inngest step so a retry here will skip already-sent events.
    await step.run("fanout-module-events", async () => {
      const events = skeleton.modules.map((m, i) => ({
        name: "module/generate.requested" as const,
        data: {
          courseId,
          moduleIndex: i,
          moduleId: m.id,
          request,
          skeletonTitle: skeleton.title,
          skeletonDescription: skeleton.description,
          skeletonModule: m,
          totalModules: skeleton.modules.length,
        },
      }));
      await inngest.send(events);
    });

    return { courseId, totalModules: skeleton.modules.length, contentDepth: "full_content" };
  },
);

// ─── Function 2: module.generate (Phase 2, parallel) ─────────

/**
 * Triggered by `module/generate.requested`. One invocation per
 * module per course. These run in parallel subject to Inngest's
 * concurrency limits.
 *
 * Concurrency: Capped at 8 concurrent module generations per
 * courseId. This prevents a single 10-module masterclass from
 * blasting 10 parallel Anthropic requests (we've seen 429s) —
 * instead the last 2 queue up behind the first 8.
 *
 * Retries: 2. Claude occasionally returns malformed JSON; retry
 * usually fixes it with a fresh stream.
 */
export const moduleGenerate = inngest.createFunction(
  {
    id: "module-generate",
    name: "Module: Generate Detail",
    retries: 2,
    // Scope concurrency per-course so a single big course can't
    // starve other courses' module jobs. Limit is 5 to stay within
    // the free-tier Inngest plan ceiling; for a 10-module masterclass
    // this still means only 2 waves (10/5=2), same wave count as
    // limit=8 (10/8≈2), so zero practical latency difference. Bump
    // to 8-10 if we ever upgrade Inngest and want single-wave runs.
    concurrency: {
      key: "event.data.courseId",
      // Lowered from 5 to 3 after Test H showed 3/5 modules failing
      // in wave 1 (likely Anthropic 429 rate limits). With 3 concurrent:
      // 10-module masterclass = 4 waves instead of 2, but each wave
      // is reliably under the rate limit. Total time ~4 × 180s = 12min
      // (vs stuck forever with 5 concurrent failures).
      limit: 3,
    },
    // CRITICAL: onFailure runs AFTER all retries are exhausted.
    // Without this, the generation_jobs row stays "running" forever
    // and course.finalize is never triggered — the course stays
    // stuck at "generating" with a partial progress count.
    //
    // This was the root cause of zombie modules in Test H: 8/10
    // modules failed silently, the finalize query kept finding
    // "running" rows, and the course never completed.
    onFailure: async ({ event: failureEvent }) => {
      const { courseId, moduleIndex, moduleId, totalModules } =
        failureEvent.data.event.data;
      const supabase = getSupabaseAdmin();

      // 1. Mark the job as "failed" with the error message.
      const errorMessage =
        failureEvent.data.error?.message ?? "Unknown error after all retries";
      console.error(
        `[inngest/moduleGenerate/onFailure] [${courseId}/${moduleId}] ` +
        `Module failed permanently: ${errorMessage}`,
      );
      await supabase
        .from("generation_jobs")
        .update({
          status: "failed",
          error: { message: errorMessage, failedAt: new Date().toISOString() },
          completed_at: new Date().toISOString(),
        })
        .eq("course_id", courseId)
        .eq("module_index", moduleIndex);

      // 2. Bump the completed count (even for failures) so the
      //    progress UI reflects reality. A failed module still
      //    "completes" in the sense that it's no longer in-flight.
      const { data: course } = await supabase
        .from("courses")
        .select("generation_completed_modules, generation_total_modules")
        .eq("id", courseId)
        .single();
      const current = course?.generation_completed_modules ?? 0;
      const total = course?.generation_total_modules ?? totalModules;
      await supabase
        .from("courses")
        .update({
          generation_completed_modules: current + 1,
          generation_progress:
            current + 1 < total
              ? `Generated ${current + 1} of ${total} modules (${moduleId} failed)...`
              : "Finalizing course...",
        })
        .eq("id", courseId);

      // 3. Check if this was the last in-flight module. If yes,
      //    trigger finalize so the course completes with whatever
      //    modules DID succeed. A course with 7/10 modules is
      //    infinitely better than one stuck at "generating" forever.
      const { count } = await supabase
        .from("generation_jobs")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId)
        .in("status", ["pending", "running"]);

      if ((count ?? 0) === 0) {
        await inngest.send({
          name: "course/finalize.requested",
          data: { courseId },
        });
      }

      await recordEvent({
        courseId,
        moduleIndex,
        eventType: "module_failure",
        phase: "module_detail",
        metadata: { moduleId, errorMessage },
      });
    },
  },
  { event: "module/generate.requested" },
  async ({ event, step }) => {
    const {
      courseId,
      moduleIndex,
      moduleId,
      request: rawRequest,
      skeletonTitle,
      skeletonDescription,
      skeletonModule,
      totalModules,
    } = event.data;
    const request = rawRequest as GenerateRequest;
    const supabase = getSupabaseAdmin();

    // Mark job as running. Wrapped in step.run() for Inngest
    // memoization — retry will see this as already-done and skip.
    await step.run("mark-running", async () => {
      await supabase
        .from("generation_jobs")
        .update({
          status: "running",
          started_at: new Date().toISOString(),
          attempts: 1,
        })
        .eq("course_id", courseId)
        .eq("module_index", moduleIndex);

      // Surface a human-readable progress message with the module title
      // so the /course/[id] live view can narrate "Writing Module 3: X".
      // Concurrent modules may race on this write; last-writer-wins is fine
      // for UX. Truncate long titles so the line stays readable in the UI.
      const moduleTitle = ((skeletonModule as Module).title || "").slice(0, 80);
      await supabase
        .from("courses")
        .update({
          generation_progress: moduleTitle
            ? `Writing module ${moduleIndex + 1} of ${totalModules}: ${moduleTitle}`
            : `Writing module ${moduleIndex + 1} of ${totalModules}...`,
        })
        .eq("id", courseId);
    });

    // Grounded pipeline (Phase 1 academic). If the request qualifies,
    // we run a source-discovery step BEFORE content generation: Claude
    // uses the web_search tool to find real peer-reviewed papers, then
    // we verify each DOI against CrossRef and persist the verified set
    // to generation_sources. The downstream generate step then cites
    // ONLY from that verified list.
    //
    // Non-grounded requests skip this entire block and hit the existing
    // pipeline unchanged (shouldGroundStyle returns null).
    const styleConfig = shouldGroundStyle(request);
    const verifiedSources: VerifiedSource[] | null = styleConfig
      ? await step.run(`discover-sources-${moduleId}`, async () => {
          const candidates = await discoverSources({
            moduleTitle: (skeletonModule as Module).title,
            moduleObjectives: (skeletonModule as Module).objectives ?? [],
            courseTopic: skeletonTitle,
            audience: request.audience,
            language: request.language ?? "en",
            styleConfig,
          });
          const verified = await verifySources(candidates);
          if (verified.length > 0) {
            // Cast: generation_sources table was added in migration 015,
            // Supabase generated Database types do not include it yet.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("generation_sources").insert(
              verified.map((v) => ({
                course_id: courseId,
                module_index: moduleIndex,
                source_type: v.type,
                title: v.title,
                authors: v.authors,
                year: v.year,
                journal: v.journal ?? null,
                doi: v.doi ?? v.arxivId ?? v.isbn ?? null,
                url: v.url,
                is_preprint: v.isPreprint ?? false,
                verified_at: v.verifiedAt,
                verified_by: v.verifiedBy,
                verified_ok: true,
              })),
            );
          }
          await recordEvent({
            courseId,
            moduleIndex,
            eventType: "module_success",
            phase: "module_detail",
            metadata: {
              kind: "sources_verified",
              candidateCount: candidates.length,
              verifiedCount: verified.length,
              densityMin: styleConfig.density.min,
            },
          });
          return verified;
        })
      : null;

    // Call Claude for this module's detail. Wrapped in step.run()
    // so the Claude call is memoized: if the subsequent DB update
    // fails and Inngest retries, we don't re-spend tokens.
    const detail = await step.run(`generate-module-${moduleId}`, async () => {
      // Phase 1.2: ground-if-any. Previously we required pool ≥ density.min,
      // which left CS/humanities modules in the un-grounded fallback even when
      // we had legitimate canonical sources (Goodfellow textbook, etc.). Now
      // any non-empty verified pool activates the grounded prompt; the density
      // target becomes a soft guidance instead of a hard gate.
      const useGrounded =
        !!styleConfig &&
        !!verifiedSources &&
        verifiedSources.length >= 1;

      const { system, messages } = useGrounded
        ? buildGroundedModuleDetailPrompt({
            request,
            courseTitle: skeletonTitle,
            courseDescription: skeletonDescription,
            moduleData: skeletonModule as Module,
            moduleIndex,
            totalModules,
            verifiedSources: verifiedSources!,
            densityTarget: styleConfig!.density,
          })
        : buildModuleDetailCurriculumPrompt(
            request,
            skeletonTitle,
            skeletonDescription,
            skeletonModule as Module,
            moduleIndex,
            totalModules,
          );
      // Length-aware routing: masterclass stays on Haiku 4.5 but gets
      // a larger output cap and longer timeout than standard.
      //
      // Token cap: 36,864 (36k) — 50% above the standard 24,576 cap.
      // The first masterclass try ran at 48k, but dense topics pushed
      // module wall-clock into the 150–260s band on Haiku streaming.
      // 36k keeps the quality headroom above standard while cutting
      // expected stream time by ~25%, putting the p95 completion
      // comfortably inside the timeout.
      //
      // Timeout: 900_000 ms (15 min). Previously 290_000 to fit under
      // Vercel's 300s function cap; now on Cloud Run with a 3600s
      // service timeout we can give dense masterclass modules enough
      // headroom. 15 min covers observed p99 Haiku streaming times
      // (up to ~430s) with generous margin. Matches the masterclass
      // skeleton timeout for consistency.
      //
      // History: Sonnet 4.6 was tried on 2026-04-12 and produced 87.5%
      // 429 rate_limit_error under parallel fan-out (org Tier 1 cap is
      // 8k output tokens/min on Sonnet). Reverted to Haiku; restore
      // Sonnet once the Anthropic tier upgrade lands.
      // Per-length module timeout. Phase 1.3 (2026-04-14): full bumped
      // from 180s to 450s after Test 6 M5 timed out repeatedly under the
      // grounded force-cite-all prompt (content is denser, longer).
      const isMasterclass = request.length === "masterclass";
      const moduleTimeout = {
        crash: 120_000,
        short: 180_000,
        full: 450_000,
        masterclass: 900_000,
      }[request.length] ?? 180_000;
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: isMasterclass ? 36_864 : 24_576,
        label: `${courseId}/module-${moduleId}`,
        timeoutMs: moduleTimeout,
        courseId,
        phase: "module_detail",
      });
      const parsed = await parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(
        rawText,
        `module ${moduleId}`,
        courseId,
      );

      // Post-generation citation validation (grounded path only). For each
      // lesson, check that every [n] inline ref resolves to a verified source.
      // Policy: invalidRatio ≤ 20% → silently strip bad refs; > 20% → keep
      // as-is for MVP (LLM repair is a Phase 1.1 follow-up).
      if (useGrounded && verifiedSources) {
        parsed.lessons = parsed.lessons.map((lesson) => {
          if (!lesson.content) return lesson;
          const result = validateCitations({
            lessonMarkdown: lesson.content,
            verifiedSources,
          });
          const policy = decideFailurePolicy(result);
          if (policy.action === "silent_remove") {
            return {
              ...lesson,
              content: stripInvalidCitations(lesson.content, policy.dropIndices),
            };
          }
          return lesson;
        });
      }

      return parsed;
    });

    // Persist the module result to generation_jobs.
    await step.run("persist-result", async () => {
      await supabase
        .from("generation_jobs")
        .update({
          status: "done",
          result: detail,
          completed_at: new Date().toISOString(),
        })
        .eq("course_id", courseId)
        .eq("module_index", moduleIndex);
    });

    // Increment courses.generation_completed_modules so the frontend
    // progress UI updates. Done as an RPC-style update to avoid
    // a read-modify-write race between parallel modules.
    await step.run("bump-progress", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("increment_course_progress", {
        p_course_id: courseId,
      });
      if (error) {
        // Non-fatal: the progress counter is UX-only. Fall back to
        // a non-atomic update so the UI at least moves forward.
        console.warn(
          `[inngest/moduleGenerate] [${courseId}/${moduleId}] RPC progress bump failed, falling back: ${error.message}`,
        );
        // Read current value, add 1, write back. Race-prone but
        // the worst-case outcome is the counter being off by 1
        // and self-correcting on the next successful increment.
        const { data: course } = await supabase
          .from("courses")
          .select("generation_completed_modules, generation_total_modules")
          .eq("id", courseId)
          .single();
        const current = course?.generation_completed_modules ?? 0;
        const total = course?.generation_total_modules ?? totalModules;
        await supabase
          .from("courses")
          .update({
            generation_completed_modules: current + 1,
            generation_progress:
              current + 1 < total
                ? `Generated ${current + 1} of ${total} modules...`
                : "Finalizing course...",
          })
          .eq("id", courseId);
      }
    });

    // Check if this was the last in-flight module for this course.
    // If yes, send the finalize event. We use a DB query instead of
    // a counter so concurrent completions can't both trigger finalize.
    await step.run("maybe-trigger-finalize", async () => {
      const { count, error } = await supabase
        .from("generation_jobs")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId)
        .in("status", ["pending", "running"]);

      if (error) {
        throw new Error(`in-flight check failed: ${error.message}`);
      }

      if ((count ?? 0) === 0) {
        // Last module: trigger finalize. Inngest's event deduplication
        // protects us if two modules race and both think they're last.
        await inngest.send({
          name: "course/finalize.requested",
          data: { courseId },
        });
      }
    });

    await recordEvent({
      courseId,
      moduleIndex,
      eventType: "module_success",
      phase: "module_detail",
      metadata: { moduleId },
    });

    return { courseId, moduleIndex, moduleId, status: "done" };
  },
);

// ─── Function 3: course.finalize ──────────────────────────────

/**
 * Triggered by `course/finalize.requested`. Merges all module
 * results back into courses.curriculum and flips status to 'ready'.
 *
 * Idempotent: if courses.status is already 'ready', this is a no-op.
 * Useful because Inngest event deduplication is best-effort and we
 * don't want to double-finalize.
 */
export const courseFinalize = inngest.createFunction(
  {
    id: "course-finalize",
    name: "Course: Finalize + Mark Ready",
    retries: 3,
  },
  { event: "course/finalize.requested" },
  async ({ event, step }) => {
    const { courseId } = event.data;
    const supabase = getSupabaseAdmin();

    // Step 1: fetch the skeleton + all module results.
    const { skeleton, jobs } = await step.run("load-state", async () => {
      const { data: course, error: courseErr } = await supabase
        .from("courses")
        .select("curriculum, status")
        .eq("id", courseId)
        .single();
      if (courseErr) throw new Error(`load course failed: ${courseErr.message}`);
      if (course?.status === "ready" || course?.status === "partial") {
        return { skeleton: null, jobs: [] };
      }
      const { data: jobRows, error: jobsErr } = await supabase
        .from("generation_jobs")
        .select("module_index, module_id, status, result, error")
        .eq("course_id", courseId)
        .order("module_index");
      if (jobsErr) throw new Error(`load jobs failed: ${jobsErr.message}`);
      return {
        skeleton: course?.curriculum as unknown as Curriculum | null,
        jobs: jobRows ?? [],
      };
    });

    // If the idempotency guard fired, we're done.
    if (!skeleton) {
      return { courseId, status: "already-ready" };
    }

    // Step 2: merge + decide final status. If fewer than
    // MIN_SUCCESS_RATIO of modules succeeded, the course is marked
    // 'partial' (still viewable, still navigable — but flagged so
    // the UI can show a retry affordance and the user is NOT
    // charged a generation against their quota).
    const { merged, successRatio, successfulCount, totalCount, finalStatus } =
      await step.run("merge-modules", async () => {
        const MIN_SUCCESS_RATIO = 0.8;
        const mergedModules: Module[] = skeleton.modules.map((skelMod, i) => {
          const job = jobs.find((j) => j.module_index === i);
          if (job?.status === "done" && job.result) {
            const detail = job.result as unknown as {
              lessons: Module["lessons"];
              quiz?: Module["quiz"];
            };
            return {
              ...skelMod,
              lessons: detail.lessons,
              quiz: detail.quiz ?? [],
            };
          }
          return skelMod;
        });
        const total = skeleton.modules.length;
        const successful = jobs.filter((j) => j.status === "done").length;
        const ratio = total === 0 ? 0 : successful / total;
        return {
          merged: { ...skeleton, modules: mergedModules } as Curriculum,
          successRatio: ratio,
          successfulCount: successful,
          totalCount: total,
          finalStatus: ratio >= MIN_SUCCESS_RATIO ? ("ready" as const) : ("partial" as const),
        };
      });

    // Strategic polish (Masterclass-length only, flag-gated + tier-gated).
    // Runs OUTSIDE step.run so recordEvent calls inside polish.ts are not
    // memoised by Inngest. Mutates `merged` in place — soft degradation on
    // per-lesson failure keeps the Sonnet body.
    const { data: polishCourse } = await supabase
      .from("courses")
      .select("user_id, length")
      .eq("id", courseId)
      .single();

    if (
      polishCourse?.length === "masterclass" &&
      polishCourse.user_id &&
      process.env.MASTERCLASS_STRATEGIC_POLISH_ENABLED === "true"
    ) {
      const { data: polishProfile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", polishCourse.user_id)
        .single();
      const polishTier = tierOrFallback(polishProfile?.plan ?? "free");

      if (TIERS[polishTier].hasPolish && merged.modules) {
        const selected = selectLessonsToPolish(
          merged.modules.map((m) => ({
            id: m.id ?? "",
            lessons: (m.lessons ?? []).map((l) => ({
              id: l.id ?? "",
              bodyLength: l.content?.length ?? 0,
              body: l.content,
            })),
          })),
        );
        const selectedIds = new Set(selected.map((l) => l.id));
        const polishJobs: Array<Promise<void>> = [];
        for (const m of merged.modules) {
          for (const l of m.lessons ?? []) {
            if (!l.id || !selectedIds.has(l.id)) continue;
            polishJobs.push(
              polishLesson({
                courseId,
                lessonId: l.id,
                body: l.content ?? "",
              }).then((polished) => {
                if (polished) l.content = polished;
              }),
            );
          }
        }
        await Promise.allSettled(polishJobs);
      }
    }

    // Observability: fire a finalize outcome event BEFORE the
    // mark-final-status step. Intentionally NOT inside step.run()
    // so Inngest retries can't replay it from memoised cache.
    await recordEvent({
      courseId,
      eventType:
        finalStatus === "ready" ? "course_finalize_ready" : "course_finalize_partial",
      phase: "finalize",
      metadata: {
        successRatio,
        successfulCount,
        totalCount,
      },
    });

    // Step 3: write the final curriculum + flip status.
    await step.run("mark-final-status", async () => {
      const errorMessage =
        finalStatus === "partial"
          ? `Partial generation: ${successfulCount}/${totalCount} modules succeeded (${Math.round(successRatio * 100)}%). You can retry failed modules without losing your quota.`
          : null;
      await supabase
        .from("courses")
        .update({
          curriculum: merged,
          status: finalStatus,
          error_message: errorMessage,
          generation_progress: null,
          generation_completed_modules: successfulCount,
        })
        .eq("id", courseId);
    });

    // Step 4: increment the user's generation counter — only on
    // fully-successful generations. Partial courses are free retries
    // so users aren't penalised for our pipeline failing them.
    if (finalStatus === "ready") {
      await step.run("increment-usage", async () => {
        const { data: course } = await supabase
          .from("courses")
          .select("user_id")
          .eq("id", courseId)
          .single();

        if (course?.user_id) {
          const { error } = await supabase.rpc("increment_generation_usage", {
            p_user_id: course.user_id,
            p_course_id: courseId,
            p_event_type: "course_generated",
          });
          if (error) {
            console.error(
              `[inngest/courseFinalize] [${courseId}] increment_generation_usage failed: ${error.message}`,
            );
          }
        } else {
          console.warn(
            `[inngest/courseFinalize] [${courseId}] No user_id found — skipping usage increment`,
          );
        }
      });
    }

    // Step 5: fire async URL validation (fire-and-forget). The
    // validator runs as its own Inngest function so finalize
    // returns immediately and the user sees their course. URL
    // statuses get patched onto curriculum.* after validation
    // completes; the UI hides `unreachable` resources on the
    // next render.
    if (finalStatus === "ready" || finalStatus === "partial") {
      await step.run("fire-url-validation", async () => {
        await inngest.send({
          name: "course/validate.requested",
          data: { courseId },
        });
      });
    }

    return {
      courseId,
      status: finalStatus,
      totalModules: merged.modules.length,
      successfulModules: successfulCount,
      successRatio,
    };
  },
);

// ─── Function registry ────────────────────────────────────────

/**
 * Exported list of all functions. The /api/inngest route imports
 * this array and passes it to `serve()`. Adding a new function
 * means appending it here and nothing else.
 */
import { bodyUnlock } from "@/lib/inngest/body-unlock";

export const inngestFunctions = [
  courseGenerate,
  moduleGenerate,
  courseFinalize,
  validateCourseUrls,
  bodyUnlock,
];
