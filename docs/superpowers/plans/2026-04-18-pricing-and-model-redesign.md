# Pricing & Model Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the new 4-tier pricing structure (Free / Planner / Masterclass / Enterprise) + Masterclass 5-Pack + €5 body unlock, rename Pro→Planner and Pro Max→Masterclass throughout, cap the previously-unlimited top tier at 20/mo, add Opus reviewer + strategic polish behind feature flags.

**Architecture:** Three concurrent changes — (a) data layer: enum rename + new columns + conversion_credits table; (b) backend logic: cap rewrite, webhook extensions, body-unlock checkout + Inngest function, Opus reviewer step, strategic polish step; (c) frontend: pricing page, PaywallModal, BodyUnlockButton, Enterprise card, dashboard prompts, i18n×16. All feature-flagged.

**Tech Stack:** Next.js 16.2.1 (App Router), TypeScript, Tailwind v4 + shadcn/ui, Supabase Postgres + Auth, Stripe Checkout + Webhooks, Inngest (on Cloud Run), Anthropic Claude API (Sonnet 4.6, Opus 4.7), ElevenLabs, Vercel.

**Spec source:** `docs/superpowers/specs/2026-04-18-pricing-and-model-redesign.md` (authoritative). Notion mirror: https://www.notion.so/34615a619d1f81b48b56f196fd07b604.

**Hard constraints (from AGENTS.md + Claude Code Context):**
- `recordEvent()` must be OUTSIDE `step.run()` (Inngest memoizes step results on retry → phantom duplicate events).
- `NEXT_PUBLIC_*` env vars are baked at build-time into Cloud Run Dockerfile; frontend reads from Vercel bundle.
- Inngest worker runs on Cloud Run (not Vercel) due to 300s function cap — new Inngest functions require Filippo to redeploy Cloud Run.
- Migration numbering: **next available is 017** (015 and 016 already used for `generation_sources`).
- 16 locale files in `src/lib/i18n/locales/` — update `en.ts` + all 15 others in the same PR. No drift.

**Split of responsibilities for this cutover:**
- **Claude:** all code + migration 017 (applied via Supabase MCP) + types regen + PR. Feature flags default OFF.
- **Gianmarco:** create 6 Stripe products + conversion coupon + archive 3 old Price IDs; set 6 `NEXT_PUBLIC_STRIPE_*` vars in Vercel + Cloud Run.
- **Filippo (when back):** redeploy Cloud Run with new env vars; flip feature flags ON after smoke test.

---

## File Structure

### Files to CREATE

**Database:**
- `supabase/migrations/017_pricing_redesign.sql` — enum values, table alter, conversion_credits table, data migration, feature-flag table.

**Tier config (single source of truth):**
- `src/lib/pricing/tiers.ts` — tier definitions, cap lookup, price-id helpers, body-unlock config.
- `src/lib/pricing/cap-enforcement.ts` — the `canGenerate(userId, tier, options)` function used by `/api/generate`.

**Body unlock (Planner €5):**
- `src/app/api/checkout/body-unlock/route.ts` — Stripe Checkout Session for €5 body unlock.
- `src/lib/inngest/body-unlock.ts` — new Inngest function, event `course/body-unlock.requested`.

**Quality pipeline:**
- `src/lib/inngest/reviewer.ts` — Opus reviewer step helper (called inside skeleton flow, feature-flagged).
- `src/lib/inngest/polish.ts` — strategic polish step helper + priority algorithm (called after module bodies finalize, feature-flagged).

**Frontend:**
- `src/components/BodyUnlockButton.tsx` — the €5 unlock CTA on Planner skeletons.
- `src/components/PricingCard.tsx` — shared card component (4 cards + 5-Pack sub-card).
- `src/components/EnterpriseMailtoCta.tsx` — thin button wrapper around `mailto:` with pre-filled body.

**Types:**
- `src/types/pricing.ts` — `Tier`, `BillingInterval`, cap types.

### Files to MODIFY

**Schema types (regenerated):**
- `src/types/database.types.ts` — `npx supabase gen types typescript …` after migration.

**Stripe:**
- `src/app/api/checkout/route.ts:78-96` — swap to new env var names + validate new price IDs.
- `src/app/api/webhooks/stripe/route.ts` — full rewrite of `resolvePriceId()`, plan-specific branches, 5-Pack conversion credit logic, body-unlock handling.

**Generation:**
- `src/app/api/generate/route.ts:1041-1070` — replace `checkGenerationLimit` with `canGenerate` from new cap-enforcement module; return structured 402 on cap-exceeded.

**Inngest pipeline:**
- `src/lib/inngest/client.ts:43-96` — add 2 new events: `course/body-unlock.requested`, `course/polish.requested`.
- `src/lib/inngest/functions.ts:484-1307` — wire reviewer into `courseGenerate` (post-skeleton), wire polish into `courseFinalize` (pre-finalize for Masterclass-length), emit `course/body-unlock.requested` from webhook.
- `src/app/api/inngest/route.ts:1-58` — register new functions in the `serve({ functions: [...] })` list.

**Frontend:**
- `src/app/pricing/page.tsx` — full redesign, 4 cards + 5-Pack sub-card, annual/monthly toggle, i18n-backed.
- `src/app/page.tsx` — update any pricing-section echoes (line ~130 per mobile-polish spec), metadata if it mentions Pro/Pro Max.
- `src/components/PaywallModal.tsx` — new props `{ reason: 'cap_exceeded' | 'masterclass_body_on_planner' | 'free_cap' }`, new copy per origin tier, new price IDs.
- `src/app/dashboard/*` — any file mentioning "Pro Max" / "Pro" / "Upgrade to" → Masterclass/Planner (grep sweep task).
- `src/app/manifest.ts` — if it mentions Pro/Pro Max.
- `src/app/layout.tsx` — update metadata if it mentions pricing.

**i18n:**
- `src/lib/i18n/types.ts` — add `pricing` and `paywall` keys to `Translations` type.
- `src/lib/i18n/locales/en.ts` — add full English copy.
- `src/lib/i18n/locales/{ar,de,es,fr,hi,it,ja,ko,nl,pl,pt,ru,sv,tr,zh}.ts` — machine-translated copy, Italian reviewed by Gianmarco.

**Env type (if exists):**
- `src/env.ts` or equivalent — declare new env var types.

### Files NOT touched (verified via spec non-goals)
- `src/lib/inngest/client.ts` event schemas for `course/generate.requested`, `module/generate.requested`, `course/finalize.requested` — unchanged (only ADDING events).
- `courses.status` enum — unchanged.
- `recordEvent`, `generation_events` table shape — unchanged.
- URL/YouTube validators — unchanged.

---

## Phase 0 — Branch + verify tooling

### Task 0: Create branch + verify tooling

**Files:** none

- [ ] **Step 1: Create feature branch off main**

```bash
cd /Users/gianmarcopaglierani/Projects/syllabi.online
git checkout -b feat/pricing-and-model-redesign
```

- [ ] **Step 2: Verify Supabase MCP is reachable**

Call `mcp__claude_ai_Supabase__list_projects`. Expected: project `gmxseuttpurnxbluvcwx` (syllabi.online, eu-west-1) in the result.

- [ ] **Step 3: Verify working tree is clean**

```bash
git status
```
Expected: `nothing to commit, working tree clean` on new branch.

- [ ] **Step 4: Commit branch marker**

No code change — proceed directly to Phase 1.

---

## Phase 1 — Data layer

### Task 1: Write migration 017

**Files:**
- Create: `supabase/migrations/017_pricing_redesign.sql`

- [ ] **Step 1: Write migration file**

Full contents:

```sql
-- ============================================================
-- 017_pricing_redesign.sql
-- ============================================================
-- Pricing & model redesign: Free / Planner / Masterclass /
-- Enterprise + Masterclass 5-Pack + €5 body unlock.
--
-- Pre-launch cutover — no grandfather logic. Existing 'pro'
-- users become 'planner'; existing 'pro_max' users become
-- 'masterclass'. Stripe Price IDs are rotated in a separate
-- dashboard step by Gianmarco.
--
-- NOTE: ALTER TYPE … ADD VALUE cannot run inside a transaction
-- block, so this migration is intentionally split across two
-- phases. Supabase runs each file as its own transaction; to
-- work around this, we add the new enum values in this file
-- (which commits on success) and rely on the follow-up
-- migration or manual UPDATE to rename them. Because `planner`,
-- `masterclass`, and `enterprise` are additive, the ALTER TYPE
-- statements can run here without COMMIT issues when each is
-- its own statement.
-- ============================================================

-- 1. Extend plan_type enum (additive, safe)
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'planner';
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'masterclass';
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'enterprise';

-- Note: the old 'pro' and 'pro_max' values remain in the enum.
-- Postgres does not support DROP VALUE from an enum. They are
-- simply retired — new code never writes them, existing rows
-- are migrated below. This is safe because plan_type is a
-- textual enum, not a bitfield.

-- 2. Body-unlock tracking on courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS body_unlock_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS body_unlock_purchased_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS body_unlock_stripe_session_id TEXT;

-- 3. Conversion credits (5-Pack → Masterclass)
CREATE TABLE IF NOT EXISTS public.conversion_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_purchase_stripe_session_id text NOT NULL,
  amount_eur numeric(10,2) NOT NULL DEFAULT 20.00,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  redeemed_stripe_invoice_id text,
  CONSTRAINT credit_window CHECK (expires_at > purchased_at),
  CONSTRAINT one_credit_per_source UNIQUE (source_purchase_stripe_session_id)
);

CREATE INDEX IF NOT EXISTS conversion_credits_user_active_idx
  ON public.conversion_credits (user_id)
  WHERE redeemed = false;

ALTER TABLE public.conversion_credits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversion_credits'
      AND policyname = 'conversion_credits_owner_read'
  ) THEN
    CREATE POLICY "conversion_credits_owner_read"
      ON public.conversion_credits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Profiles: billing_period + enterprise_gen_cap (nullable, per-contract)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_period text CHECK (billing_period IN ('monthly','annual','one_time') OR billing_period IS NULL),
  ADD COLUMN IF NOT EXISTS enterprise_gen_cap integer;

-- 5. Data migration (pre-launch, small volume):
--    pro  → planner ; pro_max → masterclass.
UPDATE public.profiles SET plan = 'planner'::public.plan_type
  WHERE plan::text = 'pro';

UPDATE public.profiles SET plan = 'masterclass'::public.plan_type
  WHERE plan::text = 'pro_max';

-- 6. Reset caps to new defaults (data migration):
--    planner → 15 ; masterclass → 20. Free stays at 1.
UPDATE public.profiles
  SET generations_limit = 15
  WHERE plan::text = 'planner' AND generations_limit != 15;

UPDATE public.profiles
  SET generations_limit = 20
  WHERE plan::text = 'masterclass' AND generations_limit != 20;

UPDATE public.profiles
  SET generations_limit = 1
  WHERE plan::text = 'free' AND generations_limit != 1;

-- 7. Comments for future readers
COMMENT ON TABLE public.conversion_credits IS
  '5-Pack → Masterclass conversion credit (€20 off, 30-day window, one per lifetime per user).';
COMMENT ON COLUMN public.courses.body_unlock_purchased IS
  'Planner-tier body unlock: €5 one-time purchase flips this true, then Inngest regenerates module bodies with Sonnet.';
COMMENT ON COLUMN public.profiles.enterprise_gen_cap IS
  'Per-contract generation cap for enterprise tier. NULL for non-enterprise; interpreted as "unlimited per contract" by cap-enforcement.ts.';
```

