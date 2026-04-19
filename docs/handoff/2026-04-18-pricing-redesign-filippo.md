# Pricing & Model Redesign — Handoff for Filippo

**Date:** 2026-04-18
**From:** Gianmarco (via Claude Code autonomous execution)
**To:** Filippo
**Purpose:** Review PR #3, merge, ship the pricing redesign to production.

> **If you're reading this inside Claude Code:** this file contains enough context that you can pick up the work without me re-explaining anything. Start by reading PR #3 (link below), then follow the checklist at the bottom.

---

## TL;DR

PR #3 redesigns the entire pricing surface (Free / Planner / Masterclass / Enterprise) + adds the Masterclass 5-Pack + adds Planner's €5 body unlock + adds an optional Opus reviewer and strategic polish step (both feature-flagged OFF by default). 22 commits, 33 tests passing, build green.

**The frontend on syllabi.online still shows the OLD pricing** because the PR isn't merged yet. Once it's merged into `main`, Vercel auto-deploys and the new pricing goes live.

**Cloud Run does NOT need a redeploy unless** you want to flip the Opus reviewer or strategic-polish flags on — they're consumed by the Inngest worker which runs on Cloud Run.

---

## Links

- **PR:** https://github.com/FilippoAglietti/friday_night_vibing/pull/3
- **Spec (design doc):** `docs/superpowers/specs/2026-04-18-pricing-and-model-redesign.md`
- **Plan (24-task implementation plan):** `docs/superpowers/plans/2026-04-18-pricing-and-model-redesign.md`
- **Cloud Run architecture reference:** `docs/cloud-run.md`
- **Agent conventions:** `AGENTS.md` (Next.js 16 + Cloud Run topology)

---

## What changed

### Pricing model (spec §3–§5)

| Tier | Price | Cap | Reviewer | Polish | Audio | White-label |
|---|---|---|---|---|---|---|
| **Free** | €0 | 1 skeleton/mo | — | — | — | — |
| **Planner** | €29/mo (€24/mo annual) | 15 reviewed skeletons/mo | ✅ Opus | — | — | — |
| **Masterclass** | €99/mo (€82/mo annual) | 20 full courses/mo | ✅ Opus | ✅ Opus on 15 key lessons | ✅ ElevenLabs | ✅ |
| **Enterprise** | Contact sales | Per-contract | ✅ | ✅ | ✅ | ✅ |
| **Masterclass 5-Pack** | €39 one-time | 5 Masterclass generations · 90-day window | ✅ | ✅ | ✅ | ✅ |

- Planner users can unlock full module bodies for a single skeleton via **€5 one-time payment** (`/api/checkout/body-unlock`).
- 5-Pack users who upgrade to Masterclass within 30 days get a **€20 conversion credit** auto-applied via Stripe coupon.
- Masterclass is now **capped at 20/mo** (previously unlimited) — business rationale in spec §4.3.

### Backend changes

- **DB migrations** (already applied to prod Supabase `gmxseuttpurnxbluvcwx`):
  - `017_pricing_redesign_enum_values.sql` — adds `planner`, `masterclass`, `enterprise` to `plan_type` enum (committed in its own transaction because Postgres requires enum additions to commit before values can be used in DML).
  - `017_pricing_redesign.sql` — body-unlock columns on `courses`, `conversion_credits` table, `billing_period` + `enterprise_gen_cap` on `profiles`, data migration `pro → planner` / `pro_max → masterclass`.
  - `017b_quality_warnings.sql` — `courses.quality_warnings JSONB` column for Opus-reviewer feedback.
- **Stripe webhook** (`src/app/api/webhooks/stripe/`): extracted `resolvePriceId.ts` with 10 tests; added branches for planner / masterclass / 5-Pack / body-unlock / subscription.deleted; auto-applies 5-Pack conversion coupon on Masterclass upgrade.
- **Checkout routes**:
  - `/api/checkout` rewritten for new VALID_PRICE_IDS (monthly/annual planner + masterclass + 5-pack).
  - `/api/checkout/body-unlock` new route — auth required, validates course ownership, rejects if already unlocked or if length=masterclass.
- **Inngest worker** (`src/lib/inngest/`):
  - `reviewer.ts` — `reviewSkeleton()` helper using Opus-4.7, gated by `OPUS_REVIEWER_ENABLED=true`.
  - `polish.ts` — `selectLessonsToPolish()` priority algorithm (P1: first/last/worked/key; P2: longest body + reviewer-flagged; P3: recap/transition/quiz-heavy) + `polishLesson()` Opus call gated by `MASTERCLASS_STRATEGIC_POLISH_ENABLED=true`.
  - `body-unlock.ts` — new Inngest function that reuses the existing `module/generate.requested` fan-out to regenerate module bodies after Stripe confirms the €5 payment.
  - `functions.ts` — wired reviewer into `courseGenerate` post-skeleton; wired polish into `courseFinalize` pre-mark-final for Masterclass-length courses only.
