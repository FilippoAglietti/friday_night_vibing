# Frontend Rebrand + €10 Single-Masterclass Upsell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap every visible tier name to `Free / Planner / Masterclass / Enterprise`, replace audio-lesson marketing with NotebookLM export copy, add a €10 Single-Masterclass upsell (display-only tonight), and gate all checkout CTAs behind a `NEXT_PUBLIC_PRICING_LIVE` flag so Stripe rotation stays a Phase 2 concern for 2026-04-19 AM.

**Architecture:** Additive foundation (flag helper + CheckoutButton component) first, then mechanical per-surface sweeps. No data migration, no backend routes. Existing `tierOrFallback()` + `resolvePriceId()` continue handling legacy `pro`/`pro_max` DB values.

**Tech Stack:** Next.js 16.2.1 app router, React 19, TypeScript, Vitest, Tailwind, framer-motion, shadcn/ui primitives.

**Spec:** `docs/superpowers/specs/2026-04-18-frontend-rebrand-design.md`
**Branch:** `feat/pricing-and-model-redesign` (already checked out)
**Base commit:** `e33192c` (the spec commit)

---

## Task 1 — Feature flag foundation

**Files:**
- Create: `src/lib/pricing/pricingLive.ts`
- Create: `src/lib/pricing/__tests__/pricingLive.test.ts`
- Create: `src/components/CheckoutButton.tsx`
- Modify: `.env.example:25-29`

- [ ] **Step 1: Write the failing test for `isPricingLive`**

Create `src/lib/pricing/__tests__/pricingLive.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isPricingLive } from "@/lib/pricing/pricingLive";

describe("isPricingLive", () => {
  const originalFlag = process.env.NEXT_PUBLIC_PRICING_LIVE;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PRICING_LIVE;
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_PRICING_LIVE;
    } else {
      process.env.NEXT_PUBLIC_PRICING_LIVE = originalFlag;
    }
  });

  it("returns false when the flag is unset", () => {
    expect(isPricingLive()).toBe(false);
  });

  it("returns true when the flag is exactly 'true'", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "true";
    expect(isPricingLive()).toBe(true);
  });

  it("returns false when the flag is 'false'", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "false";
    expect(isPricingLive()).toBe(false);
  });

  it("returns false when the flag is case-mismatched ('TRUE')", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "TRUE";
    expect(isPricingLive()).toBe(false);
  });

  it("returns false for any other string", () => {
    process.env.NEXT_PUBLIC_PRICING_LIVE = "yes";
    expect(isPricingLive()).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `bun run vitest run src/lib/pricing/__tests__/pricingLive.test.ts`
Expected: FAIL — `Cannot find module '@/lib/pricing/pricingLive'`.

- [ ] **Step 3: Implement `isPricingLive`**

Create `src/lib/pricing/pricingLive.ts`:

```ts
/**
 * Feature flag gating checkout CTAs during the 2026-04-18 → 2026-04-19 AM window.
 *
 * While false, all "Start / Buy / Upgrade" CTAs render disabled with a
 * "Launching tomorrow" label so users cannot pay old Stripe prices at the
 * moment the UI already displays the new prices. Flip to "true" in Vercel env
 * once the new Price IDs are wired up in Stripe.
 */
