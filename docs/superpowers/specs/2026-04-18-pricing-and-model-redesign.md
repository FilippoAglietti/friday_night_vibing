# Spec — Pricing & Model Redesign (Free / Planner / Masterclass / Enterprise)

**Date:** 2026-04-18
**Branch:** `feat/pricing-and-model-redesign` (to be created)
**Author:** Claude Opus 4.7 (brainstorm session with Gianmarco)
**Status:** draft → in-review
**Authoritative source:** this file. Notion mirror under the Syllabi parent page is the review surface for Filippo.
**Supersedes:** the pricing sections of the April 17 Strategy Brief where conflicts exist.

---

## 1. Problem statement

Current pricing (pre-launch, April 2026) has four concurrent structural problems:

1. **Pro Max "unlimited" breaks unit economics.** Heavy users at €69/mo can consume 50+ masterclass generations, each costing ~$5.68 in API spend with Opus per-lesson polish. Result: ~−$200/month per heavy user, before support cost.
2. **Free tier doesn't convert.** Current Free gives 3 full mini-course generations using Haiku module bodies. Output looks like a stub product (Wikipedia-padded outlines, hallucinated YouTube IDs in 5 of 6 sampled courses per the April 17 audit) — upgrade prompt lands weakly because the user can't tell whether paid would be better.
3. **Tier naming is inconsistent.** "Pro" / "Pro Max" / "Pro Max 5-Pack" mixes activity words with modifier words, and "Pro Max" anchors the top tier to the middle-tier brand family. Creates confusion when marketing copy tries to position each tier distinctly.
4. **No enterprise pathway.** High-willingness-to-pay B2B buyers (medical CME teams, corporate L&D, agencies) have no home — the €99 self-serve ceiling turns them away before they contact sales.

This spec redefines the entire pricing structure, the model routing per tier, and the go-to-market sequencing for pre-launch cutover.

---

## 2. Non-goals

- **Not changing the generation engine shape.** The 3-function Inngest pipeline (`courseGenerate → moduleGenerate → courseFinalize`) is untouched. New Opus-reviewer step slots into `moduleGenerate`; strategic Opus polish slots in after module bodies complete, before finalize. See §5.
- **Not changing Inngest function names or event schemas.** Renaming breaks in-flight events (per AGENTS.md). If a rename becomes necessary, use a temporary alias.
- **Not touching the `courses.status` enum.** Current values (`pending | generating | ready | partial | failed`) remain.
- **Not altering migration numbering convention.** New migration lands as `015_pricing_tiers.sql` (or next available integer).
- **Not doing grandfathering/loyalty logic.** We are not live. Any existing test subscribers (<10 real humans, mostly friends + founder beta) get moved manually by email. See §10.
- **Not shipping API access, SSO, SCORM 2004/xAPI/LTI, or SOC 2 certification** — these are named on the Enterprise card as "contact sales" topics, not as product features we commit to for launch. Enterprise deals are hand-negotiated; anything we'd sell beyond Masterclass feature set is scoped per-contract.
- **Not relitigating the audio decision.** The April 17 Strategy Brief locked: keep ElevenLabs lesson-level narration, ship NotebookLM export post-launch. This spec does not change that.

---

## 3. New tier line-up

All pricing in EUR unless marked. No more mixed `$` / `€` in checkout.

| Tier | Monthly | Annual | Cap | One-time |
|---|---|---|---|---|
| **Free** | €0 | €0 | 1 gen/mo | — |
| **Planner** | €29 | €290 | 15 gens/mo | — |
| **Masterclass** | €99 | €990 | 20 gens/mo | — |
| **Enterprise** | Contact us → `hello@syllabi.online` | Contact us | Negotiated | — |
| **Masterclass 5-Pack** | — | — | 5 gens / 90 days | **€39** |

Annual = **10× monthly** on both Planner and Masterclass — "pay for 10 months, get 12" is the single-sentence pitch.

---

## 4. What each tier includes

### 4.1 Free (€0)

- **1 generation per calendar month.** Resets on the 1st UTC.
- **Skeleton only.** Sonnet 4.6 produces course skeleton (lesson titles, learning objectives, pacing, quiz questions). **No module bodies.**
- All 16 languages, all course styles, all lengths except Masterclass (Masterclass skeletons require Planner+).
- PDF (skeleton format), Notion, Markdown export.
- **No audio** (nothing to narrate without body).
- **No white-label.**
- **Upgrade prompt:** when user views a skeleton, a prominent CTA reads *"Unlock full lesson content → Planner"* — click goes to `/pricing#planner`.

**Why skeleton-only and not 3 full mini-courses:** a Sonnet-generated skeleton with real lesson titles and objectives is a stronger quality signal than 3 Haiku-body stubs. Upgrade pressure comes from the course feeling ~40% complete (because it is), not from quota exhaustion. This is the inverse of today's free-tier psychology and is the core Free-tier bet of this spec.

