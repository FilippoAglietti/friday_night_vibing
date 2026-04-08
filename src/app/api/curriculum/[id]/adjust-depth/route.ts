/**
 * app/api/curriculum/[id]/adjust-depth/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/curriculum/:id/adjust-depth
 *
 * Rewrites the audience-level of an already-generated course.
 * Instead of regenerating the whole structure (which would change
 * module titles), we ask Claude to rewrite the *content* of each
 * lesson to match a new difficulty level.
 *
 * Body:
 *   {
 *     target_level: "beginner" | "intermediate" | "advanced",
 *     module_ids?: string[], // optional — limit scope to specific modules
 *   }
 *
 * Returns: { success: true, difficulty, modules_updated: number }
 * Auth:    Required. Must own the course.
 *
 * Performance note:
 *   Adjusting the whole masterclass would fan out to 6–10 module calls
 *   in parallel. To stay inside the Vercel 300s budget we cap at 4
 *   concurrent calls per request. Frontends needing to rewrite more
 *   should invoke the endpoint once per module chunk.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { callClaudeEdit, extractText, parseClaudeJson } from "@/lib/claude/edit";
import { loadCourseForEdit } from "@/lib/curriculum/loadForEdit";
import type {
  DifficultyLevel,
  Module,
  Lesson,
} from "@/types/curriculum";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Max modules rewritten per request — protects the function budget. */
const MAX_MODULES_PER_CALL = 4;

const LEVEL_GUIDANCE: Record<DifficultyLevel, string> = {
  beginner:
    "explain every concept from scratch, use simple analogies, avoid jargon, add concrete examples, define even basic terms",
  intermediate:
    "assume foundational vocabulary is known, explain advanced concepts clearly, connect to real-world practice",
  advanced:
    "use expert terminology freely, focus on edge cases, tradeoffs, performance, and recent research; skip the basics",
};

interface RewrittenLesson {
  id: string;
  keyPoints?: string[];
  content?: string;
}

interface RewrittenModulePayload {
  lessons: RewrittenLesson[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = await req.json().catch(() => ({}));
    const targetLevel = body?.target_level as DifficultyLevel | undefined;
    const filterModuleIds: string[] | null = Array.isArray(body?.module_ids)
      ? body.module_ids.filter((x: unknown) => typeof x === "string")
      : null;

    if (!targetLevel || !["beginner", "intermediate", "advanced"].includes(targetLevel)) {
      return NextResponse.json(
        { error: "target_level must be beginner|intermediate|advanced." },
        { status: 400 }
      );
    }

    const loaded = await loadCourseForEdit(courseId);
    if (loaded.kind === "error") {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    }
    const curriculum = loaded.course.curriculum!;

    // Short-circuit: nothing to do if already at target level.
    if (curriculum.difficulty === targetLevel && !filterModuleIds) {
      return NextResponse.json(
        {
          success: true,
          difficulty: targetLevel,
          modules_updated: 0,
          note: "Course is already at the requested level.",
        },
        { status: 200 }
      );
    }

    // Decide which modules to process and cap at MAX_MODULES_PER_CALL.
    const targetModules: Module[] = (
      filterModuleIds
        ? curriculum.modules.filter((m) => filterModuleIds.includes(m.id))
        : curriculum.modules
    ).slice(0, MAX_MODULES_PER_CALL);

    if (targetModules.length === 0) {
      return NextResponse.json(
        { error: "No matching modules to adjust." },
        { status: 400 }
      );
    }

    const language = (loaded.course.language || "en").toLowerCase();
    const languageBlock =
      language === "en"
        ? ""
        : `\nLANGUAGE: Keep all prose in the same language as the existing content (${language}). Only JSON keys stay in English.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Per-module rewrite prompt, executed in parallel
    const rewritePromises = targetModules.map(async (mod) => {
      const system =
        "You are an expert curriculum editor. Rewrite the CONTENT of existing lessons to match a new difficulty level. Keep titles and structure intact. Return STRICT JSON only.";

      const lessonSummaries = mod.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        current_content: l.content ?? "",
        current_key_points: l.keyPoints ?? [],
      }));

      const userPrompt = `
COURSE: "${curriculum.title}"
MODULE: "${mod.title}" — ${mod.description}

TARGET LEVEL: ${targetLevel}
GUIDANCE: ${LEVEL_GUIDANCE[targetLevel]}${languageBlock}

Rewrite the keyPoints and content for EACH of the following lessons so they match the new difficulty level. Keep the same ids. Preserve tone. Do not invent new lessons.

${JSON.stringify(lessonSummaries, null, 2)}

Return ONLY this JSON:
{
  "lessons": [
    {
      "id": "lesson-X-Y",
      "keyPoints": ["...", "...", "..."],
      "content": "## ...\\n\\nRich markdown..."
    }
  ]
}
      `.trim();

      const response = await callClaudeEdit({
        anthropic,
        system,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: 12_288,
        label: `adjust-depth/${courseId}/${mod.id}`,
        timeoutMs: 140_000,
      });

      const rawText = extractText(response);
      const payload = parseClaudeJson<RewrittenModulePayload>(
        rawText,
        `adjust-depth/${mod.id}`
      );

      // Merge the rewritten content back into the existing lessons.
      const rewrittenLessons: Lesson[] = mod.lessons.map((l) => {
        const next = payload.lessons.find((p) => p.id === l.id);
        if (!next) return l;
        return {
          ...l,
          keyPoints: next.keyPoints ?? l.keyPoints,
          content: next.content ?? l.content,
        };
      });

      return { moduleId: mod.id, lessons: rewrittenLessons };
    });

    const results = await Promise.all(rewritePromises);
    const resultMap = new Map(results.map((r) => [r.moduleId, r.lessons]));

    // Rebuild the curriculum — keep non-target modules intact.
    const nextModules: Module[] = curriculum.modules.map((m) => {
      const updated = resultMap.get(m.id);
      if (!updated) return m;
      return { ...m, lessons: updated };
    });

    const nextCurriculum = {
      ...curriculum,
      difficulty: targetLevel,
      modules: nextModules,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await loaded.admin
      .from("courses")
      .update({
        curriculum: JSON.parse(JSON.stringify(nextCurriculum)),
        level: targetLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) {
      console.error("[/api/curriculum/:id/adjust-depth] update error:", error);
      return NextResponse.json(
        { error: "Could not save adjusted depth." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        difficulty: targetLevel,
        modules_updated: results.length,
        note:
          targetModules.length < (filterModuleIds ?? curriculum.modules).length
            ? `Capped at ${MAX_MODULES_PER_CALL} modules per request.`
            : undefined,
      },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/curriculum/:id/adjust-depth] unexpected error:", msg);
    return NextResponse.json(
      { error: "Unexpected error.", details: msg },
      { status: 500 }
    );
  }
}
