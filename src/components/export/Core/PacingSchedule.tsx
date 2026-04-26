import type { PacingSchedule as PacingScheduleType, Module } from "@/types/curriculum";

interface PacingScheduleProps {
  pacing: PacingScheduleType;
  modules: Module[];
}

/**
 * PacingSchedule — full pacing breakdown that mirrors the dashboard's
 * "Pacing Schedule" card on /course/[id].
 *
 * Renders the four headline numbers (totalHours, hoursPerWeek,
 * totalWeeks, style) and, when present, the weekly plan with
 * human-readable labels. Falls back to module IDs if weeks lack a
 * label, same as the online view.
 *
 * Phase 2 audit fix (2026-04-26): v2 PDF was omitting pacing entirely,
 * even though the legacy jsPDF includes it.
 */
export function PacingSchedule({ pacing, modules }: PacingScheduleProps) {
  const moduleById = new Map(modules.map((m) => [m.id, m]));

  return (
    <section
      className="pacing-schedule page-break-before avoid-break"
      style={{ paddingTop: "var(--sp-12)" }}
    >
      <header style={{ marginBottom: "var(--sp-6)" }}>
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
          Pacing
        </div>
        <h2 style={{ fontSize: "var(--fs-h1)", marginTop: 0 }}>Pacing schedule</h2>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--sp-4)",
          marginBottom: "var(--sp-8)",
        }}
      >
        <Stat label="Total hours" value={`${pacing.totalHours}h`} />
        <Stat label="Hours / week" value={`${pacing.hoursPerWeek}h`} />
        <Stat label="Total weeks" value={String(pacing.totalWeeks)} />
        <Stat
          label="Style"
          value={pacing.style ? pacing.style.replace(/-/g, " ") : "self-paced"}
        />
      </div>

      {pacing.weeklyPlan && pacing.weeklyPlan.length > 0 && (
        <div className="avoid-break">
          <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--sp-3)" }}>
            Weekly plan
          </h3>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {pacing.weeklyPlan.map((wk, i) => {
              const label =
                wk.label ??
                wk.moduleIds
                  .map((id) => moduleById.get(id)?.title ?? id)
                  .join(" · ");
              return (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "min-content 1fr",
                    gap: "var(--sp-3)",
                    padding: "var(--sp-2) 0",
                    borderBottom: "1px solid var(--c-rule)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      fontWeight: 700,
                      color: "var(--c-accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {`Week ${wk.week}`}
                  </span>
                  <span style={{ color: "var(--c-ink-sec)" }}>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--c-paper-alt)",
        padding: "var(--sp-3) var(--sp-4)",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          fontSize: "var(--fs-micro)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--c-ink-muted)",
          marginBottom: "var(--sp-1)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-h3)", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
