# Syllabi — Masterclass Course Quality + Reliability

**Date:** 2026-04-12
**Author:** Claude (Opus 4.6), commissioned by Gianmarco
**Scope:** Masterclass course generation quality + a small set of targeted UI changes that make the backend improvements user-visible. Crash/short/full courses are NOT touched. Language generation architecture (native vs English+translate) is NOT touched. See section 11 for the explicit out-of-scope list.
**Audience:** Filippo (backend + review), Gianmarco (approval).
**Related:** `2026-04-12-generation-reliability-fix-design.md` — the P0/P1/P2 reliability work that shipped to prod earlier today. This spec builds on top of that foundation.

---

## 0. Executive summary

Earlier today the P0/P1/P2 reliability fixes shipped to production (migrations 010–013, `courseGenerate.onFailure` handler, `pg_cron` threshold raised 10→20 min, Claude/JSON telemetry plumbing, 6 SQL observability views). Those changes unblock the pipeline structurally but do not address the underlying quality and token-budget issues that cause masterclass courses — the premium tier of the product — to fail and, when they succeed, to ship with hallucinated resource URLs and flat writing on technical topics.

This spec addresses the masterclass-specific reliability and quality gap with six targeted backend changes and three small UI changes, shipped as one bundle.

**The core insight from the April 10–11 production data:** the "Sudden Cardiac Death: Electrophysiology, Risk Stratification and Prevention" masterclass — used by Gianmarco and Filippo as their worst-case stress test — failed 7+ times across both English and Italian variants. Every failure was one of two modes:

1. **`pg_cron` timeout** (fixed by migration 012 in the prior spec — 10→20 min threshold).
2. **Max-tokens truncation** — every one of the 10 modules hit the 24576-token output cap and the JSON parser could not recover. Course `6077a26e-403f-4c6a-821e-25822e22e5ae` is the canonical example: all 10 modules returned `stop_reason: "max_tokens"` with responses between 29283 and 30943 characters.

The root cause is a budget mismatch. The masterclass module_detail prompt requests `500–800` words per lesson × 5 lessons per module × full JSON structure (keyPoints, content, suggestedResources, quiz) + markdown escapes. The real output token requirement on dense technical topics is `~15k–20k tokens` of valid JSON, against a hard cap of 24576 with essentially zero safety margin. Any slightly verbose module goes over.

**This spec's job is to close the quality and token-budget gap so masterclass — the tier users pay the most for — reliably ships comprehensive, well-sourced, on-topic content.** The solution is to route masterclass module_detail calls to Claude Sonnet 4.6 (more incisive, less verbose, higher quality ceiling), raise the output cap to 48000 tokens (substantial safety margin), inject a curated URL allowlist into the prompt (prevents the #1 quality defect: hallucinated resource URLs), and add a post-generation async URL validator job (safety net for any hallucinations that slip through). The masterclass price increases to absorb the higher per-course API cost. Three small quality-of-life additions — idempotency guard, cost telemetry, and schema drift cleanup — fold in because they're adjacent and cheap to ship alongside.

### Production data that anchors this spec (2026-04-12, dev testing only)

| Metric | Value | Note |
|---|---|---|
| Masterclass courses attempted | 22 | All by Gianmarco + Filippo (no live traffic yet) |
| Masterclass `ready` | 4 (18%) | — |
| Masterclass `failed` | 18 (82%) | 12 EN + 6 IT |
| Dominant EN failure topic | "Sudden Cardiac Death" medical masterclass | Repeated 7+ times with the same failure |
| Dominant failure mode (after migration 012) | `stop_reason: "max_tokens"` on module_detail Claude calls | — |
| Current module_detail model | Haiku 4.5 (fast, cheap, verbose) | — |
| Current module_detail max_tokens | 24576 | No safety margin on dense topics |
| URL hallucination rate | Not measured, but known by inspection | No allowlist enforcement in prompts |
| Cost telemetry | None — `generation_events` captures latency but not `$` | Unit economics invisible |
| `courses.length` stray values | `mini`, `beginner`, `intermediate` present in prod | Schema drift from earlier versions |

### What users see after this ships

- **Masterclass "Sudden Cardiac Death" (and similar dense technical topics) generate end-to-end without truncation.** Acceptance gate: you or Filippo run this as a post-deploy smoke test and it reaches `status='ready'` with all 10 modules complete.
- **Masterclass content is sharper on technical topics.** Sonnet 4.6 writes more precisely than Haiku, especially on medical/legal/engineering subjects. The same module length carries more information.
- **Resource URLs actually work.** Dead links are hidden from course display; live links get through. Target: ≥ 95% of shipped URLs return 2xx/3xx.
- **Italian masterclasses cite Italian sources.** Treccani, Salute.gov.it, Italian Wikipedia, Corriere — not English-language proxies. The product feels native in every supported language, not translated.
- **Rage-click protection.** Submitting the same course twice in a row fails the second submission instantly with a clear "already in progress" message, preventing wasted Claude spend.
- **Longer masterclass wait time is communicated.** The generation progress screen tells masterclass users to expect 10–20 minutes instead of "a few minutes."
- **Masterclass costs more.** Because the per-course API cost is substantially higher (Sonnet vs Haiku), the Stripe price for the masterclass SKU goes up. The exact number is Gianmarco's call after we have 5+ real cost telemetry samples from the post-deploy smoke tests.