**Cost model:** ~$0.05/gen (single Sonnet skeleton call). At 10k free signups/month = ~$500/mo API spend = lowest-CAC marketing we have.

### 4.2 Planner (€29/mo · €290/yr)

*"The best course structures in the market. You bring the expertise; we bring the scaffolding."*

- **15 generations per calendar month.** Resets on the 1st UTC.
- Sonnet 4.6 skeleton + **Opus 4.7 reviewer pass** that catches hallucinated URLs, fake citations, broken YouTube IDs, internally contradictory lesson claims, and subject-level factual errors before publish.
- All lengths: Crash / Short / Full. **Masterclass skeletons also included** — body unlock for Masterclass requires Masterclass subscription (funnel step).
- All 16 languages, all course styles (Academic, Hands-on, Storytelling, Conversational once grounded pipeline ships).
- PDF (skeleton format), Notion, Markdown export.
- **No module bodies by default** — this is the defining property of the tier.
- **€5 on-demand body unlock per skeleton.** Any generated skeleton can be converted to a full Sonnet-body course via a one-time €5 purchase. Charge is separate from the subscription. No monthly quota on unlocks. See §7.3.
- **No audio** on Planner skeletons by default. If user unlocks a body, audio narration is **not** auto-generated — audio requires Masterclass tier (keeps audio as a clear differentiator).
- **No white-label.**

**Cost model:** ~$0.35/gen (skeleton $0.05 + Opus reviewer ~$0.30). At 15 gens × $0.35 = $5.25 max API cost vs €29 revenue = **~83% margin**. Body unlocks add ~$1–2 cost at €5 revenue each = ~60–80% margin.

**Why the name "Planner":** drops the "Pro" prefix for clarity. Each tier name is now a singular noun describing what you get (Planner = planning, Masterclass = masterclasses, Enterprise = enterprise-grade). "Pro" / "Pro Max" forced users to mentally compute "how pro is each tier"; the new names don't.

### 4.3 Masterclass (€99/mo · €990/yr)

*"Masterclass-quality AI courses, reviewed, polished, narrated — ready to teach from."*

- **20 generations per calendar month.** Resets on the 1st UTC. Hard cap, not "unlimited" — this is the single biggest economic correction in the spec.
- Everything in Planner, plus:
- **Full Sonnet 4.6 module bodies** (not Haiku) on every generation.
- **Opus 4.7 strategic per-lesson polish** on ~15 highest-leverage lessons per course (see §5.2 for algorithm).
- **Masterclass-length body generation** (not just skeleton).
- **ElevenLabs audio narration** — lesson-level, configurable voice.
- **White-label export** — strip Syllabi branding from PDFs, shareable links, certificates.
- **Priority queue** when API rate limits bite (Masterclass jobs jump ahead of Planner in the Inngest queue — soft priority via `rate_limit.priority` annotation).
- **All built export formats**: PDF, Notion, Markdown, shareable web link. (Word / PowerPoint / SCORM export are Enterprise-scoped and not built today — see §4.4.)

**Cost model:** ~$2.23/gen under strategic polish (skeleton $0.05 + Sonnet modules $0.50 + strategic Opus polish on 15 lessons $1.58 + validation $0.10). At cap 20 × $2.23 = ~$45 max API cost vs €99 revenue = **~59% margin floor**. Typical user at 10 gens/mo = ~$22 cost vs €99 = ~80% margin.

**Why 20 cap (not unlimited, not 30):** Even with strategic polish, unlimited invites abuse. 20 is generous (nearly 1/day), matches the brief's corrected math, and keeps heaviest-user margin non-negative. Marketing line stays confident: *"20 masterclass-quality courses per month, every one Opus-polished and reviewed."*

### 4.4 Enterprise (Contact us)

*"For teams building their own learning universe — not using someone else's."*

No price shown on pricing page. Single **[Contact us →]** CTA pointing to `mailto:hello@syllabi.online` with pre-filled subject `Enterprise inquiry — [Company]`.

Pricing page card lists (only things we can actually deliver today, manually or otherwise — see card copy in §7.2):
- Fully white-labeled output + custom subdomain
- Done-for-you course creation (billable service, agency rates)
- Legacy content migration service
- Dedicated learning designer on-call
- Curated source library (manual curation per client)
- Industry-tuned prompts
- Citation allowlist per contract
- Executive voice cloning (ElevenLabs)
- Dedicated Slack/Teams channel, 24h SLA
- Quarterly business reviews
- EU data residency (already eu-west-1)
- GDPR-compliant · DPA available on request

**NOT on the card** (omitted rather than promised): SSO/SAML, SCORM 2004/xAPI/LTI, analytics dashboards, REST API, webhooks, Zapier/Make connectors, SOC 2/HIPAA certifications, custom RAG pipeline. Any of these can be scoped into an individual contract if a prospect asks — quoted with engineering timeline, not committed on the card.

