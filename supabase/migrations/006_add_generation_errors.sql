-- Migration 006: Add generation_errors JSONB column to courses
--
-- Problem solved:
--   The chunked generation pipeline (Phase 2 per-module parallel generation)
--   can partially fail — e.g. 8 out of 10 modules succeed while 2 fall back
--   to the skeleton stub because Haiku hit max_tokens, the request timed out,
--   or Anthropic 429'd us. If overall success_ratio >= MIN_SUCCESS_RATIO (0.6),
--   the course is promoted to status='ready' and the partial failure reasons
--   are written to console.warn() only. Vercel runtime logs MCP is broken, so
--   those reasons vanish and the next debug cycle has zero forensic data.
--
--   Previously (Tentativo 11/12) we smuggled the reasons into error_message,
--   but that column is:
--     (a) semantically meant for HARD failures only (status='failed')
--     (b) propagated to the frontend by /api/courses/[id]/status — polluting
--         it would start false-alerting users whose course is actually ready
--     (c) a single text field — no room for per-module structured data that
--         could drive future retry UX
--
-- Design:
--   A dedicated JSONB column with a structured array of per-module failure
--   records. Always written (even on hard failure) as the source of truth
--   for "what went wrong during this generation, at what phase, how".
--   error_message stays clean and reserved for hard-failure headline text.
--
-- Schema:
--   generation_errors JSONB NOT NULL DEFAULT '[]'::jsonb
--   Each element: { moduleId, moduleIndex, phase, category, reason, ts }
--     moduleId    — text, e.g. "mod-7" (or "skeleton" for Phase 1 failures)
--     moduleIndex — int, 0-based (-1 for skeleton)
--     phase       — text, "skeleton" | "module" | "global"
--     category    — text, normalized bucket:
--                   truncation | timeout | deadline | parse_error
--                   | rate_limit | api_error | unknown
--     reason      — text, original error message truncated to 500 chars
--     ts          — text, ISO 8601 timestamp
--
--   GIN index on generation_errors for efficient analytics queries like:
--     SELECT id, title FROM courses
--     WHERE generation_errors @> '[{"category":"truncation"}]'::jsonb;
--
-- Backfill:
--   No backfill needed — default '[]' is the honest representation of
--   historical rows where we don't have structured data. Existing failed
--   courses keep their free-text error_message as before.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS generation_errors JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.courses.generation_errors IS
  'Structured per-module failure records from the chunked generation pipeline. '
  'Populated on both hard failures and partial-success cases (e.g. 8/10 modules). '
  'Each element: { moduleId, moduleIndex, phase, category, reason, ts }. '
  'Empty array when generation succeeded with zero issues. '
  'Added 2026-04-09 to close the observability gap after Tentativo 13 Italian 8/10 cliff.';

-- GIN index: enables fast containment queries for analytics / debug dashboards.
-- jsonb_path_ops is the most space-efficient operator class for @> queries.
CREATE INDEX IF NOT EXISTS courses_generation_errors_gin_idx
  ON public.courses USING GIN (generation_errors jsonb_path_ops);
