# Frontend Rebrand + €10 Single-Masterclass Upsell — Design Spec

> **Status:** Approved 2026-04-18 — executing overnight.
> **Branch:** `feat/pricing-and-model-redesign`.
> **Stripe Phase 2 (env rotation + real Price IDs):** user handles 2026-04-19 AM.
> **Mirror:** Notion page under Syllabi parent (`33015a619d1f8105b234c51afa599400`).

---

## 1. Goal

Ship a full-website frontend rebrand tonight so that by 2026-04-19 AM:

- Every visible tier name is `Free` / `Planner` / `Masterclass` / `Enterprise` — no surviving "Pro" / "Pro Max" / "ProMax" strings.
- Every visible price matches the canonical list below — no €28/€33/€69 stragglers.
- All audio-lesson marketing copy (`ElevenLabs`, `AI audio narration`, `voice cloning`, `audio lessons`) is replaced with `NotebookLM export` messaging in the tone mix below.
- A new €10 one-off upsell ("Generate one Masterclass-quality course — €10") is surfaced on pricing page, PaywallModal, and Planner dashboard, **visually only** — real checkout wiring ships as Phase 2 tomorrow.
- All checkout CTAs are gated by `NEXT_PUBLIC_PRICING_LIVE` so tonight's display-vs-Stripe mismatch is safe.

## 2. Canonical reference (don't drift)

**Tier vocabulary (display)**
| Tier         | Display name | Eyebrow             | Accent                  |
|--------------|--------------|---------------------|-------------------------|
| `free`       | Free         | Start free          | muted                   |
| `planner`    | Planner      | Plan, then build    | violet                  |
| `masterclass`| Masterclass  | Ready to teach from | amber + Crown icon      |
| `enterprise` | Enterprise   | For teams           | muted                   |

Legacy DB values (`pro` → planner, `pro_max` → masterclass) continue to be resolved through `tierOrFallback()` and `resolvePriceId()` — do **not** run a data migration.

**Pricing (canonical — these are what must be displayed everywhere)**
- Free: **€0**
- Planner: **€29/mo**, **€290/yr** (cross-sell strikethrough keeps current behavior)
- Masterclass: **€99/mo**, **€990/yr** (same cross-sell strikethrough)
- Masterclass 5-Pack: **€39** (one-time, 5 generations, 90 days)
- Body Unlock (Planner add-on, per skeleton): **€5**
- **Single Masterclass (new Planner upsell): €10** — one-time, generates 1 Masterclass-quality course on top of Planner quota
- Enterprise: **"Contact us"**

**Feature vocabulary**
- `NotebookLM export` — Masterclass + Enterprise only. Positioning: outcome for marketing, honest-hack for FAQ/tooltips, product-feature for bullets.
- **Never** in visible UI: `audio narration`, `AI audio`, `ElevenLabs`, `voice cloning`, `TTS`, `text-to-speech`, `read aloud`.
- Exception: blog posts may retain historical mentions, but audio-pitch paragraphs are rewritten in this sweep.

## 3. What changes — one branch, sequenced commits

All work on `feat/pricing-and-model-redesign`. Each numbered item below is one commit.

### C1. `NEXT_PUBLIC_PRICING_LIVE` feature flag (foundation)
- Add `src/lib/pricing/pricingLive.ts` helper exporting `isPricingLive(): boolean` (returns `process.env.NEXT_PUBLIC_PRICING_LIVE === "true"`; safe on server & client).
- Add `.env.example` line documenting the flag (default unset ⇒ false ⇒ CTAs disabled).
- Add `src/components/CheckoutButton.tsx` wrapping `<Link>` with this contract:
  - If `isPricingLive()` and `href` is set → renders the link/button normally.
  - Else → renders a disabled button with label "Launching tomorrow" and `aria-disabled="true"`.
- Add one unit test for `isPricingLive()` covering: unset, `"true"`, `"false"`, `"TRUE"` (case-sensitive).

