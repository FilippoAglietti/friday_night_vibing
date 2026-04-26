# Syllabi platform fixes — triage & decomposition

**Date:** 2026-04-25
**Author:** Gianmarco + Claude (brainstorm session)
**Type:** Triage memo (not a single design — decomposes 6 reported issues into individual workstreams)

---

## Why this doc exists

Gianmarco reported 6 issues in a single message. They're independent, span debug / audit / new-feature work, and would be a Frankenstein doc if combined into one spec. This memo:

1. Establishes ground truth per item (from parallel codebase investigation, not assumption)
2. Decides whether each item is a **debug ticket**, a **plan**, or warrants its own **spec**
3. Recommends a sequence and flags blockers (esp. Filippo-gated Vercel/Stripe access)

Each item that needs design work spawns its own `docs/superpowers/specs/2026-04-25-<item>-design.md` from here.

---

## Executive summary

| # | Item | Root cause | Track | Effort | Filippo-gated? |
|---|------|-----------|-------|--------|---------------|
| 1 | SEO — site doesn't appear for "syllabi.online" search | Site is young + low authority. Sitemap/robots/metadata are all correct. GSC verification env var missing, but that's measurement, not indexing. | Ops checklist (no code spec) | S | Partial — env var add + GSC ownership |
| 2 | Generation progress: fake %, infinite loop | Frontend ignores real backend progress fields and uses a synthetic formula capped at 99%. Loop = DB row stuck at `generating` (Cloud Run / Inngest failure → no terminal state). | **Spec** | M | No (Cloud Run is Gianmarco's) |
| 3 | "Some export buttons not working" | All 8 buttons are wired. Likely real issues: (a) `EXPORT_V2_ENABLED` flag off in prod → silent v1 fallback, (b) tier-gated exports look "broken" to free users, (c) no error toast / loading UI hides actual failures. | **Plan** (mechanical fixes + UX) | M | Yes — Vercel env vars |
| 4 | User name + logo on generated courses | Net-new feature. No existing plumbing for branding in form / generation / export. | **Spec** (proper brainstorm) | L | No |
| 5 | Quiz collection end-to-end | Backend table + POST endpoint + creator dashboard all exist. **Student-facing quiz-taking UI does not exist.** Plus a security gap: GET endpoint has no course-ownership check. | **Spec** (UX for student-taking) + small security fix | L | No |
| 6 | Footer / legal pages | Footer routes all exist. 5/8 blog posts are stub links (`slug: "#"`). Legal pages are templated/generic — adequate but not tailored to syllabi data flows. | Quick fix batch | S-M | No |

**Recommended sequencing:**
**A) Same-day:** #1 (ops checklist, partial), #6 (link fixes), #3 quick wins (verify flags, add toasts).
**B) Next dev cycle (own spec):** #2 (generation progress), then #5 (quiz student UI + security fix).
**C) Brainstorm separately:** #4 (branding) — biggest design surface, lands last so platform is stable when adding new product surface.

---

## Item 1 — SEO indexing

### What was reported
> "If I type in google syllabi.online there is no result of our website"

### What we found (verified in code)
✅ All on-site SEO fundamentals are correct:
- `src/app/sitemap.ts` lists every public route (homepage, generators, blog, legal)
- `src/app/robots.ts` allows indexing, references the sitemap, uses canonical `https://www.syllabi.online`
- `src/app/layout.tsx` exports full metadata: title template, description, OpenGraph, Twitter card, **explicit `robots: { index: true, follow: true }`** (no noindex anywhere)
- Extensive JSON-LD: Organization, WebSite, SoftwareApplication, HowTo, FAQPage
- No password gating, no `X-Robots-Tag` blocking headers
- Cookie banner properly wired

⚠️ Missing: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var is referenced at `src/app/layout.tsx:107` but not set, so the GSC verification meta tag renders empty.

### Root cause — corrected from agent's report
The investigator agent claimed "without verification, Google may not index." **That is not how Google works.** GSC verification is for *site owners to access their crawl data*. It is not an indexing signal.

The real reasons `syllabi.online` likely doesn't appear for a brand search:
1. **Site is young** — Google hasn't crawled enough pages yet, or hasn't determined the site is the authoritative source for the term "syllabi.online"
2. **No backlinks / authority** — newer domains take weeks-to-months to rank even for their own brand name
3. **Possible canonical confusion** — `www.syllabi.online` vs `syllabi.online`. No explicit redirect rule in `next.config.ts` or `vercel.json`. If both versions resolve, Google may split signal.