**Pricing posture in sales conversations** (internal, not on the card): **floor ~€499/mo** (5 seats × €99 Masterclass + service wrapper). Actual deals custom-priced per scope. First 5 deals hand-negotiated; each teaches what to productize.

### 4.5 Masterclass 5-Pack (€39 one-time)

*"Try Masterclass without committing."*

- **5 full Masterclass generations** (Sonnet bodies + Opus strategic polish + audio + white-label + all exports).
- **90 days to use** from purchase date. Unused generations expire (no rollover).
- **€20 credit toward first Masterclass month** if buyer subscribes to Masterclass within **30 days** of 5-Pack purchase. Credit applied automatically at checkout via Stripe coupon tied to the purchase metadata.
- Does not stack with other promotions. One 5-Pack conversion credit per account lifetime.

**Cost model:** ~$2.23 × 5 = ~$11.15 API cost vs €39 revenue = **~71% margin**. With €20 conversion credit applied, converted customer's first month math: €39 + (€99 − €20) = €118 for 25 gens over ~90 days = €4.72/gen — essentially equivalent to subscribing from day 1 at €99/mo, but with a no-commitment entry point.

**Why €39 (not $33 current, not $59 brief-correction):** €39 is a classic impulse-purchase threshold, keeps a clear 58% per-gen price gap vs Masterclass monthly (€7.80 vs €4.95), and matches our new EUR-only pricing. $59 was overkill under strategic-polish math.

---

## 5. Model routing — what runs where

### 5.1 Routing matrix

| Tier × Length | Skeleton | Module body | Reviewer | Polish |
|---|---|---|---|---|
| Free — any length except Masterclass | Sonnet 4.6 | — | — | — |
| Planner — Crash / Short / Full | Sonnet 4.6 | — (body unlock → Sonnet 4.6) | Opus 4.7 | — |
| Planner — Masterclass skeleton | Sonnet 4.6 | — (body requires Masterclass tier) | Opus 4.7 | — |
| Masterclass — Crash / Short / Full | Sonnet 4.6 | Sonnet 4.6 | Opus 4.7 | — |
| Masterclass — Masterclass length | Sonnet 4.6 | Sonnet 4.6 | Opus 4.7 | Opus 4.7 strategic (15 lessons) |
| Enterprise | Same as Masterclass (all lengths); custom source library is curated into prompts; branding hooks applied at export layer | | | |
| 5-Pack generation | Identical to Masterclass — Masterclass length by default; user can generate Crash/Short/Full if they prefer | | | |

### 5.2 Strategic polish algorithm (Masterclass length only)

When a Masterclass-length course completes module body generation, fire a new Inngest event `course/polish.requested` that runs in parallel with `course/finalize.requested`. The polish step:

1. Enumerate all lessons across all modules (typical: ~40 for a 6-module masterclass).
2. Rank lessons by polish priority:
   - **Priority 1** (always polish): first lesson of every module, last lesson of every module, any lesson where the skeleton marked `is_worked_example: true` or `is_key_concept: true`.
   - **Priority 2** (polish if slots remain): lessons with the longest body content (complexity signal), lessons flagged by the reviewer as "needs clarification."
   - **Priority 3** (skip by default): recap lessons, transition pages, quiz-heavy lessons where generated quiz already reviewed.
3. Take the top 15 by priority. Budget hard-capped at 15 regardless of course length.
4. Polish in parallel via Opus 4.7, concurrency 3 (same as module generation).
5. On polish failure of any single lesson: keep the unpolished Sonnet version; mark `lesson.polish_status = 'failed'` in telemetry but do not fail the course. Soft degradation.
6. Record per-lesson cost telemetry as `claude_call_success` event with `metadata.step = 'polish'`.

**Why 15 not 20 not 40:** marginal value of polishing the 16th–40th lesson is near zero (recap / quiz / transition). Polishing 15 captures ~80% of the quality lift at ~40% of the cost. Budget discipline protects margin floor at 20/mo cap.

**Feature flag:** `MASTERCLASS_STRATEGIC_POLISH_ENABLED=true` gates the polish step. If false, Masterclass falls back to no-polish (cost drops, quality drops). Used for instant rollback if polish step destabilizes.

### 5.3 Opus 4.7 reviewer pass (Planner + Masterclass)

After skeleton generation, before module generation (on Masterclass) or before publish (on Planner skeleton-only), run an Opus 4.7 review call that:

