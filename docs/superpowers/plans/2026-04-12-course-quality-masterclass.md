# Masterclass Course Quality + Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-12-course-quality-masterclass-design.md` @ `473ff0d`

**Goal:** Close the masterclass-tier reliability + quality gap — route masterclass module_detail to Sonnet 4.6 with 48k tokens, add tiered URL allowlist with async post-generation validator, idempotency guard, cost telemetry, schema drift cleanup, and three small UI changes — shipped as one bundle.

**Architecture:** Surgical changes to the existing Inngest 3-function pipeline (no restructure). New `validateCourseUrls` Inngest function runs asynchronously after `courseFinalize`. A pure `checkUrl` helper isolates HTTP validation. Prompt allowlist is a new constant block injected into existing `buildSkeletonPrompt` / `buildModuleDetailPrompt`. Each change is an independent commit so `git revert` of any one undoes it cleanly.

**Tech stack:** Next.js 16.2.1 (custom fork), TypeScript, Supabase Postgres 17, Inngest v3, Anthropic SDK v0.80 (`@anthropic-ai/sdk`), `claude-haiku-4-5-20251001` + `claude-sonnet-4-6`.

**Pre-flight notes (resolved during plan stage):**
- **Stripe masterclass price = no-op.** Checked `src/app/api/webhooks/stripe/route.ts` — Stripe is plan-based (`pro` / `5pack` / `promax`), NOT per-course-length. Masterclass is gated by plan, not a separate SKU. Spec §3.7 requires NO code change. If Gianmarco wants to raise monetization from masterclass specifically, that's a future commerce spec.
- **Event naming convention:** Codebase uses `course/generate.requested`, `module/generate.requested`, `course/finalize.requested` (slash + period). The new event is named **`course/validate.requested`** — NOT the spec's `app/course.validate.urls` — to match convention.
- **Stray `courses.length` values in production (confirmed via SQL):** `mini` (6 rows), `beginner` (2 rows), `intermediate` (1 row). All three map to `'crash'` in migration 014.
- **Render surfaces for the `unreachable` filter = 3, not 4:** `CurriculumOutput.tsx` (both lesson + bonus), `course-content.tsx` (lesson only), `share-content.tsx` (bonus only). `CourseEditor.tsx` was listed in the spec but only creates empty default arrays — it's NOT a render site. Export modules (pdf/pptx/docx/scorm/markdown/notion) render resources but are out of scope per spec §10.
- **Progress messaging insertion point:** `src/components/CurriculumForm.tsx:1058–1060` (the `<p className="text-center text-xs text-muted-foreground">` copy block below the submit button).
- **Inngest function registry** at `src/lib/inngest/functions.ts:929` — append `validateCourseUrls` there.

---

## File structure

| File | Responsibility | Change |
|---|---|---|
| `supabase/migrations/014_course_length_check.sql` | Cleanup + CHECK constraint | **CREATE** |
| `src/types/database.types.ts` | Generated Supabase types | **REGENERATE** after migration 014 |
| `src/types/curriculum.ts` | Shared curriculum types | Add `UrlStatus` type + `status?: UrlStatus` to `SuggestedResource` + `BonusResource` |
| `src/lib/prompts/curriculum.ts` | Prompt construction | Add `URL_UNIVERSAL` / `URL_NATIVE_BY_LANGUAGE` / `URL_DOMAIN_SPECIFIC` constants + `buildAllowlistBlock(language)`; inject into `buildSkeletonPrompt` + `buildModuleDetailPrompt` |
| `src/lib/inngest/functions.ts` | Inngest pipeline | Length-aware model/token/timeout for masterclass module_detail; idempotency guard in `courseGenerate`; cost telemetry in `callClaude`; fire `course/validate.requested` at end of `courseFinalize`; export `validateCourseUrls` in `inngestFunctions` |
| `src/lib/validators/url-check.ts` | Pure URL validator | **CREATE** — HEAD with timeout, GET-range fallback |
| `src/lib/inngest/validate-urls.ts` | Async URL validator Inngest function | **CREATE** |
| `src/lib/inngest/client.ts` | Inngest event schema (if typed) | Add `course/validate.requested` event shape |
| `src/components/CurriculumOutput.tsx` | Course output renderer | Filter `status === 'unreachable'` in markdown exporter + React render (lesson + bonus) |
| `src/app/course/[id]/course-content.tsx` | Course detail page | Filter suggestedResources render |
| `src/app/share/share-content.tsx` | Shared-course view | Filter bonusResources render |
| `src/components/CurriculumForm.tsx` | Generation form + progress UI | Masterclass-conditional progress messaging |

---

## Task 0: Pre-flight baseline

**Files:** none (verification only)

- [ ] **Step 1: Confirm clean working tree and up-to-date main**

```bash
git status
git pull --ff-only
git log --oneline -3
```
Expected: clean tree, HEAD at `473ff0d` (masterclass spec commit) or later.

- [ ] **Step 2: Baseline tsc/lint/build**

```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all three pass. The lint step will emit 21 pre-existing `react/no-unescaped-entities` errors (task #14) — ignore those; they're tracked separately. Everything else must be clean.

- [ ] **Step 3: Snapshot current production length values (pre-migration)**

Run via Supabase MCP (`mcp__claude_ai_Supabase__execute_sql`, project `gmxseuttpurnxbluvcwx`):

```sql
SELECT length, count(*) FROM public.courses GROUP BY length ORDER BY count(*) DESC;
```
Expected: `masterclass (22), crash (6), mini (6), beginner (2), intermediate (1), short (1)`. If any value beyond the three stray ones (`mini` / `beginner` / `intermediate`) appears, STOP and update the Task 1 migration to include it in the cleanup UPDATE.

---

## Task 1: Migration 014 — courses.length cleanup + CHECK constraint

**Files:**
- Create: `supabase/migrations/014_course_length_check.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Migration 014: CHECK constraint on courses.length + drift cleanup
-- ─────────────────────────────────────────────────────────────
-- Production contains stray length values (mini, beginner,
-- intermediate) that the application code does not handle.
-- These are dev-test artifacts from earlier schema versions
-- generated by Gianmarco + Filippo.
--
-- This migration:
--   1. Maps any stray value to 'crash' (safest fallback)
--   2. Adds a CHECK constraint restricting future inserts/updates
--      to the four valid values the code handles.
--
-- Mapping to 'crash' rather than deleting rows preserves the
-- historical failure data for investigation.
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  stray_count integer;
BEGIN
  SELECT count(*) INTO stray_count
  FROM public.courses
  WHERE length NOT IN ('crash', 'short', 'full', 'masterclass');

  IF stray_count > 0 THEN
    RAISE NOTICE 'Migration 014: mapping % rows with stray length values to ''crash''', stray_count;
    UPDATE public.courses
    SET length = 'crash'
    WHERE length NOT IN ('crash', 'short', 'full', 'masterclass');
  END IF;
END $$;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_length_valid
  CHECK (length IN ('crash', 'short', 'full', 'masterclass'));

COMMENT ON CONSTRAINT courses_length_valid ON public.courses IS
  'Added in migration 014 after observing schema drift in production. Restricts courses.length to the four values the application code handles.';
```

- [ ] **Step 2: Apply the migration**

Use `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `014_course_length_check`
- `query`: the full SQL from Step 1