### Fix scope (no spec needed — ops checklist)
1. Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>` to Vercel env (**Filippo-gated**) and Cloud Run (`NEXT_PUBLIC_*` is baked at build, so Cloud Run Dockerfile needs it too — see AGENTS.md)
2. Verify ownership at https://search.google.com/search-console
3. Manually submit `https://www.syllabi.online/sitemap.xml` via GSC
4. **Force canonical to `www.syllabi.online`** — add a 301 redirect from `syllabi.online` → `www.syllabi.online` in `vercel.json` or DNS
5. Use `site:syllabi.online` Google query to confirm whether *anything* is indexed; if zero, it's purely "young site, wait + nudge"
6. Build authority: link from any external site Gianmarco controls (LinkedIn, Twitter/X bio, Cortex blog if public, etc.)
7. Monitor GSC Index Coverage weekly for 2-4 weeks before assuming a real bug

### Track: ops checklist (no design doc, no code spec). Drop into a one-page handoff for Filippo on env var + DNS, the rest is Gianmarco-doable.

---

## Item 2 — Generation progress: fake percentage + infinite loop

### What was reported
> "The animation while generating the course the percentage is false and is looping infinity even when the course is finished, have a deep look into that full process"

### What we found

**Two distinct bugs.**

**Bug A — fake percentage**
`src/app/course/[id]/generating-view.tsx:131-135`:
```ts
const progressPercent = hasTotal
  ? Math.min(99, Math.round(10 + (completed / total) * 85))
  : phase === "skeleton" ? 8 : 5;
```
Synthetic formula: 10% baseline → scales 0-85% across module count → caps at 99%.

But the backend status endpoint (`src/app/api/courses/[id]/status/route.ts:148-159`) **already returns real progress fields**: `generation_progress`, `generation_total_modules`, `generation_completed_modules`. The frontend ignores them and computes its own number.

**Bug B — infinite loop**
The polling loop (`generating-view.tsx:84-127`) terminates only when the API returns `status === "ready"` or `status === "failed"`. If the DB row stays at `"generating"` forever (which happens when the **Inngest worker on Cloud Run fails silently** — and we already know the model alias broke once, hence the Haiku emergency override on 2026-04-20), the loop polls forever and the synthetic % stays pinned at 99%.

The frontend has **no max-retry timeout**.

### Fix scope — needs its own spec
**Two layers:**

1. **Frontend (this is where the user-visible bug lives):**
   - Read real backend progress from the status response, drop the synthetic formula
   - Add a hard timeout (e.g., 10 min wall clock) → after that, surface a "generation taking longer than expected" message with a retry/contact button
   - Show meaningful phase labels (e.g., "writing module 3 of 8: …") not just a %