- Takes the skeleton as input.
- Checks for: internally contradictory claims, obviously hallucinated external references, broken logical progression, out-of-topic drift, inappropriate subject matter escape (e.g., clinical topic generating non-clinical lessons).
- Returns either `approved` or `needs_revision` with structured feedback.
- If `needs_revision`: re-run skeleton generation once with reviewer feedback appended to prompt. If second attempt also fails review, ship with reviewer-flagged warnings surfaced in the UI (do not block publish — Planner/Masterclass users still get their generation).
- Recorded as `claude_call_success` event with `metadata.step = 'reviewer'`.

**Feature flag:** `OPUS_REVIEWER_ENABLED=true`.

### 5.4 On-demand body unlock (Planner)

When a Planner user clicks "Unlock full course body" on a generated skeleton:

1. Stripe Checkout Session created with `price_id = PLANNER_BODY_UNLOCK_PRICE_ID` (€5 one-time).
2. Success webhook (`checkout.session.completed`) flips `courses.body_unlock_purchased = true` (new column in migration 015).
3. A new Inngest event `course/body-unlock.requested` fires, which runs module body generation (Sonnet 4.6) with the original skeleton.
4. User sees "Body generating..." state on the course page; CourseAssemblyLoader runs through its body-generation phase only (skip skeleton steps).
5. Per-lesson Opus polish is **not** applied on Planner body unlocks (polish is Masterclass-only).

**Why Stripe Checkout Session not API payment:** simpler, no PCI-DSS scope creep, consistent UX with other checkout flows, Stripe handles tax.

### 5.5 What doesn't change

- Anthropic Tier 1 rate limits still bite. Tier 2 application remains in flight (per punch list). No dependency between this spec and Tier 2 — the cap-20 design works at Tier 1.
- No changes to URL validator, YouTube ID validator, citation check — all remain as-is.
- No changes to `generation_events` table shape. New step types (`reviewer`, `polish`, `body_unlock`) slot into existing `metadata` field.

---

## 6. Stripe setup

### 6.1 New Stripe products + Price IDs

Create in Stripe dashboard (Gianmarco, day of cutover):

| Product | Price | Billing | Price ID env var | Metadata |
|---|---|---|---|---|
| Planner | €29 | Monthly recurring | `NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID` | `tier=planner,billing=monthly` |
| Planner | €290 | Annual recurring | `NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID` | `tier=planner,billing=annual` |
| Masterclass | €99 | Monthly recurring | `NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID` | `tier=masterclass,billing=monthly` |
| Masterclass | €990 | Annual recurring | `NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID` | `tier=masterclass,billing=annual` |
| Masterclass 5-Pack | €39 | One-time | `NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID` | `tier=5pack,converts_to=masterclass,credit_eur=20,window_days=30` |
| Planner Body Unlock | €5 | One-time | `NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID` | `tier=planner,feature=body_unlock` |

### 6.2 Stripe coupon — 5-Pack → Masterclass conversion credit

Create coupon:
- **ID:** `masterclass_5pack_conversion_credit`
- **Discount:** €20 off, one-time application
- **Applies to:** Masterclass monthly + annual price IDs
- **Redemption mechanic:** when a user who has an active 5-Pack purchase (within 30 days) starts a Masterclass Checkout Session, webhook pre-applies this coupon to the session.

Webhook logic added to `src/app/api/webhooks/stripe/route.ts`:
1. On `checkout.session.completed` for 5-Pack: insert row in `conversion_credits` table (new, migration 015) with `user_id`, `purchased_at`, `expires_at = purchased_at + 30 days`, `redeemed = false`.
2. On `checkout.session.created` for Masterclass: check `conversion_credits` for unredeemed, unexpired row for this user. If present, attach coupon `masterclass_5pack_conversion_credit` to the session discount parameter.
3. On `invoice.paid` for Masterclass with this coupon applied: mark credit `redeemed = true`.

### 6.3 Archive old Price IDs

Archive (do not delete — historical invoices preserved):
- Existing €28 Pro monthly Price ID
- Existing €69 Pro Max monthly Price ID
- Existing $33 5-Pack Price ID

Archiving is done via Stripe Dashboard → Products → Archive. Archived prices cannot be used for new subscriptions but remain on existing customer records until manually moved.

### 6.4 Vercel env var updates

All 6 new `NEXT_PUBLIC_STRIPE_*` vars set in Vercel project `filippoaglietti/syllabi.ai`, Production environment. Redeploy to bake into frontend bundles.

Cloud Run Dockerfile already reads these during the `builder` stage (per AGENTS.md); redeploy Cloud Run service after env updates propagate.

---

## 7. Frontend surface changes

### 7.1 Pricing page (`src/app/page.tsx` pricing section + potentially `/pricing`)

Replace existing 4 pricing cards with:

1. **Free** — skeleton-only, 1/mo, upgrade CTA
2. **Planner** — €29/mo, 15 gens, Opus-reviewed skeletons, €5 body unlock mentioned as "pay only when you need the full body"
3. **Masterclass** — €99/mo, 20 gens, "reviewed, polished, narrated, white-label", positioned as the headline tier
4. **Enterprise** — no price, bullet list per §4.4, `[Contact us →]` button

