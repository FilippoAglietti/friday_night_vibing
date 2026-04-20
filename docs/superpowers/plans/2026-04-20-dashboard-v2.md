# Dashboard v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the unified Dashboard v2 from spec `2026-04-20-dashboard-v2-design.md` — fix the "Masterclass looks Free" canonicalisation bug and land a tier-aware inline export grid on course cards, aligned with the `/course/[id]` toolbar.

**Architecture:** Five independently-releasable phases. Phase A is a pure read-side normalisation (zero DB/webhook changes). Phases B–E add UI components and wiring around a new shared `<ExportGrid>` primitive used on both `/profile` cards and `/course/[id]`.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · shadcn · lucide-react · framer-motion. Tests use the existing `vitest` convention (no runner currently wired into `package.json`; verify with `bunx vitest run <path>` or `npx vitest run <path>` — the type-check via `npx tsc --noEmit` is the always-green acceptance gate). Manual verification via `npm run dev` + browser.

**Spec**: `docs/superpowers/specs/2026-04-20-dashboard-v2-design.md`

---

## File map

### Create

| Path | Responsibility |
|---|---|
| `src/lib/pricing/__tests__/normalizePlan.test.ts` | Vitest-style tests for the normalisation helper |
| `src/components/dashboard/PlanBadge.tsx` | Tier pill (amber/violet/slate) shown in header |
| `src/components/dashboard/BenefitsStrip.tsx` | Tier-specific horizontal strip for Overview tab |
| `src/components/dashboard/ExportTile.tsx` | Single format tile primitive (icon + label + subtitle, lock state) |
| `src/components/dashboard/ExportGrid.tsx` | 4×2 tier-aware grid of `<ExportTile>` + upgrade strip + deep-link caption |
| `src/lib/exports/exportHistory.ts` | localStorage-backed recent-export log, 50-entry FIFO cap |

### Modify

| Path | Change |
|---|---|
| `src/lib/pricing/tiers.ts` | Add `normalizePlan()` pure helper alongside existing `tierOrFallback` |
| `src/app/profile/page.tsx` | Replace 13 legacy-plan string matches; wire `<PlanBadge>`, `<BenefitsStrip>`, `<ExportGrid>` |
| `src/app/course/[id]/course-content.tsx` | Replace the existing Export & Share section's ad-hoc button grid with `<ExportGrid>`; add history chip row |
| `src/components/PaywallModal.tsx` | (read-only check — ensure it still accepts the canonical `Tier` union; no changes expected) |

---

# Phase A — Data layer fix (BLOCKING)

Ships the canonical/legacy normalisation. After this phase, Masterclass users see their real plan.

## Task A1: Add `normalizePlan` helper with tests

**Files:**
- Modify: `src/lib/pricing/tiers.ts` (append at end of file)
- Create: `src/lib/pricing/__tests__/normalizePlan.test.ts`

- [ ] **Step A1.1: Write the failing test file**

Create `src/lib/pricing/__tests__/normalizePlan.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { normalizePlan } from "@/lib/pricing/tiers";

describe("normalizePlan", () => {
  it("maps canonical plan strings to correct flags", () => {
    const p = normalizePlan("masterclass");
    expect(p.tier).toBe("masterclass");
    expect(p.isMasterclass).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.isPlanner).toBe(false);
    expect(p.isFree).toBe(false);
    expect(p.label).toBe("Masterclass");
  });

  it("normalises legacy pro_max to masterclass", () => {
    const p = normalizePlan("pro_max");
    expect(p.tier).toBe("masterclass");
    expect(p.isMasterclass).toBe(true);
    expect(p.label).toBe("Masterclass");
  });

  it("normalises legacy pro to planner", () => {
    const p = normalizePlan("pro");
    expect(p.tier).toBe("planner");
    expect(p.isPlanner).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.label).toBe("Planner");
  });

  it("treats enterprise as masterclass-equivalent for feature checks", () => {
    const p = normalizePlan("enterprise");
    expect(p.tier).toBe("enterprise");
    expect(p.isMasterclass).toBe(true);
    expect(p.isPaid).toBe(true);
    expect(p.label).toBe("Enterprise");
  });

  it("falls back to free for null/undefined/unknown", () => {
    expect(normalizePlan(null).isFree).toBe(true);
    expect(normalizePlan(undefined).isFree).toBe(true);
    expect(normalizePlan("garbage").isFree).toBe(true);
    expect(normalizePlan(null).label).toBe("Free");
  });

  it("isPaid excludes free only", () => {
    expect(normalizePlan("free").isPaid).toBe(false);
    expect(normalizePlan("planner").isPaid).toBe(true);
    expect(normalizePlan("masterclass").isPaid).toBe(true);
    expect(normalizePlan("enterprise").isPaid).toBe(true);
  });
});
```

- [ ] **Step A1.2: Run tests (expect FAIL — function not exported yet)**

Run: `npx vitest run src/lib/pricing/__tests__/normalizePlan.test.ts`

Expected: compile error / `normalizePlan is not a function`. If no vitest runner is available, run `npx tsc --noEmit` and expect a TS2305 "Module has no exported member 'normalizePlan'" error.

- [ ] **Step A1.3: Implement the helper**

Append to `src/lib/pricing/tiers.ts` (after the `tierOrFallback` function, line 65):