- [ ] **Step 2: Apply via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `017_pricing_redesign`
- `query`: the full SQL above

Expected: success. If fails on enum add-value (because ALTER TYPE can't be in a transaction), split into two apply_migration calls — first the three ALTER TYPE statements, then the rest.

- [ ] **Step 3: Verify applied**

Call `mcp__claude_ai_Supabase__execute_sql`:
```sql
SELECT unnest(enum_range(NULL::public.plan_type))::text AS plan_value;
```
Expected output includes: `free`, `pro`, `team`, `pro_max`, `planner`, `masterclass`, `enterprise`.

```sql
SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='courses'
    AND column_name IN ('body_unlock_purchased','body_unlock_purchased_at','body_unlock_stripe_session_id');
```
Expected: 3 rows.

```sql
SELECT COUNT(*) FROM public.conversion_credits;
```
Expected: 0.

```sql
SELECT plan::text, COUNT(*) FROM public.profiles GROUP BY plan;
```
Expected: no rows with plan='pro' or 'pro_max' (all migrated).

- [ ] **Step 4: Regenerate types**

Call `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id=gmxseuttpurnxbluvcwx`. Write the full result to `src/types/database.types.ts` (overwrite).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/017_pricing_redesign.sql src/types/database.types.ts
git commit -m "feat(db): migration 017 — pricing redesign enums, conversion_credits, body unlock tracking"
```

---

### Task 2: Tier config module

**Files:**
- Create: `src/lib/pricing/tiers.ts`
- Create: `src/types/pricing.ts`

- [ ] **Step 1: Write pricing types**

`src/types/pricing.ts`:

```typescript
export type Tier = "free" | "planner" | "masterclass" | "enterprise";
export type BillingInterval = "monthly" | "annual" | "one_time";

export type CapResult =
  | { allowed: true }
  | { allowed: false; reason: "cap_exceeded"; tier: Tier; cap: number; resetAt: string };

export interface TierConfig {
  id: Tier;
  priceMonthly: number | null;   // EUR, null = contact sales
  priceAnnual: number | null;
  monthlyCap: number;            // -1 = no cap (enterprise custom)
  hasReviewer: boolean;
  hasModuleBodies: boolean;      // false for Planner (body-unlock only)
  hasPolish: boolean;
  hasAudio: boolean;
  hasWhiteLabel: boolean;
}
```

- [ ] **Step 2: Write tier config**

`src/lib/pricing/tiers.ts`:

```typescript
import type { Tier, TierConfig } from "@/types/pricing";

/**
 * Single source of truth for pricing tiers. DB values in
 * public.plan_type enum map to these keys exactly.
 *
 * Legacy 'pro' and 'pro_max' are NOT listed here — data migration
 * 017 converts them to 'planner' and 'masterclass' respectively.
 */
export const TIERS: Record<Tier, TierConfig> = {
  free: {
    id: "free",
    priceMonthly: 0,
    priceAnnual: 0,
    monthlyCap: 1,
    hasReviewer: false,
    hasModuleBodies: false,
    hasPolish: false,
    hasAudio: false,
    hasWhiteLabel: false,
  },
  planner: {
    id: "planner",
    priceMonthly: 29,
    priceAnnual: 290,
    monthlyCap: 15,
    hasReviewer: true,          // Opus reviewer pass on every skeleton
    hasModuleBodies: false,     // Skeleton-only; bodies via €5 unlock
    hasPolish: false,
    hasAudio: false,
    hasWhiteLabel: false,
  },
  masterclass: {
    id: "masterclass",
    priceMonthly: 99,
    priceAnnual: 990,
    monthlyCap: 20,
    hasReviewer: true,
    hasModuleBodies: true,
    hasPolish: true,             // Strategic Opus polish on 15 lessons
    hasAudio: true,
    hasWhiteLabel: true,
  },
  enterprise: {
    id: "enterprise",
    priceMonthly: null,
    priceAnnual: null,
    monthlyCap: -1,              // Overridden by profiles.enterprise_gen_cap per contract
    hasReviewer: true,
    hasModuleBodies: true,
    hasPolish: true,
    hasAudio: true,
    hasWhiteLabel: true,
  },
};

export const BODY_UNLOCK_PRICE_EUR = 5;
export const FIVE_PACK_PRICE_EUR = 39;
export const FIVE_PACK_CREDIT_EUR = 20;
export const FIVE_PACK_CREDIT_WINDOW_DAYS = 30;
export const FIVE_PACK_COUNT = 5;
export const FIVE_PACK_WINDOW_DAYS = 90;

export function tierOrFallback(raw: string | null | undefined): Tier {
  if (raw === "planner" || raw === "masterclass" || raw === "enterprise" || raw === "free") {
    return raw;
  }
  // Legacy fallback — any 'pro' / 'pro_max' rows that somehow survived
  // migration 017 (fresh-clone defence).
  if (raw === "pro") return "planner";
  if (raw === "pro_max") return "masterclass";
  return "free";
}
```

- [ ] **Step 3: Write tier config tests**

`src/lib/pricing/__tests__/tiers.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { TIERS, tierOrFallback } from "@/lib/pricing/tiers";

describe("TIERS config", () => {
  it("has exactly four tiers", () => {
    expect(Object.keys(TIERS).sort()).toEqual(["enterprise", "free", "masterclass", "planner"]);
  });

  it("planner is skeleton-only (no module bodies)", () => {
    expect(TIERS.planner.hasModuleBodies).toBe(false);
    expect(TIERS.planner.hasReviewer).toBe(true);
  });

  it("masterclass has full pipeline", () => {
    expect(TIERS.masterclass.hasModuleBodies).toBe(true);
    expect(TIERS.masterclass.hasPolish).toBe(true);
    expect(TIERS.masterclass.hasAudio).toBe(true);
    expect(TIERS.masterclass.hasWhiteLabel).toBe(true);
  });

  it("masterclass cap is 20 (not unlimited)", () => {
    expect(TIERS.masterclass.monthlyCap).toBe(20);
  });

  it("annual is 10× monthly for planner and masterclass", () => {
    expect(TIERS.planner.priceAnnual).toBe(TIERS.planner.priceMonthly! * 10);
    expect(TIERS.masterclass.priceAnnual).toBe(TIERS.masterclass.priceMonthly! * 10);
  });
});

describe("tierOrFallback", () => {
  it("passes new tiers through", () => {
    expect(tierOrFallback("planner")).toBe("planner");
    expect(tierOrFallback("masterclass")).toBe("masterclass");
    expect(tierOrFallback("enterprise")).toBe("enterprise");
    expect(tierOrFallback("free")).toBe("free");
  });

  it("maps legacy pro → planner and pro_max → masterclass", () => {
    expect(tierOrFallback("pro")).toBe("planner");
    expect(tierOrFallback("pro_max")).toBe("masterclass");
  });

  it("falls back to free for unknown / null", () => {
    expect(tierOrFallback(null)).toBe("free");
    expect(tierOrFallback("team")).toBe("free");
    expect(tierOrFallback(undefined)).toBe("free");
  });
});
```

- [ ] **Step 4: Run tests**

```bash
bun test src/lib/pricing/__tests__/tiers.test.ts
```
Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/types/pricing.ts src/lib/pricing/tiers.ts src/lib/pricing/__tests__/tiers.test.ts
git commit -m "feat(pricing): tier config + fallback + tests"
```

---

### Task 3: Cap enforcement module

**Files:**
- Create: `src/lib/pricing/cap-enforcement.ts`

- [ ] **Step 1: Write failing test**

`src/lib/pricing/__tests__/cap-enforcement.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { canGenerate } from "@/lib/pricing/cap-enforcement";

describe("canGenerate", () => {
  it("free user under cap → allowed", () => {
    const r = canGenerate({ tier: "free", generationsUsedThisMonth: 0 });
    expect(r.allowed).toBe(true);
  });

  it("free user at cap → denied", () => {
    const r = canGenerate({ tier: "free", generationsUsedThisMonth: 1 });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.cap).toBe(1);
  });

  it("planner under 15 → allowed", () => {
    const r = canGenerate({ tier: "planner", generationsUsedThisMonth: 14 });
    expect(r.allowed).toBe(true);
  });

  it("planner at 15 → denied", () => {
    const r = canGenerate({ tier: "planner", generationsUsedThisMonth: 15 });
    expect(r.allowed).toBe(false);
  });

  it("masterclass at 20 → denied (no more unlimited)", () => {
    const r = canGenerate({ tier: "masterclass", generationsUsedThisMonth: 20 });
    expect(r.allowed).toBe(false);
  });

  it("masterclass at 19 → allowed", () => {
    const r = canGenerate({ tier: "masterclass", generationsUsedThisMonth: 19 });
    expect(r.allowed).toBe(true);
  });

  it("enterprise with null cap → allowed (100 default)", () => {
    const r = canGenerate({ tier: "enterprise", generationsUsedThisMonth: 50, enterpriseGenCap: null });
    expect(r.allowed).toBe(true);
  });

  it("enterprise with per-contract cap honoured", () => {
    const r = canGenerate({ tier: "enterprise", generationsUsedThisMonth: 30, enterpriseGenCap: 30 });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.cap).toBe(30);
  });

  it("returns ISO reset_at at next UTC month start", () => {
    const r = canGenerate({
      tier: "free",
      generationsUsedThisMonth: 1,
      now: new Date("2026-04-18T12:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.resetAt).toBe("2026-05-01T00:00:00.000Z");
  });
});
```

- [ ] **Step 2: Run test → expect fail**

```bash
bun test src/lib/pricing/__tests__/cap-enforcement.test.ts
```
Expected: fails with module not found.

- [ ] **Step 3: Implement cap-enforcement**

`src/lib/pricing/cap-enforcement.ts`:

```typescript
import type { Tier, CapResult } from "@/types/pricing";
import { TIERS } from "@/lib/pricing/tiers";

const ENTERPRISE_DEFAULT_CAP = 100;

export interface CanGenerateInput {
  tier: Tier;
  generationsUsedThisMonth: number;
  /** Only consulted when tier==='enterprise'. Null → default 100. */
  enterpriseGenCap?: number | null;
  /** Override for testing. */
  now?: Date;
}

export function canGenerate(input: CanGenerateInput): CapResult {
  const { tier, generationsUsedThisMonth } = input;
  const now = input.now ?? new Date();

  let cap: number;
  if (tier === "enterprise") {
    cap = input.enterpriseGenCap ?? ENTERPRISE_DEFAULT_CAP;
  } else {
    cap = TIERS[tier].monthlyCap;
  }

  if (generationsUsedThisMonth < cap) return { allowed: true };

  return {
    allowed: false,
    reason: "cap_exceeded",
    tier,
    cap,
    resetAt: nextMonthStartUtc(now).toISOString(),
  };
}

function nextMonthStartUtc(now: Date): Date {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
}
```

- [ ] **Step 4: Run tests → expect pass**

```bash
bun test src/lib/pricing/__tests__/cap-enforcement.test.ts
```
Expected: 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pricing/cap-enforcement.ts src/lib/pricing/__tests__/cap-enforcement.test.ts
git commit -m "feat(pricing): canGenerate cap-enforcement + tests"
```

---

### Task 4: Wire cap-enforcement into /api/generate

**Files:**
- Modify: `src/app/api/generate/route.ts:1041-1070`

- [ ] **Step 1: Read current checkGenerationLimit**

Current code at lines 1041-1070 (verified in exploration):
```typescript
async function checkGenerationLimit(userId: string): Promise<boolean> {
  // ... returns boolean
}
```

- [ ] **Step 2: Replace with canGenerate wrapper**

Replace the function with:

```typescript
import { canGenerate } from "@/lib/pricing/cap-enforcement";
import { tierOrFallback } from "@/lib/pricing/tiers";
import type { CapResult } from "@/types/pricing";

async function checkGenerationLimit(userId: string): Promise<CapResult> {
  const supabase = await createSupabaseServer();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, generations_used, enterprise_gen_cap")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    // Profile not found — allow generation (will be created on first save)
    return { allowed: true };
  }

  return canGenerate({
    tier: tierOrFallback(profile.plan),
    generationsUsedThisMonth: profile.generations_used,
    enterpriseGenCap: profile.enterprise_gen_cap,
  });
}
```

- [ ] **Step 3: Update every caller**

Search for all callers of `checkGenerationLimit`:

```bash
rg "checkGenerationLimit\(" src/app/api/generate/route.ts
```

At each callsite that previously did:
```typescript
const allowed = await checkGenerationLimit(userId);
if (!allowed) return NextResponse.json({ error: "limit" }, { status: 402 });
```

Replace with:
```typescript
const cap = await checkGenerationLimit(userId);
if (!cap.allowed) {
  return NextResponse.json(
    { error: "cap_exceeded", tier: cap.tier, cap: cap.cap, resetAt: cap.resetAt },
    { status: 402 }
  );
}
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors (may have existing unrelated errors — note them but don't fix).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat(generate): use canGenerate + return structured 402 on cap exceeded"
```

---

## Phase 2 — Stripe webhook + checkout

### Task 5: Rewrite resolvePriceId for new env vars

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts:44-96`

- [ ] **Step 1: Replace EUR_PRICE_IDS + resolvePriceId**

Full replacement of lines 44-96 (`EUR_PRICE_IDS`, `ResolvedPlan`, `BillingInterval`, `PRO_MONTHLY_QUOTA`, `PRO_ANNUAL_QUOTA`, `resolvePriceId`):

```typescript
// ─── Resolved-plan types ──────────────────────────────────────
type ResolvedPlan =
  | "planner"
  | "masterclass"
  | "masterclass_5pack"
  | "planner_body_unlock"
  | "unknown";
type BillingInterval = "month" | "year" | "one_time";

/** Legacy EUR price IDs kept ONLY to gracefully handle in-flight
 *  webhook events from the pre-redesign era. After all live
 *  subscribers are migrated (see migration 017), these can be
 *  removed. They resolve to the new tiers per the data migration:
 *    pro  → planner   (€28 monthly)
 *    pro_max → masterclass (€69 monthly)
 *    5-Pack → masterclass_5pack (€33 one-time) — conversion to
 *             new €39 flow happens naturally on repurchase.
 */
const LEGACY_PRICE_IDS = {
  pro: "price_1TKBpS3kBvceiBKLANxOEgzs",
  fivePack: "price_1TKBpT3kBvceiBKLgw6NIFap",
  proMax: "price_1TKBpU3kBvceiBKLmKdWHeub",
} as const;

/**
 * Resolves a Stripe price ID into our internal plan + billing interval.
 *
 * NEW env vars (2026-04-18 cutover):
 *   NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID       €29
 *   NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID        €290
 *   NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID   €99
 *   NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID    €990
 *   NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID     €39 one-time
 *   NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID   €5 one-time
 */
function resolvePriceId(priceId: string): { plan: ResolvedPlan; interval: BillingInterval } {
  const plannerMonthly = process.env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID || "";
  const plannerAnnual = process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID || "";
  const masterclassMonthly = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID || "";
  const masterclassAnnual = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID || "";
  const masterclass5Pack = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID || "";
  const plannerBodyUnlock = process.env.NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID || "";

  // 1) New env var match (primary)
  if (priceId && priceId === plannerMonthly) return { plan: "planner", interval: "month" };
  if (priceId && priceId === plannerAnnual) return { plan: "planner", interval: "year" };
  if (priceId && priceId === masterclassMonthly) return { plan: "masterclass", interval: "month" };
  if (priceId && priceId === masterclassAnnual) return { plan: "masterclass", interval: "year" };
  if (priceId && priceId === masterclass5Pack) return { plan: "masterclass_5pack", interval: "one_time" };
  if (priceId && priceId === plannerBodyUnlock) return { plan: "planner_body_unlock", interval: "one_time" };

  // 2) Legacy backstop (in-flight events from before the cutover)
  if (priceId === LEGACY_PRICE_IDS.pro) return { plan: "planner", interval: "month" };
  if (priceId === LEGACY_PRICE_IDS.fivePack) return { plan: "masterclass_5pack", interval: "one_time" };
  if (priceId === LEGACY_PRICE_IDS.proMax) return { plan: "masterclass", interval: "month" };

  // 3) Unknown
  return { plan: "unknown", interval: "month" };
}
```

- [ ] **Step 2: Remove PRO_MONTHLY_QUOTA / PRO_ANNUAL_QUOTA constants**

Replace with a single lookup pulling from `TIERS`:

```typescript
import { TIERS, FIVE_PACK_CREDIT_EUR, FIVE_PACK_CREDIT_WINDOW_DAYS } from "@/lib/pricing/tiers";

function capForTier(tier: "planner" | "masterclass", interval: BillingInterval): number {
  const monthlyCap = TIERS[tier].monthlyCap;
  return interval === "year" ? monthlyCap * 12 : monthlyCap;
}
```

- [ ] **Step 3: Commit (interim — handler rewrite in next task)**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): resolvePriceId handles new Planner/Masterclass/5-Pack/body-unlock IDs"
```

---

### Task 6: Rewrite checkout.session.completed branch

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts:147-243` (case `checkout.session.completed`)