Add **annual/monthly toggle** at top of pricing section. Toggle switches prices + badge ("Save 2 months" on annual).

Add **small card below**: "Try Masterclass without committing — Masterclass 5-Pack €39". Links to dedicated checkout.

### 7.2 Enterprise card copy (exact)

```
ENTERPRISE
For teams building their own learning universe — not using someone else's.

Everything Masterclass includes, plus:

🎨 Your brand, end-to-end
• Fully white-labeled — zero Syllabi branding in PDFs, exports, shared links
• Custom subdomain (learn.yourcompany.com)
• Typography, palette, certificates, email templates — matched to your brand
• Co-branded shareable links for client-facing training

🧑‍🏫 We build the courses for you
• Done-for-you course creation — brief us, we deliver the finished course
• Legacy content migration — bring your PDFs / Notion / Confluence, we convert
• Dedicated learning designer for scope + structure decisions
• Optional monthly course production ("course-of-the-month" retainer)

📚 Your domain, your sources
• Curated source library — we vet and integrate your internal references
• Industry-tuned prompts — courses speak your domain vocabulary
• Citation allowlist — only sources you approve appear in generated courses

🎙️ Voice + multimedia
• Executive voice cloning (ElevenLabs) — narrate in your CEO's own voice
• Custom narration tone + pace per brand guidelines
• 16 languages — localize any course for your global team

🤝 White-glove partnership
• Dedicated contact on a shared Slack or Teams channel
• 24-hour response SLA
• Quarterly business reviews with roadmap input
• Priority access to new features
• Hands-on onboarding workshop for your L&D team

🌍 Compliance & data
• EU data residency (hosted in eu-west-1)
• GDPR-compliant by default · DPA available on request
• Custom retention policies per contract

[ Contact us → hello@syllabi.online ]

Tell us what you're building. We'll reply within 2 business days with a tailored proposal.
```

### 7.3 PaywallModal (`src/components/PaywallModal.tsx`)

Triggered on: Free user hits 1/mo cap, Planner user hits 15/mo cap, Masterclass user hits 20/mo cap.

Copy varies by origin tier:
- **From Free:** "You've used your free skeleton this month. Unlock 15 reviewed skeletons + on-demand bodies with Planner." CTA: Upgrade to Planner.
- **From Planner (Free→body unlock attempt on Masterclass-length skeleton):** "Masterclass-length bodies need Masterclass tier. Or try 5 Masterclasses one-time with the 5-Pack." Dual CTA: Upgrade to Masterclass / Buy 5-Pack.
- **From Planner (monthly cap hit):** "You've used all 15 skeletons this month. Upgrade to Masterclass for 20 full courses/mo, or wait until next month." CTA: Upgrade to Masterclass.
- **From Masterclass (cap hit):** "You've hit the 20-generation cap. Contact us for Enterprise if your team needs more." CTA: Contact sales.

### 7.4 Body unlock UI (new — `src/components/BodyUnlockButton.tsx`)

Appears on any Planner-generated course detail page where `courses.body_unlock_purchased = false`. Button: `Unlock full course body — €5`. Click opens Stripe Checkout Session for Body Unlock price. On return, server polls body generation status and switches the course page into "generating body..." state once webhook confirms.

### 7.5 Dashboard upgrade prompts (`src/app/dashboard/*`)

- Existing "Upgrade to Pro Max" prompts → "Upgrade to Masterclass"
- "3 generations left" badges → reflect new caps per tier
- Billing page → show annual/monthly toggle for existing subscribers

### 7.6 Enterprise route

**Decision:** use `mailto:hello@syllabi.online` link directly from pricing page card. **Do NOT build `/enterprise` form for launch** — per Gianmarco's direct request, a button that opens mail is sufficient.

Pre-filled `mailto` link format:
```
mailto:hello@syllabi.online?subject=Enterprise%20inquiry&body=Hi%20Gianmarco%20%26%20Filippo%2C%0A%0AI%27m%20exploring%20Syllabi%20for%20%5Bcompany%5D.%0A%0ASeats%3A%20%0AUse%20case%3A%20%0ATimeline%3A%20%0A%0AThanks%21
```

Pre-filled body template in plain text:
```
Hi Gianmarco & Filippo,

I'm exploring Syllabi for [company].

Seats: 
Use case: 
Timeline: 

Thanks!
```

### 7.7 i18n — 16 locales

Every user-facing string added or changed in this spec must land in all 16 locale files under `src/lib/i18n/locales/`. New keys (under `pricing.`):