```ts
export function normalizePlan(rawPlan: string | null | undefined): {
  tier: Tier;
  isPaid: boolean;
  isMasterclass: boolean;
  isPlanner: boolean;
  isFree: boolean;
  label: "Free" | "Planner" | "Masterclass" | "Enterprise";
} {
  const tier = tierOrFallback(rawPlan);
  const labels = { free: "Free", planner: "Planner", masterclass: "Masterclass", enterprise: "Enterprise" } as const;
  return {
    tier,
    isPaid: tier !== "free",
    isMasterclass: tier === "masterclass" || tier === "enterprise",
    isPlanner: tier === "planner",
    isFree: tier === "free",
    label: labels[tier],
  };
}
```

- [ ] **Step A1.4: Re-run tests (expect PASS)**

Run: `npx vitest run src/lib/pricing/__tests__/normalizePlan.test.ts`
Expected: all 6 tests pass. Fallback: `npx tsc --noEmit` returns zero errors.

- [ ] **Step A1.5: Commit**

```bash
git add src/lib/pricing/tiers.ts src/lib/pricing/__tests__/normalizePlan.test.ts
git commit -m "feat(pricing): add normalizePlan helper for canonical/legacy reads"
```

## Task A2: Replace legacy plan reads in `profile/page.tsx`

**Files:**
- Modify: `src/app/profile/page.tsx` (13 call sites)

- [ ] **Step A2.1: Import the helper**

At `src/app/profile/page.tsx:1-73` (import block), add:

```ts
import { normalizePlan } from "@/lib/pricing/tiers";
```

Place it next to the existing pricing imports.

- [ ] **Step A2.2: Derive `plan` once in the component**

