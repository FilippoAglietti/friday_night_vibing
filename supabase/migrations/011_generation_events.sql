-- Migration 011: generation_events observability table
-- ─────────────────────────────────────────────────────────────
-- Before this migration, debugging a failed course generation
-- meant grepping Vercel logs for the courseId and guessing at
-- which step died. The post-mortem for Tentativo 13 made it
-- painfully clear we need structured, queryable telemetry on
-- the generation pipeline.
--
-- This table captures discrete events during generation:
--   • claude_call_start / claude_call_success / claude_call_failure
--   • json_parse_success (with strategy 1/2/3 — direct / extract / repair)
--   • json_parse_failure
--   • module_success / module_failure
--   • course_finalize_ready / course_finalize_partial
--
-- Writes are fire-and-forget from application code — failures
-- to record an event must NEVER fail a generation. The RLS
-- policy only exposes these rows to the service role.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generation_events (
  id bigserial PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  module_index integer,
  event_type text NOT NULL,
  phase text,
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generation_events_course_id_idx
  ON public.generation_events (course_id);

CREATE INDEX IF NOT EXISTS generation_events_event_type_created_at_idx
  ON public.generation_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS generation_events_created_at_idx
  ON public.generation_events (created_at DESC);

ALTER TABLE public.generation_events ENABLE ROW LEVEL SECURITY;

-- No policies = no access for anon/authenticated. Only the
-- service role (which bypasses RLS) can read/write this table.
-- That's exactly what we want for observability data.

COMMENT ON TABLE public.generation_events IS
  'Structured telemetry for the Inngest generation pipeline. Written fire-and-forget from src/lib/observability/metrics.ts. Service-role-only.';