### C2. Pricing constants + tier rename in i18n content
- Add `SINGLE_MASTERCLASS_PRICE_EUR = 10` constant to `src/lib/pricing/tiers.ts`.
- Update `src/lib/i18n/types.ts`: annotate `proDesc`, `proMaxDesc`, `pro1..pro5`, `pm1..pm7`, `startProBtn`, `tryProMaxBtn`, `goProMaxBtn` with a `// Deprecated key name, content is canonical` JSDoc comment. **Don't rename keys** — separate refactor.
- Rewrite content of the above keys in all 16 locales:
  - `startProBtn` → "Start Planner — €29/mo" (all locales, localised)
  - `tryProMaxBtn` → "Try the 5-Pack — €39" (all locales, localised)
  - `goProMaxBtn` → "Go Masterclass — €99/mo" (all locales, localised)
  - `proDesc`, `pro1..pro5`, `proMaxDesc`, `pm1..pm7` — rewrite if they contain stale audio/tier copy; otherwise leave.
- **This commit alone fixes the pre-existing €28/€33/€69 bug** that has been live in production.

### C3. `PricingCards.tsx` — feature swap + €10 sub-card + flag-gated CTAs
- In the `PLANS` array:
  - Rename type field `audioHighlight` → `notebookLMHighlight`.
  - `free.features`: replace `{ label: "Audio narration", included: false }` → `{ label: "NotebookLM podcast export", included: false }`.
  - `planner.features`: same swap, still `included: false`. Add: `{ label: "€10 single-Masterclass add-on available", included: true }`.
  - `masterclass.features`: replace `"ElevenLabs audio narration"` → `"NotebookLM-ready export → turn any course into a conversational podcast"`.
  - `enterprise.features`: replace `"Executive voice cloning (ElevenLabs)"` → `"Custom NotebookLM export formatting"`.
- `audioHighlight` highlight card (lines 249–263) → `notebookLMHighlight` card: keep `Headphones` icon, copy becomes:
  - Title: "One-click NotebookLM podcast export"
  - Subtitle: "Drop the file into Google NotebookLM — two-host conversational podcast on demand."
- Add a new sub-card **below the 4-card grid**, mirroring the existing 5-Pack sub-card pattern (same section, same width, placed above or below the 5-Pack): "Single Masterclass on-demand — €10 · Keep your Planner plan, generate one Masterclass-quality course whenever you need it." with a `CheckoutButton` pointing to `tier=single_masterclass` (CTA disabled until flag flipped). Use a violet-to-indigo gradient accent to visually associate with the Planner tier (amber is already the Masterclass/5-Pack accent).
- Replace all `<Link href={plan.ctaHref}>` CTAs with `<CheckoutButton />`.
- Keep: monthly/annual toggle, "Save 2 mo" badge, strikethrough cross-sell copy, all colors/icons.

### C4. `PaywallModal.tsx` — same sweep + €10 option
- Swap audio language to NotebookLM (lines 64, 69, 94, 116).
- Add secondary option for Planner users near cap: "Just need one Masterclass? **€10 one-time**" with `CheckoutButton` (disabled by flag tonight).
- Replace `Headphones` icon on Masterclass option with the NotebookLM metaphor (keep Headphones — the icon reads as "podcast"; re-purposing is OK).

### C5. Audio copy sweep — core surfaces
Files to touch (strip audio narration / ElevenLabs / voice cloning wording; replace with NotebookLM-tone-mix-appropriate copy):

- `src/app/layout.tsx` — metadata description, OG/Twitter tags, schema.org FAQPage JSON-LD.
- `src/app/manifest.ts` — web app manifest description.
- `src/app/opengraph-image.tsx` — OG image title + subtitle copy.
- `src/app/feed.xml/route.ts` — RSS feed description.
- `src/app/page.tsx` — hero, problem/solution section, landing pricing rows (lines 104–203).
- `src/app/pricing/page.tsx` — page metadata + schema.org + FAQ entries referencing audio.
- `src/app/docs/page.tsx` — Masterclass feature list + any audio-specific sections.
- `src/app/support/page.tsx` — FAQ answer mentioning audio narration.
- `src/app/changelog/page.tsx` — any entry announcing audio narration as a feature → rewrite as historical.
- `src/app/palette/page.tsx` — remove audio-copy demo strings.
- `src/app/quick/quick-client.tsx` — "Want the full course with lessons, quizzes, and audio?" → "…and NotebookLM export?"
- `src/app/generator/[niche]/page.tsx` — the `Headphones` / "Audio Narration" feature tile → NotebookLM export tile.
- `src/app/tutorial/page.tsx` — step-5 "AI audio narration" → NotebookLM export step.
- `src/components/CourseAssemblyLoader.tsx` — loading message "Making sure the audio narrator doesn't sound bored…" → replace with a NotebookLM-flavoured line.
- `src/lib/emails/welcome-email.ts` — welcome email body mentioning audio.

