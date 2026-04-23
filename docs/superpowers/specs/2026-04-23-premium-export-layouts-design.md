# Premium Export Layouts — Design Spec

> **Status:** Design approved · Implementation plan pending
> **Scope:** All course-export artifacts (PDF, Web Share, SCORM, Marp slides, Word, Notion, NLM Audio)
> **Brainstorm:** `.superpowers/brainstorm/4987-1776967661/` (8 visual screens)
> **Date:** 2026-04-23
> **Owner:** Gianmarco (frontend + design) · coord w/ Filippo (prompts for content model)

## Problem

Today's course exports look amateur. Two symptoms, one root cause:

1. **The PDF is hand-drawn.** `src/lib/pdf/generatePDF.ts` is 1,746 lines of procedural jsPDF — manually computed x/y coordinates and page-break math. Every layout mistake users report (overlap, orphan lines, broken page splits, ragged vertical rhythm) is a hand-calculated coordinate gone wrong. There is no flow engine. No amount of palette tuning or typography fiddling fixes this — the engine itself cannot reliably produce a premium document.
2. **All four teaching styles get the same layout.** `generatePDF.ts` already threads `teachingStyle` through, but uses it only for a palette swap. A palette is not a voice. Academic courses look like conversational courses look like hands-on courses. A "premium" promise needs four actually-different layouts, not four tints.

The product claim (landing page, Product Hunt copy, pricing page) is that courses **"look like they came from a design agency, not ChatGPT."** The current exports do not clear that bar. Creators — especially Masterclass at €99/mo — cannot hand these artifacts to paying students without embarrassment.

## Goals

- Replace the procedural jsPDF pipeline with a rendering engine that produces premium, flow-correct output on every run.
- Ship **four genuinely different layouts** — one per teaching style — over a **shared design system** so courses feel coherent across styles.
- Make every export artifact **white-label by default**: zero Syllabi branding, zero watermark, on any tier.
- Extend personalisation progressively by pricing tier: Free gets a clean baseline, Planner adds logo + accent, Masterclass adds hero image + footer.
- Keep the existing content model stable. One typed schema extension (academic citations); everything else rides on prompt-tuned markdown conventions.
- Reuse the same rendering source for every HTML-family export (PDF / Web Share / SCORM / Marp) so one design lands in four places.

## Non-goals

- Not redesigning Excel (`.xlsx`) or plain Markdown exports. Neither is a layout artifact.
- No AI-generated cover art (DALL·E / Flux / etc.) — rejected on cost, latency, brand drift, and AI-era fingerprint.
- No curated abstract-pattern library in v1 — deferred to a possible v2 design sprint.
- No typographic override by creators (Level 4 personalisation) — licensing rabbit hole, too much UI for v1.
- No dialect switch after generation — creator picks teaching style at generation time; export honours it.
- Not rewriting the AI generation pipeline. This spec is the **render / export layer**; prompt changes in §5 are minimal and additive.
- Not introducing new export formats (ePub, Keynote, etc.).
- Not preserving backwards compatibility for courses generated before the academic-citations schema extension — academic courses generated pre-extension render without footnotes and with the existing `suggestedResources` list as "Further Reading". No migration.

## Design decisions

Eight decisions, each resolved during the brainstorm. Numbered for reference throughout.

### 01 — Engine: HTML → Puppeteer/Playwright → PDF

React components render to HTML. Headless Chrome (already on Cloud Run) renders HTML to PDF via Playwright's `page.pdf()`. **One source of truth** — the same React component tree also powers `/course/[id]`, `/share`, the SCORM HTML bundle, and (via a Marp adapter) the slide decks.

- Rejected: continuing with jsPDF (ceiling too low, bugs rooted in procedural model).
- Rejected: `@react-pdf/renderer` (better than jsPDF, but weaker CSS, no web reuse, separate component library).

**Why Playwright over Puppeteer:** Playwright is already in the repo's dev deps (check `package.json`); picks up fonts, print CSS, `@page` rules, and paged-media features more reliably.