---

## 1. Goals and non-goals

### Goals

1. **Masterclass module_detail calls reliably produce valid, complete JSON.** Target: `v_truncation_by_language` shows masterclass `truncation_pct ≤ 5%` across all languages.
2. **Masterclass content quality rises on technical topics** (medical, engineering, legal, scientific). Measurable via: qualitative review of the same topic generated before/after, and indirectly via `v_course_success_by_length` masterclass `usable_pct` post-deploy.
3. **Suggested-resource URLs in courses work.** Target: ≥ 95% of URLs shipped by the async validator have `status='ok'`.
4. **Italian and other non-English masterclasses cite language-native authoritative sources**, not English proxies. Measured by manual review of resource lists in Italian masterclasses post-deploy.
5. **Idempotency guard prevents rage-click parallel generations** on the same `(user_id, topic, length, language)` tuple.
6. **Cost per course is measurable** from SQL queries over `generation_events.metadata->>'costUsd'`.
7. **`courses.length` stops drifting** — only the four valid values can exist post-deploy.
8. **User-facing UX honors the backend work**: dead URLs are hidden from the course display, masterclass progress messaging reflects the longer wait, pricing copy reflects the new masterclass price.

### Non-goals

- Any changes to `crash`, `short`, or `full` generation paths. Those work well enough today; touching them risks regression.
- Any changes to the prompts' pedagogical content (Bloom's taxonomy structure, audience calibration, domain-aware skeleton reasoning). Those are already well-designed.
- The English-canonical-plus-translate language architecture debate. Native multi-language generation stays; this spec does not touch language strategy.
- Any new course formats, lengths, audiences, teaching styles, output structures.
- LLM-judge quality evaluation pass on generated output. Future spec.
- Topic-level caching ("this course already exists, reuse it"). Future spec.
- Topic-density pre-flight warnings in the UI ("quantum field theory is too dense for crash length"). Future spec.
- Refactoring or deletion of the duplicate `/api/generate/route.ts` Claude pipeline. Future spec — this is real debt but folding it in here doubles the scope.
- Fixing the 21 pre-existing `react/no-unescaped-entities` CI lint errors. Already tracked as task #14 in a separate spec.
- The landing page, niche landing pages, blog pages, legal pages, pricing page layout, profile page, tutorial page — all deferred to a future "Frontend quality audit" spec.
- Observability dashboard UI over the P2 views. Future spec (views are queryable via SQL today).

---

## 2. Architecture

### 2.1 Data flow diagram

```
User submits form → /api/generate
        ↓
    courses row created (status=pending)
        ↓
    Inngest event `app/course.generate.requested`
        ↓
┌──────────────────────────────────────────────────────────────┐
│  courseGenerate  (Inngest function)                          │
│    [NEW] idempotency guard — reject in-flight duplicates     │
│    skeleton via Haiku 4.5 (UNCHANGED from today)             │
│    fan-out sendEvent × N to moduleGenerate                   │
└──────────────────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────────────────┐
│  moduleGenerate  (Inngest function, concurrency=3)           │
│    [CHANGED] model:                                          │
│        masterclass  → claude-sonnet-4-6                      │
│        other        → claude-haiku-4-5-20251001 (unchanged)  │
│    [CHANGED] maxTokens:                                      │
│        masterclass  → 48_000                                 │
│        other        → 24_576 (unchanged)                     │
│    [CHANGED] timeoutMs:                                      │
│        masterclass  → 240_000                                │
│        other        → 180_000 (unchanged)                    │
│    [NEW] prompt includes URL allowlist block                 │
│    [NEW] telemetry metadata includes costUsd, tokensIn,      │
│          tokensOut computed from the pricing table           │
└──────────────────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────────────────┐
│  courseFinalize  (Inngest function)                          │
│    mark status=ready/partial/failed (UNCHANGED)              │
│    [NEW] on ready or partial, fire                           │
│          `app/course.validate.urls` with { courseId }        │
└──────────────────────────────────────────────────────────────┘
        ↓                                        ↓
    user sees course                        [NEW] validateCourseUrls
                                              async, doesn't block
                                              HEAD-checks every URL
                                              with concurrency 10
                                              rewrites `curriculum.*.status`
                                              with 'ok' | 'unreachable' | 'blocked'
```

### 2.2 Files touched

