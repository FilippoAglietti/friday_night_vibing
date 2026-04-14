import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/profile",
        "/profile/",
        "/auth/",
        "/course/",
        "/share",
        "/palette",
        "/logo-preview",
      ],
    },
    sitemap: "https://www.syllabi.online/sitemap.xml",
    host: "https://www.syllabi.online",
  };
}
