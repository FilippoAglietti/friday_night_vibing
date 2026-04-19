import Anthropic from "@anthropic-ai/sdk";
import { recordEvent } from "@/lib/observability/metrics";

const REVIEWER_MODEL = "claude-opus-4-7";

/**
 * Runs an Opus review pass over a generated skeleton. Returns
 * 'approved' or 'needs_revision' with structured feedback.
 *
 * Gated by OPUS_REVIEWER_ENABLED env var. If flag off, returns
 * 'approved' without making a call (cost = 0).
 *
 * MUST be called inside step.run() by the orchestrator. Inngest
 * replays the function body on every subsequent step completion;
 * without memoisation the Opus API gets re-hit once per replay.
 * The helper catches its own errors (soft-degrades to 'approved')
 * and emits recordEvent internally, so a single step.run wrapper
 * fires telemetry exactly once per actual API call.
 */
export async function reviewSkeleton(params: {
  courseId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skeleton: any;
}): Promise<{ verdict: "approved" | "needs_revision"; feedback: string[] }> {
  if (process.env.OPUS_REVIEWER_ENABLED !== "true") {
    return { verdict: "approved", feedback: [] };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startMs = Date.now();

  try {
    const resp = await client.messages.create({
      model: REVIEWER_MODEL,
      max_tokens: 2048,
      system: REVIEWER_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Review this course skeleton for internal contradictions, hallucinated external references, broken logical progression, out-of-topic drift, or inappropriate subject matter escape. Return JSON: {"verdict":"approved"|"needs_revision","feedback":["..."]}\n\nSKELETON:\n${JSON.stringify(params.skeleton, null, 2)}`,
        },
      ],
    });

    const text = resp.content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => (c.type === "text" ? c.text : ""))
      .join("");
    const parsed = extractJson(text) as {
      verdict: "approved" | "needs_revision";
      feedback: string[];
    };

    await recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_success",
      phase: "skeleton",
      durationMs: Date.now() - startMs,
      metadata: {
        step: "reviewer",
        model: REVIEWER_MODEL,
        verdict: parsed.verdict,
        feedback_count: parsed.feedback?.length ?? 0,
        input_tokens: resp.usage?.input_tokens,
        output_tokens: resp.usage?.output_tokens,
      },
    });

    return parsed;
  } catch (err) {
    await recordEvent({
      courseId: params.courseId,
      eventType: "claude_call_failure",
      phase: "skeleton",
      durationMs: Date.now() - startMs,
      metadata: { step: "reviewer", error: (err as Error).message },
    });
    return { verdict: "approved", feedback: [] };
  }
}

const REVIEWER_SYSTEM = `You are a senior curriculum reviewer. Identify only fatal-quality issues: contradictions, hallucinated external references (URLs, citations, figures, YouTube IDs), broken logical progression, out-of-topic drift, and subject-matter escape. Minor stylistic issues are NOT reasons for revision. Return strict JSON only.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json in reviewer response");
  return JSON.parse(match[0]);
}