Expected: migration applies without error, `RAISE NOTICE` reports 9 rows mapped.

- [ ] **Step 3: Verify post-migration state**

Run via `mcp__claude_ai_Supabase__execute_sql`:

```sql
SELECT length, count(*) FROM public.courses GROUP BY length ORDER BY count(*) DESC;
```
Expected: only four values — `masterclass`, `crash`, `short`, `full` (with `full` possibly absent — that's fine; `mini`/`beginner`/`intermediate` are gone).

- [ ] **Step 4: Verify the CHECK constraint rejects bogus values**

```sql
INSERT INTO public.courses (id, user_id, topic, length, status, created_at, updated_at)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '__migration-014-test__', 'bogus', 'failed', now(), now());
```
Expected: `ERROR: new row for relation "courses" violates check constraint "courses_length_valid"`. Do NOT delete anything — the insert never succeeds.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/014_course_length_check.sql
git commit -m "feat(schema): migration 014 — courses.length CHECK + drift cleanup

Cleans 9 stray dev-test rows (mini/beginner/intermediate) to 'crash'
and adds a CHECK constraint restricting future values to the four
lengths the code handles (crash/short/full/masterclass).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Regenerate database types

**Files:**
- Modify: `src/types/database.types.ts`

- [ ] **Step 1: Regenerate types from Supabase**

Use `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id`: `gmxseuttpurnxbluvcwx`. Overwrite `src/types/database.types.ts` with the result.

- [ ] **Step 2: Verify tsc still passes**

```bash
npx tsc --noEmit
```
Expected: pass. CHECK constraints are runtime-only so the generated types should be unchanged or near-unchanged — if tsc fails, investigate what field shifted and adapt callers.

- [ ] **Step 3: Commit**

```bash
git add src/types/database.types.ts
git commit -m "chore(types): regenerate database types after migration 014

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Add `UrlStatus` + `status?` field to curriculum types

**Files:**
- Modify: `src/types/curriculum.ts:102-107` (SuggestedResource), `src/types/curriculum.ts:89-100` (BonusResource)

- [ ] **Step 1: Add `UrlStatus` type export near the top of the file**

Insert after the existing `ResourceType` definition (around line 37) OR as the first export of a new "URL status" section. Place it near `ResourceType`:

```ts
/** Per-URL reachability status written by the async validator */
export type UrlStatus = "ok" | "unreachable" | "blocked" | "unchecked";
```

- [ ] **Step 2: Add `status?: UrlStatus` to `SuggestedResource`**

Current:
```ts
export interface SuggestedResource {
  title: string;
  url: string;
  type: string;
}
```

New:
```ts
export interface SuggestedResource {
  title: string;
  url: string;
  type: string;
  /** Reachability status written by validateCourseUrls. Undefined on
   *  pre-validator courses; render layer treats undefined as visible. */
  status?: UrlStatus;
}
```

- [ ] **Step 3: Add `status?: UrlStatus` to `BonusResource`**

Find the `BonusResource` interface (around line 89) and add the same `status?: UrlStatus;` field at the end, before the closing brace.

- [ ] **Step 4: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. Adding optional fields can never break existing code.

- [ ] **Step 5: Commit**

```bash
git add src/types/curriculum.ts
git commit -m "feat(types): add UrlStatus + optional status field to resources

Prep for validateCourseUrls Inngest function which rewrites status
in place. Optional field — pre-validator courses stay valid.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: URL allowlist constants + `buildAllowlistBlock` helper

**Files:**
- Modify: `src/lib/prompts/curriculum.ts` (add new constants + helper before `buildSkeletonPrompt`)

- [ ] **Step 1: Add the three allowlist constants and helper**

Insert this block after `LANGUAGE_NAMES` (around line 57) and before the `CURRICULUM_SYSTEM_PROMPT` export:

```ts
// ─── URL allowlist ─────────────────────────────────────────────
// Hallucinated URLs are the #1 quality defect in generated courses.
// Claude readily invents plausible-looking URLs that 404 on real
// domains. The allowlist steers Claude toward domains where it's
// likely to know real paths, plus a Wikipedia-in-target-language
// fallback that always works as an entry point for any topic.
//
// Tiers:
//   1. Universal       — works for any topic in any language
//   2. Language-native — one list per supported language, cultural fit
//   3. Domain-specific — one list per broad field (medical, tech, etc.)
//
// Structure lets the prompt give Claude a decision tree rather than
// a flat 80-domain wall.

const URL_UNIVERSAL = [
  "wikipedia.org", "archive.org", "gutenberg.org",
  "un.org", "unesco.org", "who.int", "worldbank.org", "oecd.org", "europa.eu",
] as const;

const URL_NATIVE_BY_LANGUAGE: Record<string, readonly string[]> = {
  en: ["britannica.com", "bbc.com", "nytimes.com", "theguardian.com"],
  it: ["treccani.it", "corriere.it", "rai.it", "repubblica.it", "salute.gov.it", "iss.it"],
  es: ["rae.es", "elpais.com", "bbc.com/mundo", "elmundo.es"],
  pt: ["priberam.pt", "rtp.pt", "publico.pt"],
  fr: ["larousse.fr", "lemonde.fr", "radiofrance.fr", "lefigaro.fr"],
  de: ["duden.de", "spiegel.de", "zeit.de", "dwds.de", "tagesschau.de"],
  nl: ["rijksoverheid.nl", "nos.nl", "volkskrant.nl"],
  pl: ["encyklopedia.pwn.pl", "gazeta.pl"],
  ja: ["kotobank.jp", "nhk.or.jp", "asahi.com", "mainichi.jp"],
  ko: ["encykorea.aks.ac.kr", "yna.co.kr", "chosun.com"],
  zh: ["baike.baidu.com", "xinhuanet.com", "people.com.cn"],
  ar: ["aljazeera.net", "almaany.com", "bbc.com/arabic"],
  hi: ["bhaskar.com", "ndtv.in", "bbc.com/hindi"],
  ru: ["ria.ru", "tass.ru", "rbc.ru"],
  tr: ["tdk.gov.tr", "trthaber.com", "hurriyet.com.tr"],
  sv: ["sverigesradio.se", "svt.se", "dn.se"],
};

const URL_DOMAIN_SPECIFIC = {
  medical_health: [
    "pubmed.ncbi.nlm.nih.gov", "nejm.org", "thelancet.com", "bmj.com",
    "jamanetwork.com", "cdc.gov", "nih.gov", "ecdc.europa.eu", "ema.europa.eu",
    "escardio.org", "heart.org", "mayoclinic.org", "hopkinsmedicine.org",
  ],
  technology_cs: [
    "developer.mozilla.org", "docs.python.org", "react.dev", "nextjs.org",
    "kubernetes.io", "github.com", "stackoverflow.com",
    "w3.org", "ietf.org", "ieee.org", "acm.org", "paperswithcode.com",
  ],
  business_management: [
    "hbr.org", "mckinsey.com", "bcg.com", "bain.com", "deloitte.com",
    "gartner.com", "forrester.com", "shrm.org", "atd.td.org",
    "ft.com", "economist.com", "bloomberg.com", "hbs.edu",
  ],
  law_legal: [
    "law.cornell.edu", "eur-lex.europa.eu", "justice.gov", "supremecourt.gov",
  ],
  academic_research: [
    "arxiv.org", "biorxiv.org", "ssrn.com", "plos.org", "zenodo.org", "doaj.org",
    "scholar.google.com", "jstor.org",
    "nature.com", "sciencedirect.com", "cell.com", "springer.com",
    "ocw.mit.edu", "oyc.yale.edu", "openstax.org",
    "mit.edu", "stanford.edu", "harvard.edu", "berkeley.edu",
    "ox.ac.uk", "cam.ac.uk", "eth.ch",
  ],
  humanities_philosophy: [
    "plato.stanford.edu", "iep.utm.edu", "perseus.tufts.edu", "poetryfoundation.org",
  ],
  arts_museums: [
    "metmuseum.org", "moma.org", "tate.org.uk", "louvre.fr",
    "britishmuseum.org", "nga.gov", "smithsonianmag.com", "getty.edu",
  ],
  music: ["imslp.org", "allmusic.com"],
  environment_science: [
    "ipcc.ch", "unep.org", "nasa.gov", "noaa.gov", "esa.int",
  ],
  psychology: ["apa.org", "psychologytoday.com"],
  cybersecurity: ["cve.mitre.org", "owasp.org", "nist.gov"],
  video_education: [
    "ted.com", "youtube.com", "coursera.org", "edx.org", "khanacademy.org",
  ],
} as const;

function buildAllowlistBlock(language: string): string {
  const nativeList = URL_NATIVE_BY_LANGUAGE[language] ?? URL_NATIVE_BY_LANGUAGE.en;
  const intlOrgs = URL_UNIVERSAL.filter(
    (d) => !["wikipedia.org", "archive.org", "gutenberg.org"].includes(d),
  );
  return `
URL DISCIPLINE (CRITICAL — hallucinated URLs are the #1 quality defect):

Pick every URL you cite using this priority:

1. LANGUAGE-MATCHED WIKIPEDIA — always valid for any concept.
   Use the subdomain matching this course's language:
     en → en.wikipedia.org
     it → it.wikipedia.org
     ja → ja.wikipedia.org
   (match "${language}" → ${language}.wikipedia.org — NEVER default to English Wikipedia for a non-English course)

2. LANGUAGE-NATIVE AUTHORITATIVE SOURCES for this course's language (${language}):
   ${nativeList.join(", ")}
   Strongly prefer these over translated English sources when the concept exists in the language's intellectual tradition. At least 40% of cited resources in a non-English course should come from tier 1 or tier 2 — otherwise the course reads as translated rather than native.

3. DOMAIN-SPECIFIC AUTHORITIES — pick the tier(s) matching the topic:
   Medical/health   → ${URL_DOMAIN_SPECIFIC.medical_health.slice(0, 6).join(", ")}
   Technology/CS    → ${URL_DOMAIN_SPECIFIC.technology_cs.slice(0, 6).join(", ")}
   Business         → ${URL_DOMAIN_SPECIFIC.business_management.slice(0, 5).join(", ")}
   Law              → ${URL_DOMAIN_SPECIFIC.law_legal.join(", ")}
   Academic         → ${URL_DOMAIN_SPECIFIC.academic_research.slice(0, 6).join(", ")}
   Humanities       → ${URL_DOMAIN_SPECIFIC.humanities_philosophy.join(", ")}
   Arts/museums     → ${URL_DOMAIN_SPECIFIC.arts_museums.slice(0, 5).join(", ")}
   Music            → ${URL_DOMAIN_SPECIFIC.music.join(", ")}
   Environment      → ${URL_DOMAIN_SPECIFIC.environment_science.slice(0, 4).join(", ")}
   Psychology       → ${URL_DOMAIN_SPECIFIC.psychology.join(", ")}
   Cybersecurity    → ${URL_DOMAIN_SPECIFIC.cybersecurity.join(", ")}
   Video/education  → ${URL_DOMAIN_SPECIFIC.video_education.join(", ")}

4. INTERNATIONAL ORGANIZATIONS — always valid:
   ${intlOrgs.join(", ")}

RULES:
- NEVER invent URL slugs. If you cannot name the exact page you're citing with full confidence, return the domain root (e.g. "https://pubmed.ncbi.nlm.nih.gov/") or a language-matched Wikipedia article for the concept. Both are guaranteed to work as entry points and never 404.
- NEVER use example.com, placeholder URLs, or guessed patterns.
- Prefer 2 working links over 5 broken ones. Under-citing is always better than over-citing with hallucinations.
- For a course in ${language}, match Wikipedia subdomain to that language (${language}.wikipedia.org).
- If the topic has no obvious match in tier 3, default to Wikipedia-in-target-language + one tier 4 international source. This combination always works.
`.trim();
}
```

- [ ] **Step 2: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. These are new unused symbols so far — tsc accepts them.

- [ ] **Step 3: Commit**

```bash
git add src/lib/prompts/curriculum.ts
git commit -m "feat(prompts): tiered URL allowlist constants + buildAllowlistBlock

Three tiers: 9 universal domains, 16 language-native lists, 12 domain
categories. buildAllowlistBlock produces a decision-tree prompt block
so Claude picks sources by language + topic instead of hallucinating
slugs. Wikipedia-in-target-language is the universal fallback.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Inject allowlist into skeleton + module_detail prompts

**Files:**
- Modify: `src/lib/prompts/curriculum.ts` (inside `buildSkeletonPrompt` and `buildModuleDetailPrompt`)

- [ ] **Step 1: Read `buildSkeletonPrompt` to find the insertion point**

Open `src/lib/prompts/curriculum.ts` and locate `buildSkeletonPrompt` (around line 260–320). Find the section near the end where the JSON structure rules are listed (before the closing template literal). Insert `${buildAllowlistBlock(language)}\n\n` directly before the `STRUCTURE RULES:` block or whatever closing rules block exists. The template must already pull `language` from `params` — verify that by reading the destructure at the top of the function.

Example structure (actual line numbers in file):
```ts
export function buildSkeletonPrompt(params: GenerateRequest): string {
  const { /* ..., */ language = "en" /* ... */ } = params;
  // ... existing variables ...
  return `
You are generating the skeleton for...

${/* existing blocks */}

${buildAllowlistBlock(language)}

STRUCTURE RULES:
- ... (existing)
`.trim();
}
```

The precise location is: **immediately after the last `${learnerBlock}` / `${languageBlock}` / existing variable interpolation**, and **before the first hard-coded rule block** (`STRUCTURE RULES:`, `OUTPUT RULES:`, or similar).

- [ ] **Step 2: Inject into `buildModuleDetailPrompt`**

Locate `buildModuleDetailPrompt` (around line 462). It already destructures `language = "en"` at line 471. Insert `${buildAllowlistBlock(language)}\n\n` before the `SIZE DISCIPLINE:` section (line 520). The block lives between the JSON field definitions and the size rule.

Find this exact anchor text in the template literal:

```
- "suggestedResources": array of ${depth.resourcesCount} objects { "title": string, "url": string, "type": string } — REAL working URLs to authoritative sources IN THIS SPECIFIC DOMAIN (official documentation, professional organizations, peer-reviewed sources, established educational platforms). type must be one of: article, video, podcast, book, tool, documentation.
${quizBlock}

SIZE DISCIPLINE:
```

Replace with:

```
- "suggestedResources": array of ${depth.resourcesCount} objects { "title": string, "url": string, "type": string } — REAL working URLs to authoritative sources IN THIS SPECIFIC DOMAIN (official documentation, professional organizations, peer-reviewed sources, established educational platforms). type must be one of: article, video, podcast, book, tool, documentation.
${quizBlock}

${buildAllowlistBlock(language)}

SIZE DISCIPLINE:
```

- [ ] **Step 3: Verify tsc passes and the prompts interpolate correctly**

```bash
npx tsc --noEmit
```
Expected: pass. `buildAllowlistBlock` is now reachable so tsc confirms the call signature matches.

Quick sanity spot-check by adding a temporary `console.log` in a dev scratch file (or just eyeball the template literal) to confirm `${buildAllowlistBlock(language)}` is present exactly once in each builder and the surrounding text still makes grammatical sense.

- [ ] **Step 4: Commit**

```bash
git add src/lib/prompts/curriculum.ts
git commit -m "feat(prompts): inject URL allowlist into skeleton + module_detail

Both builder functions now embed buildAllowlistBlock(language) so
Claude gets the tiered decision tree every call. Non-English courses
get language-native sources; domain tier guides topic-specific citations.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Cost telemetry in `callClaude`

**Files:**
- Modify: `src/lib/inngest/functions.ts` (add pricing table near top; extend `callClaude` `recordEvent` call at line 148–159)

- [ ] **Step 1: Add the pricing table after the `GENERATION_MODEL` constant (around line 57)**

Insert this block after line 57:

```ts
// ─── Anthropic pricing (USD per 1M tokens) ──────────────────
//
// Used only for observability metadata — never for billing logic.
// Public Anthropic pricing as of 2026-04-12. If Anthropic changes
// prices, update this table and the commit history will record when.
const CLAUDE_PRICING_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.00, output: 5.00 },
  "claude-sonnet-4-6":         { input: 3.00, output: 15.00 },
};
```

- [ ] **Step 2: Extend the `claude_call_success` telemetry in `callClaude`**

Current code (`functions.ts:148-159`):

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

Replace with:

```ts
  const pricing = CLAUDE_PRICING_USD_PER_MTOK[params.model] ?? { input: 0, output: 0 };
  const tokensIn  = response.usage?.input_tokens  ?? 0;
  const tokensOut = response.usage?.output_tokens ?? 0;
  const costUsd =
    (tokensIn  / 1_000_000) * pricing.input +
    (tokensOut / 1_000_000) * pricing.output;

  recordEvent({
    courseId: params.courseId,
    eventType: "claude_call_success",
    phase: params.phase,
    durationMs: Date.now() - startTime,
    metadata: {
      model: params.model,
      tokensIn,
      tokensOut,
      costUsd: Number(costUsd.toFixed(6)),
      stopReason: response.stop_reason,
      truncated: response.stop_reason === "max_tokens",
    },
  });
```

- [ ] **Step 3: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. The `recordEvent` metadata field accepts arbitrary JSON so adding keys is safe.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inngest/functions.ts
git commit -m "feat(telemetry): cost-per-call USD in claude_call_success events

Adds pricing table + tokensIn/tokensOut/costUsd to the metadata
object emitted from callClaude. Zero impact on existing telemetry
queries (additive only). Unknown models fall back to \$0 — degraded
telemetry is still a successful call.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Length-aware model/token/timeout routing in `moduleGenerate`

**Files:**
- Modify: `src/lib/inngest/functions.ts:662-671` (the existing module_detail `callClaude` call inside the `generate-module-${moduleId}` step)

- [ ] **Step 1: Replace the module_detail call site**

Current code (`functions.ts:662-671`):

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

Replace with:

```ts
      // Length-aware routing: masterclass module_detail uses Sonnet 4.6
      // (more incisive, higher quality ceiling) with a 48k output cap
      // (eliminates the truncation that caused 82% of masterclass failures
      // in April 2026 dev testing) and a 240s timeout (fits Vercel 300s
      // budget; Sonnet's median module output is 200–400s of wall clock).
      const isMasterclass = request.length === "masterclass";
      const rawText = await callClaude({
        system,
        messages,
        model: isMasterclass ? "claude-sonnet-4-6" : GENERATION_MODEL,
        maxTokens: isMasterclass ? 48_000 : 24_576,
        label: `${courseId}/module-${moduleId}`,
        timeoutMs: isMasterclass ? 240_000 : 180_000,
        courseId,
        phase: "module_detail",
      });
```

**Why `request.length` and not `course.length`?** The `request` object is already destructured at the top of `moduleGenerate` (line 633) from the event payload. Reading from the event is deterministic and doesn't require a DB round-trip. The event payload was written at `courseGenerate` fan-out time, so it always matches the original user request.

- [ ] **Step 2: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. `GenerateRequest.length` is typed as `CourseLength` so `request.length === "masterclass"` is a safe comparison.

- [ ] **Step 3: Verify the skeleton call site was NOT accidentally changed**

```bash
grep -n 'maxTokens: 24576' src/lib/inngest/functions.ts
```
Expected: exactly one hit, at line 404 (inside the skeleton step.run). The skeleton stays on Haiku 24576 — the spec §3.1 is explicit on this.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inngest/functions.ts
git commit -m "feat(generation): route masterclass module_detail to Sonnet 4.6

Masterclass module_detail now uses claude-sonnet-4-6 with a 48k token
cap and 240s timeout. Non-masterclass courses still use Haiku 4.5
with the existing 24576/180s envelope. Fixes the 82% masterclass
failure rate caused by max_tokens truncation on dense technical topics.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Idempotency guard in `courseGenerate`

**Files:**
- Modify: `src/lib/inngest/functions.ts` (add guard at the very top of the `courseGenerate` handler body, before the skeleton step)

- [ ] **Step 1: Insert the guard at the top of the handler**

Find the handler body (line 384):

```ts
  async ({ event, step }) => {
    const { courseId, request: rawRequest } = event.data;
    const request = rawRequest as GenerateRequest;
    const supabase = getSupabaseAdmin();

    // Step 1: generate skeleton. Wrapped in step.run() so Inngest
```

Insert the guard between the `const supabase = getSupabaseAdmin();` line and the `// Step 1: generate skeleton` comment. The guard runs OUTSIDE `step.run` because it's a fast DB read and we want it to execute fresh on every retry (no memoization) — an in-flight course from a previous retry is still a duplicate of this one.

```ts
    // Idempotency guard: reject if another generation for the same
    // (user_id, topic, length, language) tuple is already in-flight.
    // Catches rage-click double-submits before any Claude spend. Loads
    // user_id from the DB rather than the event payload because the
    // DB is canonical — a re-fired event could drift.
    const { data: thisCourse } = await supabase
      .from("courses")
      .select("user_id, topic, length, language")
      .eq("id", courseId)
      .single();

    if (thisCourse) {
      const { data: inFlight } = await supabase
        .from("courses")
        .select("id, status")
        .eq("user_id", thisCourse.user_id)
        .eq("topic", thisCourse.topic)
        .eq("length", thisCourse.length)
        .eq("language", thisCourse.language)
        .in("status", ["pending", "generating"])
        .neq("id", courseId)
        .limit(1)
        .maybeSingle();

      if (inFlight) {
        console.log(
          `[inngest/courseGenerate] [${courseId}] Idempotency: in-flight course ${inFlight.id} (${inFlight.status}) blocks duplicate`,
        );
        await supabase
          .from("courses")
          .update({
            status: "failed",
            error_message: `A generation for the same topic/length/language is already in progress (existing course id: ${inFlight.id}). This duplicate was rejected to prevent parallel spending.`,
            generation_errors: [
              {
                moduleId: "global",
                moduleIndex: -1,
                phase: "global",
                category: "duplicate",
                reason: `duplicate of ${inFlight.id}`,
                ts: new Date().toISOString(),
              },
            ],
          })
          .eq("id", courseId);

        recordEvent({
          courseId,
          eventType: "course_finalize_failed",
          phase: "global",
          metadata: { category: "duplicate", duplicateOf: inFlight.id },
        });

        return { duplicated: true, originalCourseId: inFlight.id };
      }
    }

```

- [ ] **Step 2: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. The new code uses only types already imported at the top of the file (`recordEvent`, `getSupabaseAdmin`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/inngest/functions.ts
git commit -m "feat(generation): idempotency guard in courseGenerate

Rejects duplicate generations for the same (user_id, topic, length,
language) tuple when another course is still pending or generating.
Prevents rage-click double-submits from burning parallel Claude spend.
In-flight-only (no time window) — releases the moment the original
course finishes or errors out.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Pure URL validator helper

**Files:**
- Create: `src/lib/validators/url-check.ts`

- [ ] **Step 1: Write the helper**

```ts
// src/lib/validators/url-check.ts
// ─────────────────────────────────────────────────────────────
// Pure, framework-agnostic URL validator. Used by the async
// validateCourseUrls Inngest function to post-check every URL in
// a generated curriculum. Intentionally has no Inngest / Supabase
// imports so it can be unit-tested in isolation later without a
// test infrastructure bootstrap (see plan note in spec §6).
// ─────────────────────────────────────────────────────────────

import type { UrlStatus } from "@/types/curriculum";

/**
 * Check whether a URL is reachable.
 *
 * Strategy:
 *   1. HEAD with redirect follow and a hard timeout (default 5s).
 *   2. If HEAD returns 405/501 (method not allowed), retry with
 *      GET + Range: bytes=0-0 to avoid downloading the body.
 *   3. Classify the final response status:
 *        2xx, 3xx            → "ok"
 *        401, 403, 429       → "blocked" (server answered but denied)
 *        anything else / throw → "unreachable"
 *
 * Never throws — failures become "unreachable".
 */
export async function checkUrl(url: string, timeoutMs = 5000): Promise<UrlStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
    } catch {
      return "unreachable";
    }

    if (response.status === 405 || response.status === 501) {
      try {
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { Range: "bytes=0-0" },
        });
      } catch {
        return "unreachable";
      }
    }

    if (response.ok || (response.status >= 300 && response.status < 400)) return "ok";
    if (response.status === 401 || response.status === 403 || response.status === 429) return "blocked";
    return "unreachable";
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 2: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. Imports `UrlStatus` from `@/types/curriculum` which was added in Task 3.

- [ ] **Step 3: Smoke test the helper manually**

Start a dev REPL or scratch script (do NOT commit the scratch file):

```bash
node -e '
(async () => {
  const { checkUrl } = await import("./src/lib/validators/url-check.ts");
  // If tsx/ts-node is not available, skip this step — tsc is sufficient.
})();
' 2>/dev/null || echo "Skipping runtime smoke — relying on tsc"
```

If your repo has `tsx` installed globally or as a dev dep, run:

```bash
npx tsx -e '
import { checkUrl } from "./src/lib/validators/url-check";
(async () => {
  console.log("wikipedia.org (should be ok):", await checkUrl("https://en.wikipedia.org/wiki/Cardiology"));
  console.log("example.invalid (should be unreachable):", await checkUrl("https://this-domain-does-not-exist-12345.invalid"));
})();
'
```

Expected: `ok` and `unreachable` respectively. If `tsx` is not available, skip — the function is fully exercised by Task 10 and 14 smoke tests.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validators/url-check.ts
git commit -m "feat(validators): pure URL reachability checker

HEAD with 5s timeout, GET-range fallback for 405/501, classifies
to ok / blocked / unreachable. Never throws — failures collapse to
unreachable. Framework-agnostic so it can be unit-tested later.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: `validateCourseUrls` Inngest function

**Files:**
- Create: `src/lib/inngest/validate-urls.ts`
- Modify: `src/lib/inngest/functions.ts:929-933` (append to `inngestFunctions` export)

- [ ] **Step 1: Write the Inngest function**

Create `src/lib/inngest/validate-urls.ts`:

```ts
// src/lib/inngest/validate-urls.ts
// ─────────────────────────────────────────────────────────────
// Async URL validator. Runs after courseFinalize marks a course
// ready/partial. HEAD-checks every URL in the curriculum and
// rewrites `status` in place on SuggestedResource / BonusResource
// entries. Never blocks the user — the course is already usable
// before this runs. The UI filters `status === 'unreachable'`
// at render time.
// ─────────────────────────────────────────────────────────────

import { inngest } from "./client";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkUrl } from "@/lib/validators/url-check";
import type {
  Curriculum,
  SuggestedResource,
  BonusResource,
  UrlStatus,
} from "@/types/curriculum";
import type { Json } from "@/types/database.types";

/**
 * Bounded-concurrency parallel worker. Runs `worker` over `items`
 * with at most `concurrency` in-flight at any time. Preserves
 * result order by index.
 */
async function runConcurrent<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  async function next(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, next),
  );
  return results;
}