Inside the main `ProfilePage` component body, directly after `userProfile` is destructured/read, add the derivation. Find the spot where `userProfile` first becomes available (it's a state variable — add the derivation immediately after the state definitions, before any JSX). Insert:

```ts
const plan = normalizePlan(userProfile?.plan);
```

This is a pure derivation; React will recompute on each render.

- [ ] **Step A2.3: Replace line 824 (plan label)**

Find:
```ts
const planLabel = userProfile?.plan === "pro_max" ? "Masterclass" : userProfile?.plan === "pro" ? "Planner" : "Free";
```
Replace with:
```ts
const planLabel = plan.label;
```

- [ ] **Step A2.4: Replace lines 826-827 (plan badge colors)**

Find the existing ternary producing the badge class string. Replace with a switch:

```ts
const planBadgeClass =
  plan.isMasterclass ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
  : plan.isPlanner ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
  : "bg-muted/40 text-muted-foreground border-border/40";
```

- [ ] **Step A2.5: Replace line 1016 (€10 Planner upsell gate)**

Find:
```tsx
{userProfile?.plan === "pro" && (
```
Replace with:
```tsx
{plan.isPlanner && (
```

- [ ] **Step A2.6: Replace lines 1405 and 1414 (Masterclass generations-limit branches)**

Find:
```tsx
) : userProfile?.plan === "pro_max" && (userProfile.generations_limit < 0 || userProfile.generations_limit >= 1000) ? (
```
Replace with:
```tsx
) : plan.isMasterclass && userProfile && (userProfile.generations_limit < 0 || userProfile.generations_limit >= 1000) ? (
```

Find:
```tsx
) : userProfile?.plan === "pro_max" ? (
```
Replace with:
```tsx
) : plan.isMasterclass ? (
```

- [ ] **Step A2.7: Replace line 1442 (`plan === "free"` gate)**

Find:
```tsx
{userProfile?.plan === "free" && (
```
Replace with:
```tsx
{plan.isFree && (
```

- [ ] **Step A2.8: Replace line 1641 (locked-features strip visibility)**

Find:
```tsx
{userProfile && userProfile.plan !== "pro_max" && (
```
Replace with:
```tsx
{userProfile && !plan.isMasterclass && (
```

- [ ] **Step A2.9: Replace lines 1654-1659 (six feature items' `locked` flag)**

Find each occurrence of `locked: userProfile.plan !== "pro_max"` (6 of them, lines 1654–1659). Use find-and-replace:

```ts
locked: userProfile.plan !== "pro_max"
```
→
```ts
locked: !plan.isMasterclass
```

- [ ] **Step A2.10: Replace lines 1688 and 1699**

Find:
```tsx
{userProfile.plan === "free" && (
```
Replace with:
```tsx
{plan.isFree && (
```

Find:
```tsx
{userProfile.plan === "pro" && (
```
Replace with:
```tsx
{plan.isPlanner && (
```

- [ ] **Step A2.11: Replace line 2015 (PaywallModal `isFreeUser` prop)**

Find:
```tsx
isFreeUser={userProfile?.plan === "free"}
```
Replace with:
```tsx
isFreeUser={plan.isFree}
```

- [ ] **Step A2.12: Replace line 2082 (generations-limit copy)**

Find the multi-branch ternary:
```tsx
{userProfile?.plan === "free" ? "1 course skeleton/month included" : userProfile?.plan === "pro" ? "15 skeletons/month" : userProfile && userProfile.generations_limit > 0 && userProfile.generations_limit < 1000 ? `${userProfile.generations_limit} Masterclass generations` : "Unlimited generations"}
```
Replace with:
```tsx
{plan.isFree ? "1 course skeleton/month included" : plan.isPlanner ? "15 skeletons/month" : userProfile && userProfile.generations_limit > 0 && userProfile.generations_limit < 1000 ? `${userProfile.generations_limit} Masterclass generations` : "Unlimited generations"}
```

- [ ] **Step A2.13: Replace lines 2088 and 2103**

Find:
```tsx
{userProfile && (userProfile.plan !== "pro_max" || (userProfile.generations_limit > 0 && userProfile.generations_limit < 1000)) && (
```
Replace with:
```tsx
{userProfile && (!plan.isMasterclass || (userProfile.generations_limit > 0 && userProfile.generations_limit < 1000)) && (
```

Find:
```tsx
{userProfile?.plan === "free" && (
```
Replace with:
```tsx
{plan.isFree && (
```

- [ ] **Step A2.14: Replace line 2168 (PaywallModal currentPlan cast)**

Find:
```tsx
currentPlan={(userProfile?.plan as "free" | "planner" | "masterclass" | "enterprise") || "free"}
```
Replace with:
```tsx
currentPlan={plan.tier}
```

- [ ] **Step A2.15: Verify zero legacy reads remain in `src/app`**

Run:
```bash
rg '"pro"|"pro_max"' src/app/
```
Expected: zero matches (the only remaining matches in the repo should be inside `tierOrFallback` at `src/lib/pricing/tiers.ts:62-63`, the test file, and `src/types/database.types.ts` which is the autogenerated Supabase enum — leave those alone).

- [ ] **Step A2.16: TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step A2.17: Manual browser smoke test**

Run: `npm run dev` and open `http://localhost:3000/profile` logged in as a Masterclass user (Filippo or Gianmarco). Verify:
- Plan badge label reads "Masterclass" (not "Free")
- Plan badge color is amber
- "Unlock with Masterclass" feature strip is **hidden**
- Six feature-list locked icons are gone
- Generation count copy reads "20 Masterclass generations" or "Unlimited"

- [ ] **Step A2.18: Commit Phase A**

```bash
git add src/app/profile/page.tsx
git commit -m "fix(dashboard): normalise plan reads via normalizePlan (Phase A)

Eliminates the canonical/legacy mismatch that made Masterclass users
see the Free dashboard. Zero webhook/DB changes; read-side only."
```

---

# Phase B — Header pill + benefits strip

## Task B1: Build `<PlanBadge>` component

**Files:**
- Create: `src/components/dashboard/PlanBadge.tsx`

- [ ] **Step B1.1: Create the component**

Create `src/components/dashboard/PlanBadge.tsx`:

```tsx
"use client";

import { Crown, Sparkles } from "lucide-react";
import type { Tier } from "@/types/pricing";

interface PlanBadgeProps {
  tier: Tier;
  label: string;
}

export function PlanBadge({ tier, label }: PlanBadgeProps) {
  const isMasterclass = tier === "masterclass" || tier === "enterprise";
  const isPlanner = tier === "planner";

  const classes = isMasterclass
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : isPlanner
    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
    : "bg-muted/40 text-muted-foreground border-border/40";

  const Icon = isMasterclass ? Crown : isPlanner ? Sparkles : null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${classes}`}
    >
      {Icon && <Icon className="size-3" />}
      <span>{label}</span>
    </div>
  );
}
```

- [ ] **Step B1.2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step B1.3: Commit**

```bash
git add src/components/dashboard/PlanBadge.tsx
git commit -m "feat(dashboard): add PlanBadge component (amber/violet/slate pill)"
```

## Task B2: Wire `<PlanBadge>` into the profile header

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step B2.1: Import the badge**

In the import block of `src/app/profile/page.tsx`, add:

```ts
import { PlanBadge } from "@/components/dashboard/PlanBadge";
```

- [ ] **Step B2.2: Replace the inline plan-label render**

Find the JSX that renders `planLabel` with its color classes (around lines 824-827 rendering location — the derivation lines you already changed in Phase A; the render site is slightly below, wrapped in a `<span>` or `<div>`). Replace the entire badge render block with:

```tsx
<PlanBadge tier={plan.tier} label={plan.label} />
```

Delete the local `planLabel` and `planBadgeClass` consts introduced in Phase A if they're now unused.

- [ ] **Step B2.3: Type check + browser smoke**

Run: `npx tsc --noEmit` (expect zero errors) then `npm run dev` and confirm the pill renders with the Crown icon for Masterclass.

- [ ] **Step B2.4: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(dashboard): use PlanBadge in header"
```

## Task B3: Build `<BenefitsStrip>` component

**Files:**
- Create: `src/components/dashboard/BenefitsStrip.tsx`

- [ ] **Step B3.1: Create the component**

Create `src/components/dashboard/BenefitsStrip.tsx`:

