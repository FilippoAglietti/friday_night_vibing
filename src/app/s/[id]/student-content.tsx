"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, Lock, XCircle } from "lucide-react";
import type { Curriculum, Module, QuizQuestion } from "@/types/curriculum";

// ── Props ────────────────────────────────────────────────────

interface StudentContentProps {
  courseId: string;
  curriculum: Curriculum;
}

type View = "intro" | "modules" | "quiz" | "results";

interface AnswerRecord {
  questionId: string;
  chosen: number | string;
  isCorrect: boolean;
}

interface ResultState {
  moduleIndex: number;
  moduleTitle: string;
  total: number;
  correct: number;
  percent: number;
  answers: AnswerRecord[];
  questions: QuizQuestion[];
  durationSeconds: number;
}

// ── Helpers ──────────────────────────────────────────────────

function isCorrectAnswer(q: QuizQuestion, chosen: number | string): boolean {
  if (typeof q.correctAnswer === "number") {
    return typeof chosen === "number" && chosen === q.correctAnswer;
  }
  const gold = String(q.correctAnswer).trim().toLowerCase();
  return String(chosen).trim().toLowerCase() === gold;
}

function getModuleQuiz(module: Module): QuizQuestion[] {
  if (module.quiz && module.quiz.length > 0) return module.quiz;
  const fromLessons = (module.lessons || [])
    .flatMap((l) => l.quiz ?? [])
    .filter(Boolean);
  return fromLessons;
}

// ── Component ────────────────────────────────────────────────

