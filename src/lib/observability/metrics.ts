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
  // database.types.ts is regenerated from Supabase and does not
  // yet include generation_events (migration 011). Casting here
  // keeps the helper isolated from the rest of the codebase —
  // when types are regenerated, this cast can be removed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdmin() as any;
  void supabase
    .from("generation_events")
    .insert({
      course_id: input.courseId ?? null,
      module_index: input.moduleIndex ?? null,
      event_type: input.eventType,
      phase: input.phase ?? null,
      duration_ms: input.durationMs ?? null,
      metadata: input.metadata ?? {},
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(({ error }: { error: any }) => {
      if (error) {
        console.error(
          `[observability] recordEvent(${input.eventType}) failed: ${error.message}`,
        );
      }
    });
}
