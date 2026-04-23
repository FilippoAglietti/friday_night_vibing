import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { TableOfContents } from "../Core/TableOfContents";
import type { Module } from "@/types/curriculum";

const modules: Module[] = [
  { id: "m1", title: "Foundations", description: "", objectives: [], lessons: [{ id: "l1", title: "Hello World", description: "", format: "reading", durationMinutes: 5, order: 0 }], order: 0, durationMinutes: 5 },
  { id: "m2", title: "Training Models", description: "", objectives: [], lessons: [{ id: "l2", title: "Gradient Descent", description: "", format: "reading", durationMinutes: 12, order: 0 }], order: 1, durationMinutes: 12 },
];

describe("<TableOfContents />", () => {
  it("lists every module title in order", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    const fIdx = html.indexOf("Foundations");
    const tIdx = html.indexOf("Training Models");
    expect(fIdx).toBeGreaterThan(-1);
    expect(tIdx).toBeGreaterThan(-1);
    expect(fIdx).toBeLessThan(tIdx);
  });

  it("numbers modules starting at 01", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    expect(html).toContain("01");
    expect(html).toContain("02");
  });

  it("lists lesson titles nested under their module", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    expect(html).toContain("Hello World");
    expect(html).toContain("Gradient Descent");
  });

  it("renders nothing extra when modules array is empty", () => {
    const html = renderToString(<TableOfContents modules={[]} />);
    expect(html).toContain("Contents");
    expect(html).not.toContain("undefined");
  });
});
