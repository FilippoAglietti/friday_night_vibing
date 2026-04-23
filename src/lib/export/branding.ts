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
 * Phase 1 reads only `full_name`. Phase 5 extends this helper to read
 * `branding_logo_url`, `branding_accent`, `branding_hero_url`, `branding_footer`
 * once migration 020 adds those columns.
 */
export function resolveBranding(profile: Profile | null): BrandingTokens {
  const raw = profile?.full_name?.trim();
  const displayName = raw && raw.length > 0 ? raw : null;
  return {
    displayName,
    logoUrl: null,
    accent: null,
    heroUrl: null,
    footer: null,
  };
}
