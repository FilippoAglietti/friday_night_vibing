# Generation Reliability Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the deployment gap that causes 74% of production course generations to fail, harden two secondary zombie modes (skeleton step with no `onFailure`, pg_cron threshold too aggressive for masterclass length), and light up the telemetry that's already coded but invisible.

**Architecture:** Three sequential waves. P0 applies migrations 010 and 011 (already in-repo, never deployed), regenerates types, removes the workaround casts, and smoke-tests the `partial` path end-to-end. P1 adds `onFailure` to `courseGenerate` to stop skeleton zombies and raises the pg_cron staleness threshold from 10 to 20 min via migration 012. P2 plumbs `courseId`/`phase` through `callClaude`, adds `recordEvent` emissions at five new points, and ships six SQL views via migration 013.

**Tech Stack:** Next.js (custom fork per `AGENTS.md`), Supabase Postgres (project `gmxseuttpurnxbluvcwx`), Inngest v3, Anthropic SDK v0.80, TypeScript. Quality gates are `next build` (type-check) and `eslint`. No unit test infrastructure exists in this repo — verification is done via SQL queries against the live DB and manual end-to-end smoke tests against the deployed Inngest pipeline.

**Spec:** `docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md`
**Companion Notion page (for Filippo):** https://www.notion.so/34015a619d1f8165b9e7c45c46b28bd8

---

## File inventory

**Create:**
- `supabase/migrations/012_raise_cleanup_threshold.sql` — raises `cleanup_stuck_generating_courses.max_age_minutes` from 10 to 20.
- `supabase/migrations/013_generation_event_views.sql` — six observability views (`v_course_success_by_length`, `v_truncation_by_language`, `v_module_failure_distribution`, `v_module_latency`, `v_rate_limit_hourly`, `v_error_breakdown`).

**Apply to production (already in-repo, not yet deployed):**
- `supabase/migrations/010_add_partial_status.sql`
- `supabase/migrations/011_generation_events.sql`

**Modify:**
- `src/types/database.types.ts` — regenerate from the live schema after migrations 010/011 land. Mechanical.
- `src/lib/inngest/functions.ts` — four distinct edits:
  - Remove the `as string | undefined` cast at ~`:695` and the `as "ready"` cast at `:777` (P0.4).
  - Add `onFailure` handler to `courseGenerate` at the function-option level (~`:275`) that writes structured errors to `courses.generation_errors` (P1.1).
  - Widen `callClaude` params to include `courseId` and `phase` for telemetry plumbing (P2.1).
  - Add `recordEvent(...)` calls at five new points: `claude_call_success`, `claude_call_failure`, `json_parse_success` with strategy metadata, `claude_call_success` with truncated metadata, and `claude_call_failure` with rate-limited metadata (P2.2).
- `src/lib/observability/metrics.ts` — remove the `as any` cast on `getSupabaseAdmin()` at `:52`. No new event types are added (strategy number, truncated flag, and rate_limit flag all live in `metadata`).

**No frontend changes in this plan.** The `partial`-status dashboard badge already exists in commit `57750c9` (per spec §1).

---

## Wave P0 — Unblock production

### Task 1: Apply migration 010 (add `partial` enum value)

**Files:**
- Apply: `supabase/migrations/010_add_partial_status.sql`

- [ ] **Step 1: Verify the migration is missing from prod**

Run via Supabase MCP:
```sql
select enum_range(null::generation_status)::text;
```
Expected: `{pending,generating,ready,failed}` (note: no `partial`).

- [ ] **Step 2: Apply migration 010 to prod**

Use the Supabase MCP `apply_migration` tool with:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `010_add_partial_status`
- `query`: contents of `supabase/migrations/010_add_partial_status.sql` (exactly — the `IF NOT EXISTS` guard makes this idempotent)

```sql
ALTER TYPE public.generation_status ADD VALUE IF NOT EXISTS 'partial';
```

- [ ] **Step 3: Verify the enum now includes `partial`**

```sql
select enum_range(null::generation_status)::text;
```
Expected: `{pending,generating,ready,failed,partial}`.

If this fails, STOP — do not proceed to Task 2. Investigate first. The enum ALTER is non-transactional so a partial failure would leave the type in an inconsistent state.

---

### Task 2: Apply migration 011 (create `generation_events` table)

**Files:**
- Apply: `supabase/migrations/011_generation_events.sql`

- [ ] **Step 1: Verify the table is missing**

```sql
select to_regclass('public.generation_events');
```
Expected: `null`.

- [ ] **Step 2: Apply migration 011 to prod**

Use Supabase MCP `apply_migration` with:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `011_generation_events`
- `query`: contents of `supabase/migrations/011_generation_events.sql` (the `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` guards make this idempotent)

