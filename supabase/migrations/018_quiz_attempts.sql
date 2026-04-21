-- ============================================================
-- Syllabi.ai — Quiz Attempts (public student link)
-- Project: syllabi-ai (gmxseuttpurnxbluvcwx)
-- Adds a table for student quiz submissions on publicly-shared courses.
-- Students are identified by a free-text name/handle — no auth required.
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name     TEXT NOT NULL,
  student_email    TEXT,
  module_index     INTEGER NOT NULL,
  module_title     TEXT,
  total_questions  INTEGER NOT NULL,
  correct_answers  INTEGER NOT NULL,
  score_percent    INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_questions > 0
      THEN (correct_answers * 100) / total_questions
      ELSE 0 END
  ) STORED,
  answers          JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id  ON public.quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Anonymous students can insert attempts, but ONLY against public courses.
CREATE POLICY "Anonymous can insert attempts on public courses"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.is_public = TRUE
    )
  );

-- Course owners can read attempts for their own courses.
CREATE POLICY "Owners can view attempts for their courses"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

-- Course owners can delete (e.g. wipe before sharing again).
CREATE POLICY "Owners can delete attempts for their courses"
  ON public.quiz_attempts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );
