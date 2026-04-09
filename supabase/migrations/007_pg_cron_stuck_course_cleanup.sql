-- Migration 007: pg_cron stuck-course cleanup
-- ─────────────────────────────────────────────────────────────
-- Fixes the "zombie generating card" that Tentativo 13 left behind.
--
-- Problem: When the Vercel serverless function hits its 300s hard
-- cap mid-generation and gets SIGKILL'd, the after() catch block
-- never runs and courses.status stays 'generating' forever. The
-- frontend then shows a spinning "generating" card that never
-- resolves, the user can't launch another generation (rate-limit
-- + "one active generation" business rule), and the DB accumulates
-- zombie rows.
--
-- Solution: A pg_cron job that runs every 5 minutes and marks any
-- course still in 'generating' after MAX_GENERATION_AGE minutes as
-- 'failed' with a diagnostic error_message + a structured
-- generation_errors entry so the post-mortem has full context.
--
-- MAX_GENERATION_AGE is set to 10 minutes — double the Vercel Pro
-- 300s budget. If a course has been generating longer than 10 min,
-- something is wrong (Vercel nuked us, DB update lost, Inngest
-- function died, etc.) and we want the user to be able to retry.
--
-- Idempotency: The function is safe to run repeatedly — it only
-- touches rows that are currently 'generating' AND older than the
-- threshold. No risk of clobbering a fresh generation.
-- ─────────────────────────────────────────────────────────────

-- The cleanup function itself. SECURITY DEFINER so pg_cron (which
-- runs as the cron-owner role) can update rows in public.courses
-- regardless of RLS. Scoped tight to only 'generating' rows older
-- than the threshold — no way to misuse it to clobber 'ready'
-- courses.
CREATE OR REPLACE FUNCTION public.cleanup_stuck_generating_courses()
RETURNS TABLE(affected_course_id uuid, affected_age_minutes numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  max_age_minutes constant integer := 10;
BEGIN
  -- Update all rows that have been 'generating' for too long.
  -- Attach a structured generation_errors entry so the post-mortem
  -- knows exactly WHY this course was marked failed (i.e. "we
  -- didn't crash your course, we just noticed it never finished").
  --
  -- We RETURN QUERY the affected rows so the caller can log which
  -- courses were cleaned up. pg_cron will capture this in its own
  -- job run logs table (cron.job_run_details).
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
    -- Append a structured error record. Uses coalesce to not
    -- wipe existing generation_errors arrays from Phase 2 partial
    -- failures that happened before the final crash.
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

-- Lock down permissions so only the cron scheduler (and the
-- authenticated postgres role doing migrations) can invoke this.
-- Stops a malicious authenticated user from calling it via RPC.
REVOKE ALL ON FUNCTION public.cleanup_stuck_generating_courses() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_stuck_generating_courses() FROM anon, authenticated;

-- Schedule the job. pg_cron's cron.schedule() is idempotent by
-- job name — calling it again with the same name updates the
-- schedule/command instead of creating a duplicate.
--
-- Schedule: '*/5 * * * *' = every 5 minutes. That gives us a
-- reasonable UX: user waits at most 5 min before the stuck card
-- clears and they can retry. At 5-min tick rate and ~23 rows in
-- the courses table, the function is effectively free (runs an
-- indexed filtered UPDATE on 0-1 rows per tick).
SELECT cron.schedule(
  'cleanup-stuck-generating-courses',
  '*/5 * * * *',
  $cron$ SELECT public.cleanup_stuck_generating_courses(); $cron$
);

COMMENT ON FUNCTION public.cleanup_stuck_generating_courses() IS
  'Marks courses stuck in generating state for >10 minutes as failed. Invoked every 5 minutes by pg_cron. Added in migration 007 as the last line of defense against Vercel 300s kills leaving zombie generating cards (Tentativo 13 post-mortem).';
