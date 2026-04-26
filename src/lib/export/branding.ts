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
 * Hard constraint (spec §7): never include any Syllabi branding. The fallback
 * chain is full_name → email-prefix → null, so if a user has at least an email
 * (always true for authenticated users) the cover/footer carries an identifier
 * rather than going blank.
 *
 * Phase 1 reads only `full_name`. Phase 5 extends this helper to read
 * `branding_logo_url`, `branding_accent`, `branding_hero_url`, `branding_footer`
 * once migration 020 adds those columns.
 */
export function resolveBranding(
  profile: Profile | null,
  email?: string | null,
): BrandingTokens {
  const raw = profile?.full_name?.trim();
  const fromName = raw && raw.length > 0 ? raw : null;
  const fromEmail =
    email && email.includes("@") ? email.split("@")[0] || null : null;
  return {
    displayName: fromName ?? fromEmail,
    logoUrl: null,
    accent: null,
    heroUrl: null,
    footer: null,
  };
}

/**
 * String version of the displayName for export pipelines that don't accept null
 * (file metadata, footer attribution). Falls back to "Author" when nothing
 * resolvable is available — preserves the no-Syllabi guarantee.
 */
export function resolveCreatorLabel(
  profile: Profile | null,
  email?: string | null,
): string {
  return resolveBranding(profile, email).displayName ?? "Author";
}