| File | Responsibility | Change |
|---|---|---|
| `src/lib/inngest/functions.ts` | Pipeline orchestration | Route masterclass module_detail to Sonnet + 48k + 240s; add idempotency guard; add cost telemetry; fire URL validation event on finalize |
| `src/lib/prompts/curriculum.ts` | Prompt construction | Add `URL_ALLOWLIST` tiered constant; add `buildAllowlistBlock(language)` helper; inject allowlist into `SKELETON_SYSTEM_PROMPT` and `MODULE_DETAIL_SYSTEM_PROMPT` (or at user-prompt level for per-language language-native sources) |
| `src/lib/inngest/validate-urls.ts` | **NEW** — async URL validator Inngest function | HEAD-check every URL in curriculum, rewrite per-URL `status` in place |
| `src/lib/validators/url-check.ts` | **NEW** — pure URL validation helper | HEAD with 5s timeout, GET-range fallback on 405/403, returns `'ok' \| 'unreachable' \| 'blocked'` |
| `supabase/migrations/014_course_length_check.sql` | **NEW** | Clean stray length values + add CHECK constraint |
| `src/lib/stripe/...` (exact path TBD in plan stage) | Stripe price config | Update masterclass price ID reference — exact number set by Gianmarco post-cost-telemetry |
| `src/types/curriculum.ts` | Shared types | Add `status?: 'ok' \| 'unreachable' \| 'blocked' \| 'unchecked'` field to `SuggestedResource` and `BonusResource` types |
| `src/types/database.types.ts` | Generated | Regenerate after migration 014 applies |
| `src/components/CurriculumOutput.tsx` | Course display | Filter out `suggestedResources` and `bonusResources` with `status === 'unreachable'` at render time |
| `src/app/course/[id]/course-content.tsx` | Course detail page | Same filter |
| `src/components/CourseEditor.tsx` | Course edit view | Same filter |
| `src/app/share/share-content.tsx` | Shared-course view | Same filter |
| `src/components/CurriculumForm.tsx` | Generation form + progress UI | Add masterclass-specific progress messaging: "Masterclass courses take 10–20 minutes to generate. You can close this page and come back." |
| Pricing copy (landing page, pricing page, niche pages) | Marketing surface | The plan stage enumerates every hardcoded masterclass price reference in the codebase (via grep) and updates each. If pricing is dynamic from Stripe, zero file changes. |

### 2.3 Design decisions called out

**1. Why route by length, not by audience/language/topic?** Length is the cleanest axis we have. It maps directly to a Stripe SKU for pricing, it's already used by `v_module_latency` and `v_course_success_by_length` views, and it's the strongest predictor of content density in the request. Routing by language would make pricing messy (which Italian courses get the premium tier?) and routing by topic would require topic classification which we don't have.

**2. Why Sonnet for module_detail only, not skeleton?** Skeleton is structural — it defines the course outline, not prose content. Haiku is faster and cheaper on structured JSON and skeleton quality is already good today. The density/verbosity/precision problems all live in `module_detail`, so that's where the model upgrade goes.

**3. Why a tiered URL allowlist with Wikipedia-fallback, not a flat list?** A flat list of 80 domains confuses Claude about what's relevant to a given topic. A tiered structure lets the prompt say "pick from the medical_clinical tier for medical topics, technology tier for tech topics, Wikipedia in target language if nothing else fits" — which matches how Claude actually reasons. The Wikipedia-in-target-language fallback is the universal escape hatch: it works for every topic in every supported language and URLs are predictable (Wikipedia uses topic slugs).

**4. Why in-flight-only idempotency instead of a time window?** An in-flight-only guard has a clear contract: "you can't run two generations in parallel for the same thing." A time window is arbitrary — 10 minutes blocks legitimate regeneration within 10 min AND doesn't prevent accidental regeneration 11 min later. The in-flight rule catches rage-clicks cleanly and releases the moment the first course finishes or errors out.

**5. Why a separate `validateCourseUrls` Inngest function instead of inlining the HEAD-checks into `courseFinalize`?** Separation of concerns. `courseFinalize` has one job: mark the course as usable to the user. URL validation is a secondary quality pass — the course is already usable before it runs. Putting validation in its own function means (a) a broken validator can never block a user from seeing their course, (b) we can retry just the validator without re-running generation, (c) we can later swap the HTTP client or add caching without touching the generation pipeline, (d) validator failures don't pollute `v_course_success_by_length`.

**6. Why hide `unreachable` URLs at render time instead of at write time?** Two reasons. First, the DB record remains a lossless history of what Claude generated, which is valuable for debugging and prompt tuning. Second, a later re-run of the validator (if a domain comes back online or a rate limit lifts) can flip the status back to `ok` without needing to regenerate or re-store anything. The UI is the right place to apply visibility rules over mutable status fields.

