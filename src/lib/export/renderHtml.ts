import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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

  // Strip @import "./tokens.css" so headless browser doesn't try to fetch from filesystem
  const coreNoImport = core.replace(/@import\s+['"][^'"]*tokens\.css['"]\s*;?/g, "");

  const katex = loadKatexCss();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>${tokens}${coreNoImport}${print}${katex}</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Inline KaTeX's stylesheet so display + inline math typeset correctly
 * in the headless browser. The headless page is loaded via setContent()
 * with no base URL, so the @font-face rules' relative `fonts/` paths
 * cannot resolve from disk — we rewrite them to absolute jsDelivr URLs
 * (pinned to the installed katex version) so the math fonts still load
 * over the network during PDF generation. Graceful degradation: if the
 * CDN is unreachable the layout still works, equations just fall back
 * to the platform sans-serif.
 */
const requireFn = createRequire(import.meta.url);

function loadKatexCss(): string {
  const cssPath = requireFn.resolve("katex/dist/katex.min.css");
  const pkgPath = requireFn.resolve("katex/package.json");
  const css = fs.readFileSync(cssPath, "utf8");
  const { version } = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
    version: string;
  };
  const cdnBase = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/`;
  return css.replace(/url\((['"]?)fonts\//g, `url($1${cdnBase}fonts/`);
}