- `pricing.tiers.free.{name,pitch,cap,cta}`
- `pricing.tiers.planner.{name,pitch,cap,bodyUnlock,features[*],cta}`
- `pricing.tiers.masterclass.{name,pitch,cap,features[*],cta}`
- `pricing.tiers.enterprise.{name,pitch,features[*],cta}`
- `pricing.fivePack.{name,pitch,price,features[*],conversionCredit,cta}`
- `pricing.toggle.{monthly,annual,savePitch}`
- `pricing.bodyUnlock.{cta,modalTitle,modalBody}`
- `paywall.{fromFree,fromPlannerMasterclassUnlock,fromPlannerCap,fromMasterclassCap}.{title,body,primaryCta,secondaryCta}`

**Hard rule (per CLAUDE.md):** update `en.ts` and all 15 others in the same PR. No drift.

Translation quality bar: first-pass machine translation for the 15 non-English locales is acceptable for initial ship; Gianmarco refines post-launch as user feedback flows in. Italian should be higher-quality since it's a core market.

### 7.8 Shared landing-page components

- Hero copy: no change driven by this spec.
- "How it works" section: no change.
- Examples section: no change.
- Social proof / testimonials: still blocked on the 5-beta-testers recruitment (punch-list item). Not covered by this spec.

---

## 8. Database migrations

New migration: `supabase/migrations/015_pricing_tiers.sql`.

Changes:

```sql
-- 1. Add body-unlock tracking to courses
ALTER TABLE public.courses
  ADD COLUMN body_unlock_purchased boolean NOT NULL DEFAULT false,
  ADD COLUMN body_unlock_purchased_at timestamptz;

-- 2. Conversion credits table (5-Pack → Masterclass)
CREATE TABLE public.conversion_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_purchase_stripe_session_id text NOT NULL,
  amount_eur numeric(10,2) NOT NULL DEFAULT 20.00,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  redeemed_stripe_invoice_id text,
  CONSTRAINT credit_window CHECK (expires_at > purchased_at)
);

CREATE INDEX conversion_credits_user_active_idx
  ON public.conversion_credits (user_id)
  WHERE redeemed = false AND expires_at > now();

ALTER TABLE public.conversion_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversion_credits_owner_read"
  ON public.conversion_credits FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Subscription tier tracking (for cap enforcement + feature gates)
--    Extend existing user_subscriptions or profiles table with a canonical tier enum.
CREATE TYPE public.subscription_tier AS ENUM ('free', 'planner', 'masterclass', 'enterprise');

ALTER TABLE public.profiles  -- confirm actual table name in current schema
  ADD COLUMN current_tier public.subscription_tier NOT NULL DEFAULT 'free',
  ADD COLUMN billing_period text CHECK (billing_period IN ('monthly','annual','one_time') OR billing_period IS NULL),
  ADD COLUMN enterprise_gen_cap integer;  -- nullable; set per-contract for Enterprise accounts

-- 4. Lesson polish status tracking
ALTER TABLE public.lessons  -- confirm actual table name
  ADD COLUMN polish_status text CHECK (polish_status IN ('not_applicable','pending','polished','failed') OR polish_status IS NULL);
```

**Required after migration:**
```bash
npx supabase gen types typescript --project-id gmxseuttpurnxbluvcwx > src/types/database.types.ts
```

**Filippo coordination required:** table names (`profiles`, `lessons`) need verification against current schema. The ALTER statements assume a schema shape that may have drifted — Filippo confirms before applying.

---

## 9. Cap enforcement logic

Cap enforcement lives in `src/app/api/generate/route.ts` (or the equivalent pre-flight handler). Before insert of a new `courses` row:

1. Look up `profiles.current_tier` for `auth.uid()`.
2. Count `courses` rows for this user with `created_at >= date_trunc('month', now() at time zone 'utc')`.
3. Per-tier caps:
   - `free`: 1
   - `planner`: 15
   - `masterclass`: 20
   - `enterprise`: custom — check `profiles.enterprise_gen_cap` column (to be added per-contract), default 100 if null
4. If count >= cap → return 402 Payment Required + structured body `{ reason: 'cap_exceeded', tier, cap, reset_at }`. Frontend renders PaywallModal.

**Grace on partial/failed:** a course with `status = 'partial'` or `status = 'failed'` **does not count** toward the cap. Already implemented per Section 8 of the Claude Code Context page ("partial does NOT decrement generations_used"). Preserve this.

---

## 10. Cutover plan — pre-launch (simple path)

Because Syllabi is **not live** (pre-launch testing phase, <10 real humans on any paid tier, mostly friends + founder beta), no grandfather / loyalty / forced-migration structure is needed.

### 10.1 Sequence

**T-0 (day of cutover):**

