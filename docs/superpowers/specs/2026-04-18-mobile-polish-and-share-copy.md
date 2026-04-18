# Spec — Mobile polish + honest share copy

**Date:** 2026-04-18
**Branch:** `feat/mobile-polish-and-share-copy`
**Author:** Claude Opus 4.7 (overnight run for Gianmarco)
**Status:** draft → in-review
**Authoritative source:** this file. Notion mirror is for review.

## 1. Problem statement

Two concurrent issues on the landing surface:

1. **Mobile adaptation gaps.** On iPhone SE (320×568), the cookie consent banner covers the primary CTAs on first paint. The visual design language must be preserved — this is polish, not redesign.
2. **False "60 seconds" share-copy claim.** The social share card (`<meta>` / OG / Twitter) promises courses "in 60 seconds". Actual generation runs minutes to 10+ minutes on masterclass. This is false advertising and erodes trust once the loader runs past 60s.

## 2. Non-goals

- Redesigning the landing page. **No** new colors, fonts, weights, or component shapes.
- Touching backend pipeline, Stripe price IDs, Inngest function names, `courses.status` enum, `/api/*` route shapes, or migration numbering (hard constraints from Notion context).
- Broadening the honest-copy sweep beyond share-facing surfaces. Blog pages, `/docs`, `/support`, niche generator landing pages, and generator hub also contain "60 seconds" claims — these are **out of scope** for this PR; will be filed as a follow-up.
- Full Playwright device-matrix screenshot verification: this session was launched from `~/` not the project dir, so the project-scoped Playwright MCP is not loaded. Best-effort fallback is code review + Vercel preview + curl meta grep + (if available) firecrawl browser session. Flagged in PR.

## 3. Scope

### Task A — Mobile polish (preserve design)

**Decision on cookie banner (root cause of CTA obstruction on iPhone SE):**
- Option considered: delay entry until first scroll / after 1.5s. **Chosen.** Reason: lowest visual footprint change, preserves the desktop entry animation, and gives users unobstructed time to see the CTAs. A secondary side-effect fix is reducing banner padding and text size on `≤360w` so even if a user lands and doesn't scroll, the banner is shorter.

**Adaptation checklist** (all gated behind media queries; zero desktop regression):
- Cookie consent: `≤640w` banner compacts (reduced padding, two-line layout allowed); enter-delay bumped from on-mount to ~1200 ms to give primary CTAs first-paint breathing room.
- Tap targets: verify Accept / Decline / X in cookie banner ≥44×44px at `≤640w`; grow if below.
- No horizontal overflow: audit page.tsx hero and orbital decorations for any fixed-width > viewport.
- Hero H1 wrap at 320w: verify `Sounds as Good as It Looks` does not break mid-word. If it does, adjust line-height or reduce font-size at `≤360w`.
- Examples carousel: confirm `touch-action` is set so auto-cycle + swipe coexist.
- Primary CTA thumb-zone reachability at 320×568.

**Already shipped in `569d606` (do not redo):** `viewport-fit=cover`, `100dvh`, anchor offsets, nav compaction.

### Task B — Honest share copy

**In scope:**
- `src/app/layout.tsx` — meta `title`, `description`, OpenGraph, Twitter, JSON-LD `WebSite.description`, `HowTo.description` + `totalTime` (remove field) + step 3 text, `FAQPage` questions 1 and 6.
- `src/app/opengraph-image.tsx` — rendered tagline + `alt`.
- `src/lib/i18n/locales/*.ts` — all 16: `hero.subtitle`, `howItWorks.step2Desc`, `examples.subheading`, `finalCta.subheading`, `tutorial.subheading`, `tutorial.step3Desc`, `tutorial.step3Detail`.
- `src/app/page.tsx` line 133 — `desc` echo of `step2Desc`.
- `src/components/CurriculumForm.tsx` line 534 — subtitle echo.
- `src/app/manifest.ts` — `description`.
- `src/app/share/share-content.tsx` line 534 — share hero echo.
- `src/lib/emails/welcome-email.ts` line 220 — welcome-email subtitle.

