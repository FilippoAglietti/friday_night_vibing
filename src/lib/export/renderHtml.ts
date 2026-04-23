import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

export function renderHtml(element: ReactElement): string {
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
