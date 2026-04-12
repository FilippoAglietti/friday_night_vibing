-- Migration 013: observability views on generation_events
-- ─────────────────────────────────────────────────────────────
-- Six views that turn raw telemetry into the numbers you
-- actually need to look at. All read-only, service-role only
-- (they inherit RLS from generation_events which has no
-- anon/authenticated policies).
--
-- View list:
--   • v_course_success_by_length     — daily success ratio by length
--   • v_truncation_by_language       — max_tokens rate per language
--   • v_module_failure_distribution  — which module index fails most
--   • v_module_latency               — p50/p90/p95 of module duration
--   • v_rate_limit_hourly            — Anthropic 429s per hour
--   • v_error_breakdown              — error_message × phase × count
-- ─────────────────────────────────────────────────────────────

-- v_course_success_by_length ────────────────────────────────
-- Daily success ratio grouped by courses.length. The join is
-- on courses, not on the event rows, because "success" is a
-- property of the course not the events.
DROP VIEW IF EXISTS public.v_course_success_by_length CASCADE;
CREATE VIEW public.v_course_success_by_length AS
SELECT
  date_trunc('day', c.created_at)::date AS day,
  c.length,
  count(*) AS total,
  count(*) FILTER (WHERE c.status = 'ready') AS ready,
  count(*) FILTER (WHERE c.status = 'partial') AS partial,
  count(*) FILTER (WHERE c.status = 'failed') AS failed,
  round(
    100.0 * count(*) FILTER (WHERE c.status = 'ready') / NULLIF(count(*), 0),
    1
  ) AS ready_pct,
  round(
    100.0 * count(*) FILTER (WHERE c.status IN ('ready', 'partial')) / NULLIF(count(*), 0),
    1
  ) AS usable_pct
FROM public.courses c
WHERE c.created_at > now() - interval '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

COMMENT ON VIEW public.v_course_success_by_length IS
  'Daily course outcome breakdown by length. usable_pct = (ready+partial)/total, the real user-facing success number. Window: last 30 days.';

-- v_truncation_by_language ──────────────────────────────────
-- The Italian masterclass truncation hypothesis from April 8
-- lives or dies here. Joins claude_call_success events to
-- courses.language.
DROP VIEW IF EXISTS public.v_truncation_by_language CASCADE;
CREATE VIEW public.v_truncation_by_language AS
SELECT
  COALESCE(c.language, 'unknown') AS language,
  e.phase,
  count(*) AS total_calls,
  count(*) FILTER (WHERE (e.metadata->>'truncated')::boolean = true) AS truncated_calls,
  round(
    100.0 * count(*) FILTER (WHERE (e.metadata->>'truncated')::boolean = true)
      / NULLIF(count(*), 0),
    1
  ) AS truncation_pct
FROM public.generation_events e
LEFT JOIN public.courses c ON c.id = e.course_id
WHERE e.event_type = 'claude_call_success'
  AND e.created_at > now() - interval '30 days'
GROUP BY 1, 2
ORDER BY truncation_pct DESC NULLS LAST, total_calls DESC;

COMMENT ON VIEW public.v_truncation_by_language IS
  'max_tokens hit rate per language, broken out by phase. A high truncation_pct for a specific language points to prompt/token-budget mismatch. Window: last 30 days.';

-- v_module_failure_distribution ─────────────────────────────
-- "Is it always module-7 that fails?" Answered here.
DROP VIEW IF EXISTS public.v_module_failure_distribution CASCADE;
CREATE VIEW public.v_module_failure_distribution AS
SELECT
  e.module_index,
  count(*) AS failure_count,
  count(DISTINCT e.course_id) AS affected_courses,
  (array_agg(DISTINCT e.metadata->>'moduleId') FILTER (WHERE e.metadata ? 'moduleId'))[1:5]
    AS example_module_ids
FROM public.generation_events e
WHERE e.event_type = 'module_failure'
  AND e.created_at > now() - interval '30 days'
  AND e.module_index IS NOT NULL
GROUP BY 1
ORDER BY failure_count DESC;

COMMENT ON VIEW public.v_module_failure_distribution IS
  'Which module indexes fail most often. Uneven distribution → the prompt has a positional bias or the later waves hit rate limits. Window: last 30 days.';

-- v_module_latency ──────────────────────────────────────────
-- p50/p90/p95 module generation duration, broken out by
-- course length. Useful for detecting regressions after
-- prompt changes.
DROP VIEW IF EXISTS public.v_module_latency CASCADE;
CREATE VIEW public.v_module_latency AS
SELECT
  COALESCE(c.length, 'unknown') AS length,
  count(*) AS samples,
  round(percentile_cont(0.50) WITHIN GROUP (ORDER BY e.duration_ms)::numeric, 0) AS p50_ms,
  round(percentile_cont(0.90) WITHIN GROUP (ORDER BY e.duration_ms)::numeric, 0) AS p90_ms,
  round(percentile_cont(0.95) WITHIN GROUP (ORDER BY e.duration_ms)::numeric, 0) AS p95_ms,
  max(e.duration_ms) AS max_ms
FROM public.generation_events e
LEFT JOIN public.courses c ON c.id = e.course_id
WHERE e.event_type = 'claude_call_success'
  AND e.phase = 'module_detail'
  AND e.duration_ms IS NOT NULL
  AND e.created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY p95_ms DESC NULLS LAST;

COMMENT ON VIEW public.v_module_latency IS
  'p50/p90/p95 latency of module_detail Claude calls by course length. Rising p95 without rising p50 → tail risk from rate limits. Window: last 30 days.';

-- v_rate_limit_hourly ───────────────────────────────────────
-- Anthropic 429s per hour. The concurrency=3 decision should
-- keep this at zero. If it isn't, raise to =4/5 is risky.
DROP VIEW IF EXISTS public.v_rate_limit_hourly CASCADE;
CREATE VIEW public.v_rate_limit_hourly AS
SELECT
  date_trunc('hour', e.created_at) AS hour,
  count(*) FILTER (WHERE (e.metadata->>'rateLimited')::boolean = true) AS rate_limited,
  count(*) FILTER (WHERE (e.metadata->>'timedOut')::boolean = true) AS timed_out,
  count(*) AS total_failures
FROM public.generation_events e
WHERE e.event_type = 'claude_call_failure'
  AND e.created_at > now() - interval '7 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW public.v_rate_limit_hourly IS
  'Hourly Anthropic 429 rate and timeouts from claude_call_failure events. Window: last 7 days.';

-- v_error_breakdown ─────────────────────────────────────────
-- The "what's actually breaking today" view. Cross-tab of
-- error message × phase × occurrences.
DROP VIEW IF EXISTS public.v_error_breakdown CASCADE;
CREATE VIEW public.v_error_breakdown AS
SELECT
  e.phase,
  e.event_type,
  COALESCE(e.metadata->>'category', e.metadata->>'reason', 'unknown') AS error_key,
  count(*) AS occurrences,
  count(DISTINCT e.course_id) AS affected_courses,
  min(e.created_at) AS first_seen,
  max(e.created_at) AS last_seen
FROM public.generation_events e
WHERE e.event_type IN (
    'claude_call_failure',
    'json_parse_failure',
    'module_failure',
    'course_finalize_failed'
  )
  AND e.created_at > now() - interval '30 days'
GROUP BY 1, 2, 3
ORDER BY occurrences DESC
LIMIT 100;

COMMENT ON VIEW public.v_error_breakdown IS
  'Top 100 error signatures from the last 30 days. error_key prefers metadata.category (structured) then falls back to metadata.reason (raw message).';
