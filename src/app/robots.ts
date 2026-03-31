import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/auth/"] },
    sitemap: "https://www.syllabi.online/sitemap.xml",
  };
}
