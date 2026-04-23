import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ModuleOpener } from "../Core/ModuleOpener";
import type { Module } from "@/types/curriculum";

const module: Module = {
  id: "m1",
  title: "Foundations",
  description: "What a model is and how we train one.",
  objectives: ["Define a model", "Train a linear model", "Evaluate predictions"],
  lessons: [{ id: "l1", title: "Hello", description: "", format: "reading", durationMinutes: 5, order: 0 }],
  order: 0,
  durationMinutes: 5,
};

describe("<ModuleOpener />", () => {
  it("renders the module title and index", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("Foundations");
    expect(html).toContain("01");
  });

  it("renders the module description", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("What a model is");
  });

  it("renders every objective as a list item", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("Define a model");
    expect(html).toContain("Train a linear model");
    expect(html).toContain("Evaluate predictions");
  });

  it("renders duration", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toMatch(/5\s*min/i);
  });

  it("applies module-opener class so print CSS triggers page break", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("module-opener");
  });
});