- **Cap enforcement** (`src/lib/pricing/`): new `canGenerate()` helper; `/api/generate` returns structured `402 { error: "cap_exceeded", tier, cap, resetAt }` instead of generic 403.
- **Pricing config** (`src/lib/pricing/tiers.ts`): `TIERS` record with per-tier capabilities; `tierOrFallback()` maps legacy `pro → planner` and `pro_max → masterclass` for backward compat.

### Frontend changes

- `src/app/pricing/page.tsx` + new `src/app/pricing/PricingCards.tsx` (client component for billing-cycle toggle).
- `src/components/PaywallModal.tsx` — new `reason` prop (`cap_exceeded` | `masterclass_body_on_planner` | `unknown`) + header copy that adapts to `currentPlan × reason`.
- `src/components/BodyUnlockButton.tsx` — €5 unlock CTA for Planner skeleton pages.
- `src/components/EnterpriseMailtoCta.tsx` — pre-filled mailto with subject + body template.
- `src/app/course/[id]/page.tsx` — conditionally renders `BodyUnlockButton` when course is a Planner skeleton without bodies.
- Rename sweep across UI: `src/app/{layout,profile,page,docs,support,blog,changelog,palette,feed.xml}` + `src/data/niches.ts` (Pro → Planner, Pro Max → Masterclass, price updates).
- **i18n**: added `pricing` and `paywall` key groups to `src/lib/i18n/types.ts` + populated across all 16 locales (`ar, de, en, es, fr, hi, it, ja, ko, nl, pl, pt, ru, sv, tr, zh`). Italian hand-translated; other 14 machine-translated in-style.

### Feature flags (both default OFF)