function collectUrls(curriculum: Curriculum): string[] {
  const urls = new Set<string>();
  for (const r of curriculum.bonusResources ?? []) {
    if (r.url) urls.add(r.url);
  }
  for (const m of curriculum.modules ?? []) {
    for (const l of m.lessons ?? []) {
      for (const r of l.suggestedResources ?? []) {
        if (r.url) urls.add(r.url);
      }
    }
  }
  return Array.from(urls);
}

function applyStatuses(
  curriculum: Curriculum,
  statuses: Map<string, UrlStatus>,
): Curriculum {
  const mapSuggested = (r: SuggestedResource): SuggestedResource => ({
    ...r,
    status: r.url ? (statuses.get(r.url) ?? "unchecked") : "unchecked",
  });
  const mapBonus = (r: BonusResource): BonusResource => ({
    ...r,
    status: r.url ? (statuses.get(r.url) ?? "unchecked") : "unchecked",
  });
  return {
    ...curriculum,
    bonusResources: curriculum.bonusResources?.map(mapBonus),
    modules: curriculum.modules?.map((m) => ({
      ...m,
      lessons: m.lessons?.map((l) => ({
        ...l,
        suggestedResources: l.suggestedResources?.map(mapSuggested),
      })),
    })),
  };
}

export const validateCourseUrls = inngest.createFunction(
  { id: "course-validate-urls", name: "Course: Validate URLs (async)", retries: 1 },
  { event: "course/validate.requested" },
  async ({ event }) => {
    const { courseId } = event.data as { courseId: string };
    const supabase = getSupabaseAdmin();

    const { data: course, error: loadErr } = await supabase
      .from("courses")
      .select("curriculum")
      .eq("id", courseId)
      .single();
    if (loadErr || !course?.curriculum) {
      return { skipped: true, reason: "no-curriculum" };
    }

    const curriculum = course.curriculum as unknown as Curriculum;
    const urls = collectUrls(curriculum);
    if (urls.length === 0) return { checked: 0 };

    const results = await runConcurrent(
      urls,
      10,
      async (u): Promise<[string, UrlStatus]> => [u, await checkUrl(u)],
    );
    const statusMap = new Map(results);
    const updated = applyStatuses(curriculum, statusMap);

    const { error: writeErr } = await supabase
      .from("courses")
      .update({ curriculum: updated as unknown as Json })
      .eq("id", courseId);
    if (writeErr) {
      throw new Error(`validateCourseUrls: write failed: ${writeErr.message}`);
    }

    const okCount = results.filter(([, s]) => s === "ok").length;
    const unreachableCount = results.filter(([, s]) => s === "unreachable").length;
    return {
      checked: urls.length,
      ok: okCount,
      unreachable: unreachableCount,
      okRate: okCount / urls.length,
    };
  },
);
```

- [ ] **Step 2: Register the function in the exported array**

Open `src/lib/inngest/functions.ts` and find the registry at line 929:

```ts
export const inngestFunctions = [
  courseGenerate,
  moduleGenerate,
  courseFinalize,
];
```

Replace with:

```ts
import { validateCourseUrls } from "./validate-urls";

