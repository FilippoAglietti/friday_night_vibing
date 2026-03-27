/**
 * lib/prompts/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Master AI prompt factory for Syllabi.ai curriculum generation.
 *
 * This is the CORE of the product. The quality of the output
 * curriculum depends entirely on this prompt.
 *
 * Design principles applied:
 *   1. Bloom's Taxonomy for all learning objectives
 *      (Remember → Understand → Apply → Analyze → Evaluate → Create)
 *   2. Progressive difficulty within and across modules
 *   3. Theory + practical exercises every lesson
 *   4. Quiz questions that test understanding, not memorisation
 *   5. Strict JSON output to make parsing 100% reliable
 *
 * Usage:
 *   import { buildCurriculumPrompt, CURRICULUM_SYSTEM_PROMPT } from '@/lib/prompts/curriculum'
 *   const messages = buildCurriculumPrompt({ topic, audience, length, niche })
 * ─────────────────────────────────────────────────────────────
 */

import type { GenerateRequest, AudienceLevel, CourseLength } from "@/types/curriculum";

// ─── Helper maps ──────────────────────────────────────────────

/**
 * Human-readable description of each audience level.
 * Injected into the prompt so the AI understands the expected student baseline.
 */
const AUDIENCE_DESCRIPTIONS: Record<AudienceLevel, string> = {
  beginner:
    "complete beginners with no prior knowledge of the subject — explain every concept from scratch, avoid jargon, and always connect theory to familiar real-world examples",
  intermediate:
    "students who already understand the basics and want to go deeper — you can assume foundational vocabulary but should still explain advanced concepts clearly",
  advanced:
    "experienced practitioners who want expert-level depth — use technical terminology freely, include nuance, edge-cases, and current best practices",
};

/**
 * Maps the course length selector to concrete lesson count guidance.
 * Used to constrain the AI output to the right size.
 */
const LENGTH_DESCRIPTIONS: Record<CourseLength, string> = {
  mini:
    "a Mini-Course of exactly 1–2 modules with a total of 4–6 lessons. Keep it tight and focused on the single most valuable outcome.",
  standard:
    "a Standard Course of 3–5 modules with a total of 10–15 lessons. Balance breadth and depth.",
  bootcamp:
    "a Bootcamp of 6–10 modules with a total of 20–30 lessons. Cover the subject comprehensively from foundation to mastery.",
};

// ─── System prompt ────────────────────────────────────────────

/**
 * The system prompt that establishes the AI's role and strict output rules.
 * This never changes between requests — it is the "persona" of the AI engine.
 */
export const CURRICULUM_SYSTEM_PROMPT = `
You are an expert instructional designer and curriculum architect with 20 years of experience
creating online courses for platforms like Teachable, Thinkific, Udemy, and Coursera.

Your task is to generate a complete, professional course curriculum based on the parameters
the user provides. You follow established pedagogy:

• Bloom's Taxonomy for ALL learning objectives:
  Use action verbs at the appropriate cognitive level:
  - Remember: define, list, recall, recognise
  - Understand: explain, summarise, describe, classify
  - Apply: use, execute, implement, demonstrate
  - Analyse: compare, differentiate, examine, break down
  - Evaluate: judge, critique, justify, recommend
  - Create: design, build, produce, devise

• Progressive difficulty: each lesson and module should be slightly harder than the previous.
  Never jump difficulty levels abruptly.

• 70/30 theory-to-practice balance: every lesson should include at least one practical exercise,
  project task, or real-world application — not just theory.

• Quiz questions must test UNDERSTANDING and APPLICATION, not memorisation.
  Avoid trivial "what is the definition of X" questions. Instead ask "when would you use X?"
  or "which approach is better and why?"

• Course titles must be compelling and marketable — something a course creator would actually
  name their product. Avoid generic titles like "Introduction to X".

OUTPUT RULES (CRITICAL):
- You MUST respond with valid JSON only. No markdown, no explanations, no preamble.
- The JSON must exactly match the schema shown in the user message.
- All string fields must be properly escaped.
- Do not truncate or abbreviate — generate the full curriculum.
`.trim();

// ─── User prompt factory ──────────────────────────────────────

/**
 * Builds the user-turn message containing the generation parameters
 * and the exact JSON schema the AI must follow.
 *
 * @param params - The generation request from the frontend form
 * @returns The user message string to send to the Claude API
 */
export function buildUserPrompt(params: GenerateRequest): string {
  const { topic, audience, length, niche } = params;

  const audienceDesc = AUDIENCE_DESCRIPTIONS[audience];
  const lengthDesc = LENGTH_DESCRIPTIONS[length];
  const nicheContext = niche
    ? `The course is specifically for the "${niche}" industry/niche — tailor all examples, case studies, and exercises to this context.`
    : "Apply general best practices appropriate to the topic.";

  return `
Generate a complete course curriculum for the following parameters:

TOPIC: "${topic}"
AUDIENCE: ${audience} — ${audienceDesc}
LENGTH: ${lengthDesc}
NICHE/CONTEXT: ${nicheContext}

Return ONLY this JSON structure (no markdown fences, no extra text):

{
  "title": "string — compelling, marketable course title",
  "subtitle": "string — one-line subtitle that clarifies who this is for",
  "description": "string — 2-3 sentences describing the course value proposition",
  "learningOutcomes": [
    "string — start each with 'By the end of this course, students will be able to...' and use a Bloom's verb"
  ],
  "modules": [
    {
      "moduleNumber": 1,
      "title": "string — module title",
      "description": "string — one paragraph describing what this module covers and why",
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "string — lesson title",
          "objective": "string — single learning objective using Bloom's Taxonomy verb",
          "duration": "string — realistic lesson duration e.g. '20 minutes' or '45 minutes'",
          "keyTopics": ["string — 2-5 specific topics or skills covered in this lesson"]
        }
      ],
      "quizQuestions": [
        {
          "question": "string — question that tests understanding or application",
          "options": ["string A", "string B", "string C", "string D"],
          "correctAnswer": "string — must exactly match one of the options",
          "explanation": "string — 1-2 sentences explaining why this answer is correct"
        }
      ]
    }
  ],
  "pacingSchedule": {
    "totalDuration": "string — e.g. '4 weeks' or '2 months'",
    "weeklyBreakdown": [
      {
        "week": 1,
        "modules": [1],
        "hoursPerWeek": 3
      }
    ]
  },
  "bonusResources": [
    {
      "title": "string — resource name",
      "type": "book | video | tool | website | course | article",
      "description": "string — one sentence on why this resource helps students go further"
    }
  ]
}

Requirements:
- Include 3-5 learningOutcomes total
- Each module must have 2-3 quizQuestions
- Include 3-5 bonusResources
- The pacingSchedule weeklyBreakdown must cover ALL modules
- Lesson durations should sum to roughly the expected course scope
- Every lesson's keyTopics must be specific (not vague like "overview")
`.trim();
}

// ─── Convenience builder ──────────────────────────────────────

/**
 * Returns the complete message array ready to pass to the Anthropic SDK.
 *
 * Example:
 *   const { system, messages } = buildCurriculumPrompt(request)
 *   const response = await anthropic.messages.create({
 *     model: "claude-sonnet-4-6",
 *     system,
 *     messages,
 *     max_tokens: 8192,
 *   })
 *
 * @param params - GenerateRequest from the frontend
 * @returns Object with system prompt and messages array
 */
export function buildCurriculumPrompt(params: GenerateRequest): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  return {
    system: CURRICULUM_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(params),
      },
    ],
  };
}
