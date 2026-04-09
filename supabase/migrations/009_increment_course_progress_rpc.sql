-- Migration 009: increment_course_progress RPC
-- ─────────────────────────────────────────────────────────────
-- Atomic per-course progress counter for the Inngest module.generate
-- function. Without this, two parallel modules completing at roughly
-- the same time would both read (current=5), both write (current=6),
-- and the counter would drift by 1 every time a race happened.
--
-- Using a plpgsql function + row-level lock keeps the read-modify-
-- write atomic without a full table lock. SECURITY DEFINER so the
-- service role (which the Inngest functions use via getSupabaseAdmin)
-- can invoke it regardless of RLS.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_course_progress(p_course_id uuid)
RETURNS TABLE(
  new_completed integer,
  total_modules integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_new integer;
BEGIN
  UPDATE public.courses
  SET
    generation_completed_modules = COALESCE(generation_completed_modules, 0) + 1,
    generation_progress = CASE
      WHEN COALESCE(generation_completed_modules, 0) + 1 < COALESCE(generation_total_modules, 0)
        THEN format(
          'Generated %s of %s modules...',
          COALESCE(generation_completed_modules, 0) + 1,
          COALESCE(generation_total_modules, 0)
        )
      ELSE 'Finalizing course...'
    END,
    updated_at = now()
  WHERE id = p_course_id
  RETURNING
    COALESCE(generation_completed_modules, 0),
    COALESCE(generation_total_modules, 0)
  INTO v_new, v_total;

  RETURN QUERY SELECT v_new, v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_course_progress(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_course_progress(uuid) FROM anon, authenticated;

COMMENT ON FUNCTION public.increment_course_progress(uuid) IS
  'Atomic per-course progress counter for the Inngest module.generate function. Prevents drift from parallel module completions. Added in migration 009 as part of Fase 3 (Inngest queue).';