**7. Why `CHECK` constraint on `courses.length` now?** Because the production data already shows drift (`mini`, `beginner`, `intermediate` values that the code doesn't handle). Without a constraint, the next schema change will make this worse. A CHECK is one line of SQL and prevents a whole class of future bugs at zero ongoing cost.

**8. Why fold cost telemetry into this spec?** Because (a) it's a 10-line change to the existing `recordEvent` call inside `callClaude`, (b) the Sonnet-for-masterclass change is the first time we have a reason to know the real cost delta, and (c) without it, we can't set the new masterclass Stripe price rationally. Bundling it here means Gianmarco has cost data ready by the time he's setting the new price.

---

## 3. Components — detailed changes

### 3.1 Token budget + model routing (`src/lib/inngest/functions.ts`)

The existing module_detail call site (near line 660, exact location confirmed in the plan stage) becomes length-aware:

```ts
const isMasterclass = course.length === "masterclass";
const rawText = await callClaude({
  system,
  messages: [{ role: "user", content: userPrompt }],
  model: isMasterclass ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
  maxTokens: isMasterclass ? 48_000 : 24_576,
  label: `module ${moduleId}`,
  timeoutMs: isMasterclass ? 240_000 : 180_000,
  courseId,
  phase: "module_detail",
});
```

**Budget math for the timeout:** Claude Sonnet 4.6 sustains roughly 40–60 tok/s on dense JSON output. For 48k output tokens in the worst case, the raw wall-clock is `48000 / 50 = 960s`. In practice most modules use 10–20k tokens, so median wall-clock is 200–400s. The 240s timeout trims outliers while covering the happy path. Combined with `concurrency=3` in the Inngest function options and `retries: 1` on step failures, a 10-module masterclass hits its ceiling at `4 waves × 240s × 2 attempts = 1920s ≈ 32 minutes` worst case — over the pg_cron 20-min threshold.

**Mitigation for the worst case:** in practice retries almost never fire (Sonnet is very reliable) and concurrency=3 means waves are 200–300s each in the median, not 240s. The 20-min ceiling holds for everything except the absolute worst case. If post-deploy data shows p95 brushing against this ceiling, the followup action is dropping concurrency to 2 (which doubles the parallelism budget for each wave) or raising the pg_cron threshold further. Neither is part of this spec.

**Skeleton stays on Haiku** (line 404 area). No change.

### 3.2 URL allowlist in prompts (`src/lib/prompts/curriculum.ts`)

Add a new constant block near the top of the file, before `CURRICULUM_SYSTEM_PROMPT`:

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
// a flat 80-domain wall. Claude routes itself based on topic/language.

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
    "gartner.com", "forrester.com",
    "shrm.org", "atd.td.org",
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
   Strongly prefer these over translated English sources when the concept exists in the language's intellectual tradition. At least 40% of cited resources in a non-English course should be from this tier or tier 1 — otherwise the course reads as translated rather than native.

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
   ${URL_UNIVERSAL.filter((d) => !["wikipedia.org", "archive.org", "gutenberg.org"].includes(d)).join(", ")}

RULES:
- NEVER invent URL slugs. If you cannot name the exact page you're citing with full confidence, return the domain root (e.g. "https://pubmed.ncbi.nlm.nih.gov/") or a language-matched Wikipedia article for the concept. Both are guaranteed to work as entry points and never 404.
- NEVER use example.com, placeholder URLs, or guessed patterns.
- Prefer 2 working links over 5 broken ones. Under-citing is always better than over-citing with hallucinations.
- For a course in ${language}, match Wikipedia subdomain to that language (${language}.wikipedia.org).
- If the topic has no obvious match in tier 3, default to Wikipedia-in-target-language + one tier 4 international source. This combination always works.
`.trim();
}
```

**Prompt integration points:**
- `buildSkeletonPrompt(params)` — add `${buildAllowlistBlock(language)}` near the end, before the `STRUCTURE RULES:` section. This applies to `bonusResources`.
- `buildModuleDetailPrompt(params, ...)` — add `${buildAllowlistBlock(language)}` near the end, before the `SIZE DISCIPLINE:` section. This applies to `suggestedResources`.

Both builders already take `params.language` so no new argument plumbing is needed.

### 3.3 URL validator (new files)

**`src/lib/validators/url-check.ts`** — pure helper, no Inngest dependency:

```ts
export type UrlStatus = "ok" | "unreachable" | "blocked" | "unchecked";

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

**`src/lib/inngest/validate-urls.ts`** — new Inngest function:

```ts
import { inngest } from "./client";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkUrl, type UrlStatus } from "@/lib/validators/url-check";
import type { Curriculum, SuggestedResource, BonusResource } from "@/types/curriculum";
import type { Json } from "@/types/database.types";

type WithStatus<T> = T & { status?: UrlStatus };

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
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
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

function applyStatuses(curriculum: Curriculum, statuses: Map<string, UrlStatus>): Curriculum {
  const mapResource = <T extends { url?: string }>(r: T): WithStatus<T> => ({
    ...r,
    status: r.url ? (statuses.get(r.url) ?? "unchecked") : "unchecked",
  });
  return {
    ...curriculum,
    bonusResources: curriculum.bonusResources?.map(mapResource) as BonusResource[] | undefined,
    modules: curriculum.modules?.map((m) => ({
      ...m,
      lessons: m.lessons?.map((l) => ({
        ...l,
        suggestedResources: l.suggestedResources?.map(mapResource) as SuggestedResource[] | undefined,
      })),
    })),
  };
}

export const validateCourseUrls = inngest.createFunction(
  { id: "course-validate-urls", retries: 1, concurrency: 5 },
  { event: "app/course.validate.urls" },
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

    const results = await runConcurrent(urls, 10, async (u): Promise<[string, UrlStatus]> => [
      u,
      await checkUrl(u),
    ]);
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
    return { checked: urls.length, ok: okCount, okRate: okCount / urls.length };
  },
);
```

**`courseFinalize` fires the event** (one added step near the end, inside the success path):

```ts
await step.sendEvent("fire-url-validation", {
  name: "app/course.validate.urls",
  data: { courseId },
});
```

**Export the new function** from wherever `courseGenerate`, `moduleGenerate`, `courseFinalize` are currently exported so Inngest registers it. The exact file is determined in the plan stage (likely `src/lib/inngest/functions.ts` or an `index.ts` barrel).

### 3.4 Idempotency guard (`src/lib/inngest/functions.ts`)

At the top of `courseGenerate`, before skeleton generation, after pulling the course row:

```ts
const { data: inFlight } = await supabase
  .from("courses")
  .select("id, status")
  .eq("user_id", course.user_id)
  .eq("topic", course.topic)
  .eq("length", course.length)
  .eq("language", course.language)
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
```

The guard fires before any Claude spend. The rejected course is marked `failed` with a clear message so its row is consistent with the lifecycle the rest of the pipeline expects. The original in-flight course is untouched.

**Why `course.user_id` and not `event.data.userId`?** Because we're already loading `course` from the DB in that function, so the row has the user_id canonically. Reading it from the event payload could drift if the event was re-fired manually with a different user.

### 3.5 Cost telemetry (`src/lib/inngest/functions.ts` — inside `callClaude`)

Near the top of the file, add a pricing table:

```ts
// USD per 1M tokens. Anthropic public pricing as of 2026-04-12.
// Used only for observability metadata — never for billing logic.
const CLAUDE_PRICING_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1.00, output: 5.00 },
  "claude-sonnet-4-6": { input: 3.00, output: 15.00 },
};
```

Extend the `claude_call_success` event emission at the end of `callClaude`:

```ts
const pricing = CLAUDE_PRICING_USD_PER_MTOK[params.model] ?? { input: 0, output: 0 };
const tokensIn = response.usage?.input_tokens ?? 0;
const tokensOut = response.usage?.output_tokens ?? 0;
const costUsd =
  (tokensIn / 1_000_000) * pricing.input +
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