2. **Backend (the loop's *cause*):**
   - Audit the Inngest function `course/generation.requested` (or whatever the actual event name is) for: does it always reach a terminal DB write (`status = "ready"` OR `status = "failed"`) even on uncaught error?
   - Specifically: any error inside the worker that doesn't end with a `status = "failed"` write will leave the row stuck. Add a try/catch/finally guarantee.
   - Consider a Cloud Run watchdog: a scheduled job that finds courses stuck in `generating` for >15 min and force-fails them.

**Existing context:** there's an earlier spec at `docs/superpowers/specs/2026-04-17-generation-animation-spec.md`. **Read it before drafting the new spec** — the original design likely intended real progress; current state suggests partial implementation or regression.

### Track: full spec → plan → implementation. Spec name: `2026-04-25-generation-progress-fix-design.md`.

---

## Item 3 — Export buttons

### What was reported
> "Some export button is not working"

### What we found

All 8 export formats have wired buttons + handlers in `src/app/course/[id]/course-content.tsx`:

| Format | Pipeline | Status |
|--------|---------|--------|
| PDF | v2 (Playwright/Chromium) with v1 (jsPDF) fallback gated by `EXPORT_V2_ENABLED` | Dual-path |
| Word (DOCX) | `generateCurriculumDocx` | v1, working |
| Markdown | `curriculumToMarkdown` (in-memory) | v1, working |
| Notion | `copyNotionHtmlToClipboard` | v1, working |
| SCORM | `generateScormPackage` | v1, working |
| NotebookLM Audio | `generateNotebookLMMarkdown` | v1, working |
| NotebookLM Slides | `generateNotebookLMSlidesMarkdown` | v1, working |
| Share link | Supabase RLS-protected URL | v1, working |

### Most likely causes for "not working" reports

1. **Feature flag off in prod** → PDF v2 silently falls back to v1, masking real v2 bugs (`course-content.tsx:561` catch-all). Verify `EXPORT_V2_ENABLED` and `NEXT_PUBLIC_EXPORT_V2_ENABLED` are set in Vercel (Filippo-gated) AND Cloud Run.
2. **Tier gating** — Word, Notion, SCORM, NLM Audio, NLM Slides are gated to planner/masterclass tiers (`ExportGrid.tsx:49-53`). Free users see locked tiles that route to pricing; from the user's perspective this looks "broken." Needs clearer locked-state UX so it doesn't read as a bug.
3. **No user-facing error feedback** — every handler does `try/catch + console.error`, which the user never sees. Real errors look identical to "nothing happened."
4. **Async PDF opacity** — long courses dispatch via Inngest; the client polls `/api/export/pdf/status` with a 2-min timeout (`client.ts:28`). If Inngest is slow or down, user sees nothing happening for 2 min then a generic failure.

### Fix scope (plan, not spec — fixes are mechanical)

1. Verify env vars in production deploy (5 min, **Filippo-gated**)
2. Add `react-hot-toast` (or existing toast lib) calls to every export handler — success + error states
3. Add loading state on PDF button during the async polling window with elapsed-time indicator
4. Re-do locked-tier tiles: clearly say "Upgrade to unlock," not just disable. (Optional UX polish.)
5. Add a feature-flag check at `ExportGrid` mount that warns in dev console if v2 flag is off in production env

### Track: plan. Plan name: `2026-04-25-export-ux-hardening-plan.md`.

---

## Item 4 — User name + logo on generated courses (branding)

### What was reported
> "We said to give the opportunity to put the name and the logo of the user that are generating the course and we still don't have it"

### What we know

This is **net-new feature work**. No existing plumbing for branding in:
- Curriculum form (no name/logo input fields)
- Generation pipeline (no branding fields in `GenerateRequest` schema)
- Course render (no branding rendering on course view or PDF)
- Storage (no branding columns on `courses` table)

### Why this needs its own brainstorm

Real questions to answer before writing code:
- Is branding **per-course** (filled in form each time) or **per-user profile** (set once, applied to all courses)? Or both, with user default + per-course override?
- Where does logo live? Supabase Storage bucket? Vercel Blob? Inline base64?
- File constraints: format (SVG/PNG/JPG?), max size, validation
- Where does branding render? Cover page? Header on every page? Footer? All export formats or just PDF?
- Does branding gate behind a paid tier? (Free users get "Generated with Syllabi" footer; paid users replace it?)
- Cobranding edge case: if a user uploads a competitor's logo, do we care?

### Track: full brainstorm session. Spec name: `2026-04-25-user-branding-design.md`. **Defer until items 1-3 ship.**

---

## Item 5 — Quiz collection end-to-end

### What was reported
> "The quiz collection from students is it working? Is showing the result in the dashboard? This feature should work perfectly"

### What we found

**It is structurally complete but operationally broken — and there's a security gap.**

| Layer | State |
|-------|-------|
| Quiz schema in curriculum (`QuizQuestion`, `Module.quiz`, `Lesson.quiz`) | ✅ exists |
| Quiz generation by model (`includeQuizzes` flag) | ✅ exists, stored in `courses.curriculum` |
| **Student-facing quiz-taking UI** | 🔴 **does not exist** — `QuizBlock` component is PDF export only |
| `quiz_attempts` table + schema | ✅ exists |
| POST `/api/quiz-attempts` | ✅ exists, validates course is public |
| GET `/api/quiz-attempts` | ⚠️ **no course-ownership check** — any authenticated user can list any course's attempts |
| Creator dashboard `QuizResultsPanel` | ✅ implemented and renders |

So: **no real student data is being captured because students have no way to take a quiz on the web.** The dashboard is reading from an empty table. Quizzes only render in PDF, where there's no submit mechanism.

### Fix scope — full spec

1. **Build student-taking UI** — interactive page that:
   - Loads a public course's quiz blocks
   - Captures answers + duration
   - POSTs to existing `/api/quiz-attempts`
   - Shows score + explanations after submit
   - Optional: capture student name/email before starting (or anonymous)
   - Mobile-first

2. **Security fix (small, separate ticket):** Add ownership check to GET `/api/quiz-attempts` so creators only see their own course attempts.

3. **Discoverability:** how does a student get to the quiz-taking page? From the share link? A separate "take this course's quiz" deep link?

### Track: full spec. Spec name: `2026-04-25-student-quiz-taking-design.md`. Security fix can ship same-day as a one-line PR.

---

## Item 6 — Footer & legal pages

### What was reported
> "Are all the pages at the end of the main page working? The legal etc stuff double check and correct in case"

### What we found

✅ **20 footer links checked, all routes exist.** Cookie banner is wired correctly. Privacy / Terms / Cookies pages all have real content (last touched 2026-04-13).

⚠️ **Real issues:**

1. **Blog stubs** — `src/app/blog/page.tsx:59-99`: 5 of 8 blog posts have `slug: "#"`. Clicking them goes nowhere. Either:
   - Remove the stub entries (10 min)
   - Implement the blog posts (much larger — content writing)
   - Replace with "coming soon" UI explicitly

2. **Legal content quality** — Privacy/Terms/Cookies are templated boilerplate. They're adequate to ship but don't reflect syllabi-specific data flows (Claude API calls, Supabase storage, what happens to user-generated curriculum data, etc.). A real-lawyer pass is out of scope for this triage but worth queueing as a separate non-engineering task.

3. **`/generator` index** — verified to exist (`src/app/generator/page.tsx`).

### Fix scope (quick batch — no spec)

Same-day: remove or stub-label the 5 placeholder blog posts. Add a separate non-eng task for legal review.

### Track: quick PR. No spec.

---

## Cross-cutting observations

1. **The Filippo-gated bottleneck is real.** Items #1 and #3 both need Vercel env vars. Bundle them into a single env-var update PR / handoff for Filippo so we don't ping him twice.

2. **Cloud Run + Inngest reliability is the silent killer behind both #2 (loop) and #3 (PDF async).** A small instrumentation pass — log every Inngest function entry/exit/error to Cloud Run logs explicitly — would help diagnose stuck-state issues across multiple features. Could be a side-task during item #2.

3. **No user-facing error UX.** Items #2, #3, and #5 all suffer from "silent failure → user thinks it's broken." A small `<Toaster />` integration and consistent error handling pattern (e.g., a `useExportAction` hook) might be worth extracting once we touch any of these.

---

## Decision points for Gianmarco

Before kicking off the next session, decide:

1. **Does Filippo bundle the env vars** (#1 GSC token + #3 export flags + canonical redirect) into one Vercel update, or are we doing them one at a time?
2. **Branding (#4) — per-course, per-profile, or both?** This is the single biggest design lever for the upcoming brainstorm.
3. **Quiz student UI (#5) — anonymous or login-required?** Drives auth complexity.
4. **Legal review (#6) — do we engage a real lawyer or ship as-is for v1?**

---

## Decisions made (2026-04-26)

After triage review with Gianmarco:

- **Triage approved as-is.**
- **#4 branding model:** **Per-user-profile** (set once in account settings, applies to all courses). Per-course override deferred to v2. Rationale: the most common case is a creator branding all their courses identically; per-course form complexity isn't justified for v1.
- **#5 quiz:** **Dropped from current scope** ("for now"). Backend + dashboard remain in place but no student-taking UI work scheduled. Revisit later. Security gap on GET `/api/quiz-attempts` should still be fixed opportunistically (one-line PR) when next touching that area.
- **Next spec:** #2 (generation progress).

## Next actions

1. ☑ Mirror this triage to Notion under the Syllabi parent page
2. ☐ Begin spec for #2 (generation progress) — design doc: `2026-04-26-generation-progress-fix-design.md`
3. ☐ Same-day quick fixes for #6 (blog stubs) and #3 (verify env flags + add toasts)
4. ☐ Hand off SEO ops checklist to Filippo (bundled with #3 env vars)
