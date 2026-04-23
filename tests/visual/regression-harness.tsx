import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type { Curriculum } from "@/types/curriculum";
import { renderHtml } from "@/lib/export/renderHtml";
import { CourseDocument } from "@/components/export";

const FIXTURES_DIR = path.join(process.cwd(), "tests/visual/fixtures");
const BASELINES_DIR = path.join(process.cwd(), "tests/visual/baselines");

export async function renderFixtureToPngs(fixtureName: string): Promise<Buffer[]> {
  const curriculum: Curriculum = JSON.parse(
    fs.readFileSync(path.join(FIXTURES_DIR, `${fixtureName}.json`), "utf8"),
  );

  const html = renderHtml(
    <CourseDocument
      curriculum={curriculum}
      branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
    />,
  );

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 },
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const pages: Buffer[] = [];
    for (let y = 0; y < totalHeight; y += 1123) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      pages.push(
        await page.screenshot({ clip: { x: 0, y: 0, width: 794, height: 1123 } }),
      );
    }
    return pages;
  } finally {
    await browser.close();
  }
}

export function diffPng(a: Buffer, b: Buffer): { diffRatio: number; pixels: number } {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });
  return { diffRatio: pixels / (width * height), pixels };
}

export function loadBaseline(fixtureName: string, pageIndex: number): Buffer {
  return fs.readFileSync(path.join(BASELINES_DIR, `${fixtureName}-p${pageIndex}.png`));
}

export function saveBaseline(fixtureName: string, pageIndex: number, data: Buffer) {
  if (!fs.existsSync(BASELINES_DIR)) fs.mkdirSync(BASELINES_DIR, { recursive: true });
  fs.writeFileSync(path.join(BASELINES_DIR, `${fixtureName}-p${pageIndex}.png`), data);
}
