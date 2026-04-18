import Anthropic from "@anthropic-ai/sdk";
import { recordEvent } from "@/lib/observability/metrics";

const POLISH_MODEL = "claude-opus-4-7";
export const POLISH_BUDGET = 15;

export interface LessonLike {
  id: string;
  is_worked_example?: boolean;
  is_key_concept?: boolean;
  bodyLength?: number;
  reviewerFlag?: boolean;
  isRecap?: boolean;
  isTransition?: boolean;
  isQuizHeavy?: boolean;
  body?: string;
}

export interface ModuleLike {
  id: string;
  lessons: LessonLike[];
}

/**
 * Per spec §5.2: rank lessons by priority, take top 15.
 *  P1 (always): first + last of each module, worked_example, key_concept.
 *  P2 (fill budget): longest body, reviewer-flagged.
 *  P3 (skip by default): recap, transition, quiz-heavy.
 */
export function selectLessonsToPolish(modules: ModuleLike[]): LessonLike[] {
  const p1: LessonLike[] = [];
  const p2: LessonLike[] = [];
  const p3: LessonLike[] = [];

  for (const m of modules) {
    for (let i = 0; i < m.lessons.length; i++) {
      const l = m.lessons[i];
      const isFirst = i === 0;
      const isLast = i === m.lessons.length - 1;
      const isP1 = isFirst || isLast || l.is_worked_example || l.is_key_concept;
      const isP3 = l.isRecap || l.isTransition || l.isQuizHeavy;
      if (isP1) p1.push(l);
      else if (isP3) p3.push(l);
      else p2.push(l);
    }
  }

  p2.sort((a, b) => {
    if ((b.reviewerFlag ? 1 : 0) !== (a.reviewerFlag ? 1 : 0)) {
      return (b.reviewerFlag ? 1 : 0) - (a.reviewerFlag ? 1 : 0);
    }
    return (b.bodyLength ?? 0) - (a.bodyLength ?? 0);
  });

  const picked: LessonLike[] = [];
  for (const l of p1) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }
  for (const l of p2) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }
  for (const l of p3) {
    if (picked.length >= POLISH_BUDGET) break;
    picked.push(l);
  }
  return picked;
}

/**
 * Polish a single lesson via Opus. On failure, returns null (caller
 * keeps the original Sonnet version — soft degradation).
 * Gated by MASTERCLASS_STRATEGIC_POLISH_ENABLED env var.
 */
export async function polishLesson(params: {
  courseId: string;
  lessonId: string;
  body: string;
}): Promise<string | null> {
  if (process.env.MASTERCLASS_STRATEGIC_POLISH_ENABLED !== "true") return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startMs = Date.now();

  try {
    const resp = await client.messages.create({
      model: POLISH_MODEL,
      max_tokens: 4096,
      system:
        "You are a senior instructor polishing a lesson to masterclass quality. Improve clarity, pedagogy, and flow. Preserve all facts; NEVER introduce new references or URLs. Return only the polished lesson body in Markdown.",
      messages: [{ role: "user", content: `LESSON BODY:\n\n${params.body}` }],
    });

    const polished = resp.content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join("");

    await recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_success",
      phase: "module_detail",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "polish",
        lesson_id: params.lessonId,
        model: POLISH_MODEL,
        input_tokens: resp.usage?.input_tokens,
        output_tokens: resp.usage?.output_tokens,
      },
    });

    return polished;
  } catch (err) {
    await recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_failure",
      phase: "module_detail",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "polish",
        lesson_id: params.lessonId,
        error: (err as Error).message,
      },
    });
    return null;
  }
}
