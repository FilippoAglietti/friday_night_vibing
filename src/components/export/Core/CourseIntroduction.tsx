import type { Curriculum } from "@/types/curriculum";

interface CourseIntroductionProps {
  curriculum: Pick<
    Curriculum,
    | "description"
    | "targetAudience"
    | "objectives"
    | "prerequisites"
    | "difficulty"
    | "tags"
  >;
}

/**
 * CourseIntroduction — frontmatter page that ships the curriculum-level
 * intro fields the Cover deliberately omits (its job is the title page,
 * not the abstract).
 *
 * Renders only the sections that have content — a curriculum with no
 * prerequisites/tags simply skips those headings rather than printing an
 * empty placeholder.
 *
 * Phase 2 audit fix (2026-04-26): the v2 PDF was missing description,
 * targetAudience, objectives, prerequisites, difficulty, and tags
 * entirely. This component restores them on the page that follows the
 * Cover and precedes the Table of Contents.
 */
export function CourseIntroduction({ curriculum }: CourseIntroductionProps) {
  const {
    description,
    targetAudience,
    objectives,
    prerequisites,
    difficulty,
    tags,
  } = curriculum;

  const hasContent =
    Boolean(description) ||
    Boolean(targetAudience) ||
    (objectives && objectives.length > 0) ||
    (prerequisites && prerequisites.length > 0) ||
    Boolean(difficulty) ||
    (tags && tags.length > 0);

  if (!hasContent) return null;

  return (
    <section className="course-introduction page-break-after" style={{ paddingTop: "var(--sp-12)" }}>
      <header style={{ marginBottom: "var(--sp-8)" }}>
        <div
          style={{
            fontSize: "var(--fs-micro)",
            letterSpacing: "0.2em",
            color: "var(--c-accent)",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "var(--sp-3)",
          }}
        >
          Introduction
        </div>
        <h2 style={{ fontSize: "var(--fs-h1)", marginTop: 0 }}>About this course</h2>
      </header>

      {(difficulty || (tags && tags.length > 0)) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--sp-2)",
            marginBottom: "var(--sp-6)",
            fontSize: "var(--fs-micro)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--c-ink-muted)",
            fontWeight: 600,
          }}
        >
          {difficulty && (
            <span
              style={{
                background: "var(--c-accent-soft)",
                color: "var(--c-accent)",
                padding: "2px 8px",
                borderRadius: "3px",
              }}
            >
              {difficulty}
            </span>
          )}
          {(tags ?? []).map((t) => (
            <span
              key={t}
              style={{
                background: "var(--c-paper-alt)",
                padding: "2px 8px",
                borderRadius: "3px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {description && (
        <div style={{ marginBottom: "var(--sp-8)" }}>
          <p style={{ fontSize: "var(--fs-lg)", lineHeight: "var(--lh-loose)", maxWidth: "60ch" }}>
            {description}
          </p>
        </div>
      )}

      {targetAudience && (
        <div style={{ marginBottom: "var(--sp-8)" }}>
          <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--sp-2)" }}>
            Who this is for
          </h3>
          <p style={{ maxWidth: "60ch" }}>{targetAudience}</p>
        </div>
      )}

      {objectives && objectives.length > 0 && (
        <div style={{ marginBottom: "var(--sp-8)" }} className="avoid-break">
          <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--sp-3)" }}>
            What you will learn
          </h3>
          <ul style={{ paddingLeft: "var(--sp-5)", margin: 0 }}>
            {objectives.map((o, i) => (
              <li key={i} style={{ padding: "3px 0" }}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {prerequisites && prerequisites.length > 0 && (
        <div className="avoid-break">
          <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--sp-3)" }}>
            Prerequisites
          </h3>
          <ul style={{ paddingLeft: "var(--sp-5)", margin: 0 }}>
            {prerequisites.map((p, i) => (
              <li key={i} style={{ padding: "3px 0" }}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
