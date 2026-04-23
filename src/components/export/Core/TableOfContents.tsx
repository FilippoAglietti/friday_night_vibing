import type { Module } from "@/types/curriculum";

interface TableOfContentsProps {
  modules: Module[];
}

/**
 * Table of Contents — second page of every export.
 *
 * Numbered modules with nested lesson titles. Page numbers are filled in
 * at render time by CSS counters (see print.css).
 */
export function TableOfContents({ modules }: TableOfContentsProps) {
  return (
    <section className="toc page-break-after" style={{ paddingTop: "var(--sp-12)" }}>
      <h2 style={{ marginTop: 0 }}>Contents</h2>
      <ol style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {modules.map((module, i) => (
          <li key={module.id} style={{ marginTop: "var(--sp-6)", breakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-3)" }}>
              <span style={{
                fontSize: "var(--fs-micro)",
                fontWeight: 700,
                color: "var(--c-accent)",
                letterSpacing: "0.1em",
                minWidth: "2em",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: "var(--fs-h3)", fontWeight: 600, color: "var(--c-ink)" }}>
                {module.title}
              </span>
            </div>
            {module.lessons?.length > 0 && (
              <ul style={{ listStyle: "none", paddingLeft: "var(--sp-8)", margin: "var(--sp-2) 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} style={{ padding: "2px 0" }}>{lesson.title}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
