# Syllabi — Course Generation Reliability Fix

**Date:** 2026-04-12
**Author:** Claude (Opus 4.6), commissioned by Gianmarco
**Scope:** Course generation pipeline only. Positioning, pricing, marketing, and launch sequencing are explicitly out of scope and belong in separate specs.
**Audience:** Filippo (backend), Gianmarco (review).

---

## 0. Executive summary

A prior audit (see *Syllabi Deep Review — April 12, 2026*) diagnosed the generation failures without Supabase access and proposed a 2-day observability-first plan. With Supabase access we can now see the actual failure mode, which is simpler and more urgent.

**The root cause of the April 10–11 failure cluster is a deployment gap, not a code bug.** Commit `57750c9` ("feat(inngest): enforce MIN_SUCCESS_RATIO and add generation telemetry") shipped the code *and* the migrations that support it, but the migrations were never applied to the production Supabase database.

Production today:
- `generation_status` enum is `{pending, generating, ready, failed}` — `partial` is missing (migration 010 unapplied).
- `public.generation_events` table does not exist (migration 011 unapplied).
- `courseFinalize` in `src/lib/inngest/functions.ts:777` tries to write `status: finalStatus as "ready"` where `finalStatus` is actually `"partial"` whenever `ratio < 0.8`. Postgres rejects the enum value → throws → Inngest retries 3× → all fail → course zombies in `generating` → pg_cron kills it at the 10-minute mark with the generic "stuck in generating" error.

Every April 10–11 failed course with `total > 0, done < total` matches this signature. That's 8+ courses, probably more.

**This spec's job is to close the deployment gap, harden two secondary failure modes that the audit correctly identified but mis-prioritised (skeleton step, pg_cron threshold), and light up the observability that's already coded but invisible because the table doesn't exist.**

### Top-line numbers from production (2026-04-12)

| Metric | Value |
|---|---|
| Courses total | 38 |
| Courses `ready` | 10 |
| Courses `failed` | 28 (74% failure rate) |
| `generation_jobs` stuck in `running` | 31 of 54, all with `attempts=1`, all with `completed_at=null` |
| Dominant failure signature | `error_message = "Generation timed out after 10 minutes... Likely Vercel 300s kill or Inngest function death."` |
| Actual root cause of that signature | Finalize step throws on `partial` enum write; course never updates; pg_cron cleans it up |

---

## 1. Goals and non-goals

### Goals

1. Restore a ≥90% success rate on new course generation within 48 hours.
2. Make every failure explainable by querying a single Supabase table (`generation_events`), not by grepping Vercel logs.
3. Eliminate zombie `generation_jobs` rows (currently 31 in `running` with no completion and no error).
4. Preserve the user-trust guarantee that partial courses do NOT consume generation quota.

### Non-goals

- No changes to prompts, model selection, or course content quality.
- No changes to the Inngest function topology (3-function split stays).
- No changes to frontend copy, pricing, testimonials, or Product Hunt assets.
- No new admin dashboard UI — SQL views are enough for now.

---

## 2. Workstreams

Three workstreams, sized by blast radius.

### Workstream P0 — Unblock production (target: today)

The single most important action in this spec. Everything else is downstream.

**P0.1 Apply migrations 010 and 011 to production Supabase** (`syllabi-ai`, project ref `gmxseuttpurnxbluvcwx`).

- Migration 010: `ALTER TYPE public.generation_status ADD VALUE IF NOT EXISTS 'partial';`
- Migration 011: creates `public.generation_events` table with three indexes and RLS-on (no policies = service role only).

Apply via the Supabase MCP `apply_migration` tool or `supabase db push` — whichever the project's deploy flow uses. Both migrations are idempotent and safe to retry.

**P0.2 Regenerate TypeScript types** after the migrations land:

- `npx supabase gen types typescript --project-id gmxseuttpurnxbluvcwx > src/types/database.types.ts`
- Remove the two `as "ready"` and `as any` casts that were added as workarounds for types not knowing about `partial` and `generation_events` yet (`functions.ts:695`, `:777`, `metrics.ts:52`). Leaving them in masks future type errors.