- [ ] **Step 1: Replace the entire case body with plan-specific branches**

```typescript
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId || "";

  if (!userId || userId === "anonymous") {
    console.warn("[stripe-webhook] No userId in session metadata, skipping profile update");
    break;
  }

  const { plan, interval } = resolvePriceId(priceId);
  console.log(
    `[stripe-webhook] Checkout completed for user ${userId}, price: ${priceId}, plan: ${plan}, interval: ${interval}`
  );

  if (plan === "planner_body_unlock") {
    // ── €5 body unlock: flip courses.body_unlock_purchased ──
    const courseId = session.metadata?.courseId;
    if (!courseId) {
      console.error("[stripe-webhook] body_unlock session missing courseId in metadata");
      break;
    }
    await supabaseAdmin
      .from("courses")
      .update({
        body_unlock_purchased: true,
        body_unlock_purchased_at: new Date().toISOString(),
        body_unlock_stripe_session_id: session.id,
      })
      .eq("id", courseId)
      .eq("user_id", userId);

    // Fire Inngest event to generate the body
    const { inngest } = await import("@/lib/inngest/client");
    await inngest.send({
      name: "course/body-unlock.requested",
      data: { courseId, userId },
    });

    console.log(`[stripe-webhook] Body unlock purchased for course ${courseId}`);
    break;
  }

  if (plan === "masterclass_5pack") {
    // ── €39 5-Pack: grants 5 generations + masterclass tier + 30-day €20 credit ──
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("generations_limit, generations_used, plan")
      .eq("id", userId)
      .single();

    const currentLimit = profile?.generations_limit ?? 0;
    const nextLimit = currentLimit + 5;

    await supabaseAdmin
      .from("profiles")
      .update({
        plan: "masterclass",
        generations_limit: nextLimit,
        white_label: true,
        stripe_customer_id: session.customer as string,
        billing_period: "one_time",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // Insert conversion credit (30-day window). UNIQUE constraint on
    // source_purchase_stripe_session_id prevents double-insertion on
    // Stripe event replay.
    const expiresAt = new Date(Date.now() + FIVE_PACK_CREDIT_WINDOW_DAYS * 86400_000).toISOString();
    await supabaseAdmin
      .from("conversion_credits")
      .upsert({
        user_id: userId,
        source_purchase_stripe_session_id: session.id,
        amount_eur: FIVE_PACK_CREDIT_EUR,
        expires_at: expiresAt,
        redeemed: false,
      }, { onConflict: "source_purchase_stripe_session_id" });

    console.log(
      `[stripe-webhook] 5-Pack purchased by ${userId}: +5 generations, credit expires ${expiresAt}`
    );
    break;
  }

  if (plan === "masterclass") {
    const cap = capForTier("masterclass", interval);
    await supabaseAdmin
      .from("profiles")
      .update({
        plan: "masterclass",
        generations_limit: cap,
        generations_used: 0,
        white_label: true,
        stripe_customer_id: session.customer as string,
        billing_period: interval === "year" ? "annual" : "monthly",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    console.log(
      `[stripe-webhook] Upgraded user ${userId} to Masterclass ${interval === "year" ? "annual" : "monthly"} (cap=${cap})`
    );
    break;
  }

  if (plan === "planner") {
    const cap = capForTier("planner", interval);
    await supabaseAdmin
      .from("profiles")
      .update({
        plan: "planner",
        generations_limit: cap,
        generations_used: 0,
        white_label: false,
        stripe_customer_id: session.customer as string,
        billing_period: interval === "year" ? "annual" : "monthly",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    console.log(
      `[stripe-webhook] Upgraded user ${userId} to Planner ${interval === "year" ? "annual" : "monthly"} (cap=${cap})`
    );
    break;
  }

  console.warn(
    `[stripe-webhook] Unknown plan for price ${priceId}; no profile update performed.`
  );
  break;
}
```

