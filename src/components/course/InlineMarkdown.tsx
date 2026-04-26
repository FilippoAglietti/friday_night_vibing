"use client";

/**
 * src/components/course/InlineMarkdown.tsx
 * ─────────────────────────────────────────────────────────────
 * Inline-only markdown renderer. Used for short fields where
 * block elements (headings, tables, lists) would break the
 * surrounding layout — quiz questions, key points, lesson and
 * module descriptions, learning objectives.
 *
 * Supports: **bold**, *italic*, `code`, [links](url), and
 * KaTeX math ($...$ inline, $$...$$ display). Disallowed block
 * elements are unwrapped so their text content survives.
 * ─────────────────────────────────────────────────────────────
 */

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface InlineMarkdownProps {
  markdown: string;
  className?: string;
}

const DISALLOWED = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "ul",
  "ol",
  "li",
  "hr",
  "pre",
];

export default function InlineMarkdown({
  markdown,
  className = "",
}: InlineMarkdownProps) {
  return (
    <span className={`lesson-prose-inline ${className}`.trim()}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        disallowedElements={DISALLOWED}
        unwrapDisallowed
        components={{
          p: ({ children }) => <span>{children}</span>,
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded text-xs font-mono">
              {children}
            </code>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </span>
  );
}
