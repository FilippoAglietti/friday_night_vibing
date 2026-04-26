import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface BrandingTokens {
  displayName: string | null;
  logoUrl: string | null;    // Phase 5 — always null in Phase 1
  accent: string | null;     // Phase 5 — always null in Phase 1
  heroUrl: string | null;    // Phase 5 — always null in Phase 1
  footer: string | null;     // Phase 5 — always null in Phase 1
}

/**
 * Resolve the branding tokens used by export components.
 *
 * Hard constraint (spec §7): never include any Syllabi branding. When a creator
 * has no display name, every field is null and the renderer falls back to
 * title-only covers / blank metadata.
 *
 * v1 wires displayName + logoUrl. accent / heroUrl / footer columns exist in
 * the schema but are unused (Phase 5 will wire them).
 *
 * Display name fallback chain: branding_display_name → full_name → null.
 */
export function resolveBranding(profile: Profile | null): BrandingTokens {
  const brandName = profile?.branding_display_name?.trim();
  const fallbackName = profile?.full_name?.trim();
  const displayName =
    brandName && brandName.length > 0
      ? brandName
      : fallbackName && fallbackName.length > 0
        ? fallbackName
        : null;

  const rawLogo = profile?.branding_logo_url?.trim();
  const logoUrl = rawLogo && rawLogo.length > 0 ? rawLogo : null;

  return {
    displayName,
    logoUrl,
    accent: null,
    heroUrl: null,
    footer: null,
  };
}