export const inngestFunctions = [
  courseGenerate,
  moduleGenerate,
  courseFinalize,
  validateCourseUrls,
];
```

Move the `import` line to the top of the file, grouped with the other relative imports (near line 40 where `./client` is imported). Do not leave imports in the middle of the file.

- [ ] **Step 3: Verify tsc passes**

```bash
npx tsc --noEmit
```
Expected: pass. If tsc complains about the `event.data` typing, the inngest client has a strict event schema — in that case proceed to Task 11 which declares the event type on the client, then re-run tsc here.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inngest/validate-urls.ts src/lib/inngest/functions.ts
git commit -m "feat(generation): validateCourseUrls async Inngest function

Triggered by course/validate.requested. HEAD-checks every URL in the
curriculum with concurrency 10 and rewrites per-URL status in place
on SuggestedResource / BonusResource entries. Pure clone — never
modifies or deletes content, only adds the status field. Registered
in inngestFunctions so Inngest serves it from /api/inngest.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Wire `courseFinalize` to fire `course/validate.requested`

**Files:**
- Modify: `src/lib/inngest/functions.ts` (append a step at the very end of `courseFinalize`, after Task 4 `increment-usage` block)
- Modify: `src/lib/inngest/client.ts` if it declares event types (optional — only if tsc fails in Task 10 Step 3)

- [ ] **Step 1: Fire the event at the end of `courseFinalize`**

Find the end of the `courseFinalize` handler, after the `increment-usage` step (around line 910). Just before the `return { courseId, ... }` statement, add:

```ts
    // Fire async URL validator. Fire-and-forget — we don't wait for
    // validation and failure here cannot block the user seeing their
    // course. Wrapped in step.run so Inngest memoization prevents
    // duplicate sends on retry. Skipped entirely for structure-only
    // courses (they have no suggestedResources to validate).
    await step.run("fire-url-validation", async () => {
      await inngest.send({
        name: "course/validate.requested",
        data: { courseId },
      });
    });