**P0.3 Manual smoke test** — run one generation that deliberately fails ≥30% of modules and confirm the `partial` path works end-to-end. Easiest way to force partial failures: temporarily set `GENERATION_MODEL` to a non-existent model ID in Vercel for the module step only, or lower `maxTokens` on module generation to 2048 so JSON parsing predictably fails on 3+ modules. Revert immediately after the test. Assertions:
- `courses.status` ends up as `partial` (not `failed`)
- `courses.error_message` explains which modules failed
- `profiles.generations_used` does NOT increment
- `generation_events` has rows for `course_finalize_partial`, `module_failure`, and `module_success`

If any of the four assertions fail, stop and investigate before proceeding to P1.

**Owner:** Filippo. **Effort:** 30 min for the migrations + types, 20 min for the smoke test.

---

### Workstream P1 — Close the two real zombie modes (target: day 2)

After P0 lands, the `partial`-write zombie disappears. Two real zombie modes remain.

**P1.1 Skeleton step has no `onFailure` handler.**

`courseGenerate` at `src/lib/inngest/functions.ts:275` sets `retries: 1` but has no `onFailure`. When both attempts fail (timeout, rate limit, parse failure), the course sits in `generating` with `generation_total_modules=0` forever until pg_cron cleans it up. Of the 28 production failures, at least 6 match this pattern (`total=0, done=0`).

Mirror what `moduleGenerate` does at `functions.ts:452`. Add an `onFailure` handler to `courseGenerate` that:
1. Writes a structured entry to `courses.generation_errors` with `phase='skeleton'`, the actual error message, and a category (`timeout` / `rate_limit` / `parse_failure` / `unknown`)
2. Flips `courses.status` to `failed` and populates `error_message` with the underlying cause (not the generic pg_cron message)
3. Calls `recordEvent({ eventType: 'course_finalize_failed', phase: 'skeleton', metadata: { reason } })` so the failure is visible in telemetry

This turns silent zombies into explicit, queryable failures.

**P1.2 Raise the pg_cron staleness threshold from 10 minutes to 20 minutes.**

`cleanup_stuck_generating_courses()` currently fails anything whose `updated_at` is older than 10 minutes. At `concurrency: 3` on a 10-module masterclass, the nominal generation time is roughly:

- Skeleton up to 180s
- 4 module waves × up to 180s each = 720s
- **Total ~15 minutes on the happy path**

A course only survives today because each completed module bumps `updated_at`. One slow wave and the cleanup kills a course that was progressing normally.

Patch `supabase/migrations/007_pg_cron_stuck_course_cleanup.sql` (or add a new migration `012_raise_cleanup_threshold.sql` — preferred, to keep history clean) that redefines `cleanup_stuck_generating_courses()` with `max_age_minutes constant integer := 20;`. Everything else in the function stays identical.

**Why 20 and not 30:** 20 minutes covers the nominal masterclass (~15 min) plus a healthy margin for occasional slow waves without letting truly-zombie courses linger for half an hour. If observability shows the median masterclass is closer to the cap, raise again.

**Deferred (not in this spec):** A proper heartbeat mechanism where `moduleGenerate` bumps `courses.updated_at` periodically during long-running modules, and a pg_cron that targets `generation_jobs` directly instead of the courses table. Both are robust but touch more surface; revisit after P0 + P1 land and we have real data on whether zombies persist.

**P1.3 Backfill the stuck courses and stuck jobs currently in production.**

Run once manually after P0 and P1.2 land:

```sql
-- Kill zombie module jobs that have been running for >20 min
UPDATE public.generation_jobs
SET status = 'failed',
    error = jsonb_build_object(
      'message', 'Backfill cleanup: zombie from pre-fix pipeline',
      'backfilledAt', now()::text
    ),
    completed_at = now()
WHERE status = 'running'
  AND started_at < now() - interval '20 minutes';

-- Courses stuck in 'generating' that the cron hasn't caught yet (shouldn't be any,
-- but belt-and-suspenders in case this spec lands between cron runs)
SELECT public.cleanup_stuck_generating_courses();
```

