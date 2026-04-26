# Syllabi — user branding (name + logo) v1

**Date:** 2026-04-26
**Author:** Gianmarco + Claude (brainstorm session)
**Status:** Design — pending review
**Triage parent:** `docs/superpowers/specs/2026-04-25-platform-fixes-triage.md` §Item 4
**Related prior work:** `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` (Phase 1, shipped)

---

## Goal

Let creators put their name and logo on every course they generate. Per-user-profile model: set once in account settings, applied to all courses automatically. No Syllabi branding fallback (already a hard constraint from the export Phase 1 spec §7).

## Why now

Reported by Gianmarco 2026-04-25 as one of six platform issues: *"we said to give the opportunity to put the name and the logo of the user that are generating the course and we still don't have it."* Per the triage decision, this lands last in the batch (after stability fixes) so the platform is stable when adding new product surface.

## Scope

### In scope (v1)
1. Editable **brand display name** on the user profile, decoupled from OAuth `full_name`
2. Editable **brand logo** uploaded by the user
3. Both fields surfaced on the **course cover page** in PDF/HTML exports
4. Profile UI to manage both (under `/profile?tab=settings`)
5. Migration 020 applies all four planned Phase 5 columns + one new column for display name (so the schema is future-ready even though only logo + display name are wired in v1)

