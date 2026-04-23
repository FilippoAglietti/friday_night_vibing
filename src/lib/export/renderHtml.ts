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

  // Strip @import "./tokens.css" so headless browser doesn't try to fetch from filesystem
  const coreNoImport = core.replace(/@import\s+['"][^'"]*tokens\.css['"]\s*;?/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>${tokens}${coreNoImport}${print}</style>
</head>
<body>
${body}
</body>
</html>`;
}
