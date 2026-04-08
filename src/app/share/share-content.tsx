"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Curriculum } from "@/types/curriculum";
import { decodeCurriculumFromUrl } from "@/lib/exports/generateShareUrl";

export default function SharePageContent() {
  const searchParams = useSearchParams();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  const curriculum = useMemo(() => {
    const data = searchParams.get("data");
    if (!data) return null;
    return decodeCurriculumFromUrl(data);
  }, [searchParams]);

  if (!curriculum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Course Not Found</h1>
          <p className="text-violet-300 mb-8">
            The course data could not be loaded. Please check your link.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const totalHours = curriculum.modules?.reduce((sum, mod) => {
    return (
      sum +
      (mod.lessons?.reduce((lessonSum, lesson) => {
        return lessonSum + (lesson.durationMinutes || 0);
      }, 0) || 0)
    );
  }, 0) || 0;

  const totalQuizzes = curriculum.modules?.reduce((sum, mod) => {
    return (
      sum +
      (mod.lessons?.filter((lesson) => lesson.quiz && lesson.quiz.length > 0).length || 0)
    );
  }, 0) || 0;

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-900/40 text-emerald-300 border border-emerald-700";
      case "intermediate":
        return "bg-amber-900/40 text-amber-300 border border-amber-700";
      case "advanced":
        return "bg-red-900/40 text-red-300 border border-red-700";
      default:
        return "bg-violet-900/40 text-violet-300 border border-violet-700";
    }
  };

  const getLessonIcon = (format?: string) => {
    switch (format?.toLowerCase()) {
      case "video":
        return "▶";
      case "reading":
        return "📄";
      case "interactive":
        return "🎮";
      case "project":
        return "✏️";
      case "live-session":
        return "🔴";
      case "discussion":
        return "💬";
      default:
        return "📚";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {curriculum.difficulty && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(
                  curriculum.difficulty
                )}`}
              >
                {curriculum.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-300 via-violet-100 to-white bg-clip-text text-transparent">
            {curriculum.title}
          </h1>

          {curriculum.subtitle && (
            <p className="text-xl text-violet-200 mb-8 max-w-2xl">
              {curriculum.subtitle}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-violet-300">
                {curriculum.modules?.length || 0}
              </div>
              <div className="text-sm text-slate-400 mt-1">Modules</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-violet-300">
                {curriculum.modules?.reduce(
                  (sum, mod) => sum + (mod.lessons?.length || 0),
                  0
                ) || 0}
              </div>
              <div className="text-sm text-slate-400 mt-1">Lessons</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-violet-300">
                {Math.round(totalHours / 60)}h
              </div>
              <div className="text-sm text-slate-400 mt-1">Duration</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-violet-300">
                {totalQuizzes}
              </div>
              <div className="text-sm text-slate-400 mt-1">Quizzes</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {(curriculum.description || curriculum.targetAudience) && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {curriculum.description && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-4 text-violet-100">
                  About This Course
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {curriculum.description}
                </p>
              </div>
            )}

            {curriculum.targetAudience && (
              <div>
                <h2 className="text-3xl font-bold mb-4 text-violet-100">
                  Who is this for?
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {curriculum.targetAudience}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Learning Objectives */}
      {curriculum.objectives &&
        curriculum.objectives.length > 0 && (
          <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/2">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-violet-100">
                Learning Objectives
              </h2>
              <div className="space-y-4">
                {curriculum.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-slate-200">{objective}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Course Roadmap */}
      {curriculum.modules && curriculum.modules.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-violet-100">
              Course Roadmap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {curriculum.modules.map((module, index) => {
                const moduleDuration =
                  module.lessons?.reduce(
                    (sum, lesson) => sum + (lesson.durationMinutes || 0),
                    0
                  ) || 0;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-lg p-6 hover:border-violet-500/30 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {module.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {module.lessons?.length || 0} lessons •{" "}
                          {Math.round(moduleDuration / 60)}h
                        </p>
                      </div>
                    </div>
                    {module.description && (
                      <p className="text-slate-300 text-sm mb-4">
                        {module.description}
                      </p>
                    )}
                    {module.objectives &&
                      module.objectives.length > 0 && (
                        <ul className="text-sm text-slate-400 space-y-1">
                          {module.objectives.slice(0, 2).map((obj, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-violet-400">▸</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                          {module.objectives.length > 2 && (
                            <li className="text-violet-400 text-xs pt-1">
                              +{module.objectives.length - 2} more
                            </li>
                          )}
                        </ul>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Detailed Curriculum */}
      {curriculum.modules && curriculum.modules.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/2">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-violet-100">
              Complete Curriculum
            </h2>
            <div className="space-y-4">
              {curriculum.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/8 transition"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {module.lessons?.length || 0} lessons
                      </p>
                    </div>
                    <div
                      className={`text-2xl text-violet-400 transition-transform ${
                        expandedModules.has(moduleIndex) ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </div>
                  </button>

                  {expandedModules.has(moduleIndex) && module.lessons && (
                    <div className="border-t border-white/10 bg-black/20">
                      <div className="space-y-3 p-6">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex items-start gap-4 p-4 bg-white/3 rounded-lg border border-white/5"
                          >
                            <div className="text-2xl mt-1">
                              {getLessonIcon(lesson.format)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-white">
                                  {lesson.title}
                                </h4>
                                <span className="text-xs px-2 py-1 bg-violet-900/50 text-violet-300 rounded capitalize">
                                  {lesson.format || "lesson"}
                                </span>
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-slate-400 mb-2">
                                  {lesson.description}
                                </p>
                              )}
                              {lesson.durationMinutes && (
                                <p className="text-xs text-slate-500">
                                  {lesson.durationMinutes} min
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resources Section */}
      {curriculum.bonusResources && curriculum.bonusResources.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-violet-100">
              Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {curriculum.bonusResources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-lg p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-2">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-slate-300 text-sm mb-4">
                      {resource.description}
                    </p>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-violet-400 hover:text-violet-300 text-sm font-semibold transition"
                    >
                      View Resource →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Footer */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Want to create courses like this?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Syllabi generates complete courses with audio narration, stunning design, and shareable links — in seconds.
          </p>
          <a
            href="https://syllabi.online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold rounded-xl transition shadow-lg hover:shadow-violet-500/50 text-lg"
          >
            Create your first course free
          </a>
        </div>
      </section>

      {/* Made with Syllabi */}
      <div className="border-t border-white/5 py-6 text-center">
        <a
          href="https://syllabi.online"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          Made with Syllabi.ai
        </a>
      </div>
    </div>
  );
}