### C6. Blog trim (the 2 SEO posts)
- `src/app/blog/how-to-create-online-course-2026/page.tsx` — rewrite the "Step 4: Add audio narration" section into "Step 4: Export for NotebookLM podcast generation." Keep the surrounding structure intact.
- `src/app/blog/ai-course-generator-comparison/page.tsx` — rewrite the audio-comparison rows so Syllabi's unique differentiator is "NotebookLM-ready export" instead of "AI audio narration."
- `src/app/blog/best-tools-course-creators/page.tsx` — one-line swap on the "AI audio narration" row.

### C7. `/profile` dashboard sweep
- Scan lines 1619–1640 (Masterclass-locked features section) — rewrite any feature description that was audio-adjacent; ensure the section is titled "Masterclass features" not "Pro Max features."
- Verify `planLabel` computation (line 822) — already correct, no change.
- Add new CTA component: inline `<CheckoutButton />` on each Planner-generated skeleton card offering "Upgrade this course to Masterclass quality — €10" (disabled by flag tonight). Location: wherever the skeleton card renders; most likely inside the generations list.
- Check and update any profile-page string that displays tier copy or audio features.

### C8. Example courses refresh + re-tier
- `src/data/courses/typescriptCourse.ts` — keep as-is (full-body Masterclass showcase). Strip any incidental "audio" wording in content.
- `src/data/courses/marketingCourse.ts` — keep as-is (full-body Masterclass showcase). Strip any incidental "audio" wording.
- `src/data/courses/designCourse.ts` — convert to **Planner skeleton**:
  - Keep: module titles, lesson titles, `learningObjectives`, `keyPoints`, pacing/duration metadata.
  - Remove: lesson `content` bodies (replace with `content: ""` or omit the field).
  - Mark in `exampleCurriculaWithStyles` with a `tier: "planner"` annotation (add the optional field).
- Update `src/data/exampleCurricula.ts` to expose each example's tier intent.
- Update `src/app/page.tsx` example-cards section (lines 1131+) to render a tier badge on each card ("Planner output" / "Masterclass output").
- Add "Download for NotebookLM" button inside the preview modal (wherever `setPreviewCurriculum` opens it) — visible only on Masterclass-tier examples. Implementation: **client-side inline call to `generateNotebookLMMarkdown()` from `src/lib/exports/generateNotebookLMMarkdown.ts` + browser `Blob` download**. Avoids needing a DB course row for static example data and avoids round-tripping through the tier-gated API endpoint.
- Delete `public/examples/{photography,python,yoga,marketing}.json` (0 references in `src/`, confirmed by scan).

### C9. Tests + typecheck
- `src/lib/pricing/__tests__/tiers.test.ts` — add assertion for `SINGLE_MASTERCLASS_PRICE_EUR === 10`.
- New test file `src/lib/pricing/__tests__/pricingLive.test.ts` — covers `isPricingLive()` branches.
- Run `bun run typecheck` — must pass with zero errors.
- Run existing unit test suites — must not regress.
- Smoke via Playwright MCP (per user memory preference): home, /pricing, /profile, mobile viewport.

## 4. Non-goals (explicit)

