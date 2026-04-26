import { describe, it, expect } from "vitest";
import { escapeHtml, markdownToHtml } from "../markdown";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert("xss")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
    expect(escapeHtml("a & b")).toBe("a &amp; b");
    expect(escapeHtml("'single'")).toBe("&#39;single&#39;");
  });
});

describe("markdownToHtml", () => {
  it("returns empty string for empty input", () => {
    expect(markdownToHtml("")).toBe("");
  });

  it("escapes raw HTML before substituting markdown", () => {
    const out = markdownToHtml("Type `<script>` to run code");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("renders headings", () => {
    expect(markdownToHtml("# H1")).toContain("<h1>H1</h1>");
    expect(markdownToHtml("## H2")).toContain("<h2>H2</h2>");
    expect(markdownToHtml("### H3")).toContain("<h3>H3</h3>");
  });

  it("renders bold", () => {
    expect(markdownToHtml("This is **important** text")).toContain(
      "<strong>important</strong>",
    );
    expect(markdownToHtml("__also bold__")).toContain("<strong>also bold</strong>");
  });

  it("renders italic", () => {
    expect(markdownToHtml("a *word* there")).toContain("<em>word</em>");
  });

  it("renders inline code without re-applying bold inside it", () => {
    const out = markdownToHtml("Run `**not bold**` literally");
    expect(out).toContain("<code>**not bold**</code>");
    expect(out).not.toContain("<strong>");
  });

  it("renders blockquotes wrapping each line in <p>", () => {
    const out = markdownToHtml("> First quote line\n> Second quote line");
    expect(out).toContain("<blockquote>");
    expect(out).toContain("</blockquote>");
    expect(out).toContain("<p>First quote line</p>");
    expect(out).toContain("<p>Second quote line</p>");
  });

  it("renders unordered lists", () => {
    const out = markdownToHtml("* item one\n* item two");
    expect(out).toContain("<ul>");
    expect(out).toContain("<li>item one</li>");
    expect(out).toContain("<li>item two</li>");
    expect(out).toContain("</ul>");
  });

  it("renders ordered lists", () => {
    const out = markdownToHtml("1. first\n2. second");
    expect(out).toContain("<ol>");
    expect(out).toContain("<li>first</li>");
    expect(out).toContain("<li>second</li>");
    expect(out).toContain("</ol>");
  });

  it("renders links with target=_blank and rel=noopener", () => {
    const out = markdownToHtml("see [docs](https://example.com)");
    expect(out).toContain('<a href="https://example.com" target="_blank" rel="noopener">docs</a>');
  });

  it("groups consecutive non-blank lines into a single paragraph", () => {
    const out = markdownToHtml("line one\nline two\n\nline three");
    expect(out).toContain("<p>line one line two</p>");
    expect(out).toContain("<p>line three</p>");
  });

  it("handles a mixed-content paragraph with bold + code + link", () => {
    const out = markdownToHtml(
      "Use **fetch** to call `/api/health` — see [docs](https://mdn.com)",
    );
    expect(out).toContain("<strong>fetch</strong>");
    expect(out).toContain("<code>/api/health</code>");
    expect(out).toContain('<a href="https://mdn.com"');
  });

  it("survives a real-world lesson body", () => {
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
    const out = markdownToHtml(md);
    expect(out).toContain("<h2>Goals</h2>");
    expect(out).toContain("<strong>closures</strong>");
    expect(out).toContain("<code>setTimeout</code>");
    expect(out).toContain("<blockquote>");
    expect(out).toContain('<a href="https://developer.mozilla.org"');
  });
});