Set in Cloud Run env, NOT Vercel (they're consumed by the Inngest worker):

- `OPUS_REVIEWER_ENABLED=true` — turns on Opus-4.7 review pass after skeleton generation. Soft-fails to "approved" on any error. Cost: ~1 extra Opus call per generation (≈€0.04).
- `MASTERCLASS_STRATEGIC_POLISH_ENABLED=true` — turns on strategic polish over 15 key lessons for Masterclass-length courses only. Cost: ~15 Opus calls per Masterclass generation (≈€0.60). Polish failures soft-degrade back to the Sonnet body.

**DO NOT flip both flags at once.** Smoke-test the reviewer first for a day or two, then flip polish.

---

## What Gianmarco is doing (Stripe side)

He's handling these in the Stripe dashboard — you don't need to do them:

1. Create 6 new Price IDs:
   - Planner monthly (€29) / Planner annual (€290/yr)
   - Masterclass monthly (€99) / Masterclass annual (€990/yr)
   - Masterclass 5-Pack (€39, one-time)
   - Planner body unlock (€5, one-time)
2. Create coupon `masterclass_5pack_conversion_credit` (€20 off, one-time use, expires 30 days).
3. Archive the 3 old Price IDs (Pro €28, Pro Max €69, old 5-Pack €33).
4. Set 6 `NEXT_PUBLIC_STRIPE_*_PRICE_ID` env vars in Vercel (names in PR description).

**Timeline:** Gianmarco said he needs more time for the Stripe side. Do NOT merge the PR until he confirms env vars are set in Vercel, otherwise checkout will 500.

---

## What YOU need to do (Filippo)

### Before merge

- [ ] Read PR #3 end-to-end. The spec and plan linked above will answer most "why did you do it this way" questions.
- [ ] Sanity-check the rename sweep — there are 13 `.tsx`/`.ts` files touched in commit `2aa1faa`. Skim for anything obviously wrong (e.g. a dashboard badge that still says "Pro Max"). Legacy DB values (`"pro"`, `"pro_max"`) remain in the enum intentionally — don't remove them.
- [ ] Verify the 3 migrations match what's actually in the prod DB. Run:
  ```sql
  -- Via Supabase MCP or psql:
  SELECT column_name FROM information_schema.columns
    WHERE table_name='courses' AND column_name IN ('body_unlock_purchased','quality_warnings');
  SELECT table_name FROM information_schema.tables WHERE table_name='conversion_credits';
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'plan_type'::regtype ORDER BY enumsortorder;
  ```
  Expected: 2 columns + conversion_credits exists + enum includes planner/masterclass/enterprise alongside legacy values.
- [ ] Confirm with Gianmarco that all 6 Stripe Price IDs + the coupon are live and the env vars are set in Vercel.

### Merge + deploy (Vercel)

- [ ] Once Gianmarco green-lights Stripe, squash-merge PR #3.
- [ ] Vercel auto-deploys `main`. Watch the deployment: `mcp__claude_ai_Vercel__list_deployments` or the Vercel dashboard.
- [ ] Smoke test the deploy (see next section).

### Cloud Run redeploy (only needed for feature flags)

The Inngest worker on Cloud Run reads `OPUS_REVIEWER_ENABLED` and `MASTERCLASS_STRATEGIC_POLISH_ENABLED`. The reviewer/polish code is already in the PR — it will ship to Cloud Run on the next redeploy. But the flags default to OFF, so the behavior is dormant until you flip them.

Per `docs/cloud-run.md`:
- [ ] After Vercel deploy is green and pricing page is verified, redeploy Cloud Run so the worker picks up the reviewer + polish code.
- [ ] In Cloud Run env, set `OPUS_REVIEWER_ENABLED=true`. Run one Planner generation end-to-end and check the `claude_call_success` events for `step=reviewer` in `generation_events`.
- [ ] Wait a day or two, observe reviewer cost + false-positive rate. If stable, flip `MASTERCLASS_STRATEGIC_POLISH_ENABLED=true`. Test one Masterclass generation.

### Smoke test after Vercel deploy

```bash
# 1. Pricing page renders new cards
curl -s https://syllabi.online/pricing | grep -iE "Planner|Masterclass|Enterprise|5-Pack"
# Expected: all 4 tier names present, no "Pro Max"

# 2. OG metadata updated
curl -s https://syllabi.online/pricing | grep -iE "og:title|og:description"
# Expected: mentions Planner/Masterclass, no "Pro Max"

# 3. Body-unlock checkout route responds (401 without auth is correct)
curl -i -X POST https://syllabi.online/api/checkout/body-unlock \
  -H "Content-Type: application/json" \
  -d '{"courseId":"test"}'
# Expected: 401 Unauthorized (auth required, proves route exists)

# 4. Cap enforcement returns structured 402 on /api/generate for a maxed-out Free user
# (Do this logged in as a test Free user who's already used their 1 skeleton)
# Expected: 402 with body {"error":"cap_exceeded","tier":"free","cap":1,"resetAt":"..."}
```

Playwright MCP is installed in this repo (`reference_syllabi_playwright`) — use it for visual verification of the pricing page on mobile (390×844) and desktop.

### If something breaks

- **Checkout 500s** → Vercel env vars not set. Ask Gianmarco to verify the 6 Stripe Price IDs.
- **Pricing page renders but shows old prices** → browser cache or CDN. Hard-refresh; check Vercel deployment is actually live.
- **Reviewer/polish don't fire on Masterclass generation** → Cloud Run wasn't redeployed after the PR merge, OR the feature flag is still OFF. Check Cloud Run env.
- **Legacy users on old Stripe subscriptions hit errors** → the webhook's `LEGACY_PRICE_IDS` map should catch in-flight `pro`/`pro_max` events. If not, check `src/app/api/webhooks/stripe/resolvePriceId.ts`.

---

## Test coverage

`bun test` — 33/33 passing. Key suites:
- `src/lib/pricing/__tests__/tiers.test.ts` — tier config + legacy fallback (17 tests)
- `src/lib/pricing/__tests__/cap-enforcement.test.ts` — canGenerate logic
- `src/app/api/webhooks/stripe/__tests__/resolvePriceId.test.ts` — 10 tests covering every Price ID path
- `src/lib/inngest/__tests__/polish-priority.test.ts` — selectLessonsToPolish (4 tests)
- `src/lib/inngest/__tests__/reviewer.test.ts` — flag-off smoke test (2 tests)

Typecheck + lint + build all green (production code; only pre-existing vitest module-resolution errors in test files remain — those are a vitest config gap, not a code issue).

---

## Open questions for you

None critical — the spec covered everything. But two places where I used judgment:

1. **Rename scope**: only renamed UI-facing strings and narrowed TS unions. Left DB enum legacy values intact (`"pro"`, `"pro_max"`, `"team"` still in `plan_type`). If you want a full cleanup migration that drops legacy values, it's a separate PR (destructive, requires all subscriptions migrated first).
2. **Legacy Stripe Price IDs** kept in `resolvePriceId.ts` as `LEGACY_PRICE_IDS` so in-flight webhook events (e.g. `invoice.paid` for an existing Pro subscriber) still resolve correctly. Safe to remove ~30 days after the old Price IDs are archived and no legacy subs remain.

If anything is unclear, the plan file walks through every task step-by-step with exact file paths and rationale. And every commit message explains the why.

— End of handoff —