Do NOT delete the existing 28 failed courses — they're useful baseline data for measuring the fix.

**Owner:** Filippo. **Effort:** 1 hour for P1.1, 15 min for P1.2, 5 min for P1.3.

---

### Workstream P2 — Light up observability (target: day 3)

Once `generation_events` exists (P0.1), `recordEvent` is already being called from `functions.ts`. But only at five points, and they're the wrong five:

| Currently emitted | Missing |
|---|---|
| `module_success` after a module completes | `claude_call_start` for skeleton and module |
| `module_failure` from `moduleGenerate.onFailure` | `claude_call_failure` with error classification |
| `course_finalize_ready` from `courseFinalize` merge step | `json_parse_success` with which strategy (1/2/3) was used |
| `course_finalize_partial` from `courseFinalize` merge step | `json_parse_failure` with raw-text length |
|   | `course_finalize_failed` from the new `courseGenerate.onFailure` (P1.1) |
|   | `rate_limited` when Anthropic returns 429 |
|   | `truncated` when `stop_reason === 'max_tokens'` |

**P2.1 Add the missing emission points.** They should all go *outside* `step.run()` blocks (the helper's JSDoc already warns about this — otherwise Inngest memoises them and retries produce phantom duplicates).

Concretely, add these one-liners:

- Inside `callClaude` right before `Promise.race`: `recordEvent({ courseId, eventType: 'claude_call_success' | 'claude_call_failure', phase, durationMs, metadata })` (needs plumbing `courseId` + `phase` into `callClaude` params)
- Inside `parseClaudeJson` just before `return`: `recordEvent({ courseId, eventType: 'json_parse_success', metadata: { strategy: 1|2|3 } })`
- Inside `callClaude` when `response.stop_reason === 'max_tokens'`: `recordEvent({ courseId, eventType: 'json_parse_success', metadata: { truncated: true, tokensOut: response.usage.output_tokens } })`
- Inside `courseGenerate.onFailure` (new, from P1.1): `recordEvent({ eventType: 'course_finalize_failed', phase: 'skeleton' })`

**P2.2 Ship the six SQL views** that the prior audit proposed. They are good queries — they just needed the table to exist first. Add as `supabase/migrations/013_generation_event_views.sql`:

- `v_course_success_by_length` — daily success ratio by `course_length` (crash/short/full/masterclass)
- `v_truncation_by_language` — `stop_reason='max_tokens'` rate per language (the audit's non-English truncation hypothesis can finally be tested)
- `v_module_failure_distribution` — which module indexes fail most (is it always mod-7? the last wave? random?)
- `v_module_latency` — p50/p90/p95 of `module_success.duration_ms` by length
- `v_rate_limit_hourly` — Anthropic 429s per hour
- `v_error_breakdown` — `error_code` × `phase` × occurrences

Full view definitions are in the prior audit's Section 1.3. No changes needed; they work against the schema in migration 011 with minor column renames (`generation_events` uses `event_type`, `phase`, `metadata` jsonb — the views should join to metadata via `->>`).

**P2.3 Alerting — explicitly deferred.**

The audit proposed a 15-min pg_cron that emails `fa@syllabi.online` when the 1-hour rolling failure rate exceeds 20%. **Defer this.** Reasons:
1. The threshold cannot be calibrated before we have baseline data.
2. Email is the wrong channel for launch week; Telegram is better but requires setup.
3. A bad alert during launch week (false positives, alert fatigue) is worse than no alert.

Revisit 7 days after this spec lands, once we have data to set a threshold against.

**Owner:** Filippo for P2.1 and P2.2. **Effort:** 2 hours for P2.1, 30 min for P2.2.

---

## 3. Success criteria

This spec is done when all of the following are true:

1. `select to_regclass('public.generation_events')` returns `generation_events` (not `null`).
2. `select enum_range(null::generation_status)` includes `partial`.
3. A deliberately-failing smoke test produces `courses.status = 'partial'` without throwing.
4. `courseGenerate` has an `onFailure` handler and skeleton failures are written to `courses.generation_errors` instead of zombieing.
5. `cleanup_stuck_generating_courses.max_age_minutes` is 20, not 10.
6. `generation_events` has at least one row for each of: `claude_call_success`, `claude_call_failure`, `json_parse_success`, `module_success`, `module_failure`, `course_finalize_ready`, `course_finalize_partial`, `course_finalize_failed`.
7. The six SQL views in P2.2 exist and return rows.
8. 48 hours after deployment, production failure rate (computed from `v_course_success_by_length`) is ≤10% on non-skeleton failures, with any remaining skeleton failures categorized in `generation_errors` by cause.

---

## 4. Risks and tradeoffs

**Risk 1: Applying migration 010 in production requires an enum ALTER, which is non-transactional.** If it fails mid-way we cannot roll back in the same transaction. *Mitigation:* the migration is a single `ADD VALUE IF NOT EXISTS` which is idempotent and fast (<1s). Re-running on failure is safe.

**Risk 2: Regenerated TypeScript types may break unrelated code.** The codebase has been compiling against hand-cast types. *Mitigation:* regenerate types in a branch, fix type errors narrowly, do not expand scope to "improve type hygiene."

**Risk 3: P2.1 adds overhead to every Claude call.** `recordEvent` is fire-and-forget and swallows errors, so latency impact is a single non-awaited Postgres insert (<5ms nominal). Effectively zero. *No mitigation needed.*

**Risk 4: Raising pg_cron to 20 minutes means truly-dead courses linger 10 minutes longer.** Acceptable: users are told upfront that masterclass takes ~15 min; a legit user won't notice, and the cost of killing healthy courses is much worse than the cost of 10 extra minutes of visible "generating" state.

**Risk 5: This spec and the prior audit disagree on priority.** The audit said observability first, then fixes. This spec says deployment fix first, then observability. *Resolution:* the audit was right about what needed building but wrong about the root cause because it had no DB access. With DB access we can see the smoking gun (migrations unapplied), and fixing that is 10x higher leverage than 2 days of instrumentation against an already-correct but unshipped system.

---

## 5. Open questions

1. **How do migrations actually get applied to production Supabase in this project?** The repo has them in `supabase/migrations/` but prod's `schema_migrations` stops at April 9. Is this a forgotten `supabase db push`, a broken CI step, or a manual-ops flow that Filippo missed? The fix for the root cause is one command; the fix for "why the command wasn't run" may matter for the next migration. Answer before P0 ships.
2. **Is the Inngest free-tier concurrency limit the binding constraint?** `functions.ts:442` comments "Lowered from 5 to 3 after Test H". If we're paying for Inngest and not free-tier, we may be able to raise back. Not in scope for this spec but worth confirming.
3. **Does the Italian skeleton truncation from April 8 (`len=27013, stop=max_tokens`) still happen with the current prompts?** Filippo's `f0c1fbb` prompt rewrite may have fixed it. P2.2's `v_truncation_by_language` view will answer this 24h after P2 lands.

---

## 6. References

- Prior audit: *Syllabi Deep Review — April 12, 2026* (Notion page `34015a61-9d1f-81bc-924d-ff4fd12af96d`). Sections 1.3 and 1.4 contain the SQL view definitions and MIN_SUCCESS_RATIO design this spec builds on.
- Inngest pipeline: `src/lib/inngest/functions.ts` (836 lines).
- Metrics helper: `src/lib/observability/metrics.ts`.
- Migrations: `supabase/migrations/007_pg_cron_stuck_course_cleanup.sql`, `010_add_partial_status.sql`, `011_generation_events.sql`.
- Relevant Supabase project: `syllabi-ai` (ref `gmxseuttpurnxbluvcwx`, eu-west-1).