export function isPricingLive(): boolean {
  return process.env.NEXT_PUBLIC_PRICING_LIVE === "true";
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `bun run vitest run src/lib/pricing/__tests__/pricingLive.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create `CheckoutButton`**

Create `src/components/CheckoutButton.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { isPricingLive } from "@/lib/pricing/pricingLive";

interface CheckoutButtonProps {
  href: string;
  className?: string;
  disabledClassName?: string;
  children: ReactNode;
  /**
   * Label shown when pricing is not yet live. Defaults to "Launching tomorrow".
   */
  launchingLabel?: string;
}

/**
 * Checkout CTA gated by `NEXT_PUBLIC_PRICING_LIVE`. When the flag is off, the
 * button renders as a non-interactive disabled element with a "Launching
 * tomorrow" label so customers cannot hit a checkout that would charge stale
 * Stripe prices.
 */
export function CheckoutButton({
  href,
  className,
  disabledClassName,
  children,
  launchingLabel = "Launching tomorrow",
}: CheckoutButtonProps) {
  if (!isPricingLive()) {
    return (
      <button
        type="button"
        aria-disabled="true"
        disabled
        className={
          disabledClassName ??
          `${className ?? ""} cursor-not-allowed opacity-60 pointer-events-none`
        }
      >
        {launchingLabel}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 6: Update `.env.example`**

Modify `.env.example` lines 25-30. Replace:

```
# Stripe Price IDs (EUR — canonical since 2026-04-09)
# Pro: €28/mo  ·  5-Pack: €33 one-time  ·  Pro Max: €69/mo
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1TKBpS3kBvceiBKLANxOEgzs
NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID=price_1TKBpT3kBvceiBKLgw6NIFap
NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID=price_1TKBpU3kBvceiBKLmKdWHeub
```

With:

```
# Stripe Price IDs (EUR — canonical since 2026-04-19)
# Planner: €29/mo · €290/yr  ·  Masterclass: €99/mo · €990/yr  ·  5-Pack: €39
# Body Unlock: €5 per module · Single Masterclass (Planner upsell, NEW): €10
NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID=price_...
STRIPE_BODY_UNLOCK_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_MASTERCLASS_SINGLE_PRICE_ID=price_...

# ── Pricing live flag (2026-04-18 overnight safeguard) ────────
# Set to "true" (exactly) once the 7 Price IDs above are populated with real
# live values. While false/unset, all checkout CTAs render disabled with a
# "Launching tomorrow" label.
NEXT_PUBLIC_PRICING_LIVE=false
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/pricing/pricingLive.ts \
        src/lib/pricing/__tests__/pricingLive.test.ts \
        src/components/CheckoutButton.tsx \
        .env.example
git commit -m "feat(pricing): PRICING_LIVE flag + CheckoutButton for overnight safeguard"
```

---

## Task 2 — Tier constants + single-Masterclass €10 price

**Files:**
- Modify: `src/lib/pricing/tiers.ts:50-55`
- Modify: `src/lib/pricing/__tests__/tiers.test.ts:35`

- [ ] **Step 1: Add the new constant**

Modify `src/lib/pricing/tiers.ts`. Replace lines 50-55:

```ts
export const BODY_UNLOCK_PRICE_EUR = 5;
export const FIVE_PACK_PRICE_EUR = 39;
export const FIVE_PACK_CREDIT_EUR = 20;
export const FIVE_PACK_CREDIT_WINDOW_DAYS = 30;
export const FIVE_PACK_COUNT = 5;
export const FIVE_PACK_WINDOW_DAYS = 90;
```

With:

```ts
export const BODY_UNLOCK_PRICE_EUR = 5;
export const SINGLE_MASTERCLASS_PRICE_EUR = 10;
export const FIVE_PACK_PRICE_EUR = 39;
export const FIVE_PACK_CREDIT_EUR = 20;
export const FIVE_PACK_CREDIT_WINDOW_DAYS = 30;
export const FIVE_PACK_COUNT = 5;
export const FIVE_PACK_WINDOW_DAYS = 90;
```

- [ ] **Step 2: Update the tiers test to cover the new constant**

Modify `src/lib/pricing/__tests__/tiers.test.ts`. At line 1, change the import:

```ts
import { TIERS, tierOrFallback, SINGLE_MASTERCLASS_PRICE_EUR } from "@/lib/pricing/tiers";
```

Then before the final `});` that closes `describe("tierOrFallback", …)`, add:

```ts
describe("SINGLE_MASTERCLASS_PRICE_EUR", () => {
  it("is 10 euros (Planner on-demand upsell)", () => {
    expect(SINGLE_MASTERCLASS_PRICE_EUR).toBe(10);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `bun run vitest run src/lib/pricing/__tests__/tiers.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pricing/tiers.ts src/lib/pricing/__tests__/tiers.test.ts
git commit -m "feat(pricing): add SINGLE_MASTERCLASS_PRICE_EUR (€10) for Planner upsell"
```

---

## Task 3 — i18n content rewrite (stale prices + tier names)

**Files:**
- Modify: `src/lib/i18n/types.ts:138-146`
- Modify: `src/lib/i18n/locales/en.ts:104-145` (plus parallel updates across 15 other locale files)

**Context:** the scan found `t("pricing.startProBtn")`, `t("pricing.tryProMaxBtn")`, and `t("pricing.goProMaxBtn")` render old tier names AND old prices (€28 / €33 / €69) on the landing page. i18n KEY NAMES stay unchanged (a rename is a separate refactor); only CONTENT gets updated.

The subagent implementing this task must NOT rename keys. Only rewrite the value strings.

- [ ] **Step 1: Annotate deprecated-by-name keys in `types.ts`**

Modify `src/lib/i18n/types.ts`. Find the `pricing` block (around line 120-179). For each of these keys, add a `// Deprecated key name — content is canonical 2026-04-18 post-rebrand` JSDoc comment on the line above:
- `proDesc`
- `proMaxDesc`
- `pro1`, `pro2`, `pro3`, `pro4`, `pro5`
- `pm1`, `pm2`, `pm3`, `pm4`, `pm5`, `pm6`, `pm7`
- `startProBtn`
- `tryProMaxBtn`
- `goProMaxBtn`

Example for one key (do the same for all 15):

```ts
pricing: {
  // ...
  /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
  proDesc: string;
  // ...
}
```

- [ ] **Step 2: Update English locale (`en.ts`) — source of truth**

Modify `src/lib/i18n/locales/en.ts`. In the `pricing` block, apply these exact content rewrites:

```ts
// KEY: startProBtn
"Start Planner — €29/mo"

// KEY: tryProMaxBtn
"Try the 5-Pack — €39"

// KEY: goProMaxBtn
"Go Masterclass — €99/mo"

// KEY: proDesc
"For course creators who ship regularly — the best course structures in the market, reviewed by Opus."

// KEY: proMaxDesc
"Ready-to-teach courses, polished and exportable for NotebookLM podcast generation."

// KEY: pro1
"15 reviewed course skeletons per month"

// KEY: pro2
"Opus-quality hallucination catcher"

// KEY: pro3
"All lengths (Crash · Short · Full · Masterclass)"

// KEY: pro4
"€5 on-demand body unlock per skeleton"

// KEY: pro5
"€10 Single Masterclass upgrade, on-demand"

// KEY: pm1
"20 full Masterclass courses per month"

// KEY: pm2
"NotebookLM-ready export → turn any course into a conversational podcast"

// KEY: pm3
"Opus strategic polish on key lessons"

// KEY: pm4
"Masterclass-length courses included"

// KEY: pm5
"White-label exports (no Syllabi branding)"

// KEY: pm6
"Priority generation queue"

// KEY: pm7
"All export formats (PDF, Markdown, Notion, NotebookLM)"
```

If any of these keys (`pm5`, `pm6`, `pm7`, `pro5`, etc.) don't already exist in `types.ts`, do not add them — only rewrite what's there, and omit the mapping for keys that don't exist.

- [ ] **Step 3: Replicate the updates across the other 15 locales**

Files:
- `src/lib/i18n/locales/it.ts`
- `src/lib/i18n/locales/es.ts`
- `src/lib/i18n/locales/pt.ts`
- `src/lib/i18n/locales/fr.ts`
- `src/lib/i18n/locales/de.ts`
- `src/lib/i18n/locales/nl.ts`
- `src/lib/i18n/locales/pl.ts`
- `src/lib/i18n/locales/ja.ts`
- `src/lib/i18n/locales/ko.ts`
- `src/lib/i18n/locales/zh.ts`
- `src/lib/i18n/locales/ar.ts`
- `src/lib/i18n/locales/hi.ts`
- `src/lib/i18n/locales/ru.ts`
- `src/lib/i18n/locales/tr.ts`
- `src/lib/i18n/locales/sv.ts`

For each locale, write **idiomatic translations** of the strings above, using these rules (consistent with the 2026-04-18 audio→NotebookLM sweep already in git history):

1. Keep "Planner", "Masterclass", "NotebookLM", "Opus", "Markdown", "Notion", "PDF" in Latin script regardless of target language. Brand + tool names stay unchanged.
2. Currency symbol "€" stays as-is in all locales; do not localise to "EUR".
3. Numbers stay as Arabic digits (29, 99, 39, 10) in all locales — no native numerals (e.g., keep "€99" not "٩٩ €" in Arabic).
4. Prices: €29 / €99 / €39 / €10 are **canonical** — do not drift. Replace every €28 → €29, €33 → €39, €69 → €99.
5. For dashes ("Start Planner — €29/mo"), use the appropriate local dash convention: em-dash " — " in European languages, half-width " – " in CJK spacing, " – " for Arabic/Hebrew/Hindi.
6. Match the tone of each locale's existing strings — don't start formalising an informally-phrased locale mid-sweep.

For example, for Italian (`it.ts`):

```ts
startProBtn: "Inizia Planner — €29/mese",
tryProMaxBtn: "Prova il 5-Pack — €39",
goProMaxBtn: "Passa a Masterclass — €99/mese",
proDesc: "Per chi crea corsi sul serio — le migliori strutture sul mercato, riviste da Opus.",
// ...
```

- [ ] **Step 4: Verify no stale prices remain**

Run: `rg "€28|€33|€69" src/lib/i18n/`
Expected: zero matches.

Run: `rg -i "pro max" src/lib/i18n/locales/`
Expected: zero matches (old "Pro Max" display text).

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n/
git commit -m "fix(i18n): canonical prices + tier names across 16 locales

- Fix stale €28/€33/€69 prices shown on landing page CTAs
- Rewrite proDesc/proMaxDesc/pro*/pm*/startProBtn/tryProMaxBtn/goProMaxBtn
  content to canonical Free/Planner/Masterclass/Enterprise vocabulary
- Annotate legacy-named keys in types.ts as deprecated-by-name
  (content is canonical; key renames deferred to separate refactor)
- No audio/ElevenLabs/narration references remain in i18n content"
```

---

## Task 4 — Rebuild `PricingCards.tsx`

**Files:**
- Modify: `src/app/pricing/PricingCards.tsx` (full file rewrite inside existing structure)

**Context:** replace `audioHighlight` prop → `notebookLMHighlight`; swap all audio feature bullets; replace `<Link>` CTAs with `<CheckoutButton>`; add a new sub-card for €10 Single Masterclass below the 4-card grid (violet gradient for Planner-tier association).

- [ ] **Step 1: Update type + PLANS array**

Modify `src/app/pricing/PricingCards.tsx` lines 17-124. Replace the entire `type Plan` and `PLANS` declaration with:

```tsx
type Plan = {
  id: string;
  name: string;
  eyebrow: string;
  price: string;
  priceAnnual?: string;
  unit: string;
  unitAnnual?: string;
  strikethrough?: string;
  saveLabel?: string;
  description: string;
  features: { included: boolean; label: string }[];
  cta: string;
  ctaHref: string;
  highlight?: "popular" | "best" | "onetime";
  accent: "muted" | "violet" | "amber";
  icon?: "crown" | null;
  notebookLMHighlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    eyebrow: "Start free",
    price: "€0",
    unit: "forever",
    description: "Try Syllabi with a free skeleton — see exactly what you'd ship.",
    features: [
      { included: true, label: "1 course skeleton per month" },
      { included: true, label: "Lesson titles, learning objectives, pacing" },
      { included: true, label: "PDF / Notion / Markdown export" },
      { included: false, label: "Module bodies" },
      { included: false, label: "NotebookLM podcast export" },
      { included: false, label: "White-label exports" },
    ],
    cta: "Get started free",
    ctaHref: "/#generate",
    accent: "muted",
  },
  {
    id: "planner",
    name: "Planner",
    eyebrow: "Plan, then build",
    price: "€29",
    priceAnnual: "€24",
    unit: "/month",
    unitAnnual: "/mo · billed €290/yr",
    strikethrough: "€290/year · save 2 months",
    description: "The best course structures in the market. Skeletons on demand.",
    features: [
      { included: true, label: "15 reviewed skeletons per month" },
      { included: true, label: "Opus-quality skeleton review (hallucination catcher)" },
      { included: true, label: "All lengths (Crash / Short / Full / Masterclass)" },
      { included: true, label: "€5 on-demand body unlock per skeleton" },
      { included: true, label: "€10 Single Masterclass upgrade, on-demand" },
      { included: false, label: "Module bodies by default" },
      { included: false, label: "NotebookLM podcast export" },
    ],
    cta: "Start Planner",
    ctaHref: "/api/checkout?tier=planner",
    accent: "violet",
    highlight: "popular",
  },
  {
    id: "masterclass",
    name: "Masterclass",
    eyebrow: "Ready to teach from",
    price: "€99",
    priceAnnual: "€82",
    unit: "/month",
    unitAnnual: "/mo · billed €990/yr",
    strikethrough: "€990/year · save 2 months",
    description: "Reviewed, polished, ready for your audience — with podcast export baked in.",
    features: [
      { included: true, label: "20 full courses per month" },
      { included: true, label: "Opus strategic polish on key lessons" },
      { included: true, label: "Masterclass-length courses included" },
      { included: true, label: "NotebookLM-ready export → two-host podcast" },
      { included: true, label: "White-label exports (no Syllabi branding)" },
      { included: true, label: "Priority queue" },
    ],
    cta: "Start Masterclass",
    ctaHref: "/api/checkout?tier=masterclass",
    accent: "amber",
    highlight: "best",
    icon: "crown",
    notebookLMHighlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    eyebrow: "For teams",
    price: "Contact us",
    unit: "",
    description: "White-label, done-for-you courses, dedicated learning designer.",
    features: [
      { included: true, label: "Custom subdomain (learn.yourcompany.com)" },
      { included: true, label: "Done-for-you course creation" },
      { included: true, label: "Curated source library + citation allowlist" },
      { included: true, label: "Custom NotebookLM export formatting" },
      { included: true, label: "Dedicated Slack/Teams channel · 24h SLA" },
      { included: true, label: "EU data residency · GDPR · DPA on request" },
    ],
    cta: "Contact sales",
    ctaHref: "mailto:hello@syllabi.online?subject=Enterprise%20inquiry",
    accent: "muted",
  },
];
```

- [ ] **Step 2: Update the import line at the top of the file**

At line 5 of the file, the imports look like:

```tsx
import { Check, X, Crown, Headphones, ArrowRight } from "lucide-react";
```

After this line add:

```tsx
import { CheckoutButton } from "@/components/CheckoutButton";
```

- [ ] **Step 3: Replace the `audioHighlight` render block**

Find lines 249-263 (the `plan.audioHighlight` block). Replace with:

```tsx
{plan.notebookLMHighlight && (
  <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
    <div className="flex items-center justify-center size-9 shrink-0 rounded-lg bg-amber-500/10">
      <Headphones className="size-5 text-amber-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-amber-500">
        One-click NotebookLM podcast
      </p>
      <p className="text-[11px] text-muted-foreground">
        Drop the file into Google NotebookLM — get a two-host conversational podcast on demand.
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 4: Replace the CTA rendering block to use `CheckoutButton`**

Find the `CardFooter` block (lines 280-294). Replace with:

```tsx
<CardFooter className="mt-auto pt-0">
  {plan.id === "enterprise" ? (
    <EnterpriseMailtoCta label={plan.cta} />
  ) : plan.id === "free" ? (
    <Link
      href={plan.ctaHref}
      className={`w-full inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium transition-all hover:scale-[1.02] ${ctaClass}`}
    >
      {plan.cta}
    </Link>
  ) : (
    <CheckoutButton
      href={plan.ctaHref}
      className={`w-full inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium transition-all hover:scale-[1.02] ${ctaClass}`}
      disabledClassName={`w-full inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium cursor-not-allowed opacity-50 bg-muted text-muted-foreground`}
    >
      <>
        {plan.cta}
        {plan.highlight === "best" && <ArrowRight className="ml-2 size-4" />}
      </>
    </CheckoutButton>
  )}
</CardFooter>
```

- [ ] **Step 5: Add the new €10 Single Masterclass sub-card**

Immediately above the existing 5-Pack sub-card block (currently lines 300-312), insert this new block:

```tsx
{/* Single Masterclass sub-card — Planner upsell (violet/indigo to associate with Planner tier) */}
<div className="mt-12 rounded-2xl border border-violet-200/30 bg-violet-50/5 dark:bg-violet-500/5 dark:border-violet-500/20 p-6 text-center">
  <h3 className="text-lg font-semibold">One Masterclass, no subscription</h3>
  <p className="mt-2 text-sm text-muted-foreground">
    Keep your Planner plan — generate a single Masterclass-quality course on demand. One-time €10.
  </p>
  <CheckoutButton
    href="/api/checkout?tier=single_masterclass"
    className="mt-4 inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
    disabledClassName="mt-4 inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60"
  >
    Unlock one Masterclass — €10
  </CheckoutButton>
</div>
```

- [ ] **Step 6: Update the existing 5-Pack sub-card to use `CheckoutButton`**

Find the existing 5-Pack card (was lines 300-312, now shifted). Replace the `<Link>` inside it with:

```tsx
<CheckoutButton
  href="/api/checkout?tier=5pack"
  className="mt-4 inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
  disabledClassName="mt-4 inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60"
>
  Buy the 5-Pack — €39
</CheckoutButton>
```

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/pricing/PricingCards.tsx
git commit -m "feat(pricing): rebuild cards for NotebookLM + €10 Single Masterclass sub-card

- Swap audio feature bullets to NotebookLM export
- Rename audioHighlight prop to notebookLMHighlight
- Add Planner €10 Single Masterclass upsell sub-card (violet gradient)
- Gate all paid CTAs through CheckoutButton (PRICING_LIVE flag)"
```

---

## Task 5 — Rebuild `PaywallModal.tsx`

**Files:**
- Modify: `src/components/PaywallModal.tsx` (targeted edits)

- [ ] **Step 1: Swap Masterclass plan description + features**

Modify `src/components/PaywallModal.tsx`. Replace lines 57-85 (the entire `masterclass` plan object) with:

```tsx
  {
    id: "masterclass",
    name: "Masterclass",
    price: "€99",
    priceAnnual: "€82",
    annualBilledLabel: "billed €990/year",
    period: "/month",
    description: "Polished, ready-to-teach courses with NotebookLM podcast export.",
    badge: "Best for teachers",
    features: [
      "20 full courses/month",
      "Opus strategic polish on key lessons",
      "NotebookLM-ready export → conversational podcast",
      "Masterclass-length courses",
      "White-label exports",
      "Priority queue",
    ],
    cta: "Start Masterclass — €99/mo",
    ctaAnnual: "Start Masterclass — €82/mo annually",
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
    icon: Headphones,
    gradient: "from-amber-500 to-orange-600",
    badgeGradient: "from-amber-500 to-orange-600",
    checkColor: "text-amber-500",
    highlight: true,
    hasAnnual: true,
  },
```

- [ ] **Step 2: Import the flag helper**

At the top of the file, after the existing imports (around line 14 where `useState` is imported), add:

```tsx
import { isPricingLive } from "@/lib/pricing/pricingLive";
```

- [ ] **Step 3: Gate `handleCheckout` by the flag**

Find the `handleCheckout` function (around line 115-141). At the very top of the function, before the `if (!priceId)` check, add:

```tsx
    if (!isPricingLive()) {
      console.info("Checkout disabled: NEXT_PUBLIC_PRICING_LIVE not set to 'true'");
      return;
    }
```

- [ ] **Step 4: Disable the CTA buttons visually when flag is off**

This step requires finding where the plan CTA buttons render inside the modal's JSX. Locate the Button/link that uses `plan.cta` or `plan.ctaAnnual`. Add this variable at the top of the component (right after `const [billingPeriod, setBillingPeriod] = useState(...)`):

```tsx
  const pricingLive = isPricingLive();
```

Then on each checkout `<Button>` inside the map that handles `onClick={() => handleCheckout(...)}`, add:
- `disabled={!pricingLive || loading === priceId}` (merge with any existing disabled)
- Update the button label to show "Launching tomorrow" when `!pricingLive`:
  ```tsx
  {!pricingLive ? "Launching tomorrow" : loading === plan.priceId ? "Redirecting…" : (billingPeriod === "annual" && plan.hasAnnual ? plan.ctaAnnual : plan.cta)}
  ```

If the exact button markup doesn't match this pattern, the implementer must search for the CTA render block in the modal body and apply the equivalent guard + label swap while preserving existing accent styles.

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/PaywallModal.tsx
git commit -m "feat(paywall): NotebookLM copy + PRICING_LIVE-gated CTAs

- Masterclass plan: audio/ElevenLabs copy → NotebookLM export
- handleCheckout early-returns when flag is off (defense in depth)
- All paid CTAs visually render 'Launching tomorrow' while flag is unset"
```

---

## Task 6 — Sweep meta / SEO / structural surfaces

**Files:**
- Modify: `src/app/layout.tsx` (metadata + schema.org)
- Modify: `src/app/manifest.ts:8`
- Modify: `src/app/opengraph-image.tsx:5, 141`
- Modify: `src/app/feed.xml/route.ts:7`
- Modify: `src/lib/emails/welcome-email.ts:220`

**Approach:** the scan listed every line. Each file gets exact-string replacements; DO NOT refactor anything else in these files.

- [ ] **Step 1: `src/app/layout.tsx` — metadata + schema.org**

Find every occurrence of these exact phrases and replace:

| Find | Replace with |
|------|--------------|
| `with audio narration, beautiful design` | `with NotebookLM podcast export, beautiful design` |
| `with audio narration, design, and a shareable link` | `with NotebookLM podcast export, design, and a shareable link` |
| `AI audio narration` | `NotebookLM-ready export` |
| `audio narration & PDF export` | `NotebookLM export & PDF` |
| `audio narration, quizzes` | `NotebookLM podcast export, quizzes` |
| `audio narration, polish + white-label` | `NotebookLM podcast export, Opus polish + white-label` |
| `professional AI voice narration` | `NotebookLM-ready export for Google's podcast generator` |

For the entire FAQPage schema block around lines 330-333 ("Can I generate courses with audio narration?"), replace the whole `mainEntity` entry with:

```tsx
{
  "@type": "Question",
  name: "Can I export my course as a podcast?",
  acceptedAnswer: {
    "@type": "Answer",
    text: "Yes — Masterclass tier includes a one-click NotebookLM-ready Markdown export. Drop the file into Google NotebookLM to generate a two-host conversational podcast of your course on demand. No TTS bills, better output than per-lesson narration.",
  },
},
```

If the surrounding FAQPage structure differs, preserve its shape and only substitute that one entry.

- [ ] **Step 2: `src/app/manifest.ts:8`**

Replace:

```ts
description: "Turn any topic into a complete course with audio narration, design, and a shareable link.",
```

With:

```ts
description: "Turn any topic into a complete course with NotebookLM podcast export, design, and a shareable link.",
```

- [ ] **Step 3: `src/app/opengraph-image.tsx`**

Line 5: update the `alt` metadata constant. Replace:

```tsx
export const alt = "Syllabi — The AI Course Generator Worth Listening To. Complete courses with audio narration, design, and a shareable link.";
```

With:

```tsx
export const alt = "Syllabi — The AI Course Generator. Complete courses with NotebookLM podcast export, design, and a shareable link.";
```

Line 141 (somewhere in the rendered OG): find the string containing "audio narration" and replace with "NotebookLM podcast export".

- [ ] **Step 4: `src/app/feed.xml/route.ts:7`**

Replace:

```ts
"professional voice narration for every lesson"
```

With:

```ts
"NotebookLM-ready podcast export for every course"
```

- [ ] **Step 5: `src/lib/emails/welcome-email.ts:220`**

Find the paragraph mentioning "audio, design, and a shareable link" and replace with a version that says "NotebookLM podcast export, design, and a shareable link" while preserving the surrounding tone and structure.

- [ ] **Step 6: Verify**

Run: `rg -i "audio narration|ElevenLabs|voice clon" src/app/layout.tsx src/app/manifest.ts src/app/opengraph-image.tsx src/app/feed.xml src/lib/emails/welcome-email.ts`
Expected: zero matches.

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/manifest.ts src/app/opengraph-image.tsx src/app/feed.xml/route.ts src/lib/emails/welcome-email.ts
git commit -m "chore(seo): replace audio narration copy with NotebookLM export across meta + welcome email"
```

---

## Task 7 — Sweep content pages (docs, support, changelog, palette, etc.)

**Files:**
- Modify: `src/app/page.tsx` (hero section + feature rows — lines 100-200 ish)
- Modify: `src/app/pricing/page.tsx` (metadata + FAQ)
- Modify: `src/app/docs/page.tsx:9, 14, 47, 104, 108`
- Modify: `src/app/support/page.tsx:68`
- Modify: `src/app/changelog/page.tsx:40`
- Modify: `src/app/palette/page.tsx:220, 259, 295, 325`
- Modify: `src/app/quick/quick-client.tsx:359`
- Modify: `src/app/generator/[niche]/page.tsx:46`
- Modify: `src/app/tutorial/page.tsx:31`
- Modify: `src/components/CourseAssemblyLoader.tsx:104`

**Approach:** mechanical find-and-replace. Preserve surrounding structure; only touch the lines that reference audio/narration/ElevenLabs/voice.

- [ ] **Step 1: `src/app/page.tsx` hero + landing pricing rows**

Around lines 100-200, find every string that promises audio narration as a feature. Examples from the scan:
- Lines 104-110: problem section pitching "Audio lessons"
- Lines 156-203: `proPlanFeatures`, `proMaxFeatures` arrays
- Line 184: "Audio narration" feature row in a comparison
- Lines 188, 198, 203: audio-flagged features

For each occurrence:
- If it's a positive Masterclass feature: replace with `"NotebookLM-ready podcast export"` or equivalent outcome framing.
- If it's a locked-for-Free/Planner feature: replace with `"NotebookLM podcast export"` in the same locked/unlocked structure.
- If it's in the hero problem/solution section: replace with outcome framing: "Turn any course into a 20-minute conversational podcast" or similar.

- [ ] **Step 2: `src/app/pricing/page.tsx` metadata + FAQ**

Lines 11 and 16 (metadata description): replace audio references with NotebookLM.
Line 47 (likely schema.org title or description): same.
Lines 204-209 (FAQ section "What does AI audio narration include?"): rewrite as "What is the NotebookLM export?":

```tsx
{
  question: "What is the NotebookLM export?",
  answer: "Masterclass tier gives you a one-click Markdown export formatted for Google NotebookLM. Drop the file into a new NotebookLM notebook — it generates a two-host conversational podcast of your course. No TTS bills, better output than per-lesson narration.",
},
```

- [ ] **Step 3: `src/app/docs/page.tsx:104-108`**

Find the Masterclass feature list. Replace:
- Any `"AI-generated audio narration"` → `"NotebookLM-ready podcast export"`
- Any `"5 Masterclass generations with audio, full lesson bodies, and all export formats"` → `"5 Masterclass generations with NotebookLM export, full lesson bodies, and all export formats"`

Also scan lines 9, 14, 47 for any other audio references and apply the same substitution.

- [ ] **Step 4: `src/app/support/page.tsx:68`**

Replace:

```tsx
"JSON, Markdown, PDF, and Notion export. Masterclass adds AI-generated audio narration, PPTX and DOCX exports, white-label branding, and shareable course links"
```

With:

```tsx
"JSON, Markdown, PDF, and Notion export. Masterclass adds NotebookLM-ready podcast export, PPTX and DOCX exports, white-label branding, and shareable course links"
```

- [ ] **Step 5: `src/app/changelog/page.tsx:40`**

Find the changelog entry mentioning "AI-powered audio narration for every lesson". Replace with:

```tsx
"NotebookLM-ready podcast export — format your course for Google NotebookLM's two-host podcast generator"
```

- [ ] **Step 6: `src/app/palette/page.tsx:220, 259, 295, 325`**

These are demo/palette strings showcasing the product. Replace:
- "real audio narration" → "real NotebookLM podcast export"
- Any other audio-copy → equivalent NotebookLM phrasing

- [ ] **Step 7: `src/app/quick/quick-client.tsx:359`**

Replace:

```tsx
"Want the full course with lessons, quizzes, and audio?"
```

With:

```tsx
"Want the full course with lessons, quizzes, and NotebookLM podcast export?"
```

- [ ] **Step 8: `src/app/generator/[niche]/page.tsx:46`**

Find the feature tile labeled "Audio Narration" with a `Headphones` icon. Replace the label with "NotebookLM Export" and update the surrounding description to match (same tile structure, swap the copy).

- [ ] **Step 9: `src/app/tutorial/page.tsx:31`**

Find the step array. The current step 5 is "AI audio narration" with a `Headphones` icon. Replace with:

```tsx
{
  title: "Export for NotebookLM",
  description: "Download a Markdown file formatted for Google NotebookLM. Drop it in — get a conversational two-host podcast of your course.",
  icon: Headphones,
},
```

(Keeping `Headphones` icon is fine — reads as "podcast".)

- [ ] **Step 10: `src/components/CourseAssemblyLoader.tsx:104`**

Find the loading message "Making sure the audio narrator doesn't sound bored…". Replace with:

```tsx
"Prepping your NotebookLM-ready podcast export…"
```

- [ ] **Step 11: Verify**

Run: `rg -i "audio narration|elevenlabs|voice clon|ai audio" src/app/ src/components/`
Expected: zero matches (blog posts haven't been touched yet; they're the next task).

- [ ] **Step 12: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 13: Commit**

```bash
git add src/app/page.tsx src/app/pricing/page.tsx src/app/docs/page.tsx src/app/support/page.tsx src/app/changelog/page.tsx src/app/palette/page.tsx src/app/quick/quick-client.tsx src/app/generator/[niche]/page.tsx src/app/tutorial/page.tsx src/components/CourseAssemblyLoader.tsx
git commit -m "chore(copy): audio→NotebookLM sweep across landing, docs, support, tutorial, generator"
```

---

## Task 8 — Trim audio sections in 3 blog posts

**Files:**
- Modify: `src/app/blog/how-to-create-online-course-2026/page.tsx:102, 135, 188-196`
- Modify: `src/app/blog/ai-course-generator-comparison/page.tsx:115, 145, 148, 172, 193-197`
- Modify: `src/app/blog/best-tools-course-creators/page.tsx:167`

- [ ] **Step 1: `how-to-create-online-course-2026` — rewrite "Step 4: Add audio narration" section**

Find the section titled "Step 4: Add audio narration" (lines 188-196). Rewrite as:

```tsx
{/* Step 4: Export for NotebookLM podcast generation */}
<section>
  <h2>Step 4: Export for NotebookLM podcast generation</h2>
  <p>
    Once your course is reviewed and polished, the most efficient way to give learners
    an audio version is to export it to Google NotebookLM. Drop the Markdown file into
    a new NotebookLM notebook — it will generate a two-host conversational podcast of
    your course on demand, without any TTS cost or post-processing.
  </p>
  <p>
    This approach beats per-lesson single-voice narration: the output is conversational,
    context-aware, and updated automatically when you re-run the NotebookLM generation.
  </p>
</section>
```

Preserve the surrounding sections (Step 3, Step 5) untouched. Lines 102 and 135 also reference audio — replace those individual mentions with NotebookLM-framed equivalents.

- [ ] **Step 2: `ai-course-generator-comparison` — rewrite audio comparison rows**

Lines 115, 145, 148, 172, 193-197 are comparison table rows and surrounding text marking audio narration as Syllabi's unique feature. For each row:

- Rename column/row header "Audio narration" → "NotebookLM export"
- For the Syllabi row marked ✅: keep ✅
- For competitor rows: keep whatever status they have for NotebookLM (most will be ❌ — NotebookLM export is a unique wedge).
- For the surrounding paragraphs (lines 115, 193-197): rewrite audio-pitch prose as NotebookLM-pitch prose.

- [ ] **Step 3: `best-tools-course-creators:167`**

Find the one-line "AI audio narration" reference and replace with "NotebookLM-ready podcast export" (keep surrounding context).

- [ ] **Step 4: Verify**

Run: `rg -i "audio narration|elevenlabs|voice clon" src/app/blog/`
Expected: zero matches.

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/blog/
git commit -m "chore(blog): trim audio narration sections in 3 SEO posts → NotebookLM framing"
```

---

## Task 9 — `/profile` dashboard sweep + €10 CTA

**Files:**
- Modify: `src/app/profile/page.tsx:822-825, 1384-1421, 1619-1640, 2061-2082` (scattered)

**Context:** the 2000-line file has many tier-conditional blocks. Touch only what's in scope: Masterclass-locked features text + a new `<CheckoutButton>` on Planner-generated skeleton cards offering the €10 single-Masterclass upsell.

- [ ] **Step 1: Import the `CheckoutButton`**

At the top of the file with the other imports, add:

```tsx
import { CheckoutButton } from "@/components/CheckoutButton";
```

- [ ] **Step 2: Rewrite the "Pro Max locked features" section heading + bullets**

Find line 1619 (`{/* ── PRO MAX LOCKED FEATURES ──────────────────── */}`). Replace the whole comment with:

```tsx
{/* ── MASTERCLASS LOCKED FEATURES ──────────────────── */}
```

Then in the feature array around lines 1633-1638, replace the 6 hardcoded feature strings with ones that align with the current Masterclass story. Current entries like:

```tsx
{ icon: Brain, label: "AI Course Branding", desc: "Custom branded templates with your logo & colors", locked: userProfile.plan !== "pro_max" },
{ icon: Presentation, label: "Video Script Generator", desc: "Turn lessons into camera-ready video scripts", locked: userProfile.plan !== "pro_max" },
{ icon: BarChart3, label: "Student Analytics", desc: "Track engagement, completion, and quiz scores", locked: userProfile.plan !== "pro_max" },
{ icon: Layers, label: "Team Collaboration", desc: "Invite co-creators and share course drafts", locked: userProfile.plan !== "pro_max" },
{ icon: Zap, label: "API Access", desc: "Generate courses programmatically via REST API", locked: userProfile.plan !== "pro_max" },
{ icon: Shield, label: "White-Label Export", desc: "Remove Syllabi branding from all exports", locked: userProfile.plan !== "pro_max" },
```

Replace with:

```tsx
{ icon: Headphones, label: "NotebookLM podcast export", desc: "One-click Markdown export → Google NotebookLM two-host podcast", locked: userProfile.plan !== "pro_max" },
{ icon: Brain, label: "Opus strategic polish", desc: "Key lessons rewritten by Opus for pedagogical clarity", locked: userProfile.plan !== "pro_max" },
{ icon: BarChart3, label: "20 full Masterclass courses/month", desc: "Full-body generation with modules, lessons, and resources", locked: userProfile.plan !== "pro_max" },
{ icon: Shield, label: "White-label exports", desc: "Remove Syllabi branding from all exports", locked: userProfile.plan !== "pro_max" },
{ icon: Zap, label: "Priority queue", desc: "Faster generation during peak hours", locked: userProfile.plan !== "pro_max" },
{ icon: Layers, label: "Masterclass-length courses", desc: "Generate our longest course format (12+ hours)", locked: userProfile.plan !== "pro_max" },
```

If `Headphones` is not imported at the top of the file, add it to the existing `lucide-react` imports.

- [ ] **Step 3: Find the Planner skeleton-card render area and add the €10 CTA**

Search the file for where Planner users' generated skeletons are rendered (likely near line 1678 — `userProfile?.plan === "pro" && (...)` — or the generations list section). Inside the skeleton card JSX, **adjacent to the existing action buttons** (view/download/delete), add:

```tsx
<CheckoutButton
  href={`/api/checkout?tier=single_masterclass&course_id=${course.id}`}
  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow hover:shadow-lg transition-all"
  disabledClassName="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60"
>
  Upgrade to Masterclass — €10
</CheckoutButton>
```

If the exact property name for the course object isn't `course.id`, use whatever the surrounding code uses (e.g., `generation.id`). The href suffix `&course_id=...` is forward-compatible — Phase 2 backend will accept it.

- [ ] **Step 4: Verify profile page renders**

Run: `bun run dev` (background) — visit `/profile` — confirm:
- No console errors
- Masterclass locked features list shows NotebookLM at the top
- Planner users see the new €10 upgrade CTA on their skeleton cards (check by setting `userProfile.plan = "pro"` mock or by actual profile in dev)
- Disabled CTA renders when `NEXT_PUBLIC_PRICING_LIVE` is unset

If the subagent cannot run a browser (no Playwright MCP access), skip the visual check — typecheck must still pass.

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): Masterclass locked-features refresh + €10 Planner upgrade CTA

- Rename 'Pro Max locked' section to 'Masterclass locked'
- Replace aspirational feature list with current Masterclass features
  (NotebookLM export leads, then Opus polish, 20 courses/mo, etc.)
- Add per-skeleton 'Upgrade to Masterclass — €10' CTA for Planner users
  (gated by PRICING_LIVE flag)"
```

---

## Task 10 — Example courses refresh + re-tier

**Files:**
- Modify: `src/data/courses/designCourse.ts` (convert to Planner skeleton)
- Modify: `src/data/courses/marketingCourse.ts` (scrub any audio mentions)
- Modify: `src/data/courses/typescriptCourse.ts` (scrub any audio mentions)
- Modify: `src/data/exampleCurricula.ts` (add `tier` field + badge data)
- Modify: `src/app/page.tsx` (render tier badge on example cards + NotebookLM download button in preview modal)
- Delete: `public/examples/photography.json`, `public/examples/python.json`, `public/examples/yoga.json`, `public/examples/marketing.json`

- [ ] **Step 1: Scrub audio mentions in `marketingCourse.ts` and `typescriptCourse.ts`**

For each file, run: `rg -n "audio|narrat|listen|podcast" src/data/courses/marketingCourse.ts src/data/courses/typescriptCourse.ts`

For each hit, decide:
- If it's incidental (e.g., "audio branding" in marketing content is legit, "narrative-driven" is a pedagogy term, not a feature promise): leave it.
- If it's a product-feature promise ("audio-narrated lessons", "listen while you drive"): rewrite as NotebookLM-framed or delete that sentence.

- [ ] **Step 2: Convert `designCourse.ts` to a Planner skeleton**

Read the file. It has `modules[].lessons[].content` strings with actual lesson bodies. Convert to skeleton:

- For each lesson inside each module, replace the `content: "..."` field with `content: ""` (empty string — the skeleton shape keeps everything else: title, learningObjectives, keyPoints, duration).
- Leave `learningObjectives`, `keyPoints`, `resources`, `duration`, module-level `description` fields intact.

This is a large mechanical edit. The subagent should use `Edit` with `replace_all: false` on distinct `content:` blocks, or read the file in sections.

- [ ] **Step 3: Add `tier` annotation in `exampleCurricula.ts`**

Open `src/data/exampleCurricula.ts`. The `ExampleCurriculum` type needs an optional `tier` field. Update the type definition:

```ts
export type ExampleCurriculum = Curriculum & {
  teachingStyle: TeachingStyle;
  /** Which tier this example demonstrates on the landing page. */
  tier: "planner" | "masterclass";
};
```

Then in the `exampleCurriculaWithStyles` array, add `tier` to each entry:
- `dsCourse` (design) → `tier: "planner"`
- `mktCourse` (marketing) → `tier: "masterclass"`
- `tsCourse` (typescript) → `tier: "masterclass"`

- [ ] **Step 4: Render tier badge on example cards**

Modify `src/app/page.tsx` around lines 1131-1170 (the `exampleCurricula.map` block). Inside the card content, above the course title, add a tier badge:

```tsx
<Badge
  variant="outline"
  className={`mt-1 rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
    exampleCurriculaWithStyles[i]?.tier === "masterclass"
      ? "border-amber-500/40 text-amber-500 bg-amber-500/5"
      : "border-violet-500/40 text-violet-500 bg-violet-500/5"
  }`}
>
  {exampleCurriculaWithStyles[i]?.tier === "masterclass" ? "Masterclass output" : "Planner output"}
</Badge>
```

- [ ] **Step 5: Add NotebookLM download button to preview modal**

Find the preview modal JSX. It's opened via `setPreviewCurriculum(fullExampleCurricula[i])`. When the modal renders, if `previewCurriculum` is set and the matching tier is `"masterclass"`, show a "Download for NotebookLM" button that triggers a client-side download.

Add this imperative handler near the component's other handlers:

```tsx
const handleExamplePreviewNotebookLMDownload = useCallback(() => {
  if (!previewCurriculum) return;
  import("@/lib/exports/generateNotebookLMMarkdown").then(({
    generateNotebookLMMarkdown,
    notebookLMFilename,
  }) => {
    const md = generateNotebookLMMarkdown(previewCurriculum);
    const filename = notebookLMFilename(previewCurriculum);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}, [previewCurriculum]);
```

Then inside the modal body, only when the previewed example has `tier === "masterclass"`, add a button:

```tsx
{previewTeachingStyle /* proxy: only when modal is open */ &&
  exampleCurriculaWithStyles.find(
    (e) => e.title === previewCurriculum?.courseTitle,
  )?.tier === "masterclass" && (
  <Button
    onClick={handleExamplePreviewNotebookLMDownload}
    className="mt-4 gap-2 bg-orange-600 hover:bg-orange-700 text-white border-0"
    size="lg"
  >
    <Headphones className="h-4 w-4" />
    Download for NotebookLM
  </Button>
)}
```

If the `courseTitle` field name differs from what `generateNotebookLMMarkdown` expects (check the `Curriculum` type), adjust the match criterion. The goal is: visible only on Masterclass-tier examples.

- [ ] **Step 6: Delete orphaned `public/examples/` files**

Verify first that nothing references them:

Run: `rg "examples/(photography|python|yoga|marketing)\.json|/examples/" src/`
Expected: zero matches.

Then delete:

```bash
rm public/examples/photography.json
rm public/examples/python.json
rm public/examples/yoga.json
rm public/examples/marketing.json
```

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/data/courses/ src/data/exampleCurricula.ts src/app/page.tsx
git add -u public/examples/
git commit -m "feat(examples): re-tier landing examples + NotebookLM download + cleanup

- designCourse: convert to Planner skeleton (empty lesson bodies, keep structure)
- marketingCourse, typescriptCourse: Masterclass full-body, audio refs scrubbed
- exampleCurriculaWithStyles: add tier field
- Landing page: render 'Planner output' / 'Masterclass output' badge per card
- Preview modal: 'Download for NotebookLM' button on Masterclass examples
  (client-side inline formatter call via Blob download)
- Remove orphaned public/examples/*.json (0 refs in src/)"
```

---

## Task 11 — Final verification

**Files:** none modified — verification only.

- [ ] **Step 1: Global sweep for surviving legacy vocabulary**

Run: `rg -i "pro max|proMax|ElevenLabs|audio narration|voice clon|ai audio" src/ public/ --glob '!*.test.ts' --glob '!tiers.ts' --glob '!resolvePriceId.ts' --glob '!database.types.ts' --glob '!node_modules'`

Expected: zero matches. Any match is a bug — fix it inline before continuing.

- [ ] **Step 2: Stale price sweep**

Run: `rg "€28|€33|€69" src/ --glob '!node_modules'`

Expected: zero matches.

- [ ] **Step 3: Run full test suite**

Run: `bun run vitest run`

Expected: zero failures. Pre-existing `bun:test`/`vitest` import errors (noted in the git history as pre-existing) are acceptable; any NEW failure is in-scope to fix.

- [ ] **Step 4: Typecheck**

Run: `rm -rf .next && bun run typecheck`

(The `rm -rf .next` is required after file deletions to clear stale route type cache — there's a git-history precedent for this from the audio-route deletion in commit `a3842d7`.)

Expected: zero errors.

- [ ] **Step 5: Playwright smoke (if MCP available)**

Per user memory `Syllabi Playwright MCP installed for syllabi.online; use for mobile/visual UI verification instead of curl`:

Using Playwright MCP (or equivalent manual browser visit):
1. Open `/` — verify hero, pricing rows, example cards all show new vocabulary and new prices.
2. Open `/pricing` — verify 4 tier cards, €10 Single Masterclass sub-card, 5-Pack sub-card, disabled CTAs labelled "Launching tomorrow".
3. Open `/profile` (signed-in flow if possible) — verify Masterclass locked section + €10 CTA on Planner skeletons.
4. Open `/pricing` at 390x844 (iPhone 13 viewport) — verify mobile layout doesn't collapse.
5. Check the browser console at each step — zero errors.

If Playwright MCP access isn't available in the subagent, note this explicitly and defer visual verification; typecheck + rg sweeps must still pass.

- [ ] **Step 6: Commit the no-op verification tag**

If any inline fixes were needed during verification, commit them with a clear message. Otherwise, no commit.

- [ ] **Step 7: Push-ready summary**

Produce a short summary documenting:
- Number of commits on the branch since `e33192c`
- Number of files touched
- The flag state (`NEXT_PUBLIC_PRICING_LIVE=false`)
- Remaining Phase 2 work (from spec §8)

This summary is for the user's morning review — not a commit, just a final message.

---

## Self-review note

The implementer subagent for each task should verify:

- After each task's commit, the working tree is clean.
- Each task's sweep runs on its claimed scope only — don't touch files outside the task's file list even if you see a legacy string.
- Use `Edit` with exact-string matches (preserving whitespace) rather than `replace_all` unless explicitly intended.
- When in doubt about a translation nuance in i18n (Task 3), pick the most common idiomatic form and move on — correctness beats perfection overnight.
- Never rename the i18n keys (`proDesc`, `pm1..7`, `startProBtn` etc.) — this is an explicit non-goal.
- Never modify `tierOrFallback()`, `resolvePriceId()`, `src/types/database.types.ts`, or anything under `src/app/api/checkout` / `src/app/api/webhooks/stripe` — those are Phase 2.
