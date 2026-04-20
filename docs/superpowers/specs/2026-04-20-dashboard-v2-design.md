# Dashboard v2 — Unified Design Spec

**Date**: 2026-04-20
**Author**: Gianmarco + Claude (brainstorming)
**Status**: Design approved — implementation plan pending
**Scope**: `/profile` dashboard + `/course/[id]` export alignment

---

## Problem

Two complaints from paying users (Gianmarco + Filippo, both Masterclass):

1. **"The dashboard is locked"** — even as Masterclass subscribers, the UI treats us as Free: shows lock icons on every feature, labels the plan "Free", surfaces "Upgrade to Masterclass" strips we already paid for.
2. **"Where is NotebookLM Slides / SCORM / Word?"** — only 3 export formats (Download-aliased PDF, Notion, Share) live on the profile card. The other 5 are buried inside `/course/[id]`, behind a single Download icon that used to silently save a PDF.

Both complaints trace to the same root: a split-brain between canonical and legacy vocabulary, and an under-designed export surface.

## Root-cause analysis (the "locked" bug)

**Data layer writes canonical plan names; the UI reads legacy plan names.**

| Surface | Value | Source |
|---|---|---|
| Stripe webhook `→` `profiles.plan` | `"masterclass"` / `"planner"` / `"free"` | `src/app/api/webhooks/stripe/route.ts:149,183,253,403` |
| `src/lib/pricing/tiers.ts:59-64` | canonical (`planner`, `masterclass`, `enterprise`, `free`) | canonical source of truth |
| `src/app/profile/page.tsx:824-827, 1016, 1641, 1654-1659, 2082, 2168` | legacy (`pro`, `pro_max`) | read-side drift |

`tierOrFallback()` already normalises legacy → canonical going **in**, but nothing normalises going **out**. The profile page bypasses the helper entirely and matches raw strings. A real Masterclass user with `plan === "masterclass"` therefore falls through every legacy check and lands in the Free branch.

## Design goals

1. Masterclass subscribers land on a dashboard that **recognises their tier** — no accidental lock icons, no "upgrade" nag, plan label correct.
2. Every export format is **discoverable without leaving the dashboard** — one click on a card, all 8 formats visible with names (not mystery icons).
3. Tier gating is **honest and consistent** — amber ★ always marks Masterclass formats, locked states show a single upgrade strip, never per-tile nag.
4. `/course/[id]` and the dashboard card use the **same visual grammar** for exports — users learn one pattern.
5. **No structural navigation change** — keep the 4 tabs users already know (Overview / My Courses / New Course / Account).
6. **Zero webhook or Stripe changes** — this is a UI + read-side fix only.

## § 1. Data layer fix (blocking — ship before design changes)

### Goal
Eliminate the canonical/legacy mismatch on the read side of `/profile/page.tsx`.

### Design

Introduce one pure helper (co-located in `src/lib/pricing/tiers.ts` — same file as `tierOrFallback`) and use it everywhere the profile page currently matches raw plan strings. Pure function, not a React hook — no state, no subscriptions, just derivation:

```ts
export type Tier = "free" | "planner" | "masterclass" | "enterprise";

export function normalizePlan(rawPlan: string | null | undefined): {
  tier: Tier;
  isPaid: boolean;
  isMasterclass: boolean;
  isPlanner: boolean;
  isFree: boolean;
  label: "Free" | "Planner" | "Masterclass" | "Enterprise";
} {
  const tier = tierOrFallback(rawPlan);
  return {
    tier,
    isPaid: tier !== "free",
    isMasterclass: tier === "masterclass" || tier === "enterprise",
    isPlanner: tier === "planner",
    isFree: tier === "free",
    label: ({ free: "Free", planner: "Planner", masterclass: "Masterclass", enterprise: "Enterprise" } as const)[tier],
  };
}
```

Usage: `const plan = normalizePlan(userProfile?.plan); if (plan.isMasterclass) { … }`.

### Replacement table (`src/app/profile/page.tsx`)

