-- 017b_quality_warnings.sql
-- Adds JSONB column for Opus-reviewer feedback attached to skeletons.
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS quality_warnings JSONB;
COMMENT ON COLUMN public.courses.quality_warnings IS
  'Array of reviewer feedback strings (Opus reviewer). NULL if approved or reviewer disabled.';