### Out of scope (deferred)
- Per-course branding override at generation time *(deferred to v2 — see triage decision)*
- Accent color customization *(Phase 5 — keep migration column, don't wire UI)*
- Hero image customization *(Phase 5 — keep migration column, don't wire UI)*
- Custom footer text *(Phase 5 — keep migration column, don't wire UI)*
- Tier-gating *(free-for-all in v1; revisit if usage justifies an upsell)*
- Logo cropping/resize tooling in-app *(user uploads pre-sized)*
- "Powered by Syllabi" footer toggle for free users *(out of scope; no Syllabi branding ever, per Phase 1 spec §7)*
- Logo placement on every page header/footer *(cover only for v1)*

## Decisions (locked in)

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Per-user-profile model.** Set once in settings, applied to all courses. | Most common case is a creator branding all their courses identically. Per-course form complexity isn't justified for v1. |
| 2 | **Separate `branding_display_name` column** from OAuth `full_name`. | Conceptually different: identity vs. brand. Editing `full_name` directly would overwrite the auth record. |
| 3 | **Free-for-all in v1**, no tier-gating. | Easier to ship; collect usage signal before adding gates. The existing `profiles.white_label` boolean is left alone (out of scope for this work). |
| 4 | **Cover only**, not every-page header/footer. | Smallest design surface, fewest regressions. Full-page branding is Phase 5. |
| 5 | **PNG / JPG / SVG, 2 MB max**, recommended ≤512×512. | Covers all common logo formats. 2 MB is generous for logos; allows future raster needs. |
| 6 | **Logo bucket public-read.** | Logos aren't sensitive. Courses are publicly shareable. Public URLs simplify rendering. |
| 7 | **Optional everything.** Fallback chain for displayName: `branding_display_name → full_name → null`. Logo: present-or-absent. | Lets users adopt incrementally. `null` displayName is already handled (no Syllabi fallback). |
| 8 | **Apply all four planned Phase 5 columns** in migration 020, even though only logo is wired. | Future-friendly. Avoids a second migration when accent/hero/footer ship. |

## Architecture

```
┌───────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│ /profile settings │ ──> │ POST /api/profile   │ ──> │ Supabase profiles│
│   - display name  │     │  /branding          │     │  branding_*      │
│   - logo upload   │     │ POST /api/profile   │     │  columns         │
└───────────────────┘     │  /logo              │     └──────────────────┘
                          │  (multipart upload) │              │
                          └─────────┬───────────┘              │
                                    │                          ▼
                                    ▼                  ┌──────────────────┐
                          ┌─────────────────────┐      │ resolveBranding()│
                          │ Supabase Storage    │      │  reads profile,  │
                          │  logos bucket       │ ◄────┤  returns tokens  │
                          │  RLS: user own path │      └─────────┬────────┘
                          └─────────────────────┘                │
                                                                 ▼
                                                     ┌──────────────────────┐
                                                     │ Cover.tsx + Course   │
                                                     │ Document.tsx render  │
                                                     │ logo + display name  │
                                                     └──────────────────────┘
```

## Data model

### Migration `020_user_branding.sql`

```sql
ALTER TABLE public.profiles
  ADD COLUMN branding_display_name TEXT NULL,
  ADD COLUMN branding_logo_url TEXT NULL,
  ADD COLUMN branding_accent TEXT NULL,        -- Phase 5, unused in v1
  ADD COLUMN branding_hero_url TEXT NULL,      -- Phase 5, unused in v1
  ADD COLUMN branding_footer TEXT NULL;        -- Phase 5, unused in v1

COMMENT ON COLUMN public.profiles.branding_display_name IS
  'Creator brand name shown on courses. Falls back to full_name if null.';
COMMENT ON COLUMN public.profiles.branding_logo_url IS
  'Public URL of the creator logo file in the logos bucket.';
```

After this, `npx supabase gen types` regenerates `src/types/database.types.ts`.

### Storage bucket `logos`

Created via a separate migration (`020b_logos_bucket.sql`) or Supabase dashboard:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: any authenticated user can read; only owner can write to their path
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_user_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "logos_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "logos_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

Path layout: `logos/<user_id>/<uuid>.<ext>`. Old files kept (no automatic cleanup on replace) — small storage cost; v2 can add a cleanup hook.

## API contracts

### `POST /api/profile/branding`

Body:
```ts
{ branding_display_name: string | null }
```

Auth: required. Validates length (≤80 chars), trims, allows `null` to clear.

Response:
```ts
{ branding_display_name: string | null }
```

### `POST /api/profile/logo`

`multipart/form-data` with file field `logo`.

Server-side validation:
- MIME type ∈ `{ image/png, image/jpeg, image/svg+xml }`
- File size ≤ 2 MB
- For raster: optional dimension check (warn-only; we trust user pre-sizing)

Behavior:
1. Authenticate user
2. Generate `<uuid>.<ext>` filename
3. Upload to `logos/<user_id>/<filename>`
4. `UPDATE profiles SET branding_logo_url = <public_url> WHERE id = auth.uid()`
5. Return new URL

Response:
```ts
{ branding_logo_url: string }
```

### `DELETE /api/profile/logo`

Removes the logo (deletes storage file, sets `branding_logo_url = NULL`).

Response: `{ branding_logo_url: null }`

## `resolveBranding()` extension

Update `src/lib/export/branding.ts`:

```ts
export function resolveBranding(profile: Profile | null): BrandingTokens {
  const brandName = profile?.branding_display_name?.trim();
  const fallbackName = profile?.full_name?.trim();
  const displayName =
    brandName && brandName.length > 0
      ? brandName
      : fallbackName && fallbackName.length > 0
        ? fallbackName
        : null;

  const logoUrl = profile?.branding_logo_url?.trim() || null;

  return {
    displayName,
    logoUrl,
    accent: null,    // Phase 5
    heroUrl: null,   // Phase 5
    footer: null,    // Phase 5
  };
}
```

The interface (`BrandingTokens`) already includes `logoUrl` from Phase 1; no shape change. Existing tests at `src/lib/export/__tests__/branding.test.ts` continue to pass; add new cases for: branding_display_name overrides full_name; logo URL passes through; null fallback chain.

## Profile settings UI

Under `/profile?tab=settings`, add a new card titled **"Branding"**:

```
┌─────────────────────────────────────────────────────────┐
│ Branding                                                │
│ Appears on the cover of every course you generate.      │
│                                                         │
│   Display name                                          │
│   ┌─────────────────────────────────────────────┐      │
│   │ Acme Academy                                │      │
│   └─────────────────────────────────────────────┘      │
│   Falls back to your account name if blank.            │
│                                                         │
│   Logo                                                  │
│   ┌────────┐  ┌──────────────────────────────────┐    │
│   │  [img] │  │  Replace logo  │  Remove          │    │
│   └────────┘  └──────────────────────────────────┘    │
│   PNG, JPG, or SVG · 2 MB max · 512×512 recommended   │
└─────────────────────────────────────────────────────────┘
```

Component lives at `src/components/profile/BrandingSection.tsx`. Uses the existing `useToast()` hook for upload success/error feedback. Empty state: drag-drop placeholder + "Upload logo" button.

## Cover render

`src/components/export/Core/Cover.tsx`:

- Logo placement: top-center, ~64-96px max height, ~24px below the top edge of the cover, ~32px above the title
- Display name placement: unchanged from Phase 1 (already rendered when present)
- If no logo: cover renders as today
- If no logo and no display name: cover renders as today (title-only)
- For SVG logos: render via `<img>` with the public URL (no inline SVG; keeps the renderer simple and works in Playwright PDF)

Keep the implementation minimal — one `<img>` element, conditional on `logoUrl`, fixed max-height with `object-fit: contain`.

## Files touched

| File | Change |
|------|--------|
| `supabase/migrations/020_user_branding.sql` | New — adds 5 columns to `profiles` |
| `supabase/migrations/020b_logos_bucket.sql` | New — creates `logos` bucket + RLS |
| `src/types/database.types.ts` | Regenerated after migration |
| `src/lib/export/branding.ts` | Extended `resolveBranding()` to read new columns |
| `src/lib/export/__tests__/branding.test.ts` | Add tests for new fallback chain + logo passthrough |
| `src/app/api/profile/branding/route.ts` | New — POST endpoint for display name |
| `src/app/api/profile/logo/route.ts` | New — POST + DELETE endpoints for logo |
| `src/app/api/profile/logo/__tests__/route.test.ts` | New — validation, auth, happy path |
| `src/components/profile/BrandingSection.tsx` | New — settings card |
| `src/app/profile/page.tsx` | Render `<BrandingSection />` in settings tab |
| `src/components/export/Core/Cover.tsx` | Render logo above title when present |
| `src/components/export/__tests__/Cover.test.tsx` (or visual fixture) | New fixture exercising the logo path |

## Testing

### Unit
- `branding.test.ts` — fallback chain (`branding_display_name` → `full_name` → `null`); logo URL passthrough; null safety
- `route.test.ts` for `/api/profile/logo` — auth required; rejects wrong MIME; rejects oversized; happy path uploads + updates DB
- `route.test.ts` for `/api/profile/branding` — trims, length cap, null clears

### Visual regression
- Add 1-2 fixtures to the existing export visual harness: cover with logo + display name; cover with display name only (no logo); cover with neither (control — should match Phase 1 baseline)

### Manual
- Upload a 1.5 MB PNG → verify it renders on a generated course PDF
- Upload an SVG → verify it renders
- Try a 3 MB file → verify rejection toast
- Clear display name → verify fallback to OAuth `full_name` on cover
- Generate two courses with different topics → verify branding consistent across both

## Rollout

1. Apply migration 020 + 020b on Supabase (Filippo)
2. Regenerate types, ship the rest as one PR (no flag — backwards compatible since defaults are null)
3. Announce in changelog: "Branding: add your name and logo to every course"
4. Monitor adoption (% of profiles with a logo set after 1-2 weeks) to inform whether to add tier-gating later

## Future work (v2 candidates)

- Per-course branding override at generation time
- Accent color (Phase 5 column already exists)
- Hero image (Phase 5 column already exists)
- Custom footer text (Phase 5 column already exists)
- In-app cropping/resize for logo upload
- Logo cleanup hook on replace (currently old files remain in storage)
- Tier-gating once usage signal indicates demand

## Open considerations (non-blocking)

- **`white_label` boolean** already exists on the profiles row. Its current behavior is unclear from this audit — possibly a legacy flag from before the "never any Syllabi fallback" decision in Phase 1 spec §7. Out of scope for v1; flag for future cleanup.
- **`avatar_url`** also exists (OAuth avatar from social login). Distinct from `branding_logo_url`. We're not consolidating them; an OAuth avatar is identity, a brand logo is product-facing.