- [ ] **Step 3: Verify the table exists with the expected columns**

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'generation_events'
order by ordinal_position;
```

Expected rows:
- `id` bigint
- `course_id` uuid
- `module_index` integer
- `event_type` text
- `phase` text
- `duration_ms` integer
- `metadata` jsonb
- `created_at` timestamp with time zone

- [ ] **Step 4: Verify RLS is enabled with zero policies**

```sql
select relrowsecurity from pg_class where relname = 'generation_events';
select polname from pg_policies where tablename = 'generation_events';
```
Expected: `relrowsecurity = t`, zero rows from `pg_policies`. Service role bypasses RLS so that's the desired state — no `anon`/`authenticated` access.

---

### Task 3: Regenerate TypeScript types

**Files:**
- Modify: `src/types/database.types.ts` (full regeneration)

- [ ] **Step 1: Run the Supabase CLI type generator**

Run from repo root:
```bash
npx supabase gen types typescript --project-id gmxseuttpurnxbluvcwx > src/types/database.types.ts
```

- [ ] **Step 2: Verify `partial` is now in the generated enum**

Run:
```bash
grep -n "partial" src/types/database.types.ts | head
```
Expected: at least one match where `generation_status` is defined as a union including `"partial"`.

- [ ] **Step 3: Verify `generation_events` is now in the generated types**

```bash
grep -n "generation_events" src/types/database.types.ts | head
```
Expected: at least one match showing the table's TypeScript definition.

- [ ] **Step 4: Run build to surface any breakages**

```bash
npm run build 2>&1 | tail -40
```
Expected: the build may surface type errors at the three cast sites listed in Task 4 — those are the workaround casts we're about to remove, and they may now be either redundant or actively wrong. That's expected and will be resolved in Task 4. If the build surfaces type errors outside those three sites, stop and investigate before continuing.

---

### Task 4: Remove workaround casts in `functions.ts` and `metrics.ts`

**Files:**
- Modify: `src/lib/inngest/functions.ts:695` and `:777`
- Modify: `src/lib/observability/metrics.ts:52`

- [ ] **Step 1: Remove the `as string | undefined` cast on course status read**

In `src/lib/inngest/functions.ts`, find:
```ts
      // Idempotency guard: if already in a terminal state, bail out.
      // 'partial' is a new enum value (migration 010) and may not yet
      // be present in regenerated database.types — widen via cast.
      const currentStatus = course?.status as string | undefined;
      if (currentStatus === "ready" || currentStatus === "partial") {
        return { skeleton: null, jobs: [] };
      }
```

Replace with:
```ts
      // Idempotency guard: if already in a terminal state, bail out.
      if (course?.status === "ready" || course?.status === "partial") {
        return { skeleton: null, jobs: [] };
      }
```

- [ ] **Step 2: Remove the `as "ready"` cast on the mark-final-status write**

In the same file, find:
```ts
      await supabase
        .from("courses")
        .update({
          curriculum: merged,
          // 'partial' enum value is added in migration 010 but may
          // not be present in regenerated database.types yet — cast.
          status: finalStatus as "ready",
          error_message: errorMessage,
          generation_progress: null,
          generation_completed_modules: successfulCount,
        })
        .eq("id", courseId);