```

- [ ] **Step 2: Declare the event type on the Inngest client (if necessary)**

Open `src/lib/inngest/client.ts` and check if it declares events via a typed schema. If yes, add:

```ts
    "course/validate.requested": {
      data: { courseId: string };
    };
```

to the event map. If `client.ts` uses an untyped `inngest = new Inngest({ id: "syllabi" })` (no schema), skip this step — the event will work without explicit typing.

- [ ] **Step 3: Verify tsc and build pass**

```bash
npx tsc --noEmit
npm run build
```
Expected: both pass. Build is the real contract check for Inngest event wiring because it exercises the full Next.js route handler.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inngest/functions.ts src/lib/inngest/client.ts
git commit -m "feat(generation): fire course/validate.requested in courseFinalize

Adds a fire-and-forget step at the end of courseFinalize that emits
the URL validation event. Wrapped in step.run for memoization safety
on retry. The course is already marked ready/partial before this
runs, so validator failures never block users.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Render-time filter for `unreachable` URLs

**Files:**
- Modify: `src/components/CurriculumOutput.tsx:79-82, 116-121, 197, 694`
- Modify: `src/app/course/[id]/course-content.tsx:251`
- Modify: `src/app/share/share-content.tsx:478`

- [ ] **Step 1: Filter in `CurriculumOutput.tsx` markdown exporter (lesson resources)**

Current (`CurriculumOutput.tsx:79-82`):

```ts
      if (l.suggestedResources && l.suggestedResources.length > 0) {
        lines.push(`\n**Suggested Resources:**`);
        l.suggestedResources.forEach((r) => lines.push(`- [${r.title}](${r.url}) *(${r.type})*`));
      }
