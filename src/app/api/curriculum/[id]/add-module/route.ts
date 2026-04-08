/**
 * app/api/curriculum/[id]/add-module/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/curriculum/:id/add-module
 *
 * Appends a brand-new module to an existing course.  Claude is asked
 * to design a module that fits thematically with the rest of the
 * course, optionally guided by a user-supplied `topic_hint` /
 * `instructions`.  The output includes full lesson content on the
 * first pass so the user sees ready-to-read output immediately.
 *
 * Body:
 *   {
 *     topic_hint?: string,   // e.g. "advanced defibrillator programming"
 *     instructions?: string, // e.g. "focus on pediatric patients"
 *     position?: "end" | number, // where to insert (default: end)
 *   }
 *
 * Returns: { success: true, module: Module, index: number }
 * Auth:    Required. Must own the course.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { callClaudeEdit, extractText, parseClaudeJson } from "@/lib/claude/edit";
import { loadCourseForEdit } from "@/lib/curriculum/loadForEdit";
import type { Module, Lesson, QuizQuestion } from "@/types/curriculum";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Keep lesson IDs deterministic-ish but globally unique so merges don't
// collide with existing ones.
function nextLessonId(moduleId: string, index: number): string {
  return `${moduleId}-l${index + 1}`;
}

interface NewModulePayload {
  title: string;
  description: string;
  objectives: string[];
  durationMinutes?: number;
  lessons: Array<Partial<Lesson> & { title: string; description: string; format?: string }>;
  quiz?: QuizQuestion[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = await req.json().catch(() => ({}));
    const topicHint: string | null =
      typeof body?.topic_hint === "string" && body.topic_hint.trim().length > 0
        ? body.topic_hint.trim().slice(0, 300)
        : null;
    const instructions: string | null =
      typeof body?.instructions === "string" && body.instructions.trim().length > 0
        ? body.instructions.trim().slice(0, 500)
        : null;
    const position: "end" | number =
      typeof body?.position === "number" && Number.isInteger(body.position)
        ? body.position
        : "end";

    const loaded = await loadCourseForEdit(courseId);
    if (loaded.kind === "error") {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    }
    const curriculum = loaded.course.curriculum!;

    // Summarise existing modules so Claude can avoid duplication.
    const existingOverview = curriculum.modules
      .map(
        (m, i) =>
          `  ${i + 1}. "${m.title}" — ${m.description.slice(0, 140)}${
            m.description.length > 140 ? "…" : ""
          }`
      )
      .join("\n");

    const language = (loaded.course.language || "en").toLowerCase();
    const languageBlock =
      language === "en"
        ? ""
        : `\nLANGUAGE: Write ALL human-facing strings in the same language as the rest of the course (${language}). Only JSON keys stay in English.`;

    const system = `
You are an expert curriculum designer. The user already has a multi-module course and wants to ADD ONE new module that fits thematically. You must return STRICT JSON only — no commentary.
    `.trim();

    const userPrompt = `
COURSE: "${curriculum.title}"
COURSE DESCRIPTION: ${curriculum.description}
AUDIENCE: ${curriculum.targetAudience} (${curriculum.difficulty})
TEACHING STYLE: ${loaded.course.teaching_style || "conversational"}${languageBlock}

EXISTING MODULES (do NOT duplicate these):
${existingOverview}

USER REQUEST:
${topicHint ? `• New module topic hint: ${topicHint}` : "• No specific topic — pick the most impactful missing piece."}
${instructions ? `• Extra instructions: ${instructions}` : ""}

DESIGN the new module with:
- 3 to 5 lessons
- Clear learning objectives (3–5)
- For EACH lesson: title, description (1-2 sentences), format (video|reading|interactive|discussion|project), durationMinutes (integer, 10-45), objectives (2-3), keyPoints (3-5 strings), content (2-4 paragraphs of rich markdown with real explanations), suggestedResources (1-3 real URLs on well-known domains)
- ${curriculum.modules.length > 0 ? "2-3 end-of-module quiz questions" : "a short 2-question quiz"}

Return ONLY this JSON:
{
  "title": "Module title",
  "description": "1-2 sentences describing the module",
  "objectives": ["obj 1", "obj 2", "obj 3"],
  "durationMinutes": 120,
  "lessons": [
    {
      "title": "Lesson title",
      "description": "What this lesson covers",
      "format": "reading",
      "durationMinutes": 20,
      "objectives": ["..."],
      "keyPoints": ["...", "..."],
      "content": "## Header\\n\\nRich markdown...\\n\\n> Pro tip...",
      "suggestedResources": [{ "title": "...", "url": "https://...", "type": "article" }]
    }
  ],
  "quiz": [
    {
      "type": "multiple-choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "...",
      "points": 1
    }
  ]
}
    `.trim();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await callClaudeEdit({
      anthropic,
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 16_384,
      label: `add-module/${courseId}`,
      timeoutMs: 140_000,
    });

    const rawText = extractText(response);
    const payload = parseClaudeJson<NewModulePayload>(rawText, `add-module/${courseId}`);

    if (!payload?.title || !Array.isArray(payload.lessons) || payload.lessons.length === 0) {
      return NextResponse.json(
        { error: "Model did not return a valid module." },
        { status: 502 }
      );
    }

    // Assign stable ids and order fields.
    const newModuleId = `mod-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const newLessons: Lesson[] = payload.lessons.map((l, i) => ({
      id: nextLessonId(newModuleId, i),
      title: l.title ?? `Lesson ${i + 1}`,
      description: l.description ?? "",
      format: (l.format as Lesson["format"]) ?? "reading",
      durationMinutes:
        typeof l.durationMinutes === "number" && l.durationMinutes > 0
          ? l.durationMinutes
          : 20,
      objectives: l.objectives ?? [],
      keyPoints: l.keyPoints ?? [],
      content: l.content ?? "",
      suggestedResources: l.suggestedResources ?? [],
      order: i,
    }));

    const newDuration =
      payload.durationMinutes ??
      newLessons.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

    const newModule: Module = {
      id: newModuleId,
      title: payload.title,
      description: payload.description ?? "",
      objectives: payload.objectives ?? [],
      lessons: newLessons,
      quiz: payload.quiz ?? [],
      // Order is filled in after we know where the module lands
      order: 0,
      durationMinutes: newDuration,
    };

    // Work out the final position and rebuild the module array with the
    // order fields re-indexed so nothing drifts.
    let insertAt: number;
    if (position === "end" || position >= curriculum.modules.length) {
      insertAt = curriculum.modules.length;
    } else if (position < 0) {
      insertAt = 0;
    } else {
      insertAt = position;
    }
    const nextModules: Module[] = [
      ...curriculum.modules.slice(0, insertAt),
      newModule,
      ...curriculum.modules.slice(insertAt),
    ].map((m, i) => ({ ...m, order: i }));

    const nextCurriculum = {
      ...curriculum,
      modules: nextModules,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await loaded.admin
      .from("courses")
      .update({
        curriculum: JSON.parse(JSON.stringify(nextCurriculum)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) {
      console.error("[/api/curriculum/:id/add-module] update error:", error);
      return NextResponse.json(
        { error: "Could not save new module." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, module: nextModules[insertAt], index: insertAt },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/curriculum/:id/add-module] unexpected error:", msg);
    return NextResponse.json(
      { error: "Unexpected error.", details: msg },
      { status: 500 }
    );
  }
}