- Stripe env rotation or real Price ID wiring — Phase 2, user handles 2026-04-19 AM.
- Backend route for €10 single-Masterclass purchase — Phase 2.
- Renaming i18n keys `proDesc` / `pm1..7` / `startProBtn` etc. — separate refactor.
- DB migration of `profiles.plan` from `"pro"/"pro_max"` to `"planner"/"masterclass"` — unnecessary; `tierOrFallback()` handles it.
- New blog posts or SEO content.
- Mobile-first redesign of any surface — we preserve current layouts.

## 5. Tone guide for NotebookLM copy

- **(b) outcome framing** for landing/hero/pricing page headers and top-of-funnel: *"Turn your course into a 20-minute conversational podcast."*
- **(c) honest-hack framing** for tooltips, docs, FAQ answers, support copy: *"We format your course for Google NotebookLM — drop the file in, get a two-host podcast. No TTS bills, better output."*
- **(a) product-feature framing** for tier feature bullets where space is tight: *"NotebookLM-ready export."*

## 6. Success criteria (checkable)

- `rg -i "pro max|pro_max|proMax" src/ public/ --glob '!*.test.ts' --glob '!tiers.ts' --glob '!resolvePriceId.ts' --glob '!database.types.ts'` returns only acceptable matches (tier-guard logic, legacy-fallback code).
- `rg -i "audio narration|elevenlabs|voice clon|ai audio" src/ public/ --glob '!*.test.ts'` returns zero visible-UI hits. Blog posts have only historical mentions in the trimmed sections.
- `rg "€28|€33|€69|€28/mo|€33|€69/mo" src/` returns zero hits.
- `/` home, `/pricing`, `/profile` render without console errors in dev and Playwright smoke.
- Typecheck clean; existing test suites pass.
- `NEXT_PUBLIC_PRICING_LIVE` unset ⇒ all checkout CTAs disabled with "Launching tomorrow" label.
- The new €10 CTA is visible on pricing, paywall, and profile — and disabled until the flag is set.

## 7. Risks + mitigations

| Risk | Mitigation |
|------|------------|
| Break checkout for existing subscribers | Don't touch `NEXT_PUBLIC_STRIPE_*` env vars or `resolvePriceId.ts` at all tonight. Old prices keep charging existing subs via legacy mapping. |
| Displayed €29/€99 doesn't match Stripe's old €X/€Y overnight | Flag-gated CTAs prevent new purchases at wrong prices. Existing subs keep their current pricing. |
| Deleting `public/examples/*.json` breaks something dynamic | Confirmed by scan: zero references in `src/`. Safe. |
| Profile page is 2000+ lines — risk of accidental regression | Touch only tier-label text + one new CTA insertion; don't refactor. |
| Blog SEO hit from removing "audio narration" keyword | Accepted trade-off; user has approved. |
| i18n cost of renaming legacy keys | Defer key renames; update content in place. |
| Headphones icon still used on NotebookLM card feels audio-ish | Headphones reads as "podcast" too; acceptable. |

## 8. Phase 2 (user does 2026-04-19 AM — out of this spec's scope)

- Create 8 new Prices in existing Stripe account: Planner €29/mo, €290/yr; Masterclass €99/mo, €990/yr; Masterclass 5-Pack €39; Body Unlock €5; **Single Masterclass €10 (new)**; Enterprise not needed (custom).
- Populate env vars: `NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID`, `..._ANNUAL_...`, `..._MASTERCLASS_...`, `..._5PACK_...`, `STRIPE_BODY_UNLOCK_PRICE_ID`, **`NEXT_PUBLIC_STRIPE_MASTERCLASS_SINGLE_PRICE_ID` (new)**.
- Update `src/app/api/checkout/route.ts` to accept `tier=single_masterclass` and create a one-time checkout session with the new Price.
- Update `src/app/api/webhooks/stripe/resolvePriceId.ts` to map the new Price ID → `single_masterclass` event; handler grants 1 Masterclass-quality generation credit to the user's profile.
- Set `NEXT_PUBLIC_PRICING_LIVE=true` in Vercel env.
- Smoke-test checkout with a €0.50 test purchase on each SKU.

## 9. Mirror

Notion page will link back to this git spec; if they diverge, the git file wins. Filippo is out (user covering), so status goes straight to Approved → In progress → Shipped on completion.