```

Replace `status: finalStatus as "ready"` with `status: finalStatus`. Also remove the two-line comment above it. The regenerated types now know about `"partial"`.

- [ ] **Step 3: Remove the `as any` cast on `getSupabaseAdmin()` in metrics.ts**

In `src/lib/observability/metrics.ts`, find:
```ts
  // database.types.ts is regenerated from Supabase and does not
  // yet include generation_events (migration 011). Casting here
  // keeps the helper isolated from the rest of the codebase —
  // when types are regenerated, this cast can be removed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdmin() as any;
  void supabase
    .from("generation_events")
    .insert({
```

Replace with:
```ts
  const supabase = getSupabaseAdmin();
  void supabase
    .from("generation_events")
    .insert({
```

Also remove the `// eslint-disable-next-line @typescript-eslint/no-explicit-any` on the `.then(({ error }: { error: any })` line below — change it to `.then(({ error }) => {`.

- [ ] **Step 4: Run build to confirm types are clean**

```bash
npm run build 2>&1 | tail -40
```
Expected: build succeeds with no type errors. If it fails, the regenerated types may have a column name mismatch with what `metrics.ts` is inserting — inspect the generated `Database["public"]["Tables"]["generation_events"]["Insert"]` type and align.

- [ ] **Step 5: Run lint**

```bash
npm run lint 2>&1 | tail -20
```
Expected: no errors from the three modified files.

---

### Task 5: Smoke-test the `partial` path end-to-end

This is the verification gate for P0. Do NOT proceed to P1 until all four assertions pass.

**Files:** None modified. This task is a runtime test against the deployed system using a temporary env var override.

- [ ] **Step 1: Find a low-traffic time window to run the test**

This test deliberately breaks module generation for one request. Run it when no real users are on the platform (check `select count(*) from public.courses where created_at > now() - interval '10 minutes';` — should be 0).

- [ ] **Step 2: Temporarily lower module `maxTokens` to force JSON parse failure**

Edit `src/lib/inngest/functions.ts` locally (do NOT commit this change):

Find the module `callClaude` invocation inside `moduleGenerate` (~`:562`):
```ts
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/module-${moduleId}`,
        timeoutMs: 180_000,
      });
```

Temporarily change `maxTokens: 24576` to `maxTokens: 1024`. This is low enough that Claude cannot emit a complete module JSON and the repair strategies will fail on most modules (`parseClaudeJson` will throw on 3+ of 10 modules, triggering partial outcome).

- [ ] **Step 3: Deploy the smoke-test build to a preview Vercel URL**

```bash
vercel --prod=false
```

Record the preview URL. Do NOT push this to production.

- [ ] **Step 4: Generate a 10-module masterclass on the preview URL**

Open the preview URL, sign in as your test account, generate a course with `length=masterclass` and English as the language. Wait for the Inngest pipeline to complete (up to 20 minutes). The course should end up in `status='partial'`.

- [ ] **Step 5: Assertion 1 — course status is `partial`**

```sql
select id, status, error_message
from public.courses
where id = '<test-course-id>';
```
Expected: `status = 'partial'`, `error_message` contains "Partial generation: N/10 modules succeeded".

- [ ] **Step 6: Assertion 2 — user quota was NOT decremented**

Record `profiles.generations_used` before the test, compare after:
```sql
select generations_used
from public.profiles
where id = '<test-user-id>';
```
Expected: unchanged from pre-test value. The spec requires partial courses not consume quota.

- [ ] **Step 7: Assertion 3 — `generation_events` has telemetry rows**

```sql
select event_type, count(*)
from public.generation_events
where course_id = '<test-course-id>'
group by event_type
order by event_type;
```
Expected: at least one row each for `module_success`, `module_failure`, and `course_finalize_partial`. (Note: the full set of event types lands in P2 — for P0 we only need the three that are already wired.)

- [ ] **Step 8: Assertion 4 — the merged curriculum has skeleton stubs for failed modules**

```sql
select jsonb_array_length(curriculum->'modules') as module_count,
       jsonb_path_query_array(curriculum, '$.modules[*].lessons') as lessons_per_module
from public.courses where id = '<test-course-id>';
```
Expected: `module_count = 10`. Each module either has populated lessons (succeeded) or an empty/skeleton lesson list (failed). No module should be missing entirely.

- [ ] **Step 9: Revert the maxTokens override**

Undo the edit in `src/lib/inngest/functions.ts` — restore `maxTokens: 24576`. Do not commit this revert as a separate commit; it should go in with Task 6.

- [ ] **Step 10: If any assertion fails, stop**

Fix the spec-level issue (may require amending the plan) before proceeding to P1. Do not move on with a partially-working partial path — it masks everything P1 and P2 depend on.

---

### Task 6: Commit P0

- [ ] **Step 1: Verify the working tree has only the expected changes**

```bash
git status
git diff src/types/database.types.ts | head -40
git diff src/lib/inngest/functions.ts
git diff src/lib/observability/metrics.ts
```
Expected: `database.types.ts` regenerated, the three cast removals in the two TypeScript files, no other changes. The `maxTokens: 1024` smoke-test edit should have been reverted in Task 5 Step 9.

- [ ] **Step 2: Stage and commit**

```bash
git add src/types/database.types.ts src/lib/inngest/functions.ts src/lib/observability/metrics.ts
git commit -m "$(cat <<'EOF'
fix(generation): close P0 of reliability fix — apply migrations 010/011 and remove workaround casts

Migrations 010 (partial enum) and 011 (generation_events table) from
commit 57750c9 were shipped in the repo but never applied to the live
Supabase project. Applied via MCP apply_migration, regenerated types,
and removed the three workaround casts that were masking the ensuing
type errors. Smoke-tested end-to-end: a deliberate module-level failure
produces status='partial', user quota is preserved, and the course
remains navigable with skeleton stubs for failed modules.

Closes P0 of docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md.
EOF
)"
```

---

## Wave P1 — Close the two real zombie modes

### Task 7: Add `onFailure` handler to `courseGenerate`

**Files:**
- Modify: `src/lib/inngest/functions.ts:275` (function options block)

- [ ] **Step 1: Read the existing `moduleGenerate.onFailure` for the pattern**

Read `src/lib/inngest/functions.ts:452-519`. Note the three things it does: mark the job row as `failed` with error detail, bump the progress counter, conditionally trigger `course.finalize.requested`. The skeleton version needs a different shape because there are no `generation_jobs` rows yet — skeleton failures happen BEFORE fan-out.

- [ ] **Step 2: Add the `onFailure` handler**

In `src/lib/inngest/functions.ts`, find the `courseGenerate` definition:
```ts
export const courseGenerate = inngest.createFunction(
  {
    id: "course-generate",
    name: "Course: Skeleton + Fan-out",
    // Haiku 4.5 skeleton takes ~50-70s for a 10-module masterclass.
    // With retries: 1, worst case is 70s × 2 = 140s — well within
    // Vercel's 300s budget. This protects against transient Anthropic
    // API errors that would otherwise kill the entire course.
    retries: 1,
  },
  { event: "course/generate.requested" },
```

Insert an `onFailure` option between `retries: 1,` and the closing `}` of the options object:

```ts
export const courseGenerate = inngest.createFunction(
  {
    id: "course-generate",
    name: "Course: Skeleton + Fan-out",
    retries: 1,
    // CRITICAL: onFailure runs AFTER all retries are exhausted.
    // Without this, the skeleton path zombies — courses sit in
    // 'generating' with total_modules=0 until pg_cron cleans them
    // up with the generic "stuck in generating" error. Mirror
    // moduleGenerate.onFailure but adapted for the pre-fan-out
    // state (no generation_jobs rows exist yet).
    onFailure: async ({ event: failureEvent }) => {
      const { courseId } = failureEvent.data.event.data;
      const supabase = getSupabaseAdmin();

      const rawMessage =
        failureEvent.data.error?.message ?? "Unknown error after all retries";
      const category = classifySkeletonError(rawMessage);

      console.error(
        `[inngest/courseGenerate/onFailure] [${courseId}] ` +
        `Skeleton failed permanently (${category}): ${rawMessage}`,
      );

      await supabase
        .from("courses")
        .update({
          status: "failed",
          error_message: `[skeleton/${category}] ${rawMessage}`,
          generation_progress: null,
          generation_errors: [
            {
              moduleId: "skeleton",
              moduleIndex: -1,
              phase: "skeleton",
              category,
              reason: rawMessage,
              ts: new Date().toISOString(),
            },
          ],
        })
        .eq("id", courseId);

      recordEvent({
        courseId,
        eventType: "course_finalize_failed",
        phase: "skeleton",
        metadata: { category, reason: rawMessage },
      });
    },
  },
  { event: "course/generate.requested" },
```

- [ ] **Step 3: Add the `classifySkeletonError` helper**

Still in `src/lib/inngest/functions.ts`, find the `// ─── Shared helpers ───` section (~`:59`) and add this helper after the existing `parseClaudeJson` function (~`:256`):

```ts
/**
 * Classify a skeleton failure by inspecting the error message.
 * Used by courseGenerate.onFailure to write a structured category
 * into courses.generation_errors so the v_error_breakdown view
 * can group them meaningfully.
 */
function classifySkeletonError(message: string): "timeout" | "rate_limit" | "parse_failure" | "unknown" {
  const lower = message.toLowerCase();
  if (lower.includes("timed out") || lower.includes("timeout")) return "timeout";
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("rate_limit")) return "rate_limit";
  if (lower.includes("json parse failed") || lower.includes("unexpected token")) return "parse_failure";
  return "unknown";
}
```

- [ ] **Step 4: Run build**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean build.

- [ ] **Step 5: Runtime verification — force a skeleton failure**

Locally edit `src/lib/inngest/functions.ts` — in `callClaude`, temporarily hard-code `model: "claude-fake-model-does-not-exist"` inside the skeleton step's call site (`:305`). Deploy to preview Vercel, generate one course, wait ~5 minutes for Inngest to exhaust retries. Then:

```sql
select status, error_message, generation_errors
from public.courses
where id = '<test-course-id>';
```
Expected: `status = 'failed'`, `error_message` starts with `[skeleton/`, `generation_errors` has one entry with `phase='skeleton'` and a non-"unknown" category (likely `"unknown"` because "model not found" doesn't match the classifier — that's fine, it proves the fallback works).

Also verify telemetry:
```sql
select event_type, metadata from public.generation_events where course_id = '<test-course-id>';
```
Expected: at least one row with `event_type = 'course_finalize_failed'` and `metadata->>'category'` populated.

Revert the fake-model edit before committing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inngest/functions.ts
git commit -m "$(cat <<'EOF'
fix(generation): add onFailure handler to courseGenerate

The skeleton step had no failure handler, so exhausted retries left
courses zombied in 'generating' with total_modules=0 until pg_cron
killed them with the generic "stuck in generating" message. Mirror
moduleGenerate.onFailure but adapted for the pre-fan-out state
(no generation_jobs rows exist yet), add a classifySkeletonError
helper that sorts failures into timeout / rate_limit / parse_failure /
unknown for the v_error_breakdown view in P2, and emit a
course_finalize_failed telemetry event so skeleton deaths show up
in generation_events.

Closes P1.1 of docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md.
EOF
)"
```

---

### Task 8: Create migration 012 (raise pg_cron threshold)

**Files:**
- Create: `supabase/migrations/012_raise_cleanup_threshold.sql`

- [ ] **Step 1: Read the existing cleanup function definition**

Read `supabase/migrations/007_pg_cron_stuck_course_cleanup.sql` to confirm the current function body before redefining it. The only difference in 012 should be the `max_age_minutes` constant going from 10 to 20.

- [ ] **Step 2: Write the new migration file**

Create `supabase/migrations/012_raise_cleanup_threshold.sql` with:

```sql
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
SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;
```

- [ ] **Step 3: Verify the file**

```bash
cat supabase/migrations/012_raise_cleanup_threshold.sql | wc -l
```
Expected: roughly 55 lines.

---

### Task 9: Apply migration 012 to production

- [ ] **Step 1: Apply the migration**

Use Supabase MCP `apply_migration`:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `012_raise_cleanup_threshold`
- `query`: full contents of `supabase/migrations/012_raise_cleanup_threshold.sql`

- [ ] **Step 2: Verify the new function body is live**

```sql
select pg_get_functiondef('public.cleanup_stuck_generating_courses'::regproc);
```
Expected: the returned definition contains `max_age_minutes constant integer := 20;` (not 10).

- [ ] **Step 3: Verify the pg_cron job still references the updated function**

```sql
select jobname, schedule, command from cron.job where jobname = 'cleanup-stuck-generating-courses';
```
Expected: still scheduled `*/5 * * * *` with command `SELECT public.cleanup_stuck_generating_courses();`. We didn't touch the cron schedule, only the function body.

---

### Task 10: Backfill zombie `generation_jobs` and run cleanup once

**Files:** None modified. This is a one-shot maintenance operation against production.

- [ ] **Step 1: Verify the zombie count before backfill**

```sql
select count(*) from public.generation_jobs
where status = 'running'
  and started_at < now() - interval '20 minutes';
```
Expected: roughly 31 (the number observed during spec authoring — may differ if new work has happened since).

- [ ] **Step 2: Kill the zombies**

```sql
UPDATE public.generation_jobs
SET status = 'failed',
    error = jsonb_build_object(
      'message', 'Backfill cleanup: zombie from pre-fix pipeline',
      'backfilledAt', now()::text
    ),
    completed_at = now()
WHERE status = 'running'
  AND started_at < now() - interval '20 minutes';
```
Expected: affected rows ≈ Step 1 count.

- [ ] **Step 3: Sweep courses still in `generating`**

```sql
SELECT public.cleanup_stuck_generating_courses();
```
Expected: zero or a handful of rows. Any that come back should be legitimately stale courses from before the fix.

- [ ] **Step 4: Verify post-state**

```sql
select status, count(*) from public.generation_jobs group by status;
select status, count(*) from public.courses group by status;
```
Expected: zero `running` jobs older than 20 min; no `generating` courses older than 20 min. Do NOT delete the historical `failed` courses — they're the baseline for measuring the fix.

- [ ] **Step 5: Commit migration 012**

```bash
git add supabase/migrations/012_raise_cleanup_threshold.sql
git commit -m "$(cat <<'EOF'
fix(generation): raise pg_cron cleanup threshold 10→20 min

With the Inngest 3-function split and concurrency=3 on module
generation, a 10-module masterclass nominally takes ~15 min
(skeleton up to 180s + 4 waves × 180s = 720s). The original
10-min threshold from migration 007 was killing courses that
were progressing normally. Raising to 20 min covers the nominal
masterclass plus margin without letting truly-zombie courses
linger for half an hour.

Also backfilled the 31 existing zombie generation_jobs rows and
swept any courses still in 'generating' state.

Closes P1.2 of docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md.
EOF
)"
```

---

## Wave P2 — Light up observability

### Task 11: Plumb `courseId` and `phase` through `callClaude`

**Files:**
- Modify: `src/lib/inngest/functions.ts` — `callClaude` function signature (~`:70`), skeleton call site (~`:302`), module call site (~`:562`).

- [ ] **Step 1: Widen `callClaude` params**

In `src/lib/inngest/functions.ts`, find:
```ts
async function callClaude(params: {
  system: string;
  messages: Anthropic.MessageParam[];
  model: string;
  maxTokens: number;
  label: string;
  timeoutMs: number;
}): Promise<string> {
```

Add two new fields at the end:
```ts
async function callClaude(params: {
  system: string;
  messages: Anthropic.MessageParam[];
  model: string;
  maxTokens: number;
  label: string;
  timeoutMs: number;
  courseId: string;
  phase: "skeleton" | "module_detail";
}): Promise<string> {
```

- [ ] **Step 2: Update the skeleton call site**

Find `await callClaude({` at the skeleton step (~`:302`). Add `courseId,` and `phase: "skeleton",` to the object:

```ts
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/skeleton`,
        timeoutMs: 240_000,
        courseId,
        phase: "skeleton",
      });
```

- [ ] **Step 3: Update the module call site**

Find `await callClaude({` at the module step (~`:562`). Add `courseId,` and `phase: "module_detail",`:

```ts
      const rawText = await callClaude({
        system,
        messages,
        model: GENERATION_MODEL,
        maxTokens: 24576,
        label: `${courseId}/module-${moduleId}`,
        timeoutMs: 180_000,
        courseId,
        phase: "module_detail",
      });
```

- [ ] **Step 4: Build to verify the signature change compiles**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean build. If it fails, it's a missing call site — grep for `callClaude({` and add the new fields.

---

### Task 12: Emit `claude_call_success` / `claude_call_failure` from `callClaude`

**Files:**
- Modify: `src/lib/inngest/functions.ts` — inside `callClaude` body.

- [ ] **Step 1: Add start-time capture and success emission**

In `callClaude`, right before the `const controller = new AbortController();` line, add:
```ts
  const startTime = Date.now();
```

After the `clearTimeout(timeoutId!); // Success: prevent dangling timer` line (inside the try block), before the response content parsing, add:
```ts
    recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_success",
      phase: params.phase,
      durationMs: Date.now() - startTime,
      metadata: {
        model: params.model,
        tokensOut: response.usage?.output_tokens ?? null,
        stopReason: response.stop_reason,
        truncated: response.stop_reason === "max_tokens",
      },
    });
```

- [ ] **Step 2: Add failure emission in the catch block**

Inside the `catch (err)` block, after `clearTimeout(timeoutId!);` and before the `try { stream.abort(); }` line, add:
```ts
    const errMsg = err instanceof Error ? err.message : String(err);
    recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_failure",
      phase: params.phase,
      durationMs: Date.now() - startTime,
      metadata: {
        model: params.model,
        reason: errMsg,
        rateLimited: errMsg.includes("429") || errMsg.toLowerCase().includes("rate"),
        timedOut: errMsg.toLowerCase().includes("timed out"),
      },
    });
```

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean.

---

### Task 13: Emit `json_parse_success` / `json_parse_failure` from `parseClaudeJson`

**Files:**
- Modify: `src/lib/inngest/functions.ts` — `parseClaudeJson` signature and body.

- [ ] **Step 1: Widen the signature to accept `courseId`**

Find:
```ts
function parseClaudeJson<T>(raw: string, label: string): T {
```

Change to:
```ts
function parseClaudeJson<T>(raw: string, label: string, courseId?: string): T {
```

- [ ] **Step 2: Emit `json_parse_success` for Strategy 1 (direct parse)**

Inside the first `try { return JSON.parse(cleaned) as T; }` block, replace:
```ts
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through to Strategy 2 */
  }
```

With:
```ts
  try {
    const result = JSON.parse(cleaned) as T;
    recordEvent({
      courseId,
      eventType: "json_parse_success",
      metadata: { strategy: 1, label, rawLength: raw.length },
    });
    return result;
  } catch {
    /* fall through to Strategy 2 */
  }
```

- [ ] **Step 3: Emit `json_parse_success` for Strategy 2 (extract)**

Replace:
```ts
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      /* fall through to Strategy 3 */
    }
  }
```

With:
```ts
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const result = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      recordEvent({
        courseId,
        eventType: "json_parse_success",
        metadata: { strategy: 2, label, rawLength: raw.length },
      });
      return result;
    } catch {
      /* fall through to Strategy 3 */
    }
  }
```

- [ ] **Step 4: Emit `json_parse_success` for Strategy 3 (repair) and failure for the final throw**

Replace:
```ts
  if (firstBrace !== -1) {
    const repairedJson = repairTruncatedJson(cleaned.slice(firstBrace));
    try {
      const result = JSON.parse(repairedJson) as T;
      console.warn(
        `[inngest/parseClaudeJson] [${label}] JSON repaired after truncation — content may be incomplete but usable.`,
      );
      return result;
    } catch {
      /* fall through to throw */
    }
  }

  throw new Error(
    `[${label}] JSON parse failed after 3 strategies (len=${raw.length}). Response may be severely malformed.`,
  );
```

With:
```ts
  if (firstBrace !== -1) {
    const repairedJson = repairTruncatedJson(cleaned.slice(firstBrace));
    try {
      const result = JSON.parse(repairedJson) as T;
      console.warn(
        `[inngest/parseClaudeJson] [${label}] JSON repaired after truncation — content may be incomplete but usable.`,
      );
      recordEvent({
        courseId,
        eventType: "json_parse_success",
        metadata: { strategy: 3, label, rawLength: raw.length, repaired: true },
      });
      return result;
    } catch {
      /* fall through to throw */
    }
  }

  recordEvent({
    courseId,
    eventType: "json_parse_failure",
    metadata: { label, rawLength: raw.length },
  });
  throw new Error(
    `[${label}] JSON parse failed after 3 strategies (len=${raw.length}). Response may be severely malformed.`,
  );
```

- [ ] **Step 5: Pass `courseId` from the skeleton call site**

Find `parseClaudeJson<Curriculum>(rawText, "skeleton")` (~`:317`). Change to:
```ts
      return parseClaudeJson<Curriculum>(rawText, "skeleton", courseId);
```

- [ ] **Step 6: Pass `courseId` from the module call site**

Find `parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(rawText, ...)` (~`:570`). Change the third argument:
```ts
      return parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(
        rawText,
        `module ${moduleId}`,
        courseId,
      );
```

- [ ] **Step 7: Build**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean.

- [ ] **Step 8: Commit P2 code changes so far**

```bash
git add src/lib/inngest/functions.ts
git commit -m "$(cat <<'EOF'
feat(observability): emit claude_call and json_parse telemetry events

Plumb courseId and phase through callClaude and parseClaudeJson so
each Anthropic call and each JSON parse writes a row to
generation_events. callClaude emits claude_call_success (with token
count, stop reason, and truncated flag) or claude_call_failure (with
rate_limited and timed_out flags). parseClaudeJson emits
json_parse_success with strategy number (1=direct, 2=extract,
3=repair) so we can finally answer how often the repair path runs
and which languages drive it, and emits json_parse_failure when all
three strategies are exhausted.

Closes P2.1 of docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md.
EOF
)"
```

---

### Task 14: Create migration 013 (six SQL views)

**Files:**
- Create: `supabase/migrations/013_generation_event_views.sql`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/013_generation_event_views.sql` with:

```sql
-- Migration 013: observability views over generation_events
-- ─────────────────────────────────────────────────────────────
-- Six views that answer the questions we could not answer
-- before migration 011 landed. These are the post-migration
-- equivalent of grep'ing Vercel logs and work well enough for
-- a 2-person team that we do not yet need an admin dashboard.
--
-- All views window over the last 7 days to stay fast on the
-- indexed (event_type, created_at DESC) columns. Adjust the
-- window if you need historical deep-dives — none of these
-- views are materialised so the cost of a longer window is
-- just query time.
-- ─────────────────────────────────────────────────────────────

-- 1. Course finalize outcome by length (the headline metric)
CREATE OR REPLACE VIEW public.v_course_success_by_length AS
SELECT
  (c.length) AS course_length,
  COUNT(*) FILTER (WHERE e.event_type = 'course_finalize_ready')   AS courses_ready,
  COUNT(*) FILTER (WHERE e.event_type = 'course_finalize_partial') AS courses_partial,
  COUNT(*) FILTER (WHERE e.event_type = 'course_finalize_failed')  AS courses_failed,
  ROUND(
    AVG((e.metadata->>'successRatio')::numeric) FILTER (WHERE e.metadata ? 'successRatio'),
    2
  ) AS avg_success_ratio
FROM public.generation_events e
JOIN public.courses c ON c.id = e.course_id
WHERE e.created_at > now() - interval '7 days'
  AND e.event_type LIKE 'course_finalize_%'
GROUP BY c.length
ORDER BY c.length;

-- 2. Truncation rate by language (finally tests the non-English hypothesis)
CREATE OR REPLACE VIEW public.v_truncation_by_language AS
SELECT
  c.language,
  COUNT(*) FILTER (WHERE (e.metadata->>'truncated')::boolean = true)          AS truncated_calls,
  COUNT(*) FILTER (WHERE e.event_type = 'claude_call_success')                AS successful_calls,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE (e.metadata->>'truncated')::boolean = true)
         / NULLIF(COUNT(*) FILTER (WHERE e.event_type = 'claude_call_success'), 0),
    1
  ) AS truncation_pct,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE e.event_type = 'json_parse_success' AND (e.metadata->>'repaired')::boolean = true)
         / NULLIF(COUNT(*) FILTER (WHERE e.event_type = 'json_parse_success'), 0),
    1
  ) AS repair_strategy_pct
