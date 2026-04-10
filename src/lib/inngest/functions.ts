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
import {
  buildSkeletonCurriculumPrompt,
  buildModuleDetailCurriculumPrompt,
} from "@/lib/prompts/curriculum";
import type {
  GenerateRequest,
  Curriculum,
  Module,
} from "@/types/curriculum";

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

  // Abort if the stream stalls beyond timeoutMs. Inngest will retry
  // on thrown AbortError, so this is the first line of defense
  // against a stuck Anthropic connection.
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.error(`[inngest/callClaude] [${params.label}] timeout after ${params.timeoutMs}ms`);
    controller.abort();
  }, params.timeoutMs);

  try {
    const stream = anthropic.messages.stream(
      {
        model: params.model,
        max_tokens: params.maxTokens,
        system: params.system,
        messages: params.messages,
      },
      { signal: controller.signal },
    );

    const response = await stream.finalMessage();
    clearTimeout(timer);

    // Extract the first text block. Claude always returns at least
    // one text block for these prompts.
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`[${params.label}] Claude returned empty response`);
    }

    // Throw on max_tokens truncation so Inngest can retry with a
    // bigger budget if we ever wire that in. For now it just
    // surfaces in the failure log.
    if (response.stop_reason === "max_tokens") {
      throw new Error(
        `[${params.label}] Claude hit max_tokens (truncated at ${params.maxTokens})`,
      );
    }

    return textBlock.text.trim();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse a Claude JSON response, trimming any markdown code fences.
 * Throws on unparseable input so Inngest's retry logic kicks in.
 */
function parseClaudeJson<T>(raw: string, label: string): T {
  let cleaned = raw;
  const fenceStart = cleaned.match(/^```(?:json)?\s*\n?/);
  if (fenceStart) {
    cleaned = cleaned.slice(fenceStart[0].length);
    const fenceEnd = cleaned.lastIndexOf("```");
    if (fenceEnd !== -1) cleaned = cleaned.slice(0, fenceEnd).trim();
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Last-ditch: try to extract JSON object between first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        /* fall through to throw below */
      }
    }
    throw new Error(
      `[${label}] JSON parse failed (len=${raw.length}): ${err instanceof Error ? err.message : String(err)}`,
    );
  }
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
    retries: 2,
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
        model: "claude-haiku-4-5-20251001",
        maxTokens: 24576,
        label: `${courseId}/skeleton`,
        timeoutMs: 100_000,
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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 24576,
      }));
      const { error } = await supabase
        .from("generation_jobs")
        .upsert(jobs, { onConflict: "course_id,module_index", ignoreDuplicates: true });
      if (error) throw new Error(`generation_jobs insert failed: ${error.message}`);
    });

    // Step 4: fan out. Each sendEvent is its own Inngest step so a
    // retry here will skip already-sent events. Inngest deduplicates
    // events with the same key automatically, but we're belt-and-
    // suspenders with the step boundaries.
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

    return { courseId, totalModules: skeleton.modules.length };
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
      limit: 5,
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
        model: "claude-haiku-4-5-20251001",
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
      // Idempotency guard: if already ready, bail out.
      if (course?.status === "ready") {
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

    // Step 2: merge. For each module, if the job succeeded, use
    // the detailed result; if it failed, fall back to the skeleton
    // stub. MIN_SUCCESS_RATIO check stays on the monolithic path —
    // here we accept whatever we have, because the pg_cron zombie
    // cleanup is the ultimate safety net.
    const merged = await step.run("merge-modules", async () => {
      const mergedModules: Module[] = skeleton.modules.map((skelMod, i) => {
        const job = jobs.find((j) => j.module_index === i);
        if (job?.status === "done" && job.result) {
          // job.result is stored as Supabase Json — we narrow via unknown
          // because the module/generate step validated it with parseClaudeJson
          // before persisting, so the shape is trusted at runtime.
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
        // Failed or missing: keep skeleton stub so the course is
        // still navigable. Per-module regeneration via the dashboard
        // lets the user fix individual modules later.
        return skelMod;
      });
      return {
        ...skeleton,
        modules: mergedModules,
      };
    });

    // Step 3: write the final curriculum + flip status to ready.
    await step.run("mark-ready", async () => {
      await supabase
        .from("courses")
        .update({
          curriculum: merged,
          status: "ready",
          generation_progress: null,
          generation_completed_modules: merged.modules.length,
        })
        .eq("id", courseId);
    });

    // Step 4: increment the user's generation counter. This was
    // previously only done in the after() fallback path inside
    // route.ts (updateCourseRecord). Now that ALL lengths route
    // through Inngest, this step ensures the counter is always
    // incremented on successful course generation.
    await step.run("increment-usage", async () => {
      // Fetch the user_id from the course record — it's not passed
      // through the event chain to courseFinalize.
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
          // Non-fatal: generation counter is important but not worth
          // failing the entire finalize over. Log loudly for monitoring.
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

    return { courseId, status: "ready", totalModules: merged.modules.length };
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