```

Replace with:

```ts
      const visibleLessonResources = (l.suggestedResources ?? []).filter(
        (r) => r.status !== "unreachable",
      );
      if (visibleLessonResources.length > 0) {
        lines.push(`\n**Suggested Resources:**`);
        visibleLessonResources.forEach((r) => lines.push(`- [${r.title}](${r.url}) *(${r.type})*`));
      }
```

- [ ] **Step 2: Filter in `CurriculumOutput.tsx` markdown exporter (bonus resources)**

Current (`CurriculumOutput.tsx:116-121`):

```ts
  if (c.bonusResources && c.bonusResources.length > 0) {
    lines.push(`## Bonus Resources`);
    c.bonusResources.forEach((r) =>
      lines.push(`- **${r.title}** *(${r.type})*: ${r.description}`)
    );
  }
```

Replace with:

```ts
  const visibleBonusResources = (c.bonusResources ?? []).filter(
    (r) => r.status !== "unreachable",
  );
  if (visibleBonusResources.length > 0) {
    lines.push(`## Bonus Resources`);
    visibleBonusResources.forEach((r) =>
      lines.push(`- **${r.title}** *(${r.type})*: ${r.description}`)
    );
  }
```

- [ ] **Step 3: Filter in `CurriculumOutput.tsx` React render (lesson resources)**

Current (`CurriculumOutput.tsx:197-219`):

```tsx
              {lesson.suggestedResources && lesson.suggestedResources.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ExternalLink className="h-3 w-3 text-violet-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
                  </div>
                  <ul className="space-y-1">
                    {lesson.suggestedResources.map((res, i) => (
                      <li key={i} className="text-xs">
```

Change the array reference to filter out `unreachable`. Introduce a local variable above the JSX block:

```tsx
              {(() => {
                const visibleRes = (lesson.suggestedResources ?? []).filter(
                  (r) => r.status !== "unreachable",
                );
                if (visibleRes.length === 0) return null;
                return (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ExternalLink className="h-3 w-3 text-violet-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
                    </div>
                    <ul className="space-y-1">
                      {visibleRes.map((res, i) => (
                        <li key={i} className="text-xs">
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline underline-offset-2"
                          >
                            {res.title}
                          </a>
                          <span className="text-muted-foreground ml-1">({res.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
```

Replace the entire `{lesson.suggestedResources && lesson.suggestedResources.length > 0 && ( ... )}` JSX block (approximately lines 197–219) with the IIFE above.

- [ ] **Step 4: Filter in `CurriculumOutput.tsx` React render (bonus resources)**

Current (`CurriculumOutput.tsx:694-713`):

```tsx
      {curriculum.bonusResources && curriculum.bonusResources.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-base mb-4">✨ Bonus Resources</h2>
            <div className="space-y-3">
              {curriculum.bonusResources.map((r, i) => (
                // ...
              ))}
```

Replace the guard + map with a filtered version via an IIFE (same pattern as Step 3):

```tsx
      {(() => {
        const visibleBonus = (curriculum.bonusResources ?? []).filter(
          (r) => r.status !== "unreachable",
        );
        if (visibleBonus.length === 0) return null;
        return (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-base mb-4">✨ Bonus Resources</h2>
              <div className="space-y-3">
                {visibleBonus.map((r, i) => (
                  <div key={r.id || i} className="flex items-start gap-3">
                    <Badge variant="secondary" className="text-xs mt-0.5 shrink-0">
                      {r.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
```

- [ ] **Step 5: Filter in `course-content.tsx` (lesson resources)**

Current (`src/app/course/[id]/course-content.tsx:251`):

```tsx
          {/* Suggested resources */}
          {lesson.suggestedResources && lesson.suggestedResources.length > 0 && (
            <div>
              {/* ... */}
              <div className="space-y-1.5">
                {lesson.suggestedResources.map((r, i) => (
                  // ...
                ))}
```

Replace the guard + map with the IIFE pattern:

```tsx
          {/* Suggested resources */}
          {(() => {
            const visibleRes = (lesson.suggestedResources ?? []).filter(
              (r) => r.status !== "unreachable",
            );
            if (visibleRes.length === 0) return null;
            return (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ExternalLink className="size-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                    Resources
                  </span>
                </div>
                <div className="space-y-1.5">
                  {visibleRes.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                    >
                      <FileText className="size-3 flex-shrink-0" />
                      <span className="group-hover/link:underline">{r.title}</span>
                      {r.type && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 rounded">
                          {r.type}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
```

- [ ] **Step 6: Filter in `share-content.tsx` (bonus resources)**

Current (`src/app/share/share-content.tsx:478`):

```tsx
          {/* Resources Section */}
          {curriculum.bonusResources && curriculum.bonusResources.length > 0 && (
            <section className="px-4 py-16 sm:px-6 lg:px-8">
              {/* ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {curriculum.bonusResources.map((resource, index) => (
                  // ...
                ))}
```

Replace with the IIFE pattern:

```tsx
          {/* Resources Section */}
          {(() => {
            const visibleBonus = (curriculum.bonusResources ?? []).filter(
              (r) => r.status !== "unreachable",
            );
            if (visibleBonus.length === 0) return null;
            return (
              <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 text-violet-100">
                    Resources
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visibleBonus.map((resource, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-lg p-6"
                      >
                        <h3 className="text-lg font-bold text-white mb-2">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-slate-300 text-sm mb-4">
                            {resource.description}
                          </p>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-violet-400 hover:text-violet-300 text-sm font-semibold transition"
                          >
                            View Resource {"\u2192"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })()}
```

- [ ] **Step 7: Verify tsc + lint + build all pass**

```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all pass. Lint may still report the 21 pre-existing `react/no-unescaped-entities` errors from task #14 — ignore those.

- [ ] **Step 8: Commit**

```bash
git add src/components/CurriculumOutput.tsx src/app/course/[id]/course-content.tsx src/app/share/share-content.tsx
git commit -m "feat(ui): hide unreachable URLs from course render surfaces

Filters status === 'unreachable' in the three user-visible render
paths: CurriculumOutput (post-generation screen), course-content
(detail page), share-content (public share view). Undefined / ok /
blocked / unchecked all stay visible. Pre-validator courses are
unaffected.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Masterclass progress messaging

**Files:**
- Modify: `src/components/CurriculumForm.tsx:1058-1060`

- [ ] **Step 1: Locate the length state**

Open `src/components/CurriculumForm.tsx` and find where `length` is read from form state. It's stored in a state object — search for the state variable that tracks the currently-selected course length. The type is `CourseLength` (defined at line 34 of the same file).

- [ ] **Step 2: Replace the progress copy block**

Current (`CurriculumForm.tsx:1058-1060`):

```tsx
          <p className="text-center text-xs text-muted-foreground">
            {isSubmitting ? "Don't worry, you can leave this page and come back." : "Takes about 15–30 seconds · Your first generation is free"}
          </p>
```

Replace with (assuming the form field is named `length` inside a `formData` state object — adjust the exact accessor if the local is named differently, but the semantic is "read the currently selected course length"):

```tsx
          <p className="text-center text-xs text-muted-foreground">
            {isSubmitting
              ? formData.length === "masterclass"
                ? "Masterclass courses take 10–20 minutes to generate. You can close this page — your course will appear in your profile when it's ready."
                : "Don't worry, you can leave this page and come back."
              : formData.length === "masterclass"
                ? "Takes 10–20 minutes · Premium quality · Your first generation is free"
                : "Takes 1–3 minutes · Your first generation is free"}
          </p>
```

**Note on the accessor:** if the form uses `watch('length')` (react-hook-form) or a different state variable, substitute that. The important semantic is: read the currently-selected `length` field from the form's state at render time. Use `grep` inside the file to find how `length` is referenced in JSX (there's at least one match at line 85 for the option definitions and likely more near the form state declaration).

**Note on the non-masterclass default:** the current copy "Takes about 15–30 seconds" is wildly wrong for any length (crash generation is 1–3 minutes in the P2 telemetry). The replacement "1–3 minutes" is more truthful. If you'd rather preserve the existing misleading copy to scope this strictly, keep `"Takes about 15–30 seconds · Your first generation is free"` for the non-masterclass branch instead.

- [ ] **Step 3: Verify tsc + lint + build pass**

```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/CurriculumForm.tsx
git commit -m "feat(ui): masterclass-aware progress messaging on generation form

Masterclass submissions show '10–20 minutes' and an explicit 'close
this page' instruction. Non-masterclass lengths show 1–3 minutes
(more truthful than the previous '15–30 seconds' copy). The idle-state
subtitle also flags masterclass as premium.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Final gate — tsc + lint + build + smoke plan

**Files:** none (verification only)

- [ ] **Step 1: Run the full pre-deploy verification suite**

```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: tsc clean; lint still shows only the 21 pre-existing task #14 errors; build succeeds.

- [ ] **Step 2: Review commit history**

```bash
git log --oneline origin/main..HEAD
```
Expected: 12–13 commits, each self-contained, each referencing the task it implements. Confirm that no commit touches a file outside its declared scope.

- [ ] **Step 3: Push to remote for CI**

```bash
git push origin main
```
Expected: CI runs; GitHub Actions `pages-build-deployment` succeeds (this is the deploy pipeline). The `lint` CI workflow may show the same 21 pre-existing errors from task #14 — that's acceptable and matches the baseline we measured in Task 0.

- [ ] **Step 4: Post-deploy golden-path smoke — English masterclass**

Go to `https://syllabi.online` and submit a masterclass generation with:
- **Topic:** `Sudden Cardiac Death: Electrophysiology, Risk Stratification and Prevention`
- **Audience:** advanced
- **Length:** masterclass
- **Language:** English

Then run these verification queries via `mcp__claude_ai_Supabase__execute_sql`:

```sql
-- 1. Course status (expect 'ready')
SELECT id, status, generation_completed_modules, generation_total_modules
FROM public.courses
WHERE topic ILIKE '%Sudden Cardiac Death%'
ORDER BY created_at DESC LIMIT 1;

-- 2. Zero truncated modules (expect 0 rows)
SELECT course_id, module_index, metadata->>'model', metadata->>'stopReason', metadata->>'tokensOut'
FROM public.generation_events
WHERE event_type = 'claude_call_success'
  AND (metadata->>'truncated')::boolean = true
  AND course_id = (SELECT id FROM public.courses WHERE topic ILIKE '%Sudden Cardiac Death%' ORDER BY created_at DESC LIMIT 1);

-- 3. Model verification (expect all module_detail rows model = claude-sonnet-4-6)
SELECT phase, metadata->>'model' AS model, count(*)
FROM public.generation_events
WHERE event_type = 'claude_call_success'
  AND course_id = (SELECT id FROM public.courses WHERE topic ILIKE '%Sudden Cardiac Death%' ORDER BY created_at DESC LIMIT 1)
GROUP BY 1, 2;

-- 4. Cost telemetry (expect non-zero numeric)
SELECT sum((metadata->>'costUsd')::numeric) AS total_usd
FROM public.generation_events
WHERE event_type = 'claude_call_success'
  AND course_id = (SELECT id FROM public.courses WHERE topic ILIKE '%Sudden Cardiac Death%' ORDER BY created_at DESC LIMIT 1);

-- 5. URL validator ran (expect at least some ok / unreachable statuses)
SELECT
  jsonb_path_query_array(curriculum, '$.modules[*].lessons[*].suggestedResources[*].status') AS statuses
FROM public.courses
WHERE topic ILIKE '%Sudden Cardiac Death%'
ORDER BY created_at DESC LIMIT 1;
```

**Pass criteria:**
- Query 1: `status = 'ready'`, `generation_completed_modules = generation_total_modules`
- Query 2: 0 rows
- Query 3: skeleton → Haiku 4.5, module_detail → Sonnet 4.6 (for all ~10 modules)
- Query 4: non-zero, typically $0.50–$3 for a 10-module Sonnet masterclass
- Query 5: status array is non-empty, majority should be `ok`

**If any pass criterion fails**, follow spec §8 Rollback plan for the specific feature that broke (each commit is independently revertable).

- [ ] **Step 5: Post-deploy golden-path smoke — Italian masterclass**

Submit the same course in Italian:
- **Topic:** `Morte Cardiaca Improvvisa: Elettrofisiologia, Stratificazione del Rischio e Prevenzione`
- **Length:** masterclass
- **Language:** Italian

Verify:
- Course reaches `status = 'ready'`
- No truncation (same query as Step 4 Query 2)
- Content is written in Italian, not English (manual inspection of the rendered course page)
- At least one resource URL points to one of: `treccani.it`, `salute.gov.it`, `iss.it`, `it.wikipedia.org`, `corriere.it`, or another `.it` domain from the language-native list. Verify with:

```sql
SELECT
  jsonb_path_query_array(curriculum, '$.modules[*].lessons[*].suggestedResources[*].url') AS urls
FROM public.courses
WHERE topic ILIKE '%Morte Cardiaca Improvvisa%'
ORDER BY created_at DESC LIMIT 1;
```
Expected: array contains at least one Italian-domain URL.

- [ ] **Step 6: Non-masterclass regression check**

Generate three courses on different topics:
- One `crash` length
- One `short` length
- One `full` length (if `full` is available in the form)

Verify for each:
```sql
SELECT phase, metadata->>'model' AS model, count(*)
FROM public.generation_events
WHERE event_type = 'claude_call_success'
  AND course_id = '<new-course-id>'
GROUP BY 1, 2;
```
Expected: all calls use `claude-haiku-4-5-20251001`. If any module_detail row shows Sonnet, the length-routing check in Task 7 is broken.

- [ ] **Step 7: Idempotency smoke**

Open two browser tabs to the generation form simultaneously with the same topic/length/language. Submit both within 5 seconds. Verify:
```sql
SELECT id, status, error_message, generation_errors
FROM public.courses
WHERE topic = '<the test topic>'
ORDER BY created_at DESC LIMIT 2;
```
Expected: one row with `status = 'ready'` (or `generating`), one with `status = 'failed'` and `generation_errors[0].category = 'duplicate'`.

- [ ] **Step 8: UI smoke**

Open the ready English masterclass from Step 4 in the browser. In the course detail page (`/course/<id>`), verify at least one lesson renders suggested resources and none of the displayed links are visibly broken. Open the same course via the share view (`/share/<share-id>`) and verify the Resources section renders.

Submit a masterclass via the form and verify the submit button's helper text shows "10–20 minutes" while submitting.

- [ ] **Step 9: Mark the spec as delivered**

Update the Notion spec page (id `34015a61-9d1f-8110-a3fd-ffc6274ab245`) to flag all Filippo-review checklist items complete. Leave a summary comment with the cost-per-course number from Step 4 Query 4 so Gianmarco can set the new masterclass pricing (or whatever follow-up commerce decision he wants to make).

---

## Out-of-scope reminders (do NOT do these in this plan)

Per spec §10 and pre-flight findings — none of these are in scope here:

- Any change to `crash` / `short` / `full` generation paths
- Skeleton model (stays on Haiku)
- `src/app/api/generate/route.ts` duplicate Claude pipeline (future spec)
- The 21 pre-existing `react/no-unescaped-entities` lint errors (task #14)
- Stripe masterclass price UI/config — **no-op** (masterclass is plan-gated, not per-course priced)
- LLM-judge quality evaluation
- Topic-density pre-flight warnings
- Observability dashboard UI over P2 views
- Landing page / blog / legal / profile / tutorial page changes
- Export paths (pdf/pptx/docx/scorm/markdown/notion) rendering resources without the filter
- Test infrastructure addition

---

## Rollback quick reference

Each task is a self-contained commit. To roll back any specific change:

| Task | Rollback command |
|---|---|
| 1 | `ALTER TABLE public.courses DROP CONSTRAINT courses_length_valid;` |
| 2 | `git revert <Task 2 SHA>` (types regen only) |
| 3 | `git revert <Task 3 SHA>` (types only) |
| 4–5 | `git revert <Task 4 SHA> <Task 5 SHA>` (allowlist prompts) |
| 6 | `git revert <Task 6 SHA>` (cost telemetry, harmless to keep) |
| 7 | `git revert <Task 7 SHA>` (reverts masterclass routing — back to Haiku 24k/180s) |
| 8 | `git revert <Task 8 SHA>` (removes idempotency guard) |
| 9–10 | `git revert <Task 9 SHA> <Task 10 SHA>` (removes validator) |
| 11 | `git revert <Task 11 SHA>` (stops firing validation event) |
| 12 | `git revert <Task 12 SHA>` (removes UI filter — old courses keep their data) |
| 13 | `git revert <Task 13 SHA>` (reverts progress copy) |

No cross-task coupling. Any revert is safe independent of the others.