**Where it runs:** existing Cloud Run service. The Inngest worker Dockerfile is already Chromium-capable (Playwright is present). New export flow adds an Inngest function `course.export.requested` that renders and uploads the PDF to a Supabase bucket, then emits a download URL. For small PDFs the sync route can also run on Vercel inside the 300s cap; masterclass-length courses must go async.

### 02 — Direction: Modern Handbook

Design language is **Modern Handbook** — clean sans, numbered callouts, tight 12-column grid, marginalia, code/quiz blocks, running header/footer. References: Stripe Atlas, Linear changelog, Vercel docs, Notion pages. Reads like reference material and evaluates well in a buyer's hand.

Rejected alternatives:
- **Editorial Textbook** (serif, book-like, REWORK/O'Reilly) — beautiful but demanding to hit consistently; quiz / code blocks fight the aesthetic.
- **Agency / Editorial Brief** (Pentagram, IDEO) — gorgeous covers, but interior loses coherence on 200+ page courses.

### 03 — System: one Shared Core + four dialects

**Shared Core** — six components + the design tokens beneath them — is identical across all four dialects:

| Component | Role |
|---|---|
| Cover page | Title, creator identity, stats, volume mark |
| Table of Contents | Numbered with dot leaders, module grouping, page refs |
| Module opener | § number, title, objectives, duration |
| Lesson page | Body + marginalia track, callouts, quiz embed |
| Quiz block | Question, options, correct answer, explanation |
| Certificate | Final page, issuer = creator name, completion metadata |

**Tokens** also shared: 12-col grid, type scale (body Inter + long-form Iowan Old Style Roman / Source Serif), spacing rhythm (4/8/12/16/24/32/48/64), page numbering, running header/footer, RTL + 16-language script fallbacks.

**Four dialects** extend the Core with style-specific components and copy treatment. Each dialect is a layout *voice*, not a palette:

| Dialect | Adds | Tone | Primary color |
|---|---|---|---|
| **Academic** | numbered footnotes, marginalia notes, bibliography page, section numbering (§I / §II) | scholarly, precise | indigo-900 / #1e3a8a |
| **Hands-on** | step counters, "Try this" cards, code blocks (styled), checkpoint pages, materials list | workshop, maker | emerald-600 / #10b981 |
| **Storytelling** | chapter-break pages, drop caps, pull quotes, scene headings, prose-dominant lesson pages | narrative, warm | amber-800 / #92400e |
| **Conversational** | Q&A pairs, "In plain English" boxes, reading-time pills, soft rounded cards | friendly, approachable | violet-600 / #7c3aed |

Dialect selection is driven by `Curriculum.teachingStyle` — no new field.

### 04 — Format scope

Three tiers of treatment:

**Full redesign (HTML-family, shared source):**
- **PDF** — flagship. 4 dialects × personalisation layers. Replaces `src/lib/pdf/generatePDF.ts`.
- **Web Share** — `/course/[id]` + `/share`. Same React components as PDF. Adds interactive elements (quiz reveal, scroll progress, nav).
- **SCORM 1.2** — HTML bundle wrapped in SCORM shell. Reuses web components verbatim.
- **Marp slides** — one Marp theme per dialect; content adapter extracts slide-shaped blocks from the curriculum JSON.

**Tool-ceiling refresh (library-constrained):**
- **Word (.docx)** — uses `docx` lib; paragraph/run model, no flex grid. Refresh: dialect palette, heading styles, cover page, call-out frames via shaded paragraphs and single-cell tables.
- **Notion HTML + MD** — Notion strips most CSS on paste; refresh is structural. Clean block hierarchy, callouts for Q&A / key idea / exercise, proper heading levels.
- **NotebookLM Audio MD** — content-only (fed to podcast generation), no visual layout. Refresh: briefing structure per dialect.

**Out of scope:** Excel (`.xlsx`), plain Markdown (`toMarkdown.ts`).

### 05 — Content model: hybrid

- **Markdown conventions** for voice features. Generator prompts per dialect emit specific blockquote patterns that the renderer parses:
  - `> 💡 **Try this:** …` → hands-on "Try this" card
  - `> ❓ **You might ask:** …` / `> 💬 **Short answer:** …` → conversational Q&A pair
  - `> ★ **Key idea:** …` → handbook-neutral key-idea callout
  - `> "…" — attribution` → storytelling pull quote
  - Markdown footnote syntax `[^id]` with matching `[^id]: …` → academic footnote
  - `> 🧰 **Materials:** …` → hands-on materials list
  - Standard fenced code blocks with language tag → styled code (all dialects, hero treatment in hands-on)

- **Typed schema extension** only for **academic citations**, because footnote numbering is document-global and URLs require CrossRef validation (already in the grounded academic pipeline). Adds to `src/types/curriculum.ts`:

  ```typescript
  interface Citation {
    id: string;                // unique within course, used as footnote anchor
    lessonId: string;          // back-reference
    authors: string[];         // ["Hinton, G.", "Bengio, Y."]
    year: number;
    title: string;
    source: string;            // journal / book / conference name
    doi?: string;              // validated upstream
    url?: string;
    status?: UrlStatus;        // reuse existing validator
  }

  interface Curriculum {
    // existing fields unchanged
    citations?: Citation[];    // flat list; renderer numbers them in reading order
  }
  ```

  Zero impact on non-academic courses. Generator emits the array only for `teachingStyle === "academic"`.

### 06 — Imagery: type-led base + Masterclass hero

- **All tiers:** no imagery. Covers and section openers use color, typography, negative space, and geometric marks. Zero generation cost, zero "AI fingerprint," ages well.
- **Masterclass:** creator may upload a hero image (cover art) as part of their white-label. Image goes to a Supabase bucket, is referenced from the creator's profile, and renders as the primary cover asset when present.
- **Not v1:** AI-generated cover art (rejected); curated abstract-pattern library (reconsider post-launch).

### 07 — Branding: zero Syllabi on any export, any tier [HARD CONSTRAINT]

No logo, no watermark, no "made with Syllabi" footer, no `Producer` metadata, no mention *anywhere* in the deliverable — on any tier, including Free.

- PDF metadata: `producer` and `creator` fields are set to the creator's display name (or blank if unset), never Syllabi.
- SCORM manifest: `<organization>` uses creator name.
- `/share/opengraph-image.tsx` — update to render unbranded by default. (Loses a small amount of social-share recognition; accept.)
- Certificate issuer = creator name.
- Running footer (PDF + web): page numbers only, or custom footer text when Masterclass has set one.

**Product tradeoff consciously accepted:** this removes the organic viral loop a free-tier footer watermark would create (Notion/Linktree/Canva model). Exchange: creator trust over distribution.

### 08 — Personalisation ladder

| Tier | Level | Carries | New DB fields |
|---|---|---|---|
| Free | 1 | Course title + creator display name (from existing `profiles.full_name`) | — |
| Planner | 2 | + logo + accent color override | `profiles.branding_logo_url`, `profiles.branding_accent` |
| Masterclass | 3 | + hero image + custom footer text | `profiles.branding_hero_url`, `profiles.branding_footer` |

- Accent color overrides the dialect's primary color (but not marginalia / callout accent families — keeps legibility).
- Logo slot: top-right of cover, running header, certificate. SVG preferred; PNG accepted at ≥ 512px.
- Hero image: full-bleed cover asset. 3:4 recommended aspect. Max 3 MB, JPG / PNG / WebP.
- Footer text: single line, 80 char max. Rendered verbatim in every PDF page footer (below page number) and at the bottom of web share.

Profile UI extension lives at `/profile` settings tab — a new "Branding" subsection with fields gated by `normalizePlan(plan).tier`.

## Architecture

### Rendering engine

```
┌─────────────────────────────────────────────────────┐
│  Shared rendering source                            │
│  src/components/export/*  (React, Tailwind v4)      │
│    ├─ Core/  (6 shared components)                  │
│    ├─ dialects/                                     │
│    │    ├─ academic/    (footnote, bibliography)    │
│    │    ├─ handson/     (TryThisCard, StepHeader)   │
│    │    ├─ storytelling/ (DropCap, PullQuote)       │
│    │    └─ conversational/ (QAPair, InPlainEnglish) │
│    └─ branding/ (Cover, Footer, Logo slot)          │
└─────────────────────────────────────────────────────┘
             │
     ┌───────┼──────────┬──────────┬─────────────┐
     ▼       ▼          ▼          ▼             ▼
   /course  /share    PDF        SCORM        Marp
  (React)  (React)  (Playwright) (HTML bundle) (adapter)
```

One component tree, four render targets. PDF + SCORM + Web Share share components verbatim. Marp has an adapter that walks the `Curriculum` and emits slide-shaped markdown via the same dialect templates.

### Export flow (PDF)

```
User clicks Export → PDF
     ↓
POST /api/export/pdf  (Vercel, short-lived)
     ↓
  Short course (<~30 pages)? → Vercel function renders + returns blob
     ↓  (or)
  Long course? → Inngest "course/export.requested"
     ↓
Cloud Run Playwright:
   1. Fetch curriculum + creator profile (branding)
   2. Render React server-side to HTML string
   3. browser.newPage() → setContent(html) → emulateMedia("print")
   4. page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
   5. Upload to Supabase bucket `exports/<courseId>/<hash>.pdf`
   6. Signed URL back to client via polling endpoint
```

Vercel-vs-Cloud-Run threshold is page count, not tier. Crash / short / full almost always fit under 300s on Vercel. Masterclass (60–120 page output) reliably needs Cloud Run.

### Printed-page CSS strategy

- CSS `@page` rules set A4 dimensions, margins, running headers/footers.
- `break-before` / `break-after` / `break-inside: avoid` govern page splits — no manual coordinate math.
- `@page :first`, `@page :left`, `@page :right` handle cover and recto/verso asymmetry.
- Fonts loaded via `@font-face` with `font-display: block` (ensures fully-loaded before Playwright captures).
- Size targeted at 210×297 mm with 22 mm outer / 24 mm inner margins to match current mental model.

### Data model changes

Single migration `supabase/migrations/018_export_personalisation.sql`:

```sql
ALTER TABLE profiles
  ADD COLUMN branding_logo_url   text,
  ADD COLUMN branding_accent     text,       -- hex #rrggbb
  ADD COLUMN branding_hero_url   text,
  ADD COLUMN branding_footer     text;

-- RLS: users can read/write their own profile row (existing policy covers this)

-- Citation storage: denormalised as JSON on curriculum (already stored as JSON blob on courses.data)
-- No SQL change needed; regen types after Curriculum type extension.
```

Plus `src/types/curriculum.ts` adds `Citation` type + optional `citations?: Citation[]` on `Curriculum` (see §5).

### File structure (new / changed)

```
src/
├─ components/
│  └─ export/                       [NEW — shared React export component library]
│     ├─ Core/
│     │  ├─ Cover.tsx
│     │  ├─ TableOfContents.tsx
│     │  ├─ ModuleOpener.tsx
│     │  ├─ LessonPage.tsx
│     │  ├─ QuizBlock.tsx
│     │  └─ Certificate.tsx
│     ├─ dialects/
│     │  ├─ academic/
│     │  │  ├─ Footnote.tsx
│     │  │  ├─ Marginalia.tsx
│     │  │  └─ BibliographyPage.tsx
│     │  ├─ handson/
│     │  │  ├─ TryThisCard.tsx
│     │  │  ├─ StepHeader.tsx
│     │  │  └─ MaterialsList.tsx
│     │  ├─ storytelling/
│     │  │  ├─ ChapterBreak.tsx
│     │  │  ├─ DropCap.tsx
│     │  │  └─ PullQuote.tsx
│     │  └─ conversational/
│     │     ├─ QAPair.tsx
│     │     ├─ InPlainEnglishBox.tsx
│     │     └─ ReadingTimePill.tsx
│     ├─ branding/
│     │  ├─ CreatorIdentity.tsx
│     │  └─ HeroImage.tsx
│     ├─ markdown/
│     │  └─ DialectMarkdown.tsx     [parses > 💡 / > ❓ / > "…" conventions]
│     └─ page-css/
│        ├─ handbook-core.css
│        ├─ academic.css
│        ├─ handson.css
│        ├─ storytelling.css
│        └─ conversational.css
├─ lib/
│  └─ export/                       [NEW — server-side render + orchestration]
│     ├─ renderPdf.ts               [Playwright entry point]
│     ├─ renderHtml.ts              [React→HTML SSR]
│     ├─ buildMarpDeck.ts           [curriculum → slide markdown]
│     ├─ buildScormBundle.ts        [HTML + manifest.xml → zip]
│     └─ branding.ts                [profile → branding tokens]
├─ app/
│  ├─ api/
│  │  └─ export/
│  │     ├─ pdf/route.ts            [NEW]
│  │     ├─ scorm/route.ts          [NEW, replaces existing generator call]
│  │     └─ marp/route.ts           [NEW]
│  ├─ course/[id]/
│  │  └─ course-content.tsx         [REWRITE — consume Core components]
│  ├─ share/
│  │  └─ share-content.tsx          [REWRITE — consume Core components]
│  └─ profile/
│     └─ branding-section.tsx       [NEW — Planner logo+accent, Masterclass +hero+footer]
└─ lib/
   ├─ pdf/generatePDF.ts            [DELETE after Phase 1 cutover]
   ├─ exports/generateDocx.ts       [REFRESH — apply dialect palette + heading styles]
   ├─ exports/generateNotionHtml.ts [REFRESH]
   ├─ exports/generateNotionMarkdown.ts [REFRESH]
   ├─ exports/generateScorm.ts      [DELETE — replaced by buildScormBundle.ts]
   └─ exports/generateNotebookLMMarkdown.ts [REFRESH structure]

supabase/
└─ migrations/
   └─ 018_export_personalisation.sql [NEW]
```

## Rollout — five phases

Phased so each one ships value on its own. Rough sizing; implementation plan will refine.

| Phase | Scope | ~LoC | Can ship alone? |
|---|---|---|---|
| **1 · Foundation + Shared Core PDF** | Playwright infra on Cloud Run. `src/components/export/Core/*` + `handbook-core.css`. New `/api/export/pdf` route (sync + async paths). Cutover from jsPDF (keep old file during transition behind feature flag). Zero dialect-specific features yet. | ~1,500 | ✅ immediately replaces jsPDF |
| **2 · Web Share + SCORM reuse** | Rewrite `course-content.tsx` + `share-content.tsx` to consume Core components. `buildScormBundle.ts` replaces `generateScorm.ts`. | ~700 | ✅ after Phase 1 |
| **3 · 4 dialects + content model** | `Citation` type extension on `Curriculum`, academic pipeline wiring (CrossRef already exists), all four dialect component folders, prompt updates per dialect (Filippo coord), markdown convention parser in `DialectMarkdown.tsx`. | ~1,800 | ✅ — courses without new prompts degrade gracefully to Core |
| **4 · Marp slides + secondary refresh** | Marp theme files per dialect, `buildMarpDeck.ts`. Palette + heading refresh on `generateDocx.ts` / `generateNotion*.ts` / `generateNotebookLMMarkdown.ts`. | ~900 | ✅ |
| **5 · Personalisation UI + upload pipeline** | Migration 018 (branding fields on `profiles`). `/profile` branding subsection (tier-gated). Supabase bucket + signed upload. Image validation (dimensions, type, size). Wires new fields into export renderer. | ~700 | ✅ |

Feature flag: `EXPORT_V2_ENABLED` (env var) toggles new pipeline. Default false until Phase 1 is green.

## Success metrics

- **Zero layout defects** on a fixed 12-course regression suite (crash / short / full / masterclass × 4 teaching styles — one course per combination). "Defect" = text overlap, orphaned heading, broken table, quiz split across page, page-break mid-sentence. Measured by visual regression test (Playwright screenshot diff against baseline).
- **PDF render latency p95 < 15s for full-length, p95 < 45s for masterclass** (Cloud Run). Current jsPDF is under 5s, but output is broken — latency headroom is worth it.
- **Share-view bounce rate ↓ ≥ 10%** month-over-month post-launch (proxies "the course looks worth reading" for visitors arriving via a creator's share link).
- **Masterclass branding activation** — % of Masterclass creators with a non-null `branding_logo_url` — target ≥ 40% by end of month 2.
- **Support-ticket signal** — tag volume for "my PDF looks bad / broken / unprofessional" drops to ≤ 2/month (baseline: estimate from tickets received during April 2026).
- **No increase in 5xx rate** on `/api/export/*` compared to current export endpoints.

## Open questions

- **Content-generation cost impact.** Dialect-specific prompting (§5) adds tokens per module generation — need to sample against current `claude_call_success` cost telemetry before full rollout. Filippo owns this measurement. Acceptable ceiling: +10% OTPM on average. If above, reduce dialect-specific prompt content or feature-flag.
- **Font licensing.** Iowan Old Style Roman ships with macOS; may not have a web-licensed equivalent for server-side Playwright rendering. If licensing blocks, fall back to **Source Serif 4** (SIL OFL) for long-form serif work. No production impact either way.
- **`/share/opengraph-image` unbranding** — confirm with Gianmarco: OG images accompany a shared link. The page surrounding the OG image may itself be Syllabi (the public share page). The OG image is *part of* the creator's export artifact in spirit — consistent with §7 it should go unbranded. If the share *landing* page also needs rebranding as part of this, that's additional scope not counted in the phase sizing above.
- **DOCX dialect expression ceiling.** `docx` lib supports cover page, heading styles, shaded paragraphs, tables, and section breaks — enough for Core + subtle per-dialect palette. Margin-notes (marginalia) are not supported and will be inlined as footnotes in academic DOCX. Pull quotes render as centered italic shaded paragraphs. Accept both compromises; call out in release notes so Masterclass creators know the "full" experience is PDF.
- **Masterclass hero image aspect ratio rigour.** PDF cover is portrait (3:4) but web share hero is usually landscape. Auto-crop with object-fit or ask creators to upload two? Recommend v1: single portrait upload, object-cover on landscape rendering.

## References

- Brainstorm transcript: `.superpowers/brainstorm/4987-1776967661/` (8 visual screens, final recap at `decision-recap.html`)
- Parent Notion page: [syllabi.online — AI Course Generator](https://www.notion.so/33015a619d1f8105b234c51afa599400)
- Claude Code Context doc: [🤖 Claude Code Context — READ FIRST](https://www.notion.so/34315a619d1f81c79fd1cce8deaeef54)
- Related recently-shipped spec: [🎨 Dashboard v2 Unified Design (2026-04-20)](https://www.notion.so/34815a619d1f8112ab0bdc1dbcfc61c0) — same visual language for the export *picker*; this spec is about what the picker produces.
- Rendering engine reference: Playwright's [paged media docs](https://playwright.dev/docs/api/class-page#page-pdf) · CSS [Paged Media Module](https://www.w3.org/TR/css-page-3/).

---

*Spec authored during brainstorm session on 2026-04-23 with visual companion. Mirrors to Notion under the Syllabi parent page.*