**Out of scope (follow-up PR):**
- `src/app/generator/[niche]/page.tsx` + `opengraph-image.tsx`, `src/app/generator/page.tsx`, `src/data/niches.ts` FAQ answers — 30+ niche landing pages with "60 seconds" still claimed.
- `src/app/blog/*/page.tsx`, `src/app/feed.xml/route.ts` — blog post title "How to Create a Lead Magnet Mini-Course in 60 Seconds" and body copy.
- `src/app/docs/page.tsx`, `src/app/support/page.tsx` — FAQ answers echoing the same claim.
- `src/app/quick/*` — `/quick` is a different feature (single-screen outline) whose backend may genuinely be fast; left intact pending backend confirmation.

## 4. Share copy candidates + final picks

### `<title>` / `og:title` (≤60 chars)

Current: `Syllabi — #1 AI Course Generator | Create Full Courses in Seconds` (65 chars; false).

| # | Candidate | Length | Notes |
|---|---|---|---|
| 1 | `Syllabi — The AI Course Generator Worth Listening To` | 52 | Plays on audio differentiator; matches "Sounds as Good as It Looks" voice |
| 2 | `Syllabi — AI Course Generator. Audio. Design. Share Link.` | 57 | Triplet rhythm mirrors "Hear it. See it. Share it." |
| 3 | `Syllabi — AI Course Generator with Audio, Design & Share Links` | 62 | Marginal — over the 60-char budget |

**Pick:** #1. `Syllabi — The AI Course Generator Worth Listening To`. Confident, brand-aligned, no time claim.

### Primary `description` (≤160 chars)

Current: 185 chars, contains "60 seconds".

**New:** `The AI course generator that builds complete courses with audio narration, beautiful design, quizzes, and PDF export. Free to start — no credit card required.` (158 chars).

### `og:description`

Current (line 68) already contains no time claim and is accurate. **Keep.**

### `twitter:title` (≤60 chars)

Current: `Syllabi — AI Course Generator | Full Courses in 60 Seconds` (59 chars; false).
**New:** `Syllabi — The AI Course Generator Worth Listening To` (52 chars). Aligns with `<title>`.

### `twitter:description`

Current (line 86) doesn't contain time claim. **Keep.**

### OG image rendered tagline (≤80 chars)

Current: `Full courses with audio narration, quizzes, and PDF export — ready in 60 seconds.` (81 chars; false).

| # | Candidate | Length |
|---|---|---|
| 1 | `Complete courses with audio narration, design, and a shareable link.` | 68 |
| 2 | `Audio-narrated, beautifully designed courses — yours to share.` | 62 |
| 3 | `Full courses. Audio narration. Design worth sharing.` | 52 |

**Pick:** #1. Matches existing brand lexicon (`audio narration`, `shareable link`, `beautiful design`). No time claim.

### OG image `alt`

Current: `Syllabi — AI Course Generator: Create full courses with audio, quizzes, and beautiful design in seconds`.
**New:** `Syllabi — AI Course Generator: Create full courses with audio narration, quizzes, and beautiful design.`

### JSON-LD changes

- `WebSite.description`: drop "in seconds" → `"AI-powered course generator — create full online courses with audio, quizzes, and PDF export."`.
- `HowTo.description`: drop time claim → `"Generate a complete, professional online course with Syllabi's AI course generator — modules, lessons, quizzes, audio narration, and a shareable link."`.
- `HowTo.totalTime`: **remove the field.** Schema.org does not support ranges; a precise value would be false.
- `HowTo.step[2].text` (step 3): drop "in 15–60 seconds" → `"Click Generate and Syllabi's AI builds a full course: modules, lessons, quizzes, learning objectives, and pacing schedules."`.
- `FAQPage` Q1 "What is Syllabi?" — remove "from a single topic in under 60 seconds"; end with "...from a single topic."
- `FAQPage` Q6 "How long does course generation take?" — replace with honest answer: `"Generation time depends on course length. Short courses are ready in a few minutes; masterclass courses can take around 10 minutes. We show a live progress loader throughout."`.

