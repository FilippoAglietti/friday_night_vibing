-- Migration 008: create generation_jobs table for Inngest queue
-- ─────────────────────────────────────────────────────────────
-- Adds the per-module job tracking table that Fase 3 (Inngest
-- queue) uses as its durable state store. Inngest itself tracks
-- run history, but we mirror the work into our own DB so:
--   1. The frontend can read progress without hitting Inngest's API
--   2. If Inngest is disabled (feature flag off), the monolithic
--      path in /api/generate still keeps this table empty and
--      works as before — no schema-break rollback risk.
--   3. Post-mortem queries can correlate per-module errors with
--      per-module cost/latency without needing Inngest exports.
--
-- Each generation_jobs row represents ONE MODULE in a chunked
-- generation. course_id FKs back to public.courses. A masterclass
-- with 10 modules → 10 rows here.
--
-- Lifecycle:
--   pending  → Inngest event sent, function not yet started
--   running  → Inngest function picked it up, calling Claude now
--   done     → Module JSON returned and merged into course
--   failed   → Claude call failed after all retries, still counted
--              for MIN_SUCCESS_RATIO and backfilled with skeleton stub
--
-- The `result` column holds the parsed { lessons, quiz } JSON so
-- the finalize step (course.finalize Inngest function) can merge
-- them into courses.curriculum without having to re-call Claude.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  module_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'done', 'failed')),
  model text,
  max_tokens integer,
  result jsonb,
  error jsonb,
  attempts integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, module_index)
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_course_id
  ON public.generation_jobs (course_id);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_in_flight
  ON public.generation_jobs (course_id, status)
  WHERE status IN ('pending', 'running');

CREATE OR REPLACE FUNCTION public.touch_generation_jobs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_generation_jobs_updated_at();

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.generation_jobs FROM PUBLIC;
REVOKE ALL ON public.generation_jobs FROM anon, authenticated;

COMMENT ON TABLE public.generation_jobs IS
  'Per-module job tracking for the Inngest queue-based generation pipeline (Fase 3). One row per module per course. Populated by /api/generate when INNGEST_ENABLED=true, consumed by the module.generate and course.finalize Inngest functions.';