1. **Filippo** merges migration 015. Runs `supabase db push`. Confirms schema. Regenerates `database.types.ts`.
2. **Gianmarco** creates 6 new Stripe products + Price IDs in Stripe Dashboard (per §6.1). Creates conversion coupon (§6.2). Archives 3 old Price IDs (§6.3).
3. **Gianmarco** updates 6 Vercel env vars. Triggers redeploy of frontend project.
4. **Filippo** redeploys Cloud Run with refreshed build-time env vars.
5. **Claude (or Filippo)** merges the code PR containing: new pricing page cards, PaywallModal rewrites, BodyUnlockButton, Enterprise mailto link, i18n updates for 16 locales, Stripe webhook extensions, cap enforcement, Opus reviewer step, strategic polish step (behind feature flags, defaulted OFF for safety on first deploy; enable within 24h after smoke test).
6. **Gianmarco** sends one short email to any real humans currently on €28 Pro or €69 Pro Max: *"We're finalizing pricing for launch. As thank-you for testing, here's 3 months of Masterclass free — we'll move you over. In exchange we'd love a short quote + headshot for the launch."* This doubles as the 5-beta-testers recruitment already on the punch list.

**T+1:**
- Smoke test every checkout path: Free → Planner monthly → Planner annual → Masterclass monthly → Masterclass annual → 5-Pack → body unlock → Enterprise mailto click.
- Enable feature flags: `OPUS_REVIEWER_ENABLED`, `MASTERCLASS_STRATEGIC_POLISH_ENABLED`.

**T+1 to T+7:**
- Monitor `generation_events` and cost telemetry. Target metrics: reviewer step success rate ≥ 95%; polish step success rate ≥ 90%; per-Masterclass cost ≤ $3.00 (buffer above $2.23 target).

**T+7 to T+30:**
- Public launch sequence (Product Hunt, social, Reddit, SEO indexing — per existing punch list) proceeds with new pricing in place.

### 10.2 Rollback plan

If post-deploy smoke tests fail or cost telemetry goes off-budget:

1. **Immediate:** flip feature flags `OPUS_REVIEWER_ENABLED` and/or `MASTERCLASS_STRATEGIC_POLISH_ENABLED` to `false`. Tier definitions remain; model pipeline reverts to pre-spec behavior (no reviewer, no polish) while investigation happens.
2. **If Stripe checkout is broken:** revert Vercel env vars to old Price IDs. Old products are archived, not deleted — new subs pointing to old prices may need temporary un-archive. Communicate with any attempted buyers.
3. **If migration 015 has data issues:** roll forward, not back. Database rollbacks are rarely the right call.

### 10.3 Not-in-scope handling

- **No grandfather logic, no loyalty price tier, no 90-day transition window.** Any existing test subscribers handled by 1:1 email (see T-0 step 6).
- **No backwards-compatible old Price IDs.** Archive and move on.
- **No dual-pricing UI toggle for "legacy customers."** Everyone sees the new prices.

---

## 11. Testing plan

### 11.1 Unit tests

- Cap enforcement logic (`src/app/api/generate/route.ts`): per-tier boundary conditions, timezone edge cases (UTC month boundary), partial/failed exclusion.
- Stripe webhook extensions: 5-Pack purchase → credit row inserted; Masterclass subscription within 30 days → coupon applied; outside window → coupon not applied; second Masterclass subscription by same user → no double credit.
- Strategic polish priority algorithm: 6-module × various lesson counts inputs, assert 15-lesson cap, assert priority-1 lessons always included.

### 11.2 Integration tests (hit real Supabase, not mocks — per AGENTS.md)

- End-to-end body unlock: Planner user generates skeleton → clicks unlock → Stripe test mode → webhook → body generation → course updates.
- End-to-end 5-Pack conversion: buy 5-Pack → use 2 gens → subscribe to Masterclass within 30 days → verify €20 coupon applied → confirm `conversion_credits.redeemed = true`.
- Cap enforcement: Free user generates 1 skeleton → attempts 2nd → 402 response + PaywallModal state.

### 11.3 Cost + quality regression (soft, via existing observability)

- Run 10 masterclass generations across 5 languages (en, it, es, fr, ja) post-deploy. Assert:
  - `v_truncation_by_language`: no language > 20% truncation rate.
  - Per-course cost from `generation_events`: p95 ≤ $3.50 (headroom above $2.23 target).
  - Polish success rate (from `metadata.step = 'polish'`) ≥ 90%.
- Manual spot check: 2 generated masterclasses per tested language reviewed for Rick-Astley-class hallucinations. Zero tolerance.

### 11.4 UI/visual regression (per Notion context — use Playwright MCP)

- Pricing page: mobile (320×568, 390×844), tablet, desktop — screenshots captured before + after, diffed by eye.
- PaywallModal: render for each origin-tier variant, verify copy + CTAs.
- Enterprise card: verify mailto opens with correct pre-filled subject + body (manual, one per browser — Safari, Chrome, Firefox).
- Body unlock button: Planner user on course page, click → Stripe Checkout loads in sandbox mode.