### Locale keys to update (all 16)

| Key path | Current EN | New EN |
|---|---|---|
| `hero.subtitle` | `...ready to teach, sell, or share in seconds.` | `...ready to teach, sell, or share.` |
| `howItWorks.step2Desc` | `In seconds you get modules, lessons, quizzes, audio narration, and a shareable link — all editable.` | `You get modules, lessons, quizzes, audio narration, and a shareable link — all editable.` |
| `examples.subheading` | `Every course below was generated in seconds — complete with...` | `Every course below was generated with Syllabi — complete with...` |
| `finalCta.subheading` | `Create a course with audio, design, and a shareable link — all in under 60 seconds. Your first generation is free.` | `Create a course with audio, design, and a shareable link. Your first generation is free.` |
| `tutorial.subheading` | `Everything you need to go from blank page to shareable link — in under 60 seconds.` | `Everything you need to go from blank page to shareable link.` |
| `tutorial.step3Desc` | `Hit Generate. AI builds a complete course structure with modules, lessons, quizzes, and learning objectives — all in seconds.` | `Hit Generate. AI builds a complete course structure with modules, lessons, quizzes, and learning objectives.` |
| `tutorial.step3Detail` | `Full courses with 8+ modules generate in under 60 seconds.` | `Full courses with 8+ modules are ready in minutes — progress shown live.` |

Translation strategy: adapt to each locale's idiom, preserve brand voice. For RTL (ar) and heavy-tokenizing languages (de, ru), prefer the shortest faithful phrasing.

### Hardcoded English echoes to update

- `src/app/page.tsx` line 133 — mirror the new `step2Desc` text above.
- `src/components/CurriculumForm.tsx` line 534 — `Describe your course and we'll take it from there.`
- `src/app/share/share-content.tsx` line 534 — drop `— in seconds`, end at `shareable links.`
- `src/app/manifest.ts` line 8 — `Turn any topic into a full course with AI-generated modules, lessons, quizzes, audio narration & PDF export.`
- `src/lib/emails/welcome-email.ts` line 220 — `Full courses with modules, lessons, quizzes & pacing — ready to share.`

## 5. Open questions resolved autonomously

| Question | Chosen path | Reason |
|---|---|---|
| Cookie banner: reduce height, reposition, or delay entry? | **Delay entry** (primary) + compact padding on `≤640w` (secondary) | Preserves desktop animation and visual footprint; gives CTAs a clean first-paint window. |
| `HowTo.totalTime`: pick a truthful number or drop? | **Drop.** | No ISO 8601 way to express a range; any single value would be false for part of the length matrix. |
| `/quick` route copy — touch or leave? | **Leave.** | Different feature (one-screen outline) that may genuinely finish in seconds. Backend confirmation needed before editing. |
| Blog / niche / docs / support pages? | **Defer** to follow-up PR | Out of the spec's explicit 4-bucket scope; 30+ more surfaces; would bloat review. |
| Is Playwright MCP usable for the device matrix verification? | **No** — use code review + Vercel preview + curl meta grep + firecrawl browser (best-effort) | Session launched from `~/`, not the project dir. Flagged in PR. |

## 6. Verification strategy

- `bun run lint` — zero errors.
- `npx tsc --noEmit` — zero errors.
- `bun run build` — successful production build.
- Push branch. Vercel auto-deploys a preview.
- `curl -s <preview-url> | grep -iE 'og:title|og:description|twitter:title|twitter:description|<title>'` — confirm new copy in rendered HTML.
- Fetch `<preview-url>/opengraph-image` — confirm the OG image reflects the new tagline.
- Best-effort mobile visual via firecrawl browser at 320/393/412 widths if it supports viewport control.
- PR body includes the meta-tag diff, verification checklist, and the explicit Playwright gap.

## 7. Rollout

Branch → PR → review by Gianmarco → merge → Vercel prod auto-deploys → no runtime migrations, no env-var changes, no backend coordination needed.
