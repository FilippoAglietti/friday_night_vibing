import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Vercel's outputFileTracing analyzes static imports; the export PDF route
  // reads katex.min.css + the katex package.json at runtime via require.resolve,
  // which the tracer does not detect. Force-include them so serverless
  // functions can find the files.
  outputFileTracingIncludes: {
    "/api/export/**/*": [
      "./node_modules/katex/dist/katex.min.css",
      "./node_modules/katex/package.json",
    ],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
