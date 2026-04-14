import type { MetadataRoute } from "next";
import { getAllNicheSlugs } from "@/data/niches";

// ── Blog posts with real publish dates (for <lastmod>) ──
const BLOG_POSTS: { slug: string; date: string }[] = [
  { slug: "how-to-create-online-course-2026", date: "2026-04-10" },
  { slug: "ai-course-generator-comparison",   date: "2026-04-08" },
  { slug: "best-tools-course-creators",       date: "2026-04-06" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.syllabi.online";
  const now = new Date();

  // ── Programmatic niche pages ──
  const nichePages = getAllNicheSlugs().map((slug) => ({
    url: `${baseUrl}/generator/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Blog article pages ──
  const blogPostPages = BLOG_POSTS.map(({ slug, date }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(date),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    // ── Core pages (highest priority) ──
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/tutorial`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/generator`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/quick`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },

    // ── Product pages ──
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // ── Blog articles ──
    ...blogPostPages,

    // ── Niche generator pages (programmatic SEO) ──
    ...nichePages,

    // ── Legal (low priority, rarely changes) ──
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
