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
import { getSupabaseAdmin } from "@/lib/supabase";
import { recordEvent } from "@/lib/observability/metrics";
import {
  buildSkeletonCurriculumPrompt,
  buildModuleDetailCurriculumPrompt,
} from "@/lib/prompts/curriculum";
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
}): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    // Ensure the stream is cleaned up on any error (timeout or otherwise)
    try { stream.abort(); } catch { /* ignore cleanup errors */ }
    throw err;
  }

  // Extract the first text block. Claude always returns at least
  // one text block for these prompts.
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`[${params.label}] Claude returned empty response`);
  }

  // If Claude hit the token ceiling, the JSON is likely truncated.
  // Instead of throwing (which wastes the entire response), we warn
  // and pass the text through — the repairTruncatedJson() strategy
  // in parseClaudeJson will attempt to recover valid partial JSON.
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
 * Parse a Claude JSON response with 3 strategies:
 *   1. Direct JSON.parse (happy path)
 *   2. Extract between first { and last } (markdown/preamble stripping)
 *   3. repairTruncatedJson (recover from max_tokens truncation)
 *
 * Throws on unparseable input so Inngest's retry logic kicks in,
 * but only after all 3 strategies have been exhausted.
 */
function parseClaudeJson<T>(raw: string, label: string): T {
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
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through to Strategy 2 */
  }

  // Strategy 2: Extract JSON between first { and last }
  // Handles cases where Claude adds preamble text before the JSON
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      /* fall through to Strategy 3 */
    }
  }

  // Strategy 3: Repair truncated JSON (max_tokens truncation recovery)
  // This is the critical path for non-English languages and large modules
  // that hit the 24k token ceiling.
  if (firstBrace !== -1) {
    const repairedJson = repairTruncatedJson(cleaned.slice(firstBrace));
    try {
      const result = JSON.parse(repairedJson) as T;
      console.warn(
        `[inngest/parseClaudeJson] [${label}] JSON repaired after truncation — content may be incomplete but usable.`,
      );
      return result;
    } catch {
      /* fall through to throw */
    }
  }

  throw new Error(
    `[${label}] JSON parse failed after 3 strategies (len=${raw.length}). Response may be severely malformed.`,
  );
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
  },
  { event: "course/generate.requested" },
  async ({ event, step }) => {
    const { courseId, request: rawRequest } = event.data;
    const request = rawRequest as GenerateRequest;
    const supabase = getSupabaseAdmin();

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
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/skeleton`,
        // Haiku 4.5 skeleton empirically takes 100-180s depending on
        // API load and language (non-English tokenizes 20-30% heavier).
        // 240s gives solid headroom. Each Inngest retry is a SEPARATE
        // Vercel invocation with its own 300s budget, so 240s fits
        // comfortably. With retries: 1 we get two independent 240s
        // windows, not a shared 300s.
        timeoutMs: 240_000,
      });

      return parseClaudeJson<Curriculum>(rawText, "skeleton");
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

      recordEvent({
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
    });

    // Call Claude for this module's detail. Wrapped in step.run()
    // so the Claude call is memoized: if the subsequent DB update
    // fails and Inngest retries, we don't re-spend tokens.
    const detail = await step.run(`generate-module-${moduleId}`, async () => {
      const { system, messages } = buildModuleDetailCurriculumPrompt(
        request,
        skeletonTitle,
        skeletonDescription,
        skeletonModule as Module,
        moduleIndex,
        totalModules,
      );
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/module-${moduleId}`,
        timeoutMs: 180_000,
      });
      return parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(
        rawText,
        `module ${moduleId}`,
      );
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

    recordEvent({
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
      // Idempotency guard: if already in a terminal state, bail out.
      // 'partial' is a new enum value (migration 010) and may not yet
      // be present in regenerated database.types — widen via cast.
      const currentStatus = course?.status as string | undefined;
      if (currentStatus === "ready" || currentStatus === "partial") {
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

    // Observability: fire a finalize outcome event BEFORE the
    // mark-final-status step. Intentionally NOT inside step.run()
    // so Inngest retries can't replay it from memoised cache.
    recordEvent({
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
          // 'partial' enum value is added in migration 010 but may
          // not be present in regenerated database.types yet — cast.
          status: finalStatus as "ready",
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
export const inngestFunctions = [
  courseGenerate,
  moduleGenerate,
  courseFinalize,
];