Post-deploy query to see cost per course:

```sql
SELECT course_id, sum((metadata->>'costUsd')::numeric) AS total_usd
FROM generation_events
WHERE event_type = 'claude_call_success'
GROUP BY course_id
ORDER BY total_usd DESC;
```

The pricing table is a constant in the file so it's versioned with the code. If Anthropic changes prices, the commit history shows when we updated. A future `v_course_cost` view can be added on top of this without any telemetry change.

### 3.6 Schema drift cleanup (`supabase/migrations/014_course_length_check.sql`)

```sql
-- Migration 014: CHECK constraint on courses.length + drift cleanup
-- ─────────────────────────────────────────────────────────────
-- Production contains stray length values (mini, beginner,
-- intermediate) that the application code does not handle.
-- These are dev-test artifacts from earlier schema versions.
--
-- This migration:
--   1. Enumerates current distinct length values (notice only)
--   2. Maps any stray value to 'crash' (safest fallback)
--   3. Adds a CHECK constraint restricting future inserts/updates
--      to the four valid values the code handles
--
-- Mapping to 'crash' rather than deleting rows preserves the
-- historical failure data for investigation. The rows are all
-- dev test data from Gianmarco + Filippo, so no user content
-- is at risk.
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

**Plan stage pre-flight:** run `SELECT DISTINCT length, count(*) FROM public.courses GROUP BY 1` via `execute_sql` and confirm the cleanup `UPDATE` covers every stray value. If new stray values exist beyond the three we already know about, the migration file needs updating before it runs.

### 3.7 Stripe price change

The plan stage will `grep` the codebase for:
- `masterclass` in any `.ts` / `.tsx` / `.js` / `.json` file under `src/`
- `price_` (Stripe price ID prefix) in any config file
- Hardcoded dollar amounts near the word "masterclass"

Any hit that isn't code logic (i.e., user-visible marketing copy or Stripe config) becomes a task in the plan.

**Gianmarco sets the new price** based on the cost telemetry collected from the first 5 post-deploy masterclass smoke tests. The spec does not prescribe a number. The plan task is "update the hardcoded masterclass price from $X to $Y" once Gianmarco has provided `Y`.

### 3.8 UI changes

#### 3.8.1 Filter `unreachable` URLs at render time

**`src/components/CurriculumOutput.tsx`**, **`src/app/course/[id]/course-content.tsx`**, **`src/components/CourseEditor.tsx`**, **`src/app/share/share-content.tsx`**:

Wherever the component reads `suggestedResources` or `bonusResources` arrays, apply a filter:

```ts
const visibleSuggestedResources = (lesson.suggestedResources ?? [])
  .filter((r) => r.status !== "unreachable");
```

Resources with `status === 'ok'`, `status === 'blocked'`, `status === 'unchecked'`, or `status === undefined` (e.g. courses that predate the validator) all remain visible. Only confirmed-dead links are hidden.

**Exact line numbers TBD in plan stage.** The plan task greps for `suggestedResources` and `bonusResources` in each file and adds the filter at each render site.

#### 3.8.2 Masterclass progress messaging

**`src/components/CurriculumForm.tsx`** (or whichever component renders the "generating..." progress state):

Conditional on `length === 'masterclass'`, show an additional message:

> "Masterclass courses take 10–20 minutes to generate. You can close this page — your course will appear in your profile when it's ready."

Non-masterclass courses keep the existing messaging (probably something like "This will take a few minutes").

**Exact component and insertion point TBD in plan stage.** The plan task greps for the current progress messaging and inserts the conditional.

#### 3.8.3 Pricing copy for new masterclass price

The plan stage enumerates every hardcoded masterclass price reference in the repo via grep (see 3.7) and updates each to the new value Gianmarco provides. If pricing is dynamic from Stripe (pulled at render time via a Stripe API call), no `.tsx` changes are needed — only the Stripe dashboard update.

---

## 4. Data flow and type changes

### 4.1 `src/types/curriculum.ts`

Add `status` to the resource types:

```ts
export type UrlStatus = "ok" | "unreachable" | "blocked" | "unchecked";

