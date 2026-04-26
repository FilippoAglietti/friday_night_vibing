import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

// Dynamic import of react-dom/server — Next.js 16 Turbopack rejects a static
// import from a route's server graph, even though this module only runs at
// request time.
export async function renderHtml(element: ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const body = renderToStaticMarkup(element);

  const cssDir = path.join(
    process.cwd(),
    "src",
    "components",
    "export",
    "page-css",
  );
  const tokens = fs.readFileSync(path.join(cssDir, "tokens.css"), "utf8");
  const core = fs.readFileSync(path.join(cssDir, "handbook-core.css"), "utf8");
  const print = fs.readFileSync(path.join(cssDir, "print.css"), "utf8");
  // Vendored katex.min.css — the upstream stylesheet is mirrored under
  // page-css/ so Next's standalone bundler picks it up the same way it
  // picks up the other page-css files. Reading it from node_modules at
  // runtime via require.resolve fails inside Turbopack's chunked output.
  // Bump procedure: re-copy from node_modules/katex/dist/katex.min.css
  // when the katex dep is upgraded.
  const katex = fs.readFileSync(path.join(cssDir, "katex.css"), "utf8");

  // Strip @import "./tokens.css" so headless browser doesn't try to fetch from filesystem
  const coreNoImport = core.replace(/@import\s+['"][^'"]*tokens\.css['"]\s*;?/g, "");

  // Rewrite katex's relative `url(fonts/...)` to absolute jsDelivr URLs so
  // the fonts load over the network: setContent() leaves the page with no
  // base URL, so relative paths can't resolve. Graceful degradation: if the
  // CDN is unreachable, math falls back to the platform sans-serif.
  const katexVersion = readKatexVersion();
  const cdnBase = `https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist/`;
  const katexWithCdnFonts = katex.replace(
    /url\((['"]?)fonts\//g,
    `url($1${cdnBase}fonts/`,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>${tokens}${coreNoImport}${print}${katexWithCdnFonts}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function readKatexVersion(): string {
  // Resolved from the installed package; harmless if a build copies a
  // newer katex.min.css than the package.json knows about (CDN versioning
  // just falls back to the next-closest snapshot via jsDelivr's resolver).
  const pkgPath = path.join(process.cwd(), "node_modules", "katex", "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };
    return pkg.version;
  } catch {
    // Fallback to a known-good major version. Better than crashing the render.
    return "0.16.45";
  }
}