export default function StudentContent({ courseId, curriculum }: StudentContentProps) {
  const [view, setView] = useState<View>("intro");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const modulesWithQuizzes = useMemo(() => {
    return (curriculum.modules || [])
      .map((m, idx) => ({ module: m, idx, questions: getModuleQuiz(m) }))
      .filter((m) => m.questions.length > 0);
  }, [curriculum]);

  const totalQuizzes = modulesWithQuizzes.length;
  const totalQuestions = modulesWithQuizzes.reduce((a, m) => a + m.questions.length, 0);

  const activeModule = curriculum.modules?.[activeModuleIdx];
  const activeQuestions = activeModule ? getModuleQuiz(activeModule) : [];

  // ── Actions ────────────────────────────────────────────────

  const handleStart = () => {
    if (studentName.trim().length < 2) return;
    setView("modules");
  };

  const handlePickModule = (idx: number) => {
    setActiveModuleIdx(idx);
    setAnswers({});
    setStartedAt(Date.now());
    setSubmitError(null);
    setView("quiz");
  };

  const handleSubmit = async () => {
    if (!activeModule) return;
    setSubmitting(true);
    setSubmitError(null);

    const records: AnswerRecord[] = activeQuestions.map((q) => {
      const chosen = answers[q.id];
      return {
        questionId: q.id,
        chosen: chosen ?? "",
        isCorrect: chosen === undefined ? false : isCorrectAnswer(q, chosen),
      };
    });
    const correct = records.filter((r) => r.isCorrect).length;
    const total = activeQuestions.length;
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

    try {
      const res = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          student_name: studentName.trim(),
          student_email: studentEmail.trim() || undefined,
          module_index: activeModuleIdx,
          module_title: activeModule.title,
          total_questions: total,
          correct_answers: correct,
          answers: records,
          duration_seconds: durationSeconds,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Could not submit your attempt.");
      }
      setResult({
        moduleIndex: activeModuleIdx,
        moduleTitle: activeModule.title,
        total,
        correct,
        percent: total > 0 ? Math.round((correct * 100) / total) : 0,
        answers: records,
        questions: activeQuestions,
        durationSeconds,
      });
      setView("results");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 text-white">
      <header className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 text-[11px] text-violet-300/80">
          <GraduationCap className="size-3.5" />
          <span>Syllabi · Student view</span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold leading-tight">{curriculum.title}</h1>
        {curriculum.subtitle && (
          <p className="mt-1 text-sm text-slate-300">{curriculum.subtitle}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5">
            <BookOpen className="size-3" />
            {curriculum.modules?.length || 0} modules
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5">
            {totalQuizzes} quiz{totalQuizzes === 1 ? "" : "zes"} · {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
          </span>
          {curriculum.difficulty && (
            <span className="capitalize rounded-full bg-white/5 border border-white/10 px-2 py-0.5">
              {curriculum.difficulty}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-16">
        {view === "intro" && (
          <IntroView
            curriculum={curriculum}
            totalQuizzes={totalQuizzes}
            totalQuestions={totalQuestions}
            studentName={studentName}
            studentEmail={studentEmail}
            onName={setStudentName}
            onEmail={setStudentEmail}
            onStart={handleStart}
          />
        )}

        {view === "modules" && (
          <ModuleListView
            curriculum={curriculum}
            studentName={studentName}
            onPick={handlePickModule}
          />
        )}

        {view === "quiz" && activeModule && activeQuestions.length > 0 && (
          <QuizView
            module={activeModule}
            moduleIndex={activeModuleIdx}
            questions={activeQuestions}
            answers={answers}
            onAnswer={(qid, val) => setAnswers((p) => ({ ...p, [qid]: val }))}
            onBack={() => setView("modules")}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {view === "results" && result && (
          <ResultsView
            result={result}
            onRetake={() => handlePickModule(result.moduleIndex)}
            onOther={() => {
              setResult(null);
              setView("modules");
            }}
          />
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-[10px] text-slate-500">
        Shared with <a className="text-violet-400 hover:underline" href="https://syllabi.online" target="_blank" rel="noreferrer">Syllabi</a> · Your name and score are visible to the course owner.
      </footer>
    </div>
  );
}

// ── Subviews ─────────────────────────────────────────────────

function IntroView({
  curriculum,
  totalQuizzes,
  totalQuestions,
  studentName,
  studentEmail,
  onName,
  onEmail,
  onStart,
}: {
  curriculum: Curriculum;
  totalQuizzes: number;
  totalQuestions: number;
  studentName: string;
  studentEmail: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onStart: () => void;
}) {
  const canStart = studentName.trim().length >= 2;
  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-2">Welcome</h2>
      <p className="text-sm text-slate-300 mb-5">
        {curriculum.description || "Take the quizzes below to check what you've learned."}
      </p>
      {totalQuizzes === 0 ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          This course doesn&apos;t have any quizzes yet.
        </div>
      ) : (
        <>
          <label className="block text-xs text-slate-300 mb-1">Your name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. Ada Lovelace"
            maxLength={80}
            className="w-full rounded-md bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
          <label className="block text-xs text-slate-300 mt-3 mb-1">Email (optional)</label>
          <input
            type="email"
            value={studentEmail}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={200}
            className="w-full rounded-md bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
          <p className="mt-2 text-[11px] text-slate-500">
            The teacher who shared this course will see your name, email (if provided) and score per module.
          </p>
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Start · {totalQuizzes} quiz{totalQuizzes === 1 ? "" : "zes"} · {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
            <ArrowRight className="size-4" />
          </button>
        </>
      )}
    </section>
  );
}

function ModuleListView({
  curriculum,
  studentName,
  onPick,
}: {
  curriculum: Curriculum;
  studentName: string;
  onPick: (idx: number) => void;
}) {
  return (
    <section className="mt-4">
      <p className="text-xs text-slate-400 mb-4">Hi <span className="text-white font-medium">{studentName}</span> — pick a module to start.</p>
      <ol className="space-y-3">
        {(curriculum.modules || []).map((m, idx) => {
          const qs = getModuleQuiz(m);
          const hasQuiz = qs.length > 0;
          return (
            <li key={m.id || idx}>
              <button
                type="button"
                onClick={() => hasQuiz && onPick(idx)}
                disabled={!hasQuiz}
                className={`w-full text-left rounded-lg border p-4 transition-colors ${
                  hasQuiz
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/40 cursor-pointer"
                    : "border-white/5 bg-white/5 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-violet-300/80 mb-0.5">Module {idx + 1}</div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{m.title}</h3>
                    {m.description && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{m.description}</p>}
                  </div>
                  <div className="shrink-0 text-[11px] text-slate-300 inline-flex items-center gap-1">
                    {hasQuiz ? (
                      <>
                        <span>{qs.length} Q</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="size-3" /> No quiz
                      </>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function QuizView({
  module,
  moduleIndex,
  questions,
  answers,
  onAnswer,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: {
  module: Module;
  moduleIndex: number;
  questions: QuizQuestion[];
  answers: Record<string, number | string>;
  onAnswer: (qid: string, val: number | string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
  const canSubmit = answeredCount === questions.length && !submitting;

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-300 mb-3"
      >
        <ArrowLeft className="size-3.5" /> Back to modules
      </button>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-4">
        <div className="text-[10px] uppercase tracking-wide text-violet-300/80 mb-1">Module {moduleIndex + 1}</div>
        <h2 className="text-lg font-semibold">{module.title}</h2>
        <p className="text-[11px] text-slate-400 mt-1">
          {answeredCount} / {questions.length} answered
        </p>
      </div>

      <ol className="space-y-4">
        {questions.map((q, qIdx) => (
          <li key={q.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs text-violet-300 font-medium">Q{qIdx + 1}</span>
              <p className="text-sm text-white leading-relaxed">{q.question}</p>
            </div>

            {(q.type === "multiple-choice" || q.type === "true-false") && Array.isArray(q.options) && (
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const selected = answers[q.id] === oIdx;
                  return (
                    <label
                      key={oIdx}
                      className={`flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors text-sm ${
                        selected
                          ? "border-violet-500/60 bg-violet-500/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-violet-500/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected}
                        onChange={() => onAnswer(q.id, oIdx)}
                        className="mt-1 accent-violet-500"
                      />
                      <span className="flex-1">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {(q.type === "short-answer" || q.type === "fill-in-the-blank") && (
              <input
                type="text"
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                placeholder="Type your answer…"
                maxLength={240}
                className="w-full rounded-md bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            )}
          </li>
        ))}
      </ol>

      {submitError && (
        <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          {submitError}
        </div>
      )}

      <div className="sticky bottom-4 mt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-900/40"
        >
          {submitting ? "Submitting…" : answeredCount === questions.length ? "Submit answers" : `Answer ${questions.length - answeredCount} more`}
        </button>
      </div>
    </section>
  );
}

function ResultsView({
  result,
  onRetake,
  onOther,
}: {
  result: ResultState;
  onRetake: () => void;
  onOther: () => void;
}) {
  const pct = result.percent;
  const tone =
    pct >= 80 ? { bar: "from-emerald-500 to-teal-500", text: "text-emerald-300", label: "Excellent" } :
    pct >= 50 ? { bar: "from-violet-500 to-indigo-500", text: "text-violet-300", label: "Solid" } :
                { bar: "from-amber-500 to-rose-500",  text: "text-amber-300",  label: "Keep going" };

  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className={`text-[10px] uppercase tracking-wide ${tone.text} mb-1`}>{tone.label}</div>
        <h2 className="text-2xl font-semibold">{pct}%</h2>
        <p className="text-sm text-slate-300 mt-1">
          {result.correct} of {result.total} correct · {result.moduleTitle}
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Submitted to the course owner · completed in {result.durationSeconds}s
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
        <h3 className="text-sm font-semibold mb-3">Review</h3>
        <ol className="space-y-3">
          {result.questions.map((q, idx) => {
            const rec = result.answers[idx];
            return (
              <li key={q.id} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {rec?.isCorrect ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <XCircle className="size-4 text-rose-400" />
                  )}
                  <span className="text-[11px] text-slate-400">Q{idx + 1}</span>
                </div>
                <p className="text-slate-200">{q.question}</p>
                {q.explanation && (
                  <p className="mt-1 text-[11px] text-slate-400 italic">{q.explanation}</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs text-slate-200"
        >
          Retake this quiz
        </button>
        <button
          type="button"
          onClick={onOther}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs text-white"
        >
          Try another module <ArrowRight className="size-3.5" />
        </button>
      </div>
    </section>
  );
}
