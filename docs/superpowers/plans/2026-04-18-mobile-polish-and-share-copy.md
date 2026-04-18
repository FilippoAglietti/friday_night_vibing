# Plan — Mobile polish + honest share copy

**Spec:** `docs/superpowers/specs/2026-04-18-mobile-polish-and-share-copy.md`
**Branch:** `feat/mobile-polish-and-share-copy`

Commits are small and thematic. Each step is independently verifiable.

---

## Step 1 — Brainstorm + spec + plan mirrored to Notion
**Done by:** this session, before any code change. Notion mirror under the Syllabi parent page.

**Verify:** spec file exists at `docs/superpowers/specs/...`; plan at `docs/superpowers/plans/...`; Notion children created under the Syllabi parent.

## Step 2 — Task B.1: root meta + JSON-LD honest copy
**Commit:** `feat(meta): honest share copy — remove 60-second claim from layout meta + JSON-LD`
**Files:** `src/app/layout.tsx`
**Diff scope:** `metadata.title.default`, `metadata.description`, `openGraph.title`, `openGraph.images[0].alt`, `twitter.title`, and in `jsonLd`: `WebSite.description`, `HowTo.description`, `HowTo.totalTime` (removed), `HowTo.step[2].text`, `FAQPage.mainEntity[0].acceptedAnswer.text`, `FAQPage.mainEntity[5].acceptedAnswer.text`.

**Verify:** grep layout.tsx for `60 second` / `in seconds` / `PT1M` → zero matches. `npx tsc --noEmit`.

## Step 3 — Task B.2: OG image generator copy
**Commit:** `feat(og): honest OG image tagline + alt`
**Files:** `src/app/opengraph-image.tsx`
**Diff scope:** `alt` export, rendered `<p>` tagline inside the `ImageResponse`.

**Verify:** grep file for `60 second` / `in seconds` → zero matches.

## Step 4 — Task B.3: en.ts honest copy
**Commit:** `feat(i18n/en): honest share + hero copy`
**Files:** `src/lib/i18n/locales/en.ts`
**Keys updated:** `hero.subtitle`, `howItWorks.step2Desc`, `examples.subheading`, `finalCta.subheading`, `tutorial.subheading`, `tutorial.step3Desc`, `tutorial.step3Detail`.

**Verify:** grep en.ts for `60 second|in seconds` → zero matches. No key additions, no schema changes.

## Step 5 — Task B.4: translate 15 remaining locales
**Commit:** `feat(i18n): honest share + hero copy across 15 non-English locales`
**Files:** `src/lib/i18n/locales/{it,es,fr,de,pt,nl,pl,ko,zh,ja,ar,hi,ru,tr,sv}.ts`
**Keys:** same 7 keys, locale-adapted.

**Verify:** grep all locale files for `60 second|secondi|segundos|secondes|Sekunden|segundos|seconden|sekund|초|秒|秒|ثانية|सेकंड|секунд|saniye|sekunder` → review each residual match. Zero occurrences on the 7 target keys.

## Step 6 — Task B.5: remaining hardcoded echoes
**Commit:** `feat(copy): remove "in seconds" echoes from hardcoded subtitles`
**Files:** `src/app/page.tsx`, `src/components/CurriculumForm.tsx`, `src/app/share/share-content.tsx`, `src/app/manifest.ts`, `src/lib/emails/welcome-email.ts`.

**Verify:** `npx tsc --noEmit`. Grep repo for `in seconds|60 second` in these five paths → zero.

## Step 7 — Task A.1: cookie banner does not obstruct CTAs on iPhone SE
**Commit:** `fix(mobile): delay cookie consent entry + compact padding on ≤640w`
**Files:** `src/components/CookieConsent.tsx`
**Diff scope:** add a `setTimeout(1200)` before setIsVisible when no consent cookie present; compact py/px on `≤640w`; keep accept/decline/X tap targets ≥44px.

**Verify:** open `/` at a simulated 320×568 viewport; first paint shows CTAs above the fold; banner appears after ~1.2s and does not overlap the primary CTA. Tap targets measured via devtools overlay.

## Step 8 — Task A.2: mobile adaptation polish
**Commit:** `fix(mobile): H1 wrap, horizontal-overflow audit, tap targets, safe-area insets`
**Files:** `src/app/page.tsx`, `src/app/globals.css` (if CSS additions are needed).
**Diff scope:**
- Guard hero H1 `Sounds as Good as It Looks` against mid-word break at 320w via `text-balance` + tighter `text-3xl` fallback on `≤360w`.
- Audit any decoration with fixed width > viewport; add `max-w-full` / `overflow-x-hidden` where needed.
- Ensure `env(safe-area-inset-*)` on full-bleed hero and footer.
- Confirm Examples carousel has `touch-action: pan-x` while auto-cycle is active.

**Verify:** `document.documentElement.scrollWidth === clientWidth` equals true at every target breakpoint in the device matrix (via firecrawl browser or manual check by Gianmarco).

## Step 9 — Typecheck + lint + build
**Commit:** None (if all passes). If fixes needed, `fix: <…>` commit.
**Files:** none (verify-only step).

**Verify:**
- `bun run lint` → 0 errors.
- `npx tsc --noEmit` → 0 errors.
- `bun run build` → production build succeeds.

## Step 10 — Push + Vercel preview + meta verification
**Commands:**
```bash
git push -u origin feat/mobile-polish-and-share-copy
# wait for Vercel preview URL
curl -s <preview-url> | grep -iE 'og:title|og:description|twitter:title|twitter:description|<title>'
curl -s <preview-url>/opengraph-image # or write to /tmp and render
```

**Verify:** grep output shows the new copy on every tag; OG image renders with new tagline.

## Step 11 — PR open
**Title:** `feat(mobile): polish adaptation + honest share copy`
**Body includes:**
- Summary (why: "60 seconds" was false; mobile SE cookie banner obstruction).
- Meta-tag diff (before/after grep output).
- Share-copy candidates + justification for the final pick.
- Verification checklist from spec Section 6.
- **Explicit Playwright gap:** device-matrix screenshots were not generated because this session was launched from `~/`, not the project dir. Asks Gianmarco to eyeball once locally before merging.
- Final line: `Do not merge — Gianmarco reviews.`

---

## Rollback

- Meta / copy changes: simply revert the PR.
- CookieConsent delay: a single timer; revert the one commit.
- Any locale reverts individually.

No database, no env, no backend coordination required.
