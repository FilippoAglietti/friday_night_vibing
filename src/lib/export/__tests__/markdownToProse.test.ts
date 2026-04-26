import { describe, it, expect } from "vitest";
import { markdownToProse } from "../markdown";

describe("markdownToProse", () => {
  it("returns empty string for empty input", () => {
    expect(markdownToProse("")).toBe("");
  });

  it("strips heading markers and ensures terminal punctuation", () => {
    expect(markdownToProse("## When to use")).toBe("When to use.");
    expect(markdownToProse("# Already punctuated?")).toBe("Already punctuated?");
  });

  it("flattens an unordered list into a single sentence with semicolons", () => {
    const out = markdownToProse("- first\n- second\n- third");
    expect(out).toBe("first; second; and third.");
  });

  it("flattens an ordered list into one sentence", () => {
    const out = markdownToProse("1. one\n2. two\n3. three");
    expect(out).toBe("one; two; and three.");
  });

  it("strips bold/italic/code/link markers from inline text", () => {
    const out = markdownToProse("Use **fetch** and `setTimeout` — see [docs](https://mdn.com).");
    expect(out).toBe("Use fetch and setTimeout — see docs.");
  });

  it("unwraps blockquotes (drops the > marker, keeps content)", () => {
    expect(markdownToProse("> a closure remembers its lexical scope.")).toBe(
      "a closure remembers its lexical scope.",
    );
  });

  it("preserves paragraph breaks across the document", () => {
    const md = "First paragraph here.\n\n## Section\n\nSecond paragraph here.";
    const out = markdownToProse(md);
    expect(out).toContain("First paragraph here.");
    expect(out).toContain("Section.");
    expect(out).toContain("Second paragraph here.");
    expect(out.split("\n\n")).toHaveLength(3);
  });

  it("handles a real lesson body without leaking markdown markers", () => {
    const md = [
      "## Goals",
      "",
      "By the end you will:",
      "",
      "* Understand **closures**",
      "* Use `setTimeout` correctly",
      "",
      "> A closure remembers its lexical scope.",
      "",
      "See [MDN](https://developer.mozilla.org).",
    ].join("\n");
    const out = markdownToProse(md);
    expect(out).not.toMatch(/[*_`#>\[\]()]/);
    expect(out).toContain("Goals.");
    expect(out).toContain("Understand closures");
    expect(out).toContain("Use setTimeout correctly");
    expect(out).toContain("A closure remembers");
    expect(out).toContain("MDN");
  });
});