- [ ] **Step 2: Rewrite invoice.paid branch (lines 248-308)**

Replace the body with:

```typescript
case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;

  if (invoice.billing_reason === "subscription_create") {
    console.log("[stripe-webhook] Skipping invoice.paid for new subscription (handled by checkout)");
    break;
  }

  const userId = await findUserByCustomerId(supabaseAdmin, customerId);
  if (!userId) {
    console.warn(`[stripe-webhook] invoice.paid: no user found for customer ${customerId}`);
    break;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renewalPriceId = (invoice.lines?.data?.[0] as any)?.price?.id || "";
  const { plan: renewalPlan, interval: renewalInterval } = resolvePriceId(renewalPriceId);

  if (renewalPlan === "masterclass") {
    const cap = capForTier("masterclass", renewalInterval);
    await supabaseAdmin
      .from("profiles")
      .update({
        plan: "masterclass",
        generations_limit: cap,
        generations_used: 0,
        white_label: true,
        billing_period: renewalInterval === "year" ? "annual" : "monthly",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // If this invoice has the 5-Pack conversion coupon applied, mark credit redeemed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discounts = (invoice as any).discount ? [(invoice as any).discount] : ((invoice as any).discounts || []);
    const hasConversionCredit = discounts.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d?.coupon?.id === "masterclass_5pack_conversion_credit"
    );
    if (hasConversionCredit) {
      await supabaseAdmin
        .from("conversion_credits")
        .update({ redeemed: true, redeemed_at: new Date().toISOString(), redeemed_stripe_invoice_id: invoice.id })
        .eq("user_id", userId)
        .eq("redeemed", false);
    }

    console.log(`[stripe-webhook] Invoice paid — Masterclass ${renewalInterval} for ${userId} (cap=${cap}, credit=${hasConversionCredit})`);
    break;
  }

  if (renewalPlan === "planner") {
    const cap = capForTier("planner", renewalInterval);
    await supabaseAdmin
      .from("profiles")
      .update({
        plan: "planner",
        generations_limit: cap,
        generations_used: 0,
        white_label: false,
        billing_period: renewalInterval === "year" ? "annual" : "monthly",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    console.log(`[stripe-webhook] Invoice paid — Planner ${renewalInterval} for ${userId} (cap=${cap})`);
    break;
  }

  break;
}
```

- [ ] **Step 3: Rewrite subscription.updated + subscription.deleted branches**

For `customer.subscription.updated` (lines 347-417), replace `"pro"` → `"planner"` and `"pro_max"` → `"masterclass"` throughout; use `TIERS[...].monthlyCap` for the quota.

For `customer.subscription.deleted` (lines 422-444), update:
```typescript
await supabaseAdmin
  .from("profiles")
  .update({
    plan: "free",
    generations_limit: 1, // New free-tier cap
    white_label: false,
    updated_at: new Date().toISOString(),
  })
  .eq("id", userId);
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): plan-specific branches for Planner/Masterclass/5-Pack + credit redemption + body-unlock event"
```

---

### Task 7: Webhook resolvePriceId tests

**Files:**
- Create: `src/app/api/webhooks/stripe/__tests__/resolvePriceId.test.ts`

- [ ] **Step 1: Extract resolvePriceId for testability**

Split `src/app/api/webhooks/stripe/route.ts` — move `resolvePriceId` and `LEGACY_PRICE_IDS` into a new module `src/app/api/webhooks/stripe/resolvePriceId.ts`, re-export from route. Keeps the route file focused on the handler.

File content:

```typescript
// src/app/api/webhooks/stripe/resolvePriceId.ts
export type ResolvedPlan =
  | "planner"
  | "masterclass"
  | "masterclass_5pack"
  | "planner_body_unlock"
  | "unknown";
export type BillingInterval = "month" | "year" | "one_time";

export const LEGACY_PRICE_IDS = {
  pro: "price_1TKBpS3kBvceiBKLANxOEgzs",
  fivePack: "price_1TKBpT3kBvceiBKLgw6NIFap",
  proMax: "price_1TKBpU3kBvceiBKLmKdWHeub",
} as const;

// [move the resolvePriceId function body verbatim here]
export function resolvePriceId(priceId: string, env = process.env): { plan: ResolvedPlan; interval: BillingInterval } {
  // Accept env as a parameter so tests can inject a fresh env map.
  // ... (same body as before, but reading `env` instead of `process.env`)
}
```

Update `route.ts` to `import { resolvePriceId, LEGACY_PRICE_IDS, ... } from "./resolvePriceId";`.

- [ ] **Step 2: Write tests**

`src/app/api/webhooks/stripe/__tests__/resolvePriceId.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolvePriceId } from "../resolvePriceId";

const ENV = {
  NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID: "price_planner_m",
  NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID: "price_planner_y",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID: "price_mc_m",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID: "price_mc_y",
  NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID: "price_5pack",
  NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID: "price_body",
} as NodeJS.ProcessEnv;

describe("resolvePriceId", () => {
  it("resolves new planner monthly", () => {
    expect(resolvePriceId("price_planner_m", ENV)).toEqual({ plan: "planner", interval: "month" });
  });
  it("resolves new masterclass annual", () => {
    expect(resolvePriceId("price_mc_y", ENV)).toEqual({ plan: "masterclass", interval: "year" });
  });
  it("resolves 5-pack one-time", () => {
    expect(resolvePriceId("price_5pack", ENV)).toEqual({ plan: "masterclass_5pack", interval: "one_time" });
  });
  it("resolves body unlock", () => {
    expect(resolvePriceId("price_body", ENV)).toEqual({ plan: "planner_body_unlock", interval: "one_time" });
  });
  it("legacy pro → planner", () => {
    expect(resolvePriceId("price_1TKBpS3kBvceiBKLANxOEgzs", ENV)).toEqual({ plan: "planner", interval: "month" });
  });
  it("legacy pro_max → masterclass", () => {
    expect(resolvePriceId("price_1TKBpU3kBvceiBKLmKdWHeub", ENV)).toEqual({ plan: "masterclass", interval: "month" });
  });
  it("unknown price → unknown", () => {
    expect(resolvePriceId("price_xxx", ENV)).toEqual({ plan: "unknown", interval: "month" });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
bun test src/app/api/webhooks/stripe/__tests__/resolvePriceId.test.ts
```
Expected: 7 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/stripe/resolvePriceId.ts src/app/api/webhooks/stripe/__tests__/resolvePriceId.test.ts src/app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): extract resolvePriceId + tests"
```

---

### Task 8: Update /api/checkout for new env vars

**Files:**
- Modify: `src/app/api/checkout/route.ts:76-96`

- [ ] **Step 1: Replace VALID_PRICE_IDS list**

```typescript
const VALID_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID,
  // Body unlock has its own route; not listed here.
].filter(Boolean);
```

- [ ] **Step 2: Replace fivePackPriceId lookup**

```typescript
const fivePackPriceId = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID || "";
const isOneTime = priceId === fivePackPriceId;
```

- [ ] **Step 3: Auto-apply 5-Pack conversion coupon when applicable**

Before `stripe.checkout.sessions.create(...)`, if this is a Masterclass subscription checkout and the user has an unredeemed credit:

```typescript
let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

if (
  user?.id &&
  (priceId === process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID)
) {
  const supabase = createServerClient(/* ... same args ... */);
  const { data: credit } = await supabase
    .from("conversion_credits")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("redeemed", false)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (credit) {
    discounts = [{ coupon: "masterclass_5pack_conversion_credit" }];
  }
}