FROM public.generation_events e
JOIN public.courses c ON c.id = e.course_id
WHERE e.created_at > now() - interval '7 days'
GROUP BY c.language
ORDER BY truncation_pct DESC NULLS LAST;

-- 3. Module failure distribution (is it always the same module index?)
CREATE OR REPLACE VIEW public.v_module_failure_distribution AS
SELECT
  module_index,
  COUNT(*) FILTER (WHERE event_type = 'module_failure') AS failures,
  COUNT(*) FILTER (WHERE event_type = 'module_success') AS successes,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_type = 'module_failure')
         / NULLIF(COUNT(*) FILTER (WHERE event_type IN ('module_success', 'module_failure')), 0),
    1
  ) AS failure_pct
FROM public.generation_events
WHERE created_at > now() - interval '7 days'
  AND module_index IS NOT NULL
GROUP BY module_index
ORDER BY module_index;

-- 4. Module latency percentiles (p50/p90/p95) by course length
CREATE OR REPLACE VIEW public.v_module_latency AS
SELECT
  c.length AS course_length,
  PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY e.duration_ms) AS p50_ms,
  PERCENTILE_CONT(0.9)  WITHIN GROUP (ORDER BY e.duration_ms) AS p90_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY e.duration_ms) AS p95_ms,
  MAX(e.duration_ms)                                          AS max_ms