```tsx
"use client";

import { Zap, FileText, FileDown, Link2, Headphones, Presentation, GraduationCap, Code2 } from "lucide-react";
import type { Tier } from "@/types/pricing";

interface BenefitsStripProps {
  tier: Tier;
  creditsUsed: number;
  creditsLimit: number;
  onUpgrade?: () => void;
}

export function BenefitsStrip({ tier, creditsUsed, creditsLimit, onUpgrade }: BenefitsStripProps) {
  const creditsLeft = creditsLimit < 0 ? Infinity : Math.max(0, creditsLimit - creditsUsed);
  const creditsLabel = creditsLimit < 0 ? "unlimited" : `${creditsLeft} of ${creditsLimit}`;

  if (tier === "masterclass" || tier === "enterprise") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-4 py-2.5 text-[11px] text-amber-200/90">
        <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-amber-400" />{creditsLabel} credits</span>
        <span className="inline-flex items-center gap-1.5"><Headphones className="size-3.5 text-orange-400" />NLM podcasts</span>
        <span className="inline-flex items-center gap-1.5"><Presentation className="size-3.5 text-pink-400" />NLM slide decks</span>
        <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5 text-emerald-400" />SCORM unlocked</span>
      </div>
    );
  }

  if (tier === "planner") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-violet-500/15 bg-violet-500/5 px-4 py-2.5 text-[11px] text-violet-200/90">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-violet-400" />{creditsLabel} skeletons</span>
          <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5 text-violet-400" />PDF</span>
          <span className="inline-flex items-center gap-1.5"><FileDown className="size-3.5 text-blue-400" />Word</span>
          <span className="inline-flex items-center gap-1.5"><Link2 className="size-3.5 text-cyan-400" />Share</span>
        </div>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          Upgrade → NLM €10
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border/40 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5" />{creditsLabel} skeleton</span>
        <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5" />PDF</span>
        <span className="inline-flex items-center gap-1.5"><Code2 className="size-3.5" />Markdown</span>
        <span className="inline-flex items-center gap-1.5"><Link2 className="size-3.5" />Share</span>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
      >
        See plans →
      </button>
    </div>
  );
}
```

- [ ] **Step B3.2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step B3.3: Commit**

```bash
git add src/components/dashboard/BenefitsStrip.tsx
git commit -m "feat(dashboard): add BenefitsStrip component (tier-specific)"
```

## Task B4: Wire `<BenefitsStrip>` into the Overview tab

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step B4.1: Import**

Add to the import block:

```ts
import { BenefitsStrip } from "@/components/dashboard/BenefitsStrip";
```

- [ ] **Step B4.2: Insert in the Overview tab**

Find the Overview tab rendering block (search for `activeTab === "overview"`). Directly below the welcome `<h1>` headline and above the recent-courses/stats grid, insert:

```tsx
{userProfile && (
  <BenefitsStrip
    tier={plan.tier}
    creditsUsed={userProfile.generations_used}
    creditsLimit={userProfile.generations_limit}
    onUpgrade={() => setShowPaywall(true)}
  />
)}
```

- [ ] **Step B4.3: Type check + browser smoke**

Run: `npx tsc --noEmit`. Open `/profile` in browser: Masterclass user sees amber strip with credits + three format chips. Planner sees violet strip with upgrade CTA. Free sees slate strip with "See plans →".

- [ ] **Step B4.4: Commit Phase B**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(dashboard): show tier-specific BenefitsStrip on Overview (Phase B)"
```

---

# Phase C — Course card export grid

## Task C1: Build `<ExportTile>` primitive

**Files:**
- Create: `src/components/dashboard/ExportTile.tsx`

- [ ] **Step C1.1: Create the component**

Create `src/components/dashboard/ExportTile.tsx`:

```tsx
"use client";