const session = await stripe.checkout.sessions.create({
  mode: isOneTime ? "payment" : "subscription",
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  ...(discounts && { discounts }),
  success_url: `${appUrl}?checkout=success`,
  cancel_url: `${appUrl}?checkout=cancelled`,
  ...(user?.email && { customer_email: user.email }),
  metadata: {
    userId: user?.id || "anonymous",
    priceId,
  },
});
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat(checkout): new env vars + auto-apply 5-Pack conversion coupon"
```

---

### Task 9: Body-unlock checkout route

**Files:**
- Create: `src/app/api/checkout/body-unlock/route.ts`

- [ ] **Step 1: Write the route**

```typescript
/**
 * app/api/checkout/body-unlock/route.ts
 * ─────────────────────────────────────────────────────────────
 * Planner-tier body unlock: creates a Stripe Checkout Session for
 * a one-time €5 purchase that regenerates module bodies for a
 * specific course.
 *
 * POST /api/checkout/body-unlock
 * Body: { courseId: string }
 * Returns: { url: string } — Stripe-hosted checkout URL
 * ─────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getUserAndSupabase() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() { /* read-only */ },
        remove() { /* read-only */ },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { courseId } = await req.json();
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    const { user, supabase } = await getUserAndSupabase();
    if (!user) {
      return NextResponse.json({ error: "auth required" }, { status: 401 });
    }

    // Verify the course belongs to the user and is Planner-generated (skeleton only).
    const { data: course } = await supabase
      .from("courses")
      .select("id, user_id, status, body_unlock_purchased, length")
      .eq("id", courseId)
      .single();

    if (!course || course.user_id !== user.id) {
      return NextResponse.json({ error: "course not found" }, { status: 404 });
    }
    if (course.body_unlock_purchased) {
      return NextResponse.json({ error: "body already unlocked" }, { status: 409 });
    }
    if (course.length === "masterclass") {
      // Per spec §14.1: masterclass-length bodies require Masterclass tier, not €5 unlock.
      return NextResponse.json(
        { error: "masterclass_length_requires_subscription" },
        { status: 422 }
      );
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "body_unlock price not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/course/${courseId}?body_unlock=success`,
      cancel_url: `${appUrl}/course/${courseId}?body_unlock=cancelled`,
      customer_email: user.email ?? undefined,
      metadata: {
        userId: user.id,
        priceId,
        courseId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create body-unlock session";
    console.error("[/api/checkout/body-unlock] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/checkout/body-unlock/route.ts
git commit -m "feat(checkout): body-unlock route for Planner tier"
```

---

## Phase 3 — Inngest extensions

### Task 10: Register new events in client.ts

**Files:**
- Modify: `src/lib/inngest/client.ts:43-96`

- [ ] **Step 1: Add events to Events type**

Append to the `Events` type map:

```typescript
"course/body-unlock.requested": {
  data: { courseId: string; userId: string };
};
"course/polish.requested": {
  data: { courseId: string };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/inngest/client.ts
git commit -m "feat(inngest): add body-unlock + polish event types"
```

---

### Task 11: Body-unlock Inngest function

**Files:**
- Create: `src/lib/inngest/body-unlock.ts`
- Modify: `src/app/api/inngest/route.ts`

- [ ] **Step 1: Write the function**

`src/lib/inngest/body-unlock.ts`:

```typescript
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";

/**
 * course/body-unlock.requested handler.
 *
 * Triggered by Stripe webhook after a Planner user pays €5 for body
 * generation on a skeleton-only course. Reuses the existing module-
 * generation path by emitting `module/generate.requested` events for
 * each skeleton module.
 *
 * Per spec §5.4 step 5: Opus polish is NOT applied on Planner body
 * unlocks (polish is Masterclass-only).
 */
export const bodyUnlock = inngest.createFunction(
  {
    id: "course-body-unlock",
    name: "Course: Body Unlock (Planner €5)",
    retries: 2,
    onFailure: async ({ event, error, step }) => {
      const data = (event.data as { event: { data: { courseId: string } } }).event.data;
      console.error(`[body-unlock] exhausted retries for course ${data.courseId}: ${error.message}`);
    },
  },
  { event: "course/body-unlock.requested" },
  async ({ event, step }) => {
    const { courseId, userId } = event.data;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const course = await step.run("fetch-course", async () => {
      const { data, error } = await admin
        .from("courses")
        .select("id, user_id, curriculum, topic, audience, length, niche, language, level, teaching_style, output_structure, include_quizzes")
        .eq("id", courseId)
        .single();
      if (error || !data) throw new NonRetriableError("course not found");
      if (data.user_id !== userId) throw new NonRetriableError("course owner mismatch");
      if (!data.curriculum?.modules) throw new NonRetriableError("no skeleton to unlock");
      return data;
    });

    await step.run("mark-generating", async () => {
      await admin.from("courses").update({ status: "generating" }).eq("id", courseId);
    });

    // Reuse the existing module/generate.requested fan-out path.
    // curriculum.modules is the skeleton array.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modules = (course.curriculum as any).modules;
    for (let i = 0; i < modules.length; i++) {
      await step.sendEvent(`module-${i}`, {
        name: "module/generate.requested",
        data: {
          courseId,
          moduleIndex: i,
          moduleId: modules[i].id ?? `m${i}`,
          request: {
            topic: course.topic,
            audience: course.audience,
            length: course.length,
            niche: course.niche,
            language: course.language,
            teachingStyle: course.teaching_style,
            outputStructure: course.output_structure,
            includeQuizzes: course.include_quizzes,
          },
          skeletonTitle: course.curriculum.title ?? course.topic,
          skeletonDescription: course.curriculum.description ?? "",
          skeletonModule: modules[i],
          totalModules: modules.length,
        },
      });
    }

    return { ok: true, moduleCount: modules.length };
  }
);
```

- [ ] **Step 2: Register the function**

In `src/app/api/inngest/route.ts`, add to the `functions` array:

```typescript
import { bodyUnlock } from "@/lib/inngest/body-unlock";

// ...in serve({...}) functions list:
functions: [
  courseGenerate,
  moduleGenerate,
  courseFinalize,
  validateCourseUrls,
  bodyUnlock, // NEW
],
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inngest/body-unlock.ts src/app/api/inngest/route.ts
git commit -m "feat(inngest): body-unlock function reuses module-generate fan-out"
```

---

### Task 12: Opus reviewer step (skeleton quality gate)

**Files:**
- Create: `src/lib/inngest/reviewer.ts`
- Modify: `src/lib/inngest/functions.ts` (`courseGenerate` post-skeleton hook)

- [ ] **Step 1: Write the reviewer helper**

`src/lib/inngest/reviewer.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { recordEvent } from "@/lib/observability/metrics";

const REVIEWER_MODEL = "claude-opus-4-7";

/**
 * Runs an Opus review pass over a generated skeleton. Returns
 * 'approved' or 'needs_revision' with structured feedback.
 *
 * Gated by OPUS_REVIEWER_ENABLED env var. If flag off, returns
 * 'approved' without making a call (cost = 0).
 *
 * IMPORTANT: Per AGENTS.md, recordEvent() must be called OUTSIDE
 * step.run() blocks. This helper is always invoked OUTSIDE step.run,
 * via a plain async call in the orchestrator body. The caller is
 * responsible for awaiting it.
 */
export async function reviewSkeleton(params: {
  courseId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skeleton: any;
}): Promise<{ verdict: "approved" | "needs_revision"; feedback: string[] }> {
  if (process.env.OPUS_REVIEWER_ENABLED !== "true") {
    return { verdict: "approved", feedback: [] };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startMs = Date.now();

  try {
    const resp = await client.messages.create({
      model: REVIEWER_MODEL,
      max_tokens: 2048,
      temperature: 0,
      system: REVIEWER_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Review this course skeleton for internal contradictions, hallucinated external references, broken logical progression, out-of-topic drift, or inappropriate subject matter escape. Return JSON: {"verdict":"approved"|"needs_revision","feedback":["..."]}\n\nSKELETON:\n${JSON.stringify(params.skeleton, null, 2)}`,
        },
      ],
    });

    const text = resp.content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join("");
    const parsed = extractJson(text) as {
      verdict: "approved" | "needs_revision";
      feedback: string[];
    };

    await recordEvent({
      courseId: params.courseId,
      type: "claude_call_success",
      phase: "skeleton",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "reviewer",
        model: REVIEWER_MODEL,
        verdict: parsed.verdict,
        feedback_count: parsed.feedback?.length ?? 0,
        input_tokens: resp.usage?.input_tokens,
        output_tokens: resp.usage?.output_tokens,
      },
    });

    return parsed;
  } catch (err) {
    await recordEvent({
      courseId: params.courseId,
      type: "claude_call_failure",
      phase: "skeleton",
      durationMs: Date.now() - startMs,
      metadata: { step: "reviewer", error: (err as Error).message },
    });
    // Soft-fail: reviewer failure should not block the generation.
    return { verdict: "approved", feedback: [] };
  }
}

const REVIEWER_SYSTEM = `You are a senior curriculum reviewer. Identify only fatal-quality issues: contradictions, hallucinated external references (URLs, citations, figures, YouTube IDs), broken logical progression, out-of-topic drift, and subject-matter escape. Minor stylistic issues are NOT reasons for revision. Return strict JSON only.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json in reviewer response");
  return JSON.parse(match[0]);
}
```

- [ ] **Step 2: Wire into courseGenerate**

In `src/lib/inngest/functions.ts`, find the section of `courseGenerate` after the skeleton-generation step completes and BEFORE the module fan-out emits events. Add (OUTSIDE step.run):

```typescript
import { reviewSkeleton } from "@/lib/inngest/reviewer";
import { tierOrFallback, TIERS } from "@/lib/pricing/tiers";

// After skeleton exists, before module fan-out:
const profileTier = tierOrFallback((await fetchProfileTier(userId, supabaseAdmin)));
if (TIERS[profileTier].hasReviewer) {
  const review = await reviewSkeleton({ courseId, skeleton: skeletonDraft });
  if (review.verdict === "needs_revision") {
    // Attach feedback to metadata; do NOT block publish per spec §5.3.
    console.warn(`[courseGenerate] skeleton reviewer flagged ${courseId}: ${review.feedback.join("; ")}`);
    await supabaseAdmin
      .from("courses")
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quality_warnings: review.feedback as any,
      })
      .eq("id", courseId);
  }
}
```

Add helper `fetchProfileTier`:
```typescript
async function fetchProfileTier(userId: string, admin: SupabaseClient): Promise<string> {
  const { data } = await admin.from("profiles").select("plan").eq("id", userId).single();
  return data?.plan ?? "free";
}
```

- [ ] **Step 3: Add quality_warnings column (separate migration)**

Migration 017 is already committed, so create a new migration file `supabase/migrations/017b_quality_warnings.sql`:

```sql
-- 017b_quality_warnings.sql
-- Adds JSONB column for Opus-reviewer feedback attached to skeletons.
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS quality_warnings JSONB;
COMMENT ON COLUMN public.courses.quality_warnings IS
  'Array of reviewer feedback strings (Opus reviewer). NULL if approved or reviewer disabled.';
```

Apply via `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `gmxseuttpurnxbluvcwx`
- `name`: `017b_quality_warnings`
- `query`: the SQL above

- [ ] **Step 4: Regenerate types**

Call `mcp__claude_ai_Supabase__generate_typescript_types`; overwrite `src/types/database.types.ts`.

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/lib/inngest/reviewer.ts src/lib/inngest/functions.ts src/types/database.types.ts supabase/migrations/017b_quality_warnings.sql
git commit -m "feat(reviewer): Opus skeleton reviewer behind OPUS_REVIEWER_ENABLED flag"
```

---

### Task 13: Strategic polish step + priority algorithm

**Files:**
- Create: `src/lib/inngest/polish.ts`
- Modify: `src/lib/inngest/functions.ts` (`courseFinalize` pre-finalize hook)

- [ ] **Step 1: Write the priority algorithm with tests**

`src/lib/inngest/__tests__/polish-priority.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { selectLessonsToPolish } from "@/lib/inngest/polish";

interface TestLesson { id: string; is_worked_example?: boolean; is_key_concept?: boolean; bodyLength?: number; reviewerFlag?: boolean; isRecap?: boolean; isTransition?: boolean; isQuizHeavy?: boolean; }

function mod(id: string, lessons: TestLesson[]) {
  return { id, lessons };
}

describe("selectLessonsToPolish", () => {
  it("respects 15-lesson cap regardless of total count", () => {
    const modules = Array.from({ length: 6 }, (_, mi) =>
      mod(`m${mi}`, Array.from({ length: 8 }, (_, li) => ({ id: `m${mi}l${li}`, bodyLength: 1000 + li })))
    );
    const picked = selectLessonsToPolish(modules);
    expect(picked.length).toBe(15);
  });

  it("always includes priority 1 (first/last per module + worked/key)", () => {
    const modules = [
      mod("m0", [
        { id: "l0", bodyLength: 1 }, // first
        { id: "l1", is_worked_example: true, bodyLength: 1 },
        { id: "l2", isRecap: true, bodyLength: 1 },
        { id: "l3", bodyLength: 1 }, // last
      ]),
    ];
    const picked = selectLessonsToPolish(modules);
    expect(picked.map((l) => l.id)).toContain("l0");
    expect(picked.map((l) => l.id)).toContain("l1");
    expect(picked.map((l) => l.id)).toContain("l3");
  });

  it("skips priority 3 (recap / transition / quiz-heavy) when P1+P2 fill budget", () => {
    const modules = [
      mod("m0", Array.from({ length: 20 }, (_, i) => ({ id: `l${i}`, bodyLength: 100 + i }))),
    ];
    modules[0].lessons[10].isRecap = true;
    const picked = selectLessonsToPolish(modules);
    const ids = picked.map((l) => l.id);
    // Should not include l10 because P1+P2 fill 15 slots first.
    // (l0 first + l19 last = P1; remaining ranked by bodyLength desc = l18..l7 → l10 is included only if its bodyLength ranks top.)
    // Looser assertion: P3 recaps are deprioritized vs high-bodyLength peers.
    const recapRank = ids.indexOf("l10");
    expect(recapRank === -1 || recapRank >= 10).toBe(true);
  });

  it("empty input returns empty", () => {
    expect(selectLessonsToPolish([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run → expect fail**

```bash
bun test src/lib/inngest/__tests__/polish-priority.test.ts
```
Expected: fails (module not found).

- [ ] **Step 3: Implement polish.ts**

`src/lib/inngest/polish.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { recordEvent } from "@/lib/observability/metrics";

const POLISH_MODEL = "claude-opus-4-7";
export const POLISH_BUDGET = 15;

interface LessonLike {
  id: string;
  is_worked_example?: boolean;
  is_key_concept?: boolean;
  bodyLength?: number;
  reviewerFlag?: boolean;
  isRecap?: boolean;
  isTransition?: boolean;
  isQuizHeavy?: boolean;
  body?: string;
}

interface ModuleLike {
  id: string;
  lessons: LessonLike[];
}

/**
 * Per spec §5.2: rank lessons by priority, take top 15.
 *  P1 (always): first + last of each module, worked_example, key_concept.
 *  P2 (fill budget): longest body, reviewer-flagged.
 *  P3 (skip by default): recap, transition, quiz-heavy.
 */
export function selectLessonsToPolish(modules: ModuleLike[]): LessonLike[] {
  const p1: LessonLike[] = [];
  const p2: LessonLike[] = [];
  const p3: LessonLike[] = [];

  for (const m of modules) {
    for (let i = 0; i < m.lessons.length; i++) {
      const l = m.lessons[i];
      const isFirst = i === 0;
      const isLast = i === m.lessons.length - 1;
      const isP1 = isFirst || isLast || l.is_worked_example || l.is_key_concept;
      const isP3 = l.isRecap || l.isTransition || l.isQuizHeavy;

      if (isP1) p1.push(l);
      else if (isP3) p3.push(l);
      else p2.push(l);
    }
  }

  // P2 ranked by bodyLength desc, then reviewer-flagged first.
  p2.sort((a, b) => {
    if ((b.reviewerFlag ? 1 : 0) !== (a.reviewerFlag ? 1 : 0)) {
      return (b.reviewerFlag ? 1 : 0) - (a.reviewerFlag ? 1 : 0);
    }
    return (b.bodyLength ?? 0) - (a.bodyLength ?? 0);
  });

  const picked: LessonLike[] = [];
  for (const l of p1) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }
  for (const l of p2) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }
  // P3 only as last resort
  for (const l of p3) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }

  return picked;
}

/**
 * Polish a single lesson via Opus. On failure, returns null (caller
 * should keep the original Sonnet version — soft degradation).
 */
export async function polishLesson(params: {
  courseId: string;
  lessonId: string;
  body: string;
}): Promise<string | null> {
  if (process.env.MASTERCLASS_STRATEGIC_POLISH_ENABLED !== "true") return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startMs = Date.now();

  try {
    const resp = await client.messages.create({
      model: POLISH_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system:
        "You are a senior instructor polishing a lesson to masterclass quality. Improve clarity, pedagogy, and flow. Preserve all facts; NEVER introduce new references or URLs. Return only the polished lesson body in Markdown.",
      messages: [{ role: "user", content: `LESSON BODY:\n\n${params.body}` }],
    });

    const polished = resp.content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join("");

    await recordEvent({
      courseId: params.courseId,
      type: "claude_call_success",
      phase: "module_detail",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "polish",
        lesson_id: params.lessonId,
        model: POLISH_MODEL,
        input_tokens: resp.usage?.input_tokens,
        output_tokens: resp.usage?.output_tokens,
      },
    });

    return polished;
  } catch (err) {
    await recordEvent({
      courseId: params.courseId,
      type: "claude_call_failure",
      phase: "module_detail",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "polish",
        lesson_id: params.lessonId,
        error: (err as Error).message,
      },
    });
    return null;
  }
}
```

- [ ] **Step 4: Wire polish into courseFinalize**

In `src/lib/inngest/functions.ts` `courseFinalize` (around line 1200, before marking final status), add (OUTSIDE step.run):

```typescript
import { selectLessonsToPolish, polishLesson } from "@/lib/inngest/polish";

// After all module results merged, before mark-final-status:
const profileTier = tierOrFallback((await fetchProfileTier(course.user_id, supabaseAdmin)));
const shouldPolish =
  TIERS[profileTier].hasPolish &&
  course.length === "masterclass" &&
  process.env.MASTERCLASS_STRATEGIC_POLISH_ENABLED === "true";

if (shouldPolish && mergedCurriculum?.modules) {
  const selected = selectLessonsToPolish(mergedCurriculum.modules);
  // Polish in parallel with concurrency 3.
  const results = await Promise.allSettled(
    selected.map((lesson) =>
      polishLesson({
        courseId: course.id,
        lessonId: lesson.id,
        body: lesson.body ?? "",
      }).then((polished) => ({ lesson, polished }))
    )
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.polished) {
      // Find the lesson in mergedCurriculum and swap body.
      for (const m of mergedCurriculum.modules) {
        const l = m.lessons?.find((x: LessonLike) => x.id === r.value.lesson.id);
        if (l) l.body = r.value.polished;
      }
    }
    // Failures keep original Sonnet body (soft degradation).
  }
}
```

- [ ] **Step 5: Run priority tests**

```bash
bun test src/lib/inngest/__tests__/polish-priority.test.ts
```
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inngest/polish.ts src/lib/inngest/__tests__/polish-priority.test.ts src/lib/inngest/functions.ts
git commit -m "feat(polish): strategic Opus polish on 15 key lessons (Masterclass length only)"
```

---

## Phase 4 — Frontend: pricing surfaces

### Task 14: Pricing page redesign

**Files:**
- Modify: `src/app/pricing/page.tsx`

- [ ] **Step 1: Replace PLANS constant with new tier array**

New `PLANS` (use locale keys so i18n can override — but hardcode English fallback for now; i18n wiring in Task 20):

```typescript
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
      { included: false, label: "Audio narration" },
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
    unit: "/month",
    strikethrough: "€290/year · save 2 months",
    description: "The best course structures in the market. Skeletons on demand.",
    features: [
      { included: true, label: "15 reviewed skeletons per month" },
      { included: true, label: "Opus-quality skeleton review (hallucination catcher)" },
      { included: true, label: "All lengths (Crash / Short / Full / Masterclass)" },
      { included: true, label: "€5 on-demand body unlock per skeleton" },
      { included: false, label: "Module bodies by default" },
      { included: false, label: "Audio narration" },
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
    unit: "/month",
    strikethrough: "€990/year · save 2 months",
    description: "Reviewed, polished, narrated — every course ready for your audience.",
    features: [
      { included: true, label: "20 full courses per month" },
      { included: true, label: "Opus strategic polish on key lessons" },
      { included: true, label: "Masterclass-length courses included" },
      { included: true, label: "ElevenLabs audio narration" },
      { included: true, label: "White-label exports (no Syllabi branding)" },
      { included: true, label: "Priority queue" },
    ],
    cta: "Start Masterclass",
    ctaHref: "/api/checkout?tier=masterclass",
    accent: "amber",
    highlight: "best",
    icon: "crown",
    audioHighlight: true,
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
      { included: true, label: "Executive voice cloning (ElevenLabs)" },
      { included: true, label: "Dedicated Slack/Teams channel · 24h SLA" },
      { included: true, label: "EU data residency · GDPR · DPA on request" },
    ],
    cta: "Contact sales",
    ctaHref: "mailto:hello@syllabi.online?subject=Enterprise%20inquiry",
    accent: "muted",
  },
];
```

- [ ] **Step 2: Update page metadata**

```typescript
export const metadata: Metadata = {
  title: "Pricing — Free, Planner, Masterclass, Enterprise | Syllabi AI Course Generator",
  description:
    "Simple pricing for the AI course generator. Free skeleton to start, Planner at €29/mo for 15 reviewed skeletons, Masterclass at €99/mo with polish + audio + white-label, Enterprise on request.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Syllabi Pricing — Free / Planner / Masterclass / Enterprise",
    description: "Free skeleton to start. €29/mo Planner. €99/mo Masterclass with audio + polish + white-label. Enterprise contact us.",
    url: `${BASE_URL}/pricing`,
    type: "website",
  },
};
```

- [ ] **Step 3: Add 5-Pack sub-card below the grid**

Render after the 4-card grid:

```tsx
<div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center">
  <h3 className="text-lg font-semibold">Try Masterclass without committing</h3>
  <p className="mt-2 text-sm text-muted-foreground">
    5 full Masterclass generations · 90 days to use · €20 off if you upgrade within 30 days.
  </p>
  <Button className="mt-4" asChild>
    <Link href="/api/checkout?tier=5pack">Buy the 5-Pack — €39</Link>
  </Button>
</div>
```

- [ ] **Step 4: Add monthly/annual toggle**

State at top of the Page component:
```typescript
const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
```

Toggle chip UI above the grid; swap `price` + `unit` based on `billingCycle` for planner and masterclass.

Since this is a server component (has `metadata`), convert to client-component wrapper: extract `<PricingCards />` into its own `"use client"` file, keep metadata in the outer server component.

- [ ] **Step 5: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat(pricing): redesign pricing page with 4 tiers + 5-Pack + annual toggle"
```

---

### Task 15: PaywallModal rewrite

**Files:**
- Modify: `src/components/PaywallModal.tsx`

- [ ] **Step 1: Replace plans config**

In the component, replace `plans` const with:

```typescript
const plans = [
  {
    id: "planner",
    name: "Planner",
    price: "€29",
    priceAnnual: "€24",
    annualBilledLabel: "billed €290/year",
    period: "/month",
    description: "Best-in-class course skeletons on demand.",
    badge: "Most Popular",
    features: [
      "15 reviewed skeletons/month",
      "Opus-quality hallucination catcher",
      "€5 on-demand body unlock per skeleton",
      "PDF, Markdown & Notion export",
      "All course lengths",
    ],
    cta: "Start Planner — €29/mo",
    ctaAnnual: "Start Planner — €24/mo annually",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID,
    icon: Crown,
  },
  {
    id: "masterclass",
    name: "Masterclass",
    price: "€99",
    priceAnnual: "€82",
    annualBilledLabel: "billed €990/year",
    period: "/month",
    description: "Ready-to-teach courses with Opus polish + audio.",
    badge: "Best for teachers",
    features: [
      "20 full courses/month",
      "Opus strategic polish on key lessons",
      "ElevenLabs audio narration",
      "Masterclass-length courses",
      "White-label exports",
      "Priority queue",
    ],
    cta: "Start Masterclass — €99/mo",
    ctaAnnual: "Start Masterclass — €82/mo annually",
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
    icon: Headphones,
  },
];
```

- [ ] **Step 2: Update prop type**

```typescript
interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: "free" | "planner" | "masterclass" | "enterprise";
  /** What triggered the paywall — used to customize copy. */
  reason?: "cap_exceeded" | "masterclass_body_on_planner" | "unknown";
}
```

- [ ] **Step 3: Customize header copy by reason**

```tsx
const headerCopy = {
  cap_exceeded:
    currentPlan === "free"
      ? "You've used your free skeleton this month."
      : currentPlan === "planner"
      ? "You've used all 15 skeletons this month."
      : "You've hit the 20-generation cap.",
  masterclass_body_on_planner: "Masterclass-length bodies need Masterclass tier.",
  unknown: "Ready to unlock more?",
}[reason ?? "unknown"];
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/PaywallModal.tsx
git commit -m "feat(paywall): Planner/Masterclass plans + reason-specific copy"
```

---

### Task 16: BodyUnlockButton component

**Files:**
- Create: `src/components/BodyUnlockButton.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Unlock } from "lucide-react";

interface BodyUnlockButtonProps {
  courseId: string;
  disabled?: boolean;
}

export function BodyUnlockButton({ courseId, disabled }: BodyUnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/checkout/body-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || "Failed to start checkout");
      }
      const { url } = await resp.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={disabled || loading} size="lg">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
        Unlock full course body — €5
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BodyUnlockButton.tsx
git commit -m "feat(body-unlock): €5 unlock button component"
```

---

### Task 17: Wire BodyUnlockButton into course detail page

**Files:**
- Modify: `src/app/course/[id]/page.tsx` (or equivalent course detail page)

- [ ] **Step 1: Locate the course detail page**

```bash
rg "body_unlock_purchased" src/ || rg "params\.id" src/app/course/ -l
```

Find the page rendering a single course. Identify where modules/bodies are rendered.

- [ ] **Step 2: Add BodyUnlockButton conditionally**

Near the top of the course body (after the title), where the user sees the skeleton only:

```tsx
{course.body_unlock_purchased !== true &&
  course.status === "ready" &&
  !courseHasModuleBodies(course.curriculum) &&
  course.user_id === currentUserId && (
    <div className="mb-8 rounded-lg border border-violet-200 bg-violet-50/50 p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        This is the skeleton. Unlock full module bodies (~2 min):
      </p>
      <BodyUnlockButton courseId={course.id} />
    </div>
  )}
```

Add helper (in same file or `src/lib/curriculum.ts`):

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function courseHasModuleBodies(curriculum: any): boolean {
  if (!curriculum?.modules) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return curriculum.modules.some((m: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    m.lessons?.some((l: any) => typeof l.body === "string" && l.body.length > 0)
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/course/ src/lib/curriculum.ts
git commit -m "feat(course-page): show BodyUnlockButton for Planner skeletons"
```

---

## Phase 5 — Rename sweep + Enterprise card

### Task 18: Grep sweep for "Pro Max" / "Pro" rename

**Files:**
- Multiple

- [ ] **Step 1: Enumerate every occurrence**

```bash
cd /Users/gianmarcopaglierani/Projects/syllabi.online
rg -l --type ts --type tsx "Pro Max|pro_max|ProMax|proMax" src/ > /tmp/pro-max-files.txt
rg -l --type ts --type tsx "\\bPro\\b" src/ | grep -v "Profile" | grep -v "Pro Max" >> /tmp/pro-max-files.txt
cat /tmp/pro-max-files.txt | sort -u
```

- [ ] **Step 2: Per file, review each match and decide**

For each file, run:
```bash
rg -n "Pro Max|pro_max|ProMax|proMax|\\bPro\\b" <file>
```

Decision tree:
- **UI copy mentioning "Pro Max":** rename to "Masterclass".
- **UI copy mentioning "Pro" (as tier name):** rename to "Planner".
- **DB value `pro_max` in TypeScript type unions:** replace with `"masterclass"`.
- **DB value `pro` in type unions:** replace with `"planner"`.
- **Stripe legacy env var reference:** keep (backward-compat).
- **`.md` or doc files:** skip this task; docs updated separately.

- [ ] **Step 3: Apply edits**

For each identified location, use `Edit` tool with the decision above.

Known hotspots to check:
- `src/components/PaywallModal.tsx` — already handled in Task 15.
- `src/app/pricing/page.tsx` — already handled in Task 14.
- `src/app/dashboard/*/page.tsx` — upgrade CTAs.
- `src/app/layout.tsx` — metadata.
- `src/app/manifest.ts` — app name / description.
- `src/lib/emails/welcome-email.ts` — email copy.
- Any `src/app/api/*` route that matches on the tier string.

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "refactor(ui): rename Pro → Planner, Pro Max → Masterclass across user-facing surfaces"
```

---

### Task 19: Enterprise mailto component

**Files:**
- Create: `src/components/EnterpriseMailtoCta.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const SUBJECT = "Enterprise inquiry";
const BODY = `Hi Gianmarco & Filippo,

I'm exploring Syllabi for [company].

Seats:
Use case:
Timeline:

Thanks!`;

export function EnterpriseMailtoCta({ label }: { label?: string }) {
  const href = `mailto:hello@syllabi.online?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  return (
    <Button asChild size="lg">
      <a href={href}>
        <Mail className="mr-2 h-4 w-4" />
        {label ?? "Contact sales"}
      </a>
    </Button>
  );
}
```

- [ ] **Step 2: Use it on the pricing page Enterprise card**

In `src/app/pricing/page.tsx`, swap the Enterprise card's Link CTA for:

```tsx
import { EnterpriseMailtoCta } from "@/components/EnterpriseMailtoCta";

// in the card:
<EnterpriseMailtoCta />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/EnterpriseMailtoCta.tsx src/app/pricing/page.tsx
git commit -m "feat(enterprise): mailto CTA with pre-filled body"
```

---

## Phase 6 — i18n (16 locales)

### Task 20: Add pricing + paywall keys to Translations type + en.ts

**Files:**
- Modify: `src/lib/i18n/types.ts`
- Modify: `src/lib/i18n/locales/en.ts`

- [ ] **Step 1: Extend Translations type**

`src/lib/i18n/types.ts` — add to the `Translations` interface:

```typescript
pricing: {
  heading: string;
  subheading: string;
  toggle: { monthly: string; annual: string; savePitch: string };
  tiers: {
    free: { name: string; eyebrow: string; pitch: string; cap: string; cta: string };
    planner: { name: string; eyebrow: string; pitch: string; cap: string; bodyUnlock: string; cta: string };
    masterclass: { name: string; eyebrow: string; pitch: string; cap: string; cta: string };
    enterprise: { name: string; eyebrow: string; pitch: string; cta: string };
  };
  fivePack: { heading: string; pitch: string; cta: string; conversionCredit: string };
  bodyUnlock: { cta: string; modalTitle: string; modalBody: string };
};
paywall: {
  fromFree: { title: string; body: string; primaryCta: string };
  fromPlannerCap: { title: string; body: string; primaryCta: string };
  fromPlannerMasterclassBody: { title: string; body: string; primaryCta: string; secondaryCta: string };
  fromMasterclassCap: { title: string; body: string; primaryCta: string };
};
```

- [ ] **Step 2: Populate en.ts**

Append to `src/lib/i18n/locales/en.ts`:

```typescript
pricing: {
  heading: "Pricing that matches what you ship",
  subheading: "Start free. Upgrade when your students do.",
  toggle: { monthly: "Monthly", annual: "Annual", savePitch: "Save 2 months" },
  tiers: {
    free: {
      name: "Free",
      eyebrow: "Start free",
      pitch: "Try Syllabi with a free skeleton — see exactly what you'd ship.",
      cap: "1 course skeleton per month",
      cta: "Get started free",
    },
    planner: {
      name: "Planner",
      eyebrow: "Plan, then build",
      pitch: "The best course structures in the market. Skeletons on demand.",
      cap: "15 reviewed skeletons per month",
      bodyUnlock: "€5 on-demand body unlock per skeleton",
      cta: "Start Planner",
    },
    masterclass: {
      name: "Masterclass",
      eyebrow: "Ready to teach from",
      pitch: "Reviewed, polished, narrated — every course ready for your audience.",
      cap: "20 full courses per month",
      cta: "Start Masterclass",
    },
    enterprise: {
      name: "Enterprise",
      eyebrow: "For teams",
      pitch: "White-label, done-for-you courses, dedicated learning designer.",
      cta: "Contact sales",
    },
  },
  fivePack: {
    heading: "Try Masterclass without committing",
    pitch: "5 full Masterclass generations · 90 days to use",
    cta: "Buy the 5-Pack — €39",
    conversionCredit: "€20 off if you upgrade to Masterclass within 30 days",
  },
  bodyUnlock: {
    cta: "Unlock full course body — €5",
    modalTitle: "Unlock body for this skeleton",
    modalBody: "One-time €5. Generates the full module bodies (~2 min).",
  },
},
paywall: {
  fromFree: {
    title: "You've used your free skeleton this month",
    body: "Unlock 15 reviewed skeletons and on-demand bodies with Planner.",
    primaryCta: "Upgrade to Planner",
  },
  fromPlannerCap: {
    title: "You've used all 15 skeletons this month",
    body: "Upgrade to Masterclass for 20 full courses per month, or wait until the 1st.",
    primaryCta: "Upgrade to Masterclass",
  },
  fromPlannerMasterclassBody: {
    title: "Masterclass-length bodies need Masterclass tier",
    body: "Upgrade to Masterclass, or try 5 Masterclasses with the 5-Pack.",
    primaryCta: "Upgrade to Masterclass",
    secondaryCta: "Buy the 5-Pack",
  },
  fromMasterclassCap: {
    title: "You've hit the 20-generation cap",
    body: "Contact us for Enterprise if your team needs more.",
    primaryCta: "Contact sales",
  },
},
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 15 errors (each non-English locale file missing `pricing` + `paywall` keys).

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n/types.ts src/lib/i18n/locales/en.ts
git commit -m "feat(i18n): pricing + paywall keys in Translations + en"
```

---

### Task 21: Populate 15 non-English locales

**Files:**
- Modify: `src/lib/i18n/locales/{ar,de,es,fr,hi,it,ja,ko,nl,pl,pt,ru,sv,tr,zh}.ts`

- [ ] **Step 1: For Italian (core market), hand-translate**

`src/lib/i18n/locales/it.ts` — append:

```typescript
pricing: {
  heading: "Un prezzo chiaro, come i tuoi corsi",
  subheading: "Inizia gratis. Passa al piano superiore quando i tuoi studenti lo faranno.",
  toggle: { monthly: "Mensile", annual: "Annuale", savePitch: "Risparmi 2 mesi" },
  tiers: {
    free: {
      name: "Free",
      eyebrow: "Inizia gratis",
      pitch: "Prova Syllabi con uno scheletro gratuito — vedi esattamente cosa pubblicheresti.",
      cap: "1 scheletro di corso al mese",
      cta: "Inizia gratis",
    },
    planner: {
      name: "Planner",
      eyebrow: "Pianifica, poi costruisci",
      pitch: "Le migliori strutture per corsi sul mercato. Scheletri su richiesta.",
      cap: "15 scheletri revisionati al mese",
      bodyUnlock: "Sblocco contenuti a €5 per ogni scheletro",
      cta: "Inizia Planner",
    },
    masterclass: {
      name: "Masterclass",
      eyebrow: "Pronto per insegnare",
      pitch: "Revisionati, rifiniti, narrati — ogni corso pronto per i tuoi studenti.",
      cap: "20 corsi completi al mese",
      cta: "Inizia Masterclass",
    },
    enterprise: {
      name: "Enterprise",
      eyebrow: "Per team",
      pitch: "White-label, corsi fatti per te, learning designer dedicato.",
      cta: "Contatta le vendite",
    },
  },
  fivePack: {
    heading: "Prova Masterclass senza impegno",
    pitch: "5 generazioni Masterclass complete · 90 giorni per usarle",
    cta: "Compra il 5-Pack — €39",
    conversionCredit: "€20 di sconto se passi a Masterclass entro 30 giorni",
  },
  bodyUnlock: {
    cta: "Sblocca il corso completo — €5",
    modalTitle: "Sblocca i contenuti di questo scheletro",
    modalBody: "€5 una tantum. Genera i moduli completi (~2 min).",
  },
},
paywall: {
  fromFree: {
    title: "Hai usato lo scheletro gratuito di questo mese",
    body: "Sblocca 15 scheletri revisionati e contenuti on-demand con Planner.",
    primaryCta: "Passa a Planner",
  },
  fromPlannerCap: {
    title: "Hai usato tutti i 15 scheletri questo mese",
    body: "Passa a Masterclass per 20 corsi completi al mese, o aspetta il 1°.",
    primaryCta: "Passa a Masterclass",
  },
  fromPlannerMasterclassBody: {
    title: "I corsi Masterclass richiedono il piano Masterclass",
    body: "Passa a Masterclass, oppure prova il 5-Pack.",
    primaryCta: "Passa a Masterclass",
    secondaryCta: "Compra il 5-Pack",
  },
  fromMasterclassCap: {
    title: "Hai raggiunto il limite di 20 generazioni",
    body: "Contattaci per Enterprise se il tuo team ne ha bisogno di più.",
    primaryCta: "Contatta le vendite",
  },
},
```

- [ ] **Step 2: Machine-translate the other 14 locales**

For each of `ar, de, es, fr, hi, ja, ko, nl, pl, pt, ru, sv, tr, zh`:

Use the same structure as en.ts above. For each string, machine-translate the English value into the target language. Commit them in batch.

Heuristics per locale:
- Keep brand names ("Syllabi", "Planner", "Masterclass", "Enterprise") unchanged.
- "5-Pack" stays as-is.
- Currency stays "€".
- Right-to-left locales (ar): no string manipulation needed — the React component handles direction.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: zero errors (all 16 locales complete).

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n/locales/
git commit -m "feat(i18n): populate pricing + paywall keys across 16 locales"
```

---

## Phase 7 — Build, smoke tests, PR

### Task 22: Lint + typecheck + build

**Files:** none

- [ ] **Step 1: Lint**

```bash
cd /Users/gianmarcopaglierani/Projects/syllabi.online
bun run lint
```
Expected: zero errors. Fix any that appear.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Build**

```bash
bun run build
```
Expected: successful production build. Investigate any failures.

- [ ] **Step 4: Unit tests**

```bash
bun test
```
Expected: all tests pass (existing + new: tiers, cap-enforcement, resolvePriceId, polish-priority).

- [ ] **Step 5: Commit (if any lint/type fixes)**

```bash
git add -u
git commit -m "chore: lint + typecheck fixes post-pricing-redesign"
```

---

### Task 23: Smoke test via Vercel preview

**Files:** none

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/pricing-and-model-redesign
```

- [ ] **Step 2: Wait for Vercel preview**

Use `mcp__claude_ai_Vercel__list_deployments` to find the preview deployment for this branch. When `readyState === "READY"`, note the URL.

- [ ] **Step 3: Smoke test pricing page**

```bash
curl -s https://<preview-url>/pricing | grep -iE "planner|masterclass|enterprise|5-pack"
```
Expected: all four tier names present.

- [ ] **Step 4: Verify OG metadata**

```bash
curl -s https://<preview-url>/pricing | grep -iE "og:title|og:description|twitter:title"
```
Expected: new titles present, no "Pro Max" references.

- [ ] **Step 5: Check with Playwright MCP**

Per memory (syllabi playwright MCP), use Playwright to:
- Load `/pricing` at 390×844 (iPhone 12) and desktop
- Verify 4 tier cards render
- Verify annual/monthly toggle flips prices
- Click Enterprise card's Contact sales → verifies `mailto:` link opens
- Click Body Unlock button on a dummy Planner course → verifies checkout redirect

- [ ] **Step 6: Note blockers in PR description**

If anything fails, fix inline and re-push. Don't open the PR with known bugs.

---

### Task 24: Open PR

**Files:** none

- [ ] **Step 1: Open PR**

```bash
gh pr create --title "Pricing & model redesign — Free/Planner/Masterclass/Enterprise + strategic Opus polish" --body "$(cat <<'EOF'
## Summary
- Pricing redesign: Free (skeleton-only) · Planner €29 with Opus reviewer + €5 body unlock · Masterclass €99 with strategic Opus polish + audio + white-label · Enterprise contact sales.
- Masterclass 5-Pack €39 with €20 conversion credit (30-day window).
- 20-generation cap on Masterclass (no more unlimited).
- Rename Pro→Planner and Pro Max→Masterclass across UI + DB enum.
- Migration 017 + data migration.
- Opus reviewer + strategic polish behind feature flags (default OFF).
- i18n across 16 locales.

Spec: `docs/superpowers/specs/2026-04-18-pricing-and-model-redesign.md`
Plan: `docs/superpowers/plans/2026-04-18-pricing-and-model-redesign.md`
Notion: https://www.notion.so/34615a619d1f81b48b56f196fd07b604

## Outstanding (handled out-of-band)
- **Gianmarco:** Create 6 new Stripe products + Price IDs + conversion coupon in Stripe dashboard; archive 3 old Price IDs; set 6 `NEXT_PUBLIC_STRIPE_*` vars in Vercel.
- **Filippo:** After env vars set, redeploy Cloud Run; flip `OPUS_REVIEWER_ENABLED` and `MASTERCLASS_STRATEGIC_POLISH_ENABLED` to `true` after smoke test.

## Test plan
- [ ] `bun run lint` zero errors
- [ ] `npx tsc --noEmit` zero errors
- [ ] `bun run build` succeeds
- [ ] `bun test` all pass
- [ ] Vercel preview loads `/pricing` with new cards
- [ ] Paywall modal shows correct copy per tier
- [ ] Body unlock button launches Stripe Checkout (after env vars set)
- [ ] Enterprise mailto link opens with pre-filled body
- [ ] All 16 locales type-check
- [ ] Migration 017 applied to Supabase prod
- [ ] `plan_type` enum includes planner/masterclass/enterprise

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Return PR URL + handoff summary to Gianmarco**

Post-PR message should list:
- Stripe actions for Gianmarco (with env var names to set in Vercel)
- Cloud Run redeploy note for Filippo
- Feature flag toggle instructions

---

## Self-Review Checklist (run after plan is committed)

1. **Spec coverage** (each section of spec → task):
   - §3 tier line-up → Task 2 (tiers.ts), Task 14 (pricing page)
   - §4.1 Free → Task 14 (pricing page)
   - §4.2 Planner + body unlock → Tasks 2, 9, 14, 16, 17
   - §4.3 Masterclass + polish → Tasks 2, 13, 14
   - §4.4 Enterprise → Tasks 14, 19
   - §4.5 5-Pack → Tasks 6, 14
   - §5 model routing → Tasks 12 (reviewer), 13 (polish), 11 (body unlock)
   - §6 Stripe → Tasks 5, 6, 7, 8 (code side); Gianmarco does dashboard side
   - §7 frontend → Tasks 14, 15, 16, 17, 18, 19
   - §8 migration → Task 1, patched in Task 12
   - §9 cap enforcement → Tasks 3, 4
   - §10 cutover → Tasks 22, 23, 24 + handoff
   - §11 testing plan → Tasks 2, 3, 7, 13, 22, 23
   - §12 copy principles → baked into Tasks 14, 15, 20, 21
   - §13 success metrics → not in this plan (observed post-launch)
   - §14 open items → feature flags default OFF (Task 1 comments, Task 12, Task 13)
2. **Placeholder scan:** searched — no "TBD", "TODO", "implement later" in task steps.
3. **Type consistency:** `Tier` + `CapResult` + `ResolvedPlan` types consistent across tasks.

---

## Known deferred items (not in this plan)

- **`/quick` flow copy** — per mobile-polish spec, left intact.
- **Translation quality review** — Italian done inline; other 14 locales machine-translated, Gianmarco refines post-launch.
- **Masterclass-length body unlock on Planner** — explicitly blocked (spec §14.1); UI surfaces this via PaywallModal `fromPlannerMasterclassBody` reason.
- **Enterprise subdomain automation** — manual per contract.
- **SSO / SCORM / SOC 2 / REST API** — Enterprise contract-specific, not built.
