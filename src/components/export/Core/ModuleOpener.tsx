import type { Module } from "@/types/curriculum";

interface ModuleOpenerProps {
  module: Module;
  index: number;
}

/**
 * ModuleOpener — starts each module on a fresh page.
 *
 * The `module-opener` className is consumed by print.css to force
 * `break-before: page` and `break-inside: avoid`.
 */
export function ModuleOpener({ module, index }: ModuleOpenerProps) {
  return (
    <section className="module-opener" style={{ paddingTop: "var(--sp-16)" }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        letterSpacing: "0.2em",
        color: "var(--c-accent)",
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: "var(--sp-3)",
      }}>
        Module {String(index + 1).padStart(2, "0")}
      </div>

      <h2 style={{ fontSize: "var(--fs-h1)", marginTop: 0, marginBottom: "var(--sp-4)" }}>
        {module.title}
      </h2>

      {module.description && (
        <p style={{ fontSize: "var(--fs-lg)", color: "var(--c-ink-sec)", maxWidth: "60ch" }}>
          {module.description}
        </p>
      )}

      {module.objectives.length > 0 && (
        <div style={{ marginTop: "var(--sp-8)" }}>
          <div style={{
            fontSize: "var(--fs-micro)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--c-ink-muted)",
            marginBottom: "var(--sp-3)",
          }}>
            Learning objectives
          </div>
          <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
            {module.objectives.map((obj, i) => (
              <li key={i} style={{ padding: "2px 0" }}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "var(--sp-8)", fontSize: "var(--fs-micro)", color: "var(--c-ink-muted)" }}>
        {`${module.durationMinutes} min · ${module.lessons?.length ?? 0} lessons`}
      </div>
    </section>
  );
}
