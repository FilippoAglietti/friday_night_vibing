-- Migration 012: raise cleanup_stuck_generating_courses threshold 10→20 min
-- ─────────────────────────────────────────────────────────────
-- The original 10-minute threshold from migration 007 was
-- calibrated against an earlier (monolithic) pipeline. After
-- the Inngest 3-function split with concurrency=3 on module
-- generation, a 10-module masterclass nominally takes:
--
--   skeleton     : up to 180s
--   4 waves ×180s: up to 720s
--   total        : ~15 minutes
--
-- The old 10-min threshold was killing courses that were
-- progressing normally. Raising to 20 min covers the nominal
-- masterclass plus a healthy margin without letting truly-zombie
-- courses linger for half an hour.
--
-- Everything else in the function is identical to migration 007.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_stuck_generating_courses()
RETURNS TABLE(affected_course_id uuid, affected_age_minutes numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  max_age_minutes constant integer := 20;
BEGIN
  RETURN QUERY
  UPDATE public.courses
  SET
    status = 'failed',
    error_message = COALESCE(
      error_message,
      format(
        'Generation timed out after %s minutes (stuck in generating state). Auto-cleaned by cleanup_stuck_generating_courses cron job at %s.',
        max_age_minutes,
        now()
      )
    ),
    generation_errors = COALESCE(generation_errors, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'moduleId', 'global',
        'moduleIndex', -1,
        'phase', 'global',
        'category', 'deadline',
        'reason', format(
          'pg_cron cleanup: course stuck in generating for >%s minutes. Likely Vercel 300s kill or Inngest function death.',
          max_age_minutes
        ),
        'ts', now()
      )
    ),
    updated_at = now()
  WHERE status = 'generating'
    AND updated_at < now() - (max_age_minutes || ' minutes')::interval
  RETURNING
    id AS affected_course_id,
    EXTRACT(epoch FROM (now() - updated_at)) / 60 AS affected_age_minutes;
END;
$$;

COMMENT ON FUNCTION public.cleanup_stuck_generating_courses() IS
  'Marks courses stuck in generating state for >20 minutes as failed. Invoked every 5 minutes by pg_cron. Threshold raised from 10 to 20 min in migration 012 to accommodate masterclass nominal runtime (~15 min with concurrency=3).';