| Line(s) | Before | After |
|---|---|---|
| 824 | `plan === "pro_max" ? "Masterclass" : plan === "pro" ? "Planner" : "Free"` | `label` |
| 826-827 | `plan === "pro_max" ? <amber> : plan === "pro" ? <violet> : <slate>` | switch on `tier` |
| 1016 | `plan === "pro"` | `isPlanner` |
| 1405, 1414 | `plan === "pro_max" && …` | `isMasterclass && …` |
| 1442 | `plan === "free"` | `isFree` |
| 1641 | `plan !== "pro_max"` | `!isMasterclass` |
| 1654-1659 | `plan !== "pro_max"` ×6 | `!isMasterclass` ×6 |
| 1688, 1699 | `plan === "free"`, `plan === "pro"` | `isFree`, `isPlanner` |
| 2015 | `isFreeUser={plan === "free"}` | `isFreeUser={isFree}` |
| 2082 | 3-branch `plan === "free" / "pro" / …` | switch on `tier` |
| 2088, 2103 | `plan !== "pro_max"` / `plan === "free"` | `!isMasterclass` / `isFree` |
| 2168 | cast `plan as "free" | "planner" | "masterclass" | "enterprise"` | `tier` directly |

Same pattern for any other file matching `"pro" | "pro_max"` strings — audit via `grep -r '"pro_max"\|"pro"' src/app src/components`.

### Verification

- Log in as Filippo (Masterclass): plan label = "Masterclass", no locked-features strip, no "Upgrade to Masterclass" CTAs on cards.
- Log in as a Planner test user: €10 upgrade CTA on cards (line 1016 equivalent), no NLM lock icons on PDF/Markdown, locks on NLM formats.
- Log in as Free: locked strip visible, all legacy checks green.
- Run `rg '"pro"|"pro_max"' src/` — should return zero matches outside `tierOrFallback` and `LEGACY_PRICE_IDS`.

## § 2. Tab structure (kept, polished)

### Goal
No structural nav change; just refresh what lives inside tabs.

### Design

- Keep 4 tabs: `Overview · My Courses · New Course · Account` (unchanged IDs, labels, icons).
- Replace the stealth plan label in the top bar (`profile/page.tsx:824`) with an **amber pill** "★ MASTERCLASS" for paid users (violet for Planner, slate "Free" for Free). The pill lives next to the theme toggle, right side of the header row.
- Overview tab gets a new **benefits strip** (see §3).
- My Courses tab: cards change per §4.
- New Course tab: unchanged.
- Account tab: unchanged except replacing legacy plan checks.

## § 3. Masterclass benefits strip (Overview tab)

### Goal
Replace "upgrade to X" nag with "here's what your plan gives you" affirmation.

### Design

A horizontal strip below the welcome headline on the Overview tab. Content is tier-dependent.

**Masterclass strip**:
```
⚡ 8 credits · 🎧 4 podcasts · ▣ 4 slide decks · 🎓 SCORM unlocked
```
- Amber background (`bg-amber-500/5`), amber border (`border-amber-500/15`).
- Numbers pulled from `userProfile.generations_used` and `generations_limit` (already fetched).
- Copy shifts when credits are low (< 3): "⚡ 2 credits left — resets April 30".

**Planner strip**:
```
⚡ 8 skeletons · 📄 PDF · 📝 Word · 📥 Notion · 🔗 Share     [ Upgrade → NLM €10 ]
```
- Violet background (`bg-violet-500/5`), violet border.
- Right-side CTA links to PaywallModal prefilled with `planner→masterclass` upgrade path.

**Free strip**:
```
⚡ 1 skeleton · 📄 PDF · M↓ Markdown · 🔗 Share     [ See plans → ]
```
- Slate background, muted colors.
- Right-side CTA opens PaywallModal.

### Placement
Lives in the Overview tab, directly under the welcome `<h1>`, above the recent-courses grid. ~40 px tall, single row, responsive collapse to two rows on mobile (< 640 px).

## § 4. Course card — collapsed + expanded states

### Goal
Every format discoverable in one click; card stays clean when collapsed.

