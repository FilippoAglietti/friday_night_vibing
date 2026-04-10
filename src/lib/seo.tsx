/**
 * lib/seo.tsx
 * ─────────────────────────────────────────────────────────────
 * Shared SEO utilities for Syllabi.
 * - Breadcrumb JSON-LD generator
 * - Per-page JSON-LD component
 * - hreflang config
 * ─────────────────────────────────────────────────────────────
 */

export const BASE_URL = "https://www.syllabi.online";

// ── Supported languages for hreflang ────────────────────────
export const SUPPORTED_LOCALES = [
  "en", "it", "es", "fr", "de", "pt", "ja", "ar",
  "nl", "hi", "ru", "tr", "sv", "ko", "zh", "pl",
] as const;

// ── Breadcrumb JSON-LD generator ────────────────────────────
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// ── React component to inject JSON-LD into <head> ───────────
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// ── Common breadcrumb paths ─────────────────────────────────
export const BREADCRUMBS = {
  docs: [
    { name: "Home", url: "/" },
    { name: "Documentation", url: "/docs" },
  ],
  blog: [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ],
  changelog: [
    { name: "Home", url: "/" },
    { name: "Changelog", url: "/changelog" },
  ],
  support: [
    { name: "Home", url: "/" },
    { name: "Support", url: "/support" },
  ],
  tutorial: [
    { name: "Home", url: "/" },
    { name: "Tutorial", url: "/tutorial" },
  ],
  contact: [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ],
  privacy: [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/terms" },
    { name: "Privacy Policy", url: "/privacy" },
  ],
  terms: [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/terms" },
    { name: "Terms of Service", url: "/terms" },
  ],
  cookies: [
    { name: "Home", url: "/" },
    { name: "Legal", url: "/terms" },
    { name: "Cookie Policy", url: "/cookies" },
  ],
};
