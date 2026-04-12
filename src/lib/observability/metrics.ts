/**
 * lib/observability/metrics.ts
 * ─────────────────────────────────────────────────────────────
 * Fire-and-forget telemetry for the course generation pipeline.
 *
 * Writes land in public.generation_events (migration 011). The
 * helper NEVER throws: if the insert fails, we log and swallow
 * so that observability can never take down a generation.
 *
 * CRITICAL: Do NOT call recordEvent from inside Inngest
 * step.run() blocks. Step results are memoised by Inngest on
 * retry, which would mean events get replayed from cache and
 * produce phantom duplicates. Call it between steps (or inline
 * in the orchestrator body) so every invocation actually fires.
 * ─────────────────────────────────────────────────────────────
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import type { Json } from "@/types/database.types";

export type GenerationEventType =
  | "claude_call_success"
  | "claude_call_failure"
  | "json_parse_success"
  | "json_parse_failure"
  | "module_success"
  | "module_failure"
  | "course_finalize_ready"
  | "course_finalize_partial"
  | "course_finalize_failed";

export type GenerationPhase =
  | "skeleton"
  | "module_detail"
  | "finalize"
  | "global";

export interface RecordEventInput {
  courseId?: string;
  moduleIndex?: number;
  eventType: GenerationEventType;
  phase?: GenerationPhase;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export function recordEvent(input: RecordEventInput): void {
  const supabase = getSupabaseAdmin();
  void supabase
    .from("generation_events")
    .insert({
      course_id: input.courseId ?? null,
      module_index: input.moduleIndex ?? null,
      event_type: input.eventType,
      phase: input.phase ?? null,
      duration_ms: input.durationMs ?? null,
      metadata: (input.metadata ?? {}) as Json,
    })
    .then(({ error }) => {
      if (error) {
        console.error(
          `[observability] recordEvent(${input.eventType}) failed: ${error.message}`,
        );
      }
    });
}
