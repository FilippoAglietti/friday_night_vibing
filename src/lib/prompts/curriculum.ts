/**
 * lib/prompts/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Master AI prompt factory for Syllabi.ai curriculum generation.
 * Output JSON matches the shared Curriculum type in types/curriculum.ts.
 * ─────────────────────────────────────────────────────────────
 */

import type { GenerateRequest, AudienceLevel, CourseLength } from "@/types/curriculum";

// Re-export for convenience
export type { GenerateRequest };

// ─── Helper maps ──────────────────────────────────────────────

const AUDIENCE_DESCRIPTIONS: Record<AudienceLevel, string> = {
  beginner:
    "complete beginners with no prior knowledge — explain everything from scratch, avoid jargon, connect theory to real-world examples",
  intermediate:
    "students who know the basics and want to go deeper — assume foundational vocabulary but explain advanced concepts clearly",
  advanced:
    "experienced practitioners who want expert-level depth — use technical terminology, include nuance, edge-cases, and best practices",
};

const LENGTH_DESCRIPTIONS: Record<CourseLength, string> = {
  mini:         "1-2 modules with 4-6 lessons total. Tight, focused on one key outcome.",
  beginner:     "3-4 modules with 8-12 lessons total. Solid foundation with room to explore.",
  intermediate: "4-6 modules with 12-18 lessons total. In-depth coverage balancing breadth and depth.",
  advanced:     "6-10 modules with 20-30 lessons total. Comprehensive deep dive from foundation to mastery.",
};

// ─── System prompt ────────────────────────────────────────────

export const CURRICULUM_SYSTEM_PROMPT = `
You are an expert instructional designer with 20 years of experience building online courses.

Follow these pedagogical principles:
• Bloom's Taxonomy for ALL objectives (Remember → Understand → Apply → Analyse → Evaluate → Create)
• Progressive difficulty — each lesson/module is slightly harder than the last
• 70/30 theory-to-practice — every lesson must include a practical exercise or real-world task
• Quiz questions test UNDERSTANDING, not memorisation
• Course titles must be compelling and marketable
• Every lesson MUST include detailed "keyPoints" (3-5 bullet points covering the core concepts, actionable takeaways, and practical tips), "suggestedResources" (1-3 external resources with REAL, working URLs to authoritative sources), and "content" (2-4 paragraphs of rich lesson body text in markdown with key concepts explained, real-world examples, and practical exercises)

OUTPUT RULES (CRITICAL):
- Respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- Every id field must be a short slug (e.g. "mod-1", "lesson-1-2", "q-1").
- durationMinutes must be a number (integer), not a string.
- All arrays must have at least the minimum required items.
`.trim();

// ─── User prompt factory ──────────────────────────────────────

export function buildUserPrompt(params: GenerateRequest): string {
  const { topic, audience, length, niche, abstract, learnerProfile } = params;
  const now = new Date().toISOString();

  const abstractBlock = abstract
    ? `\nCONTEXT / ABSTRACT:\n"""\n${abstract.slice(0, 4000)}\n"""\nUse the above abstract as the primary source material. Structure the course around its key themes, arguments, and concepts.\n`
    : "";

  const learnerBlock = learnerProfile
    ? `\nLEARNER PROFILE:\n"""\n${learnerProfile.slice(0, 500)}\n"""\nPersonalize the course for this learner. Adapt examples, exercises, and language to their background, goals, and experience level. Make the content feel tailored to who they are.\n`
    : "";

  return `
Generate a complete course for:

TOPIC: "${topic}"
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
LENGTH: ${LENGTH_DESCRIPTIONS[length]}
NICHE: ${niche ? `"${niche}"` : "general / not specified"}${learnerBlock}${abstractBlock}

Return ONLY this exact JSON structure:

{
  "id": "curriculum-slug",
  "title": "Compelling course title",
  "subtitle": "One-liner subtitle",
  "description": "2-3 sentence value proposition",
  "targetAudience": "Who this course is for",
  "difficulty": "${audience}",
  "objectives": ["3-5 high-level learning outcomes using Bloom's verbs"],
  "prerequisites": ["optional — list 0-3 prerequisites or omit"],
  "tags": ["3-5 relevant tags"],
  "modules": [
    {
      "id": "mod-1",
      "title": "Module title",
      "description": "One paragraph describing what this module covers and why",
      "objectives": ["2-3 module-level learning objectives"],
      "order": 0,
      "durationMinutes": 90,
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson title",
          "description": "2-3 sentence description of this lesson",
          "format": "video",
          "durationMinutes": 20,
          "objectives": ["Single lesson learning objective using a Bloom's verb"],
          "keyPoints": [
            "Core concept or principle explained clearly",
            "Practical tip or actionable takeaway",
            "Common mistake to avoid or best practice",
            "How this connects to the next lesson or real-world application"
          ],
          "content": "## Key Concept\\n\\nRich markdown lesson body (2-4 paragraphs). Explain core concepts clearly with **bold** for emphasis. Include real-world examples, step-by-step instructions, and practical exercises.\\n\\n### Try It Yourself\\n\\nDescribe a hands-on exercise the learner should complete.\\n\\n> **Pro Tip:** Include a practical insight or common pitfall to watch out for.",
          "suggestedResources": [
            {
              "title": "Resource title — from authoritative source",
              "url": "https://real-domain.com/actual-page",
              "type": "article"
            }
          ],
          "order": 0
        }
      ],
      "quiz": [
        {
          "id": "q-1-1",
          "type": "multiple-choice",
          "question": "Question testing understanding or application",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Why this answer is correct",
          "points": 1
        }
      ]
    }
  ],
  "pacing": {
    "style": "self-paced",
    "totalHours": 10,
    "hoursPerWeek": 3,
    "totalWeeks": 4,
    "weeklyPlan": [
      {
        "week": 1,
        "label": "Week label",
        "moduleIds": ["mod-1"]
      }
    ]
  },
  "bonusResources": [
    {
      "id": "res-1",
      "title": "Resource title",
      "type": "book",
      "url": "https://example.com",
      "description": "Why this helps students go further",
      "isFree": true
    }
  ],
  "createdBy": "syllabi-ai",
  "createdAt": "${now}",
  "updatedAt": "${now}",
  "version": "1.0.0"
}

Requirements:
- Each module must have 2-5 lessons and 2-3 quiz questions
- Each lesson MUST have "content" (string, 2-4 paragraphs of rich markdown with real explanations, examples, exercises — NOT placeholder text)
- Each lesson MUST have "keyPoints" (array of 3-5 strings) covering core concepts, practical tips, and actionable takeaways
- Each lesson MUST have "suggestedResources" (array of 1-3 objects with title, url, type) with REAL, working URLs to well-known authoritative sites (e.g. MDN, official docs, Wikipedia, real blog posts, YouTube channels)
- suggestedResources type must be one of: article, video, podcast, book, tool, documentation
- URLs must be real and point to actual pages on well-known domains — never use example.com or placeholder URLs
- Include 3-5 bonusResources with real, working URLs where possible
- weeklyPlan must cover ALL module IDs
- lesson format must be one of: video, reading, interactive, discussion, project, live-session
- correctAnswer for multiple-choice must be the INDEX (0-3) of the correct option
`.trim();
}

// ─── Convenience builder ──────────────────────────────────────

export function buildCurriculumPrompt(params: GenerateRequest): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  return {
    system: CURRICULUM_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(params) }],
  };
}