FROM public.generation_events e
JOIN public.courses c ON c.id = e.course_id
WHERE e.created_at > now() - interval '7 days'
  AND e.event_type = 'claude_call_success'
  AND e.phase = 'module_detail'
GROUP BY c.length;

-- 5. Rate-limit hits per hour (is Anthropic throttling us?)
CREATE OR REPLACE VIEW public.v_rate_limit_hourly AS
SELECT
  date_trunc('hour', created_at) AS hour,
  COUNT(*) AS rate_limit_events
FROM public.generation_events
WHERE event_type = 'claude_call_failure'
  AND (metadata->>'rateLimited')::boolean = true
  AND created_at > now() - interval '7 days'
GROUP BY 1
ORDER BY 1 DESC;

-- 6. Error category breakdown
CREATE OR REPLACE VIEW public.v_error_breakdown AS
SELECT
  phase,
  COALESCE(metadata->>'category', metadata->>'reason', 'unspecified') AS category_or_reason,
  COUNT(*)   AS occurrences,
  MAX(created_at) AS last_seen
FROM public.generation_events
WHERE event_type IN ('claude_call_failure', 'json_parse_failure', 'module_failure', 'course_finalize_failed')
  AND created_at > now() - interval '7 days'
GROUP BY phase, category_or_reason
ORDER BY occurrences DESC;
```

- [ ] **Step 2: Sanity-check the file**

```bash
wc -l supabase/migrations/013_generation_event_views.sql
```
Expected: roughly 100 lines.

---

### Task 15: Apply migration 013 and verify

- [ ] **Step 1: Apply migration**

Use Supabase MCP `apply_migration`:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `013_generation_event_views`
- `query`: full contents of `supabase/migrations/013_generation_event_views.sql`

- [ ] **Step 2: Verify all six views exist**

```sql
select viewname
from pg_views
where schemaname = 'public'
  and viewname like 'v_%'