### Collapsed state

The card footer action row is simplified:

```
✎ Edit     ↗ Share     👁 View     ⧉ Duplicate                    [ Exports ▼ ]
```

- 4 monochrome ghost icon buttons (lucide `Pencil`, `Share2`, `Eye`, `Copy`), 26 × 26 px, muted hover tints matching existing palette (indigo / cyan / amber / pink).
- **Removed**: standalone `FileText` (Notion) icon and `Download` icon. Both move into the Exports grid.
- **Exports pill**: right-aligned, `bg-gradient-to-r from-violet-600/15 to-indigo-600/15`, `border-violet-500/30`, 11 px text "Exports", arrow `▲`/`▼` flips on expand.

The pill AND the card body both trigger the same expand state (leveraging existing `setExpandedId(gen.id)` on line 906). No new state machine.

### Expanded state — export grid

Slides down inside the card (existing expanded-content region, `AnimatePresence` already wraps it). First block of the expanded region is an 8-tile grid: `grid grid-cols-4 gap-2` on desktop, `grid-cols-2` on mobile.

Each tile:

```
┌─────────────────┐
│   📄 (colored)  │   ← 16 px lucide icon
│   PDF           │   ← 10 px white, font-weight 500
│   Printable     │   ← 8 px muted subtitle
└─────────────────┘
```

Padding `0.6rem 0.5rem`, `rounded-md` (6 px), background `<color>/6`, border `<color>/20`, all translucent so the card gradient shows through.

### Tile catalogue

| # | Icon (lucide) | Color | Label | Subtitle | Tier | Handler (already exists) |
|---|---|---|---|---|---|---|
| 1 | `FileText` | violet | PDF | Printable | all | `handleDownloadPDF` (dashboard copy, already fixed to call `.save()`) |
| 2 | `FileDown` | blue | Word | .docx | planner+ | `handleExportDocx` |
| 3 | `Code2` | slate | Markdown | Plain text | all | `handleCopyMarkdown` |
| 4 | `FileCode` | purple | Notion | Copy HTML | planner+ | `handleExportNotion` (copies HTML to clipboard) |
| 5 | `GraduationCap` | emerald | SCORM | LMS-ready | masterclass | `handleExportScorm` |
| 6 | `Headphones` ★ | orange | NLM Audio | Podcast | masterclass | `handleExportNotebookLMAudio` |
| 7 | `Presentation` ★ | pink | NLM Slides | Marp deck | masterclass | `handleExportNotebookLMSlides` |
| 8 | `Link2` | cyan | Share | Public URL | all | `handleShareLink` (already exists as `handleShareCourse`) |

(Icon choices are from `lucide-react`, already a project dependency. If any name drifts in a future lucide release, swap to the closest equivalent — the spec pins semantics, not the string.)

The ★ in the table is a visual amber dot top-right of the tile — always visible for tiles 6 and 7, regardless of user tier (badge = format identity, not gating).

### Tier-aware states

- **Masterclass user**: all 8 tiles fully enabled, opacity 1.
- **Planner user**: tiles 1-4 + 8 enabled. Tiles 5/6/7 dim to `opacity-55`, show `Lock` icon top-right (replaces the ★ for 6/7), clicking them does not trigger the handler — instead opens the PaywallModal with `planner→masterclass` upgrade context.
- **Free user**: tiles 1 + 3 + 8 enabled. Everything else dimmed + locked as above.

Bottom of the grid shows **one** upgrade strip (never per-tile):

- Masterclass: strip hidden.
- Planner: gradient violet→fuchsia, text "Unlock NLM Audio, Slides & SCORM", CTA "Upgrade €10 →".
- Free: same gradient, text "Unlock all export formats · Word · Notion · SCORM · NLM Audio & Slides", CTA "See plans →".

### Deep-link caption

Directly under the upgrade strip (or directly under the grid for Masterclass), right-aligned, muted:

```
Full toolbar with speaker notes & metadata → Open course view
```

Links to `/course/[id]#export-share`. Keeps the per-course page as the power-user surface; the dashboard is the quick-access surface.

