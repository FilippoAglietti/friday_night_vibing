"use client";

/**
 * src/components/course/LessonProse.tsx
 * ─────────────────────────────────────────────────────────────
 * Block-level markdown renderer for the online course view.
 * Used for `lesson.content` — full prose with headings, lists,
 * blockquotes, fenced code, GFM tables, and KaTeX math
 * ($...$ inline, $$...$$ display).
 *
 * Tailwind classes match the dark-theme palette already used
 * across course-content.tsx (slate-300 body, violet-400 accents,
 * white headings).
 * ─────────────────────────────────────────────────────────────
 */

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface LessonProseProps {
  markdown: string;
  className?: string;
}

export default function LessonProse({ markdown, className = "" }: LessonProseProps) {
  return (
    <div className={`lesson-prose ${className}`.trim()}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-lg font-semibold text-white mt-5 mb-2">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-base font-semibold text-white mt-4 mb-2">{children}</h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-sm font-semibold text-white mt-3 mb-2">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>
          ),
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
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 mb-3 text-sm text-slate-300 marker:text-violet-400/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 mb-3 text-sm text-slate-300 marker:text-violet-400/70">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-violet-500/50 pl-4 py-1 my-3 text-sm text-slate-300 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          pre: ({ children }) => (
            <pre className="bg-slate-900/60 border border-white/10 rounded-lg p-3 my-3 overflow-x-auto text-xs leading-relaxed">
              {children}
            </pre>
          ),
          code: ({ className: codeClass, children, ...rest }) => {
            const isFenced = typeof codeClass === "string" && codeClass.startsWith("language-");
            if (isFenced) {
              return (
                <code className={`${codeClass} text-slate-200 font-mono`} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded text-xs font-mono"
                {...rest}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-200 uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-slate-300 align-top">{children}</td>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