---

## 12. Copy principles — tone across surfaces

Consistent across pricing page, PaywallModal, emails, Enterprise card:

- **Name the tier by what you get, not what you are.** "Get the best skeletons" not "Unlock Pro features."
- **State caps as features, not restrictions.** "15 skeletons included" not "limited to 15."
- **Make the quality pitch concrete.** "Opus-reviewed" > "AI-quality-checked." "Sonnet bodies" > "AI-generated content."
- **Never say unlimited.** Anywhere. Even on Enterprise — it's "negotiated," not "unlimited."
- **Never say 60 seconds.** Per the April 18 share-copy spec, all "fast" claims reference "minutes" or "quick generation" not fixed-second promises.
- **Never use "premium," "enhanced," or "advanced" as standalone descriptors.** They mean nothing and buyers tune them out.

---

## 13. Success metrics (90 days post-cutover)

Measured from `generation_events` + Stripe + Supabase.

| Metric | Target | Why |
|---|---|---|
| Free → Planner conversion rate | ≥ 4% of unique Free users | Sonnet-skeleton upgrade pressure thesis |
| Planner body-unlock attach rate | ≥ 20% of Planner generations | Validates the €5 unlock mechanic |
| 5-Pack → Masterclass conversion rate (30-day window) | ≥ 30% of 5-Pack buyers | Validates the €20 credit mechanic |
| Masterclass annual mix | ≥ 40% of Masterclass subs pick annual | Validates "2 months free" pitch |
| Per-Masterclass generation cost (p95) | ≤ $3.50 | Strategic polish math holds under real workload |
| Masterclass heavy-user count (20 gens/mo) | ≤ 10% of Masterclass subs | Unit economics stay healthy; cap signal works |
| Enterprise inbound (90 days) | ≥ 5 qualified leads | Validates the card pitch |
| Masterclass NPS | ≥ 40 | Quality bar from Opus polish lands |

Any metric missing target by > 30% after 90 days triggers a dedicated review (not immediate rollback — review).

---

## 14. Open items (non-blocking)

1. **Body unlock UX on Masterclass skeletons (Planner tier).** If a Planner user generates a Masterclass-length skeleton and tries to unlock, the body unlock €5 price is insufficient to cover Masterclass body cost (~$2 Sonnet body + $1.58 Opus polish). **Decision for spec:** Masterclass body unlock is not available on Planner tier. Only Crash / Short / Full skeletons can be body-unlocked. Masterclass-length skeletons on Planner remain planning artifacts — upgrade to Masterclass to get bodies. UI surfaces this explicitly.
2. **Feature-flag defaults at first deploy.** Default `OPUS_REVIEWER_ENABLED=false` and `MASTERCLASS_STRATEGIC_POLISH_ENABLED=false` on initial deploy. Enable after smoke test. This keeps the first deploy small and easy to roll back.
3. **5-Pack credit stacking.** One 5-Pack conversion credit per account lifetime (per §4.5). If a user buys 2 5-Packs, the second one's credit is not issued. Enforced by the unique-ish index on `(user_id, source_purchase_stripe_session_id)` + a check on existing unredeemed credits before insert.
4. **Enterprise subdomain delivery.** Custom subdomain (e.g., `learn.yourcompany.com`) is a DNS + Vercel domain configuration, per-contract. No automation for launch. Sales team (Gianmarco) does this manually during onboarding.
5. **Translation quality for non-English pricing copy.** First-pass machine translation accepted for 15 non-English locales at launch; native-speaker review for Italian treated as must-have before PH launch.

---

## 15. Commit + review

**Commit message (when spec lands):**
```
docs(spec): pricing & model redesign — Free/Planner/Masterclass/Enterprise + strategic Opus polish

Introduces the new 4-tier pricing structure (Free skeleton-only, Planner €29
with Opus reviewer + €5 body unlock, Masterclass €99 with strategic Opus polish
on 15 key lessons, Enterprise contact-sales), renames Pro→Planner and Pro
Max→Masterclass, introduces €39 Masterclass 5-Pack with €20 conversion credit,
adds "10× monthly" annual tiers, and caps the previously-unlimited top tier at
20/mo.

Cutover plan assumes pre-launch state (no grandfather / loyalty logic needed).
Opus reviewer + strategic polish ship behind feature flags, enabled after
smoke test. Migration 015 adds tier enum, body-unlock tracking, and conversion
credits table.

See docs/superpowers/specs/2026-04-18-pricing-and-model-redesign.md for full
detail. Notion mirror under Syllabi parent page.
```

**Review path:**
1. Gianmarco reviews this file directly (authoritative source per Notion context).
2. Notion mirror created under Syllabi parent page for Filippo's async review.
3. Implementation plan (via `superpowers:writing-plans`) created after spec review closes.