import { Lock, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ExportTileProps {
  Icon: LucideIcon;
  label: string;
  subtitle: string;
  colorClass: string;      // e.g. "text-violet-400"
  bgClass: string;         // e.g. "bg-violet-500/6 border-violet-500/20"
  locked?: boolean;
  masterclassOnly?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ExportTile({
  Icon,
  label,
  subtitle,
  colorClass,
  bgClass,
  locked = false,
  masterclassOnly = false,
  onClick,
  disabled = false,
}: ExportTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-md border p-2.5 text-center transition-all ${bgClass} ${locked ? "opacity-55" : "hover:brightness-125"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      title={locked ? `${label} — upgrade to unlock` : label}
    >
      {masterclassOnly && !locked && (
        <Star className="absolute top-1 right-1 size-2.5 fill-amber-400 text-amber-400" />
      )}
      {locked && (
        <Lock className="absolute top-1 right-1 size-2.5 text-muted-foreground" />
      )}
      <Icon className={`size-4 ${locked ? "opacity-40" : ""} ${colorClass}`} />
      <span className="text-[10px] font-medium text-foreground">{label}</span>
      <span className="text-[8px] text-muted-foreground">{subtitle}</span>
    </button>
  );
}
```

- [ ] **Step C1.2: Type check + commit**

```bash
npx tsc --noEmit
git add src/components/dashboard/ExportTile.tsx
git commit -m "feat(dashboard): add ExportTile primitive"
```

## Task C2: Build `<ExportGrid>` with tier-aware states

**Files:**
- Create: `src/components/dashboard/ExportGrid.tsx`

- [ ] **Step C2.1: Create the grid component**

Create `src/components/dashboard/ExportGrid.tsx`:

```tsx
"use client";

import { FileText, FileDown, Code2, FileCode, GraduationCap, Headphones, Presentation, Link2 } from "lucide-react";
import type { Tier } from "@/types/pricing";
import { ExportTile } from "./ExportTile";

export type ExportFormat =
  | "pdf"
  | "word"
  | "markdown"
  | "notion"
  | "scorm"
  | "nlmAudio"
  | "nlmSlides"
  | "share";

export interface ExportGridProps {
  tier: Tier;
  onExport: (format: ExportFormat) => void;
  onLockedClick: (format: ExportFormat) => void;
  onDeepLink?: () => void;
  compact?: boolean;
}

const TILES: Array<{
  format: ExportFormat;
  Icon: typeof FileText;
  label: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
  minTier: "free" | "planner" | "masterclass";
  masterclassOnly?: boolean;
}> = [
  { format: "pdf",       Icon: FileText,       label: "PDF",        subtitle: "Printable",  colorClass: "text-violet-400",  bgClass: "bg-violet-500/6 border-violet-500/20",    minTier: "free" },
  { format: "word",      Icon: FileDown,       label: "Word",       subtitle: ".docx",      colorClass: "text-blue-400",    bgClass: "bg-blue-500/6 border-blue-500/20",        minTier: "planner" },
  { format: "markdown",  Icon: Code2,          label: "Markdown",   subtitle: "Plain text", colorClass: "text-slate-300",   bgClass: "bg-slate-500/6 border-slate-500/20",      minTier: "free" },
  { format: "notion",    Icon: FileCode,       label: "Notion",     subtitle: "Copy HTML",  colorClass: "text-purple-400",  bgClass: "bg-purple-500/6 border-purple-500/20",    minTier: "planner" },
  { format: "scorm",     Icon: GraduationCap,  label: "SCORM",      subtitle: "LMS-ready",  colorClass: "text-emerald-400", bgClass: "bg-emerald-500/6 border-emerald-500/20",  minTier: "masterclass" },
  { format: "nlmAudio",  Icon: Headphones,     label: "NLM Audio",  subtitle: "Podcast",    colorClass: "text-orange-400",  bgClass: "bg-orange-500/6 border-orange-500/20",    minTier: "masterclass", masterclassOnly: true },
  { format: "nlmSlides", Icon: Presentation,   label: "NLM Slides", subtitle: "Marp deck",  colorClass: "text-pink-400",    bgClass: "bg-pink-500/6 border-pink-500/20",        minTier: "masterclass", masterclassOnly: true },
  { format: "share",     Icon: Link2,          label: "Share",      subtitle: "Public URL", colorClass: "text-cyan-400",    bgClass: "bg-cyan-500/6 border-cyan-500/20",        minTier: "free" },
];

function isUnlocked(minTier: "free" | "planner" | "masterclass", tier: Tier): boolean {
  if (minTier === "free") return true;
  if (minTier === "planner") return tier === "planner" || tier === "masterclass" || tier === "enterprise";
  return tier === "masterclass" || tier === "enterprise";
}

export function ExportGrid({ tier, onExport, onLockedClick, onDeepLink, compact = false }: ExportGridProps) {
  const isMasterclass = tier === "masterclass" || tier === "enterprise";
  const isPlanner = tier === "planner";

  let upgradeStrip: { text: string; cta: string } | null = null;
  if (isPlanner) {
    upgradeStrip = { text: "Unlock NLM Audio, Slides & SCORM", cta: "Upgrade €10 →" };
  } else if (!isMasterclass) {
    upgradeStrip = { text: "Unlock all export formats · Word · Notion · SCORM · NLM Audio & Slides", cta: "See plans →" };
  }

  return (
    <div className="space-y-2.5">
      <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4"}`}>
        {TILES.map((t) => {
          const unlocked = isUnlocked(t.minTier, tier);
          return (
            <ExportTile
              key={t.format}
              Icon={t.Icon}
              label={t.label}
              subtitle={t.subtitle}
              colorClass={t.colorClass}
              bgClass={t.bgClass}
              locked={!unlocked}
              masterclassOnly={t.masterclassOnly}
              onClick={() => (unlocked ? onExport(t.format) : onLockedClick(t.format))}
            />
          );
        })}
      </div>

      {upgradeStrip && (
        <button
          type="button"
          onClick={() => onLockedClick("nlmAudio")}
          className="flex w-full items-center justify-between gap-3 rounded-md border border-violet-500/20 bg-gradient-to-r from-violet-500/8 to-fuchsia-500/8 px-3 py-2 text-[11px] text-violet-200 hover:from-violet-500/12 hover:to-fuchsia-500/12 transition-colors"
        >
          <span className="text-left">{upgradeStrip.text}</span>
          <span className="shrink-0 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
            {upgradeStrip.cta}
          </span>
        </button>
      )}

      {onDeepLink && (
        <div className="text-right">
          <button
            type="button"
            onClick={onDeepLink}
            className="text-[10px] text-muted-foreground hover:text-violet-400 transition-colors"
          >
            Full toolbar with speaker notes & metadata → Open course view
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step C2.2: Type check + commit**

```bash
npx tsc --noEmit
git add src/components/dashboard/ExportGrid.tsx
git commit -m "feat(dashboard): add ExportGrid with tier gating and upgrade strip"
```

## Task C3: Replace profile-card action row + integrate `<ExportGrid>`

**Files:**
- Modify: `src/app/profile/page.tsx` (around lines 968-1013 — the card footer action row + expanded region)

- [ ] **Step C3.1: Import**

Add to the import block:

```ts
import { ExportGrid, type ExportFormat } from "@/components/dashboard/ExportGrid";
```

- [ ] **Step C3.2: Add a single export dispatcher in the component scope**

Inside `ProfilePage` (near existing handler definitions), add:

```ts
const handleExportFromCard = (c: Curriculum, gen: Generation, format: ExportFormat) => {
  switch (format) {
    case "pdf":       return handleDownloadPDF(c, gen.teaching_style);
    case "word":      return handleExportDocx(c, gen.teaching_style);
    case "markdown":  return handleCopyMarkdown(c);
    case "notion":    return handleExportNotion(c, gen.teaching_style);
    case "scorm":     return handleExportScorm(c, gen);
    case "nlmAudio":  return handleExportNotebookLMAudio(c);
    case "nlmSlides": return handleExportNotebookLMSlides(c);
    case "share":     return handleShareCourse(gen);
  }
};
```

If any of those handlers don't yet exist in `profile/page.tsx` (grep to confirm), copy them over from `src/app/course/[id]/course-content.tsx` where they were added in commit `a8a10d9`. They are already fully implemented there and are pure client-side — no adaptation needed beyond matching the `(c: Curriculum, ...)` signature.

- [ ] **Step C3.3: Update the card action row**

Find the card footer action row (currently lines 971-1012). Remove:
- the `<Link>` wrapping the `Download` icon (line 975-982)
- the `FileText` (Notion) ghost button (line 983-985)

Keep: Edit (`Pencil`), Share (`Share2`), View (`Eye`), Duplicate (`Copy`).

The action row should now be:

```tsx
<div className="flex items-center justify-between pt-2 border-t border-border/20">
  <span className="text-[10px] text-muted-foreground">{timeAgo(gen.created_at)}</span>
  <div className="flex gap-0.5">
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-indigo-500/10 hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); setEditingGenId(gen.id); setActiveTab("courses"); }} title="Edit Course">
      <Pencil className="size-3.5" />
    </Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-cyan-500/10 hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); handleShareCourse(gen); }} title="Share">
      {copiedId === gen.id ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
    </Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-amber-500/10 hover:text-amber-400" onClick={(e) => { e.stopPropagation(); window.open(`/course/${gen.id}`, "_blank"); }} title="View Course">
      <Eye className="size-3.5" />
    </Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-pink-500/10 hover:text-pink-400" onClick={(e) => { e.stopPropagation(); handleDuplicateCourse(gen); setActiveTab("generate"); }} title="Duplicate & Remix">
      <Copy className="size-3.5" />
    </Button>
  </div>
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : gen.id); }}
    className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-gradient-to-r from-violet-600/15 to-indigo-600/15 px-2.5 py-1 text-[11px] font-medium text-violet-300 hover:from-violet-600/25 hover:to-indigo-600/25 transition-colors"
  >
    Exports <span className="text-[9px] opacity-70">{isExpanded ? "▲" : "▼"}</span>
  </button>
</div>
```

- [ ] **Step C3.4: Insert `<ExportGrid>` at top of expanded region**

Find the expanded content JSX (starts around line 1029 with `{isExpanded && (`). Insert an `<ExportGrid>` as the first block inside that expanded region, before the modules/objectives preview:

```tsx
{isExpanded && (
  <div className="mt-3 pt-3 border-t border-border/20 space-y-3" onClick={(e) => e.stopPropagation()}>
    <ExportGrid
      tier={plan.tier}
      onExport={(format) => handleExportFromCard(c, gen, format)}
      onLockedClick={() => setShowPaywall(true)}
      onDeepLink={() => window.location.assign(`/course/${gen.id}#export-share`)}
    />
    <Separator />
    {/* existing expanded content continues here: modules preview, objectives, etc. */}
  </div>
)}
```

Keep whatever already lives inside the expanded region below the `<Separator />`.

- [ ] **Step C3.5: Type check + browser smoke**

Run: `npx tsc --noEmit`. In browser: click any card to expand. Confirm 8 tiles render; Masterclass user sees all enabled with amber ★ on NLM Audio/Slides; Planner user sees 5 enabled + 3 locked + violet "Upgrade €10" strip; Free sees 3 enabled + 5 locked + "See plans" strip.

- [ ] **Step C3.6: Commit Phase C**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(dashboard): inline tier-aware ExportGrid on card expand (Phase C)"
```

---

# Phase D — Course page toolbar alignment + export history

## Task D1: Build `exportHistory` util

**Files:**
- Create: `src/lib/exports/exportHistory.ts`

- [ ] **Step D1.1: Create the util**

Create `src/lib/exports/exportHistory.ts`:

```ts
export type ExportFormatId =
  | "pdf"
  | "word"
  | "markdown"
  | "notion"
  | "scorm"
  | "nlmAudio"
  | "nlmSlides"
  | "share";

export interface ExportHistoryEntry {
  format: ExportFormatId;
  ts: number;
}

const MAX_ENTRIES = 50;
const KEY_PREFIX = "syllabi.exportHistory.";

function keyFor(courseId: string): string {
  return `${KEY_PREFIX}${courseId}`;
}

export function appendExportEvent(courseId: string, format: ExportFormatId): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(keyFor(courseId));
    const parsed: ExportHistoryEntry[] = raw ? JSON.parse(raw) : [];
    const next: ExportHistoryEntry[] = [...parsed, { format, ts: Date.now() }].slice(-MAX_ENTRIES);
    window.localStorage.setItem(keyFor(courseId), JSON.stringify(next));
  } catch {
    // Quota exceeded or JSON parse failure — silent drop, non-critical.
  }
}

export function readExportHistory(courseId: string): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyFor(courseId));
    return raw ? (JSON.parse(raw) as ExportHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function summarizeExportHistory(courseId: string): Array<{ format: ExportFormatId; count: number }> {
  const history = readExportHistory(courseId);
  const counts = new Map<ExportFormatId, number>();
  for (const entry of history) {
    counts.set(entry.format, (counts.get(entry.format) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count);
}
```

- [ ] **Step D1.2: Type check + commit**

```bash
npx tsc --noEmit
git add src/lib/exports/exportHistory.ts
git commit -m "feat(exports): add exportHistory util (localStorage, FIFO cap 50)"
```

## Task D2: Wire history recording + chip row on `/course/[id]`

**Files:**
- Modify: `src/app/course/[id]/course-content.tsx`

- [ ] **Step D2.1: Import the util**

At the top of `src/app/course/[id]/course-content.tsx`, add:

```ts
import { appendExportEvent, summarizeExportHistory, type ExportFormatId } from "@/lib/exports/exportHistory";
```

- [ ] **Step D2.2: Record each successful export**

Each existing handler (`handleDownloadPDF`, `handleExportDocx`, `handleExportScorm`, `handleExportNotebookLMAudio`, `handleExportNotebookLMSlides`, `handleExportNotion`, `handleCopyMarkdown`, `handleShareLink`) should append to the history after the export succeeds. Find each and add one line at the end of the successful branch:

```ts
appendExportEvent(courseId, "pdf"); // or "word", "scorm", "nlmAudio", "nlmSlides", "notion", "markdown", "share"
```

Use the course's `id` prop (or whatever variable the component uses) as `courseId`. If the component doesn't currently receive the course id as a prop, thread it through from the parent `page.tsx`.

- [ ] **Step D2.3: Render the chip row above the Export & Share section**

Above the existing Export & Share grid, render a chip row (only if history is non-empty):

```tsx
{(() => {
  const summary = summarizeExportHistory(courseId);
  if (summary.length === 0) return null;
  const LABELS: Record<ExportFormatId, string> = {
    pdf: "PDF", word: "Word", markdown: "Markdown", notion: "Notion",
    scorm: "SCORM", nlmAudio: "NLM Audio", nlmSlides: "NLM Slides", share: "Share link",
  };
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-3">
      <span className="font-medium text-foreground/70">Recently exported:</span>
      {summary.map((s) => (
        <span key={s.format} className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 px-2 py-0.5">
          {LABELS[s.format]}{s.count > 1 && <span className="text-muted-foreground">×{s.count}</span>}
        </span>
      ))}
    </div>
  );
})()}
```

- [ ] **Step D2.4: Type check + browser smoke**

Run: `npx tsc --noEmit`. Open a course, click PDF twice, reload the page — chip row should read "Recently exported: PDF ×2".

- [ ] **Step D2.5: Commit**

```bash
git add src/app/course/[id]/course-content.tsx
git commit -m "feat(course): record export history + show chip row"
```

## Task D3: Replace the `/course/[id]` Export & Share grid with `<ExportGrid>`

**Files:**
- Modify: `src/app/course/[id]/course-content.tsx`

- [ ] **Step D3.1: Import `<ExportGrid>` and `normalizePlan`**

Add to imports:

```ts
import { ExportGrid, type ExportFormat } from "@/components/dashboard/ExportGrid";
import { normalizePlan } from "@/lib/pricing/tiers";
```

- [ ] **Step D3.2: Derive `tier` from the user's plan**

Wherever the component receives/reads the current user's profile (grep for `userProfile` or equivalent — it likely uses a Supabase-fetched `profiles.plan`), derive:

```ts
const plan = normalizePlan(userProfile?.plan);
```

If the component does not yet fetch the user profile, fetch it via `supabaseBrowser()` the same way `src/app/profile/page.tsx` does.

- [ ] **Step D3.3: Replace the existing 8-button toolbar with `<ExportGrid>`**

Find the JSX inside the `<section id="export-share">` introduced in commit `a8a10d9`. Replace the 8 custom `<Button>` blocks with one `<ExportGrid>`:

```tsx
<ExportGrid
  tier={plan.tier}
  onExport={(format: ExportFormat) => {
    switch (format) {
      case "pdf":       return handleDownloadPDF();
      case "word":      return handleExportDocx();
      case "markdown":  return handleCopyMarkdown();
      case "notion":    return handleExportNotion();
      case "scorm":     return handleExportScorm();
      case "nlmAudio":  return handleExportNotebookLMAudio();
      case "nlmSlides": return handleExportNotebookLMSlides();
      case "share":     return handleShareLink();
    }
  }}
  onLockedClick={() => {/* open paywall modal or route to pricing */}}
/>
```

If the page doesn't have a `PaywallModal` wired, route locked clicks to `/pricing` via `router.push("/pricing")`.

Keep the chip row from D2 above the grid.

- [ ] **Step D3.4: Type check + browser smoke**

Run: `npx tsc --noEmit`. Visit `/course/<some-id>#export-share`. Verify the section now uses the same visual grammar as the dashboard card.

- [ ] **Step D3.5: Commit Phase D**

```bash
git add src/app/course/[id]/course-content.tsx
git commit -m "feat(course): align export toolbar with dashboard ExportGrid (Phase D)"
```

---

# Phase E — Empty states + inline confirmation

## Task E1: Empty-state card on My Courses

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step E1.1: Find the My Courses grid rendering**

Search for the block that renders the list of course cards (look for `generations.map` or similar). Directly above it, add an empty-state guard:

```tsx
{generations.length === 0 ? (
  <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center">
    <Sparkles className="mx-auto size-8 text-violet-400 opacity-80" />
    <h3 className="mt-3 text-sm font-medium">No courses yet</h3>
    <p className="mt-1 text-xs text-muted-foreground">
      {plan.isMasterclass ? "Your Masterclass toolkit is ready." : "Generate your first course to get started."}
    </p>
    <button
      type="button"
      onClick={() => setActiveTab("generate")}
      className="mt-4 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90"
    >
      Generate your first course →
    </button>
  </div>
) : (
  /* existing generations.map(...) stays here, wrapped in this branch */
)}
```

- [ ] **Step E1.2: Type check + browser smoke**

Run: `npx tsc --noEmit`. Sign in as a user with zero courses; confirm the empty-state card renders.

- [ ] **Step E1.3: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(dashboard): empty-state card on My Courses tab"
```

## Task E2: Inline export confirmation on `<ExportTile>`

**Files:**
- Modify: `src/components/dashboard/ExportTile.tsx`
- Modify: `src/components/dashboard/ExportGrid.tsx`

Spec §6 calls for a sonner toast; we don't ship sonner. Instead, each tile briefly swaps to a ✓ state for 1.5 s after a successful click — zero new deps, more tactile.

- [ ] **Step E2.1: Add a `justClicked` visual state to `<ExportTile>`**

Modify `src/components/dashboard/ExportTile.tsx` — add `justClicked` prop and render a `Check` icon overlay when true:

```tsx
import { Check, Lock, Star } from "lucide-react";
// ...existing props + add:
//   justClicked?: boolean;

// inside the button JSX, add just before the Icon:
{justClicked && (
  <Check className="absolute top-1 left-1 size-3 text-emerald-400" />
)}
```

Also update the props interface.

- [ ] **Step E2.2: Track per-tile recency in `<ExportGrid>`**

Modify `src/components/dashboard/ExportGrid.tsx`. Add state:

```tsx
import { useState } from "react";
// ...inside the component:
const [recentFormat, setRecentFormat] = useState<ExportFormat | null>(null);
```

Wrap the `onExport` passthrough to record + clear:

```tsx
onClick={() => {
  if (unlocked) {
    onExport(t.format);
    setRecentFormat(t.format);
    setTimeout(() => setRecentFormat((cur) => (cur === t.format ? null : cur)), 1500);
  } else {
    onLockedClick(t.format);
  }
}}
```

Pass `justClicked={recentFormat === t.format}` into each `<ExportTile>`.

- [ ] **Step E2.3: Type check + browser smoke**

Run: `npx tsc --noEmit`. Click any tile — ✓ appears top-left for 1.5 s, then clears.

- [ ] **Step E2.4: Commit Phase E**

```bash
git add src/components/dashboard/ExportTile.tsx src/components/dashboard/ExportGrid.tsx src/app/profile/page.tsx
git commit -m "feat(dashboard): empty-state card + inline export confirmation (Phase E)"
```

---

# Final verification

- [ ] **Step F1: Full type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step F2: Lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step F3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step F4: Legacy-plan grep**

Run: `rg '"pro"|"pro_max"' src/app src/components`
Expected: zero matches.

- [ ] **Step F5: Manual end-to-end smoke**

`npm run dev`, then:

1. **Masterclass user (Gianmarco / Filippo):**
   - Header pill → amber "MASTERCLASS" with Crown icon
   - Overview benefits strip → amber, credits + three format chips, no upgrade CTA
   - Any course card → click to expand → 8 tiles, all enabled, amber ★ on NLM Audio + NLM Slides
   - Click PDF tile → file downloads + ✓ appears 1.5 s
   - "Unlock with Masterclass" feature strip is **gone**

2. **Planner test user:**
   - Header pill → violet "PLANNER" with Sparkles icon
   - Overview benefits strip → violet, includes "Upgrade → NLM €10" CTA
   - Card expand → 5 tiles enabled + 3 locked (SCORM, NLM Audio, NLM Slides) + violet upgrade strip at grid bottom
   - Click a locked tile → paywall modal opens

3. **Free user:**
   - Header pill → slate "FREE"
   - Overview benefits strip → slate with "See plans →"
   - Card expand → 3 tiles enabled (PDF, Markdown, Share) + 5 locked + slate upgrade strip

4. **Course page `/course/[id]#export-share`:**
   - Same visual grid as dashboard card grid
   - Recently-exported chips appear above grid after any export click
   - Tier gating matches dashboard

- [ ] **Step F6: Push**

```bash
git push origin main
```

---

## Notes for the implementer

- The existing `src/lib/pricing/__tests__/tiers.test.ts` uses `import { describe, it, expect } from "vitest"` but `vitest` is **not** listed in `package.json` devDependencies and there is no `test` script. Tests are type-checked but not executed by current tooling. Run them with `npx vitest run <path>` or add `vitest` as a devDep + a `test` script in a separate chore commit if you want CI coverage. This plan treats `npx tsc --noEmit` + manual browser smoke as the acceptance gate.
- `PaywallModal` already accepts the canonical `Tier` union at the prop type level — no changes needed there. If TypeScript flags the call site, verify that `currentPlan={plan.tier}` is typed as `Tier` and not widened.
- If any of the export handlers listed in Task C3.2 don't exist in `src/app/profile/page.tsx`, port them from `src/app/course/[id]/course-content.tsx` (they all live there, added in commit `a8a10d9`). They are pure client-side — no API calls, no server logic.
- `framer-motion` is available; feel free to wrap the `<ExportGrid>` in an `AnimatePresence` inside the card's expanded region so it fades/slides in, but that's polish, not required.
- Commit after each task. Do not batch commits across phases.
