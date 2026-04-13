"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Curriculum, Module, Lesson } from "@/types/curriculum";

interface CourseEditorProps {
  curriculum: Curriculum;
  onSave: (updated: Curriculum) => void;
  onClose: () => void;
}

export default function CourseEditor({ curriculum, onSave, onClose }: CourseEditorProps) {
  const [draft, setDraft] = useState<Curriculum>(structuredClone(curriculum));
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ mod: number; les: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const update = useCallback((fn: (d: Curriculum) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setHasChanges(true);
  }, []);

  // ── Course-level edits ──
  const updateTitle = (val: string) => update((d) => { d.title = val; });
  const updateSubtitle = (val: string) => update((d) => { d.subtitle = val; });
  const updateDescription = (val: string) => update((d) => { d.description = val; });

  // ── Module edits ──
  const updateModuleTitle = (mi: number, val: string) => update((d) => { d.modules[mi].title = val; });
  const updateModuleDesc = (mi: number, val: string) => update((d) => { d.modules[mi].description = val; });
  const moveModule = (mi: number, dir: -1 | 1) => {
    const ni = mi + dir;
    if (ni < 0 || ni >= draft.modules.length) return;
    update((d) => {
      const temp = d.modules[mi];
      d.modules[mi] = d.modules[ni];
      d.modules[ni] = temp;
      d.modules[mi].order = mi;
      d.modules[ni].order = ni;
    });
  };
  const removeModule = (mi: number) => {
    if (draft.modules.length <= 1) return;
    update((d) => {
      d.modules.splice(mi, 1);
      d.modules.forEach((m, i) => { m.order = i; });
    });
    setActiveModule(null);
  };
  const addModule = () => {
    update((d) => {
      d.modules.push({
        id: `new-mod-${Date.now()}`,
        title: "New Module",
        description: "Module description",
        objectives: [],
        order: d.modules.length,
        durationMinutes: 60,
        lessons: [{
          id: `new-les-${Date.now()}`,
          title: "New Lesson",
          description: "Lesson description",
          format: "reading" as const,
          durationMinutes: 15,
          order: 0,
          objectives: [],
          keyPoints: [],
          suggestedResources: [],
        }],
      });
    });
    setActiveModule(draft.modules.length);
  };

  // ── Lesson edits ──
  const updateLessonTitle = (mi: number, li: number, val: string) =>
    update((d) => { d.modules[mi].lessons[li].title = val; });
  const updateLessonDesc = (mi: number, li: number, val: string) =>
    update((d) => { d.modules[mi].lessons[li].description = val; });
  const updateLessonContent = (mi: number, li: number, val: string) =>
    update((d) => { d.modules[mi].lessons[li].content = val; });
  const updateLessonDuration = (mi: number, li: number, val: number) =>
    update((d) => { d.modules[mi].lessons[li].durationMinutes = val; });
  const removeLesson = (mi: number, li: number) => {
    if (draft.modules[mi].lessons.length <= 1) return;
    update((d) => {
      d.modules[mi].lessons.splice(li, 1);
      d.modules[mi].lessons.forEach((l, i) => { l.order = i; });
    });
    setActiveLesson(null);
  };
  const addLesson = (mi: number) => {
    update((d) => {
      d.modules[mi].lessons.push({
        id: `new-les-${Date.now()}`,
        title: "New Lesson",
        description: "Lesson description",
        format: "reading" as const,
        durationMinutes: 15,
        order: d.modules[mi].lessons.length,
        objectives: [],
        keyPoints: [],
        suggestedResources: [],
      });
    });
  };

  // ── Objectives ──
  const updateObjective = (idx: number, val: string) =>
    update((d) => { d.objectives[idx] = val; });
  const removeObjective = (idx: number) =>
    update((d) => { d.objectives.splice(idx, 1); });
  const addObjective = () =>
    update((d) => { d.objectives.push("New objective"); });

  const handleSave = () => {
    onSave(draft);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-3 sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-3 -mx-1 px-1">
        <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={onClose}>
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-[10px] text-amber-400 font-medium">Unsaved changes</span>
          )}
          <Button
            size="sm"
            className="gap-2 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="size-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Course Info ── */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Pencil className="size-3.5 text-violet-400" /> Course Details
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Title</label>
            <input
              className="w-full mt-1 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
              value={draft.title}
              onChange={(e) => updateTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subtitle</label>
            <input
              className="w-full mt-1 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
              value={draft.subtitle}
              onChange={(e) => updateSubtitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              className="w-full mt-1 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
              value={draft.description}
              onChange={(e) => updateDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Learning Objectives ── */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold">Learning Objectives</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          {draft.objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-500 shrink-0" />
              <input
                className="flex-1 rounded-md border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                value={obj}
                onChange={(e) => updateObjective(i, e.target.value)}
              />
              <button
                onClick={() => removeObjective(i)}
                aria-label="Remove objective"
                className="text-muted-foreground/40 hover:text-rose-400 transition-colors p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full text-[10px] gap-1.5 text-muted-foreground hover:text-violet-400" onClick={addObjective}>
            <Plus className="size-3" /> Add Objective
          </Button>
        </CardContent>
      </Card>

      {/* ── Modules ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Modules ({draft.modules.length})</h3>
          <Button variant="outline" size="sm" className="text-[10px] gap-1.5 h-7" onClick={addModule}>
            <Plus className="size-3" /> Add Module
          </Button>
        </div>

        {draft.modules.map((mod, mi) => (
          <Card key={mod.id} className={`transition-all ${activeModule === mi ? "border-violet-500/30 shadow-lg shadow-violet-500/5" : ""}`}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setActiveModule(activeModule === mi ? null : mi)}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveModule(mi, -1); }}
                    disabled={mi === 0}
                    aria-label="Move module up"
                    className="text-muted-foreground/30 hover:text-foreground disabled:opacity-20 p-0.5"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveModule(mi, 1); }}
                    disabled={mi === draft.modules.length - 1}
                    aria-label="Move module down"
                    className="text-muted-foreground/30 hover:text-foreground disabled:opacity-20 p-0.5"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-bold shrink-0">
                  {mi + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {activeModule === mi ? (
                    <input
                      className="w-full rounded-md border border-violet-500/30 bg-muted/20 px-2.5 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                      value={mod.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateModuleTitle(mi, e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium truncate">{mod.title}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">{mod.lessons.length} lessons</p>
                </div>
                {activeModule === mi && draft.modules.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeModule(mi); }}
                    aria-label="Remove module"
                    className="text-muted-foreground/40 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${activeModule === mi ? "rotate-180" : ""}`} />
              </div>
            </CardHeader>

            {activeModule === mi && (
              <CardContent className="pt-0 space-y-3">
                <textarea
                  className="w-full rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                  value={mod.description}
                  onChange={(e) => updateModuleDesc(mi, e.target.value)}
                  placeholder="Module description..."
                />

                <Separator className="border-border/20" />

                {/* Lessons */}
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Lessons</p>
                  {mod.lessons.map((les, li) => (
                    <div
                      key={les.id}
                      className={`rounded-lg border p-3 transition-all ${
                        activeLesson?.mod === mi && activeLesson?.les === li
                          ? "border-violet-500/30 bg-violet-500/[0.02]"
                          : "border-border/30 hover:border-border/50"
                      }`}
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setActiveLesson(
                          activeLesson?.mod === mi && activeLesson?.les === li ? null : { mod: mi, les: li }
                        )}
                      >
                        <GripVertical className="size-3 text-muted-foreground/30 shrink-0" />
                        <span className="text-[10px] font-bold text-violet-400/60 shrink-0">{li + 1}</span>
                        <p className="text-xs font-medium flex-1 truncate">{les.title}</p>
                        <span className="text-[9px] text-muted-foreground shrink-0">{les.durationMinutes}m</span>
                        {mod.lessons.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeLesson(mi, li); }}
                            aria-label="Remove lesson"
                            className="text-muted-foreground/30 hover:text-rose-400 transition-colors p-0.5"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>

                      {activeLesson?.mod === mi && activeLesson?.les === li && (
                        <div className="mt-3 space-y-2.5 pl-5">
                          <div>
                            <label className="text-[9px] font-medium text-muted-foreground uppercase">Title</label>
                            <input
                              className="w-full mt-0.5 rounded-md border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                              value={les.title}
                              onChange={(e) => updateLessonTitle(mi, li, e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-muted-foreground uppercase">Description</label>
                            <textarea
                              className="w-full mt-0.5 rounded-md border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs resize-none h-14 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                              value={les.description || ""}
                              onChange={(e) => updateLessonDesc(mi, li, e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-muted-foreground uppercase">Content</label>
                            <textarea
                              className="w-full mt-0.5 rounded-md border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs resize-none h-24 focus:outline-none focus:ring-1 focus:ring-violet-500/30 font-mono"
                              value={les.content || ""}
                              onChange={(e) => updateLessonContent(mi, li, e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-medium text-muted-foreground uppercase shrink-0">Duration (min)</label>
                            <input
                              type="number"
                              min={1}
                              className="w-20 rounded-md border border-border/40 bg-muted/10 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                              value={les.durationMinutes}
                              onChange={(e) => updateLessonDuration(mi, li, parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full text-[10px] gap-1.5 text-muted-foreground hover:text-violet-400" onClick={() => addLesson(mi)}>
                    <Plus className="size-3" /> Add Lesson
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
