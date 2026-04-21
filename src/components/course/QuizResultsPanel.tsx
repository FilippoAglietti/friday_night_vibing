"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronDown, RefreshCw, Users } from "lucide-react";

// ── Props ────────────────────────────────────────────────────

interface QuizResultsPanelProps {
  courseId: string;
}

interface Attempt {
  id: string;
  student_name: string;
  student_email: string | null;
  module_index: number;
  module_title: string | null;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  duration_seconds: number | null;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Component ────────────────────────────────────────────────

export default function QuizResultsPanel({ courseId }: QuizResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz-attempts?course_id=${encodeURIComponent(courseId)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Could not load attempts.");
      }
      setAttempts(json.attempts as Attempt[]);
      setFetched(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not load attempts.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (expanded && !fetched) {
      void fetchAttempts();
    }
  }, [expanded, fetched, fetchAttempts]);

  const stats = useMemo(() => {
    if (attempts.length === 0) return null;
    const totalScore = attempts.reduce((a, v) => a + v.score_percent, 0);
    const avg = Math.round(totalScore / attempts.length);
    const perModule = new Map<number, { title: string; count: number; sum: number }>();
    for (const a of attempts) {
      const cur = perModule.get(a.module_index) ?? { title: a.module_title ?? `Module ${a.module_index + 1}`, count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += a.score_percent;
      perModule.set(a.module_index, cur);
    }
    const modules = Array.from(perModule.entries())
      .map(([idx, v]) => ({ idx, title: v.title, count: v.count, avg: Math.round(v.sum / v.count) }))
      .sort((a, b) => a.idx - b.idx);
    const uniqueStudents = new Set(attempts.map((a) => a.student_name.toLowerCase())).size;
    return { avg, total: attempts.length, uniqueStudents, modules };
  }, [attempts]);

  return (
    <section id="quiz-results" className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Student quiz results</h2>
            {fetched && (
              <span className="text-[11px] text-slate-400">
                · {attempts.length} attempt{attempts.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <ChevronDown className={`size-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        {expanded && (
          <div className="border-t border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Attempts submitted via your public student link. Only visible to you.
              </p>
              <button
                type="button"
                onClick={fetchAttempts}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-violet-300 disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                {error}
              </div>
            )}

            {!loading && attempts.length === 0 && !error && (
              <div className="rounded-md border border-dashed border-white/10 bg-white/5 p-6 text-center">
                <Users className="size-6 text-violet-400/60 mx-auto mb-2" />
                <p className="text-sm text-slate-300">No attempts yet.</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Share the student link from Export &amp; Share. Results appear here automatically.
                </p>
              </div>
            )}

            {stats && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Attempts" value={stats.total.toString()} />
                  <StatCard label="Students" value={stats.uniqueStudents.toString()} />
                  <StatCard label="Avg score" value={`${stats.avg}%`} />
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="text-xs font-semibold text-slate-200 mb-3">Per module</h3>
                  <ul className="space-y-2">
                    {stats.modules.map((m) => (
                      <li key={m.idx} className="flex items-center gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 truncate">Module {m.idx + 1} · {m.title}</p>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                              style={{ width: `${m.avg}%` }}
                            />
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-slate-100 font-medium">{m.avg}%</div>
                          <div className="text-[10px] text-slate-500">{m.count} attempt{m.count === 1 ? "" : "s"}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  <h3 className="px-4 py-2 text-xs font-semibold text-slate-200 border-b border-white/10">Recent attempts</h3>
                  <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {attempts.slice(0, 50).map((a) => (
                      <li key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-100 font-medium truncate">
                            {a.student_name}
                            {a.student_email && (
                              <span className="text-slate-500 font-normal"> · {a.student_email}</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {a.module_title || `Module ${a.module_index + 1}`} · {formatDate(a.created_at)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`text-sm font-semibold ${
                            a.score_percent >= 80 ? "text-emerald-400" :
                            a.score_percent >= 50 ? "text-violet-300" : "text-amber-300"
                          }`}>{a.score_percent}%</div>
                          <div className="text-[10px] text-slate-500">{a.correct_answers}/{a.total_questions}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