export interface SuggestedResource {
  title: string;
  url: string;
  type: "article" | "video" | "podcast" | "book" | "tool" | "documentation";
  status?: UrlStatus; // NEW — written by validateCourseUrls, absent on pre-validator courses
}

export interface BonusResource {
  id: string;
  title: string;
  type: "article" | "video" | "podcast" | "book" | "tool" | "documentation";
  url: string;
  description: string;
  isFree: boolean;
  status?: UrlStatus; // NEW
}
```

The field is optional so existing courses in the DB that predate the validator don't fail type checks. The render-time filter treats `undefined` as "visible" (not filtered out).

### 4.2 `src/types/database.types.ts`

Regenerated via `mcp__claude_ai_Supabase__generate_typescript_types` after migration 014 applies. Picks up the new CHECK constraint (no type change — CHECK constraints are runtime-only) and reflects any schema changes that might have landed outside this spec.

---

## 5. Error handling

| Failure mode | What happens | Why it's acceptable |
|---|---|---|
| Sonnet 4.6 call times out on masterclass | `callClaude` catches via AbortController, emits `claude_call_failure` with `timedOut=true`, throws. Inngest step retries once. If both fail, the module is marked failed in `courseFinalize`'s partial-tolerance logic. The course is marked `partial` if ≥80% of modules succeed, else `failed`. | Same path as existing Haiku failures. Sonnet routing does not introduce a new failure class — it just occupies a different call site. The existing onFailure handler and partial-tolerance logic cover it. |
| `validateCourseUrls` fails entirely | Inngest retries once. If both attempts fail, the curriculum row is unchanged — all URLs have `status` either undefined (old) or whatever the previous run set. The UI filter treats undefined as visible. | The course is already marked `ready` or `partial` before `validateCourseUrls` runs. The validator failing never prevents a user from seeing their course. We can manually re-fire `app/course.validate.urls` events via SQL/CLI to rerun validation on any course. |
| Validator marks all URLs as `unreachable` | Possible during network blips or test environments without outbound access. Course still renders — the filter hides unreachable links but keeps everything else (course title, descriptions, lesson content, key points, quiz). | Acceptable degradation. The course is still usable; the user just sees no external links. Re-running the validator later restores them. |
| Idempotency guard rejects a legitimate duplicate | User sees "A generation for the same topic/length/language is already in progress (existing course id: X). This duplicate was rejected to prevent parallel spending." | Correct behavior. They're not losing anything — the in-flight course is either running or will error out within 20 min max, after which they can retry freely. The message names the existing course ID so support can look it up. |
| Migration 014 `UPDATE` misses an unenumerated stray length value | Plan stage pre-flight query enumerates every distinct length value before migration 014 runs. If a new stray value exists, the plan updates the migration before running it. | The pre-flight is cheap (one SELECT) and catches this mechanically. |
| `callClaude` encounters a model not in the pricing table | Pricing fallback is `{ input: 0, output: 0 }`. `costUsd` becomes `0`. No throw. | Degraded telemetry, not a failure. Fallback logged; plan followup is to add the model to the pricing table. |
| The URL allowlist is too restrictive and Claude omits resources entirely | The prompt already instructs "2 working links > 5 broken ones" and "under-citing is always OK." Claude will produce fewer resources rather than fewer real courses. | Acceptable trade. Fewer-but-working is the product we want. |

**No new Inngest function has `retries > 1`**. Function-level retries duplicate telemetry events because `recordEvent` is called outside of `step.run` blocks (intentional — see P2 notes). Step-level retries inside `moduleGenerate` are the correct retry surface and remain unchanged.

---

## 6. Testing and acceptance

No test infrastructure exists in this repo — validation is `tsc` + `lint` + manual smoke + observability. Acceptance is gated on the following checks, all of which must pass before the branch merges and all of which Gianmarco and Filippo can run in one sitting:

### 6.1 Pre-merge local gates

- `npm run lint` passes (no **new** errors — task #14 pre-existing lint debt is excluded)
- `npx tsc --noEmit` passes (this is the real correctness gate given no test suite)
- `npm run build` passes
- All new/modified files have been read and re-read before commit (sanity pass)

### 6.2 Migration 014 gate

- Pre-flight: `SELECT DISTINCT length, count(*) FROM public.courses GROUP BY 1` — confirm the cleanup `UPDATE` covers every value
- Apply via `mcp__claude_ai_Supabase__apply_migration`
- Post-check 1: `SELECT DISTINCT length FROM public.courses` returns only the four valid values
- Post-check 2: `INSERT INTO public.courses (user_id, topic, length) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'bogus')` fails with constraint violation

### 6.3 Masterclass golden-path smoke test (worst-case topic)

- Gianmarco or Filippo generates an English masterclass on "Sudden Cardiac Death: Electrophysiology, Risk Stratification and Prevention" (the canonical stress test from production data)
- Expected:
  - All 10 modules generate without `stop_reason: "max_tokens"` (verify via `SELECT * FROM generation_events WHERE course_id = X AND event_type = 'claude_call_success' AND (metadata->>'truncated')::boolean = true` — must return zero rows)
  - Course reaches `status = 'ready'` in the `courses` table
  - `v_course_success_by_length` shows this run contributing to masterclass `usable_pct`
  - `v_module_latency` shows masterclass `module_detail` `p95_ms ≤ 120000` (120s — allows some headroom over the 90s target before we tune further)
  - After the async validator runs (within ~60s of `ready`), every `suggestedResource` in the curriculum JSON has `status = 'ok'` or `status = 'blocked'`. Count of `status = 'unreachable'` ≤ 5% of total.
- Blocking: if any gate fails, the spec has not delivered its core value and the rollback plan (section 8) runs.

### 6.4 Italian masterclass smoke

- Same topic in Italian: "Morte Cardiaca Improvvisa: Elettrofisiologia, Stratificazione del Rischio e Prevenzione"
- Expected:
  - All 10 modules generate without truncation
  - Resource URLs cite at least one of: `treccani.it`, `salute.gov.it`, `iss.it`, `it.wikipedia.org`, `corriere.it` (evidence the language-native sourcing works)
  - Course content is in Italian, not English
- Blocking: if the Italian version still truncates while the English version succeeds, the prompt allowlist may be displacing Italian-specific instructions — investigate before shipping broadly.

### 6.5 Non-masterclass regression check

- Generate one `crash`, one `short`, one `full` course on three different topics
- Expected: all three complete within their historical latency envelopes (no regression), no `stop_reason: "max_tokens"` on any call, `callClaude` telemetry shows model = Haiku for all three
- Purpose: confirm we didn't accidentally route non-masterclass calls to Sonnet.

### 6.6 Idempotency guard smoke

- Submit the same `(user, topic, length, language)` tuple twice within 5 seconds (via form double-click or two API calls)
- Expected: the second submission marks itself `failed` with `error_message` matching "already in progress", `generation_errors[0].category = 'duplicate'`, `generation_events` row with `metadata->>'category' = 'duplicate'`. The first submission completes normally.

### 6.7 Cost telemetry smoke

- After any test generation: `SELECT sum((metadata->>'costUsd')::numeric) FROM generation_events WHERE course_id = '<id>' AND event_type = 'claude_call_success'` returns a non-zero numeric
- Compare Sonnet masterclass cost to a Haiku `full` course cost — Sonnet masterclass should be roughly 5–15× more expensive per course
- Gianmarco uses these numbers to set the new masterclass Stripe price (section 3.7)

### 6.8 UI render smoke

- View a test course with a mixed URL set (some `ok`, some `unreachable`) in the course detail page, the share view, and the course editor
- Expected: `unreachable` links are absent from the render; `ok` links display normally; the count of displayed resources equals `total - unreachable_count`
- View a masterclass submission in progress — the "generating..." screen displays the "10–20 minutes" messaging instead of the generic "this will take a few minutes"

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Sonnet 4.6 is slower than projected → masterclass waves blow the 20-min `pg_cron` ceiling | Medium | High — we're back to where we started on reliability | Timeout set to 240s (out of 300s Vercel budget). If real p95 exceeds 180s consistently, drop concurrency 3→2 in a follow-up. Revert-safe: 1-line change. |
| Sonnet costs substantially more than the pricing-table estimate (input cache misses, unexpected output lengths) | Medium | Medium — revenue only impacted if new masterclass Stripe price doesn't cover the actual delta | Cost telemetry (section 3.5) makes this visible within the first 5 test generations. Gianmarco sets the Stripe price AFTER seeing real data, not before. |
| URL validator hits a domain that rate-limits us → many courses marked `blocked` for that domain | Low | Low | Concurrency capped at 10 parallel HEAD checks per course. HEAD method minimizes bandwidth. `blocked` status is truthful ("we got 429/403, can't confirm") and the UI still shows these URLs. |
| Migration 014 CHECK fails because of an unenumerated stray length value | Low | Medium — migration rollback | Plan stage pre-flight enumerates distinct values before migration runs. Mechanical fix. |
| URL allowlist is too restrictive → Claude starts omitting resources entirely on obscure topics | Medium | Low — under-citing is explicitly instructed as the safe fallback | Prompt makes this explicit: "2 working links > 5 broken ones" and "domain root is always valid fallback." Wikipedia-in-target-language always works for any concept. |
| Allowlist prompt block inflates token usage enough to re-introduce truncation pressure | Low | Low | Allowlist block is roughly 600 tokens of input. Against a 48k output budget, this is negligible. Monitor via `v_module_latency` post-deploy. |
| Sonnet model ID changes or deprecates | Very Low | Medium — generation stops | Hard-coded model IDs live in one constant block in `functions.ts`. 1-line bump if needed. Quality-gate alerts via `v_error_breakdown` grouping by model would catch this within minutes. |
| The new `validateCourseUrls` function has a bug that corrupts the curriculum JSON | Low | High — corrupted data in `courses.curriculum` | Function is pure — applyStatuses clones the curriculum and only adds `status` fields. Never deletes or modifies content. Acceptance test 6.3 and 6.4 verify this by inspecting post-validator JSON. |
| UI filter inadvertently hides `ok` or `unchecked` resources | Low | Medium | Filter is `status !== 'unreachable'` (not `status === 'ok'`), so undefined/unchecked/blocked all remain visible. Acceptance test 6.8 confirms by inspection. |
| `recordEvent` cost telemetry is called from inside an Inngest `step.run` block (would memoize and duplicate on retry) | Low | Medium — telemetry pollution | `callClaude` is called outside `step.run` blocks in the current codebase (P2 followed this rule strictly). Plan task explicitly verifies this remains true after changes. |

---

## 8. Rollback plan

Each change is an independent commit so `git revert` of any one undoes that change cleanly without touching the others.

| Change | Rollback step |
|---|---|
| Token/model routing for masterclass | `git revert <commit>` on the `functions.ts` change — reverts to Haiku + 24576 |
| URL allowlist prompt block | `git revert <commit>` on the `curriculum.ts` change — prompts revert to old text |
| URL validator Inngest function | Remove the `sendEvent` call from `courseFinalize` AND the function export. Existing `status` fields in DB stay (harmless — UI filter treats undefined/old values as visible). |
| Idempotency guard | `git revert <commit>` on the `functions.ts` change |
| Cost telemetry | `git revert <commit>` on the `functions.ts` change — existing `generation_events` rows with `costUsd` stay (harmless — views ignore unknown fields) |
| Migration 014 | `ALTER TABLE public.courses DROP CONSTRAINT courses_length_valid;` — one statement, reversible. The stray-value cleanup UPDATE is not reversible, but all affected rows are dev test data from Gianmarco + Filippo. |
| UI `unreachable` filter | `git revert` on each affected component file |
| Masterclass progress messaging | `git revert` on `CurriculumForm.tsx` |
| Stripe price change | Revert the Stripe dashboard + any hardcoded price references via `git revert` |

**There is no big-bang coupling** — any one change can be rolled back without affecting the others. If rollback is needed for the whole spec, the simplest path is `git revert` on the range of commits in reverse order.

---

## 9. Open questions (resolved during plan stage)

1. **Exact file path for Stripe masterclass price config** — plan stage greps for `masterclass` + `price` and identifies the file.
2. **Exact line numbers for `suggestedResources` / `bonusResources` filter insertion in each component** — plan stage greps each component file.
3. **Exact component and insertion point for the masterclass progress messaging** — plan stage reads `CurriculumForm.tsx` and finds the current progress state rendering.
4. **Current distinct `courses.length` values in prod** — plan stage pre-flight query. If any value beyond `mini`/`beginner`/`intermediate`/the four valid ones exists, the migration's cleanup `UPDATE` gets updated before running.
5. **Inngest function export barrel** — plan stage confirms whether new functions are exported from a central file or registered individually.

None of these block the spec from being approved; they are mechanical lookups for the plan stage.

---

## 10. Out of scope (explicit)

For clarity, every one of the following is intentionally **not** in this spec:

- Any change to the `crash`, `short`, or `full` generation paths (model, prompt, budget, timeout, content)
- Any change to skeleton generation (stays on Haiku)
- English-canonical-plus-translate language architecture (debated and explicitly kept as native multi-language)
- LLM-judge quality evaluation
- Topic-level caching / course deduplication across users
- Topic-density pre-flight warnings ("this topic is too dense for `crash`")
- Failure-aware retry UX ("this topic failed twice — try `full` instead")
- Duplicate-course "open existing" UX polish (the backend guard rejects; the UI does not offer a graceful alternative — user just sees the error)
- Refactoring or deletion of `src/app/api/generate/route.ts` duplicate Claude pipeline
- Fix for the 21 pre-existing `react/no-unescaped-entities` CI lint errors (task #14)
- Any landing page, niche landing page, blog post, legal page, profile page, tutorial page, or pricing page layout/copy changes
- Observability dashboard UI over the P2 views
- Any test infrastructure addition
- Any non-English-language prompt tuning beyond the allowlist (no Italian-specific "be more concise" instructions, for example)

Any of the above is a valid follow-up spec. None of them belong in this one.

---

## 11. Appendix: why some obvious ideas were rejected

- **"Generate in English and translate to the target language."** Economically not cheaper (translation layer costs as much as generation), culturally worse (translated courses feel foreign in non-English markets), architecturally expensive (4–6 weeks of re-platforming). Cost-neutral with real downsides. Re-evaluate only if `v_truncation_by_language` post-deploy shows non-English is structurally worse than English even after Sonnet + 48k cap.
- **"Raise max_tokens without switching to Sonnet."** Solves truncation but not quality — the content would still be Haiku-written and feel generic on dense topics. Cost delta is smaller but quality ceiling doesn't move, and the whole point of masterclass as a premium tier is to have a quality ceiling.
- **"Switch to Sonnet without raising max_tokens."** Solves quality but masterclass still truncates occasionally because Sonnet, while more concise, still burns output tokens on dense medical/legal topics. The dual change is needed; either one alone is insufficient.
- **"Validate URLs synchronously during generation instead of async afterward."** Blocks the user from seeing the course while we HEAD-check 30+ URLs. Adds 5–10s to every generation. Unacceptable latency cost for a quality gain that works just as well asynchronously.
- **"Post-process URLs (strip non-allowlist ones) instead of prompting the allowlist."** Wastes generated content and leaves the lesson with no resources for that concept. Prompting is a steering wheel; post-processing is a hammer.
- **"Add an LLM judge pass on every generated course."** Valuable quality win but doubles generation cost and adds latency. Better as a future spec after we have baseline quality telemetry from this spec's observability.
- **"Separate prompts per niche (medical, legal, tech)."** Combinatorial explosion, operational nightmare, and the current prompts already handle audience/teaching-style/output-structure calibration well. The allowlist does the niche-specific steering without duplicating prompts.