order by viewname;
```
Expected rows: `v_course_success_by_length`, `v_error_breakdown`, `v_module_failure_distribution`, `v_module_latency`, `v_rate_limit_hourly`, `v_truncation_by_language`.

- [ ] **Step 3: Query each view to verify it executes without error**

```sql
select * from public.v_course_success_by_length;
select * from public.v_truncation_by_language;
select * from public.v_module_failure_distribution;
select * from public.v_module_latency;
select * from public.v_rate_limit_hourly;
select * from public.v_error_breakdown;
```
Expected: each query completes without error. Row counts may be 0 or low since the fix just landed — that's fine, we're verifying the view definitions compile against the live schema.

- [ ] **Step 4: Commit migration 013**

```bash
git add supabase/migrations/013_generation_event_views.sql
git commit -m "$(cat <<'EOF'
feat(observability): six SQL views over generation_events

v_course_success_by_length — headline success rate by course length
v_truncation_by_language — max_tokens hit rate per language (tests
  the non-English tokenizer hypothesis from the April 12 audit)
v_module_failure_distribution — which module indexes fail most
v_module_latency — p50/p90/p95 module generation time by length
v_rate_limit_hourly — Anthropic 429s per hour
v_error_breakdown — failure count grouped by phase and reason

Closes P2.2 of docs/superpowers/specs/2026-04-12-generation-reliability-fix-design.md.
EOF
)"
```

---

### Task 16: Final verification — does `generation_events` have rows across all event types?

This is the acceptance gate for the whole plan. Do NOT claim the plan complete until all assertions pass.

- [ ] **Step 1: Deploy the P2 commits to production**

```bash
vercel --prod
```

Record the production deploy URL.

- [ ] **Step 2: Run one successful generation on production**

Sign in with your test account on the production URL. Generate one `length=short` English course (shortest path, least likely to hit truncation, fastest to complete — this is the happy-path smoke test). Wait for it to reach `status='ready'`.

- [ ] **Step 3: Run one deliberately-failing generation**

Repeat the Task 5 `maxTokens=1024` trick to force a `partial` outcome on the deployed code, OR (if you don't want to deploy a test-only build) use the production path with a very long custom topic that's known to hit truncation on the Italian model.

- [ ] **Step 4: Assert the event type distribution is non-empty across the full set**

```sql
select event_type, count(*)
from public.generation_events
where created_at > now() - interval '1 hour'
group by event_type
order by event_type;
```

Expected: at least one row for EACH of:
- `claude_call_success`
- `claude_call_failure` (from the deliberately-failing run; if your smoke test didn't trigger one, run a second test that forces `callClaude` to throw)
- `json_parse_success` (with `metadata->>'strategy'` populated)
- `module_success`
- `module_failure` (from the deliberately-failing run)
- `course_finalize_ready` (from the happy-path run)
- `course_finalize_partial` (from the deliberately-failing run)

The following event types may legitimately be zero at this stage and are NOT required to block acceptance (they only fire under specific conditions that the smoke test may not reproduce):
- `json_parse_failure` — only fires when all three strategies exhaust
- `course_finalize_failed` — only fires when skeleton fails

- [ ] **Step 5: Assert the views return non-empty rows for the last-hour window**

```sql
select * from public.v_course_success_by_length;
select * from public.v_error_breakdown;
```

Expected: at least one row in `v_course_success_by_length`, possibly some rows in `v_error_breakdown`.

- [ ] **Step 6: Run the failure-rate check against the spec's 90% target**

```sql
with recent as (
  select * from public.generation_events
  where created_at > now() - interval '48 hours'
    and event_type like 'course_finalize_%'
)
select
  count(*) filter (where event_type = 'course_finalize_ready')   as ready,
  count(*) filter (where event_type = 'course_finalize_partial') as partial,
  count(*) filter (where event_type = 'course_finalize_failed')  as failed,
  round(
    100.0 * count(*) filter (where event_type in ('course_finalize_ready','course_finalize_partial'))
         / nullif(count(*), 0),
    1
  ) as usable_pct
from recent;
```

Note: this check is only meaningful once 48 hours of real traffic have elapsed post-deploy. Until then, run it daily; the spec's success criterion #8 (failure rate ≤10%) is checked at the 48h mark, not at plan-completion time.

- [ ] **Step 7: Update the Notion page for Filippo**

Edit https://www.notion.so/34015a619d1f8165b9e7c45c46b28bd8 to check off the completed P0/P1/P2 bullets and add a dated "Deployed on 2026-04-XX — results: …" section at the bottom.

---

## Follow-up specs (out of scope for this plan)

After this plan completes, two known issues remain that the user has flagged but that belong in separate specs:

1. **Course output quality** — even when generation does not fail, users report the course content is not as good as they want. This is a prompt/model/content-depth problem, not a reliability problem, and needs its own brainstorm once we have data from the P2 views (specifically `v_truncation_by_language` to confirm or rule out the non-English truncation theory).
2. **Heartbeat-based pg_cron** — the robust solution to zombie detection (heartbeat `courses.updated_at` from long-running modules, and target `generation_jobs.started_at` directly in the cleanup query). Deferred per the spec's §4 Risk 4; revisit only if P1.2's 20-minute threshold proves insufficient.