### Expanded region — below the export grid

The existing expanded content (modules preview, objectives, etc.) stays below the export grid, separated by a thin `<Separator />`. No other change to existing expand behavior.

## § 5. `/course/[id]` export toolbar alignment

### Goal
Same visual grammar as the card grid — users who learn one surface know the other.

### Design

The existing Export & Share section (introduced in commit `a8a10d9`) at `src/app/course/[id]/course-content.tsx` gets restyled using the same tile structure as §4:

- 4×2 grid, same colors, same icons, same subtitles.
- Each tile slightly larger (desktop): 80 px tall vs. 60 px on the card, so the course page feels like the "main" surface.
- Adds one feature: a small **export history** chip row above the grid:

```
Recently exported: PDF 2× · NLM Slides 1× · Share link
```

Pulled from `localStorage` (`syllabi.exportHistory.<courseId>` array of `{format, ts}`). Appends on every successful export handler. Zero server-side state.

Tier gating on `/course/[id]` mirrors the card grid (PaywallModal, single upgrade strip at bottom). Remove any legacy plan-string checks on this page in the same pass as §1.

## § 6. Empty states & first run

- First-time Masterclass user (0 courses): Overview strip still shows entitlements, My Courses shows a single "Generate your first course →" card that routes to the New Course tab.
- First export click logs to `exportHistory` and triggers a subtle amber sonner toast: "PDF saved · 1 of unlimited this month" (Masterclass) / "PDF saved · 1 of 1 this month" (Free).

## Out of scope

Explicitly not in this spec:

- Sidebar nav / ⌘K palette (rejected in favour of keeping 4 tabs).
- New export formats beyond NotebookLM Slides (shipped 2026-04-19).
- Stripe webhook or price-ID changes.
- Tier config changes (caps, feature flags).
- Course editor, onboarding quiz, generation flow — all untouched.
- Mobile nav redesign beyond the export grid's `grid-cols-2` fallback.

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `normalizePlan` missed a call site | Medium | Grep pass for `"pro"\|"pro_max"` across `src/`; add ESLint rule forbidding the string literals in UI files |
| Expanded card becomes too tall on mobile | Low | `grid-cols-2` fallback under 640 px; each tile is ~56 px |
| Upgrade strip feels like nag for Planner users | Low | Appears only inside the expanded grid (user initiated), never on collapsed card; single CTA, not per-tile |
| Users rely on the legacy Download-icon PDF-save behavior | Low | The fix already landed (commit `2fe6b03`); dashboard card no longer has a standalone Download icon |
| Export history in localStorage inflates forever | Low | Cap at 50 most recent entries per course, evict FIFO |

## Success metrics

- Zero `"pro_max"` / `"pro"` string-literal reads in `src/app/**` after the fix.
- Filippo's login shows "Masterclass" pill, no locked strip.
- Per-user export click-through rate on NLM Slides and SCORM increases (prev. ~0, bounded by discoverability).
- No support tickets in the shape of "where is NotebookLM / SCORM / Word".

## Implementation phases

The design is coherent enough to ship in phases; each phase is independently releasable:

1. **Phase A — data fix** (§1 only). Small, safe, unblocks Masterclass users immediately. ~200 LoC.
2. **Phase B — header pill + benefits strip** (§2, §3). Visual polish on Overview tab. ~150 LoC.
3. **Phase C — card export grid** (§4). Biggest visual change; depends on A. ~350 LoC.
4. **Phase D — course page alignment + history** (§5). Cosmetic restyle of the existing toolbar + localStorage history. ~200 LoC.
5. **Phase E — empty states + toasts** (§6). Polish pass. ~80 LoC.

Total: ~1000 LoC across `src/app/profile/page.tsx`, `src/app/course/[id]/course-content.tsx`, new `src/lib/pricing/useNormalizedPlan.ts`, new `src/components/ExportGrid.tsx` (shared tile grid), new `src/lib/exports/exportHistory.ts`.

---

*Notion mirror: publish under the Syllabi parent page for Filippo review, per user preference.*
