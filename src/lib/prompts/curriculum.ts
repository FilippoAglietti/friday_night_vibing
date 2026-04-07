/**
 * lib/prompts/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Master AI prompt factory for Syllabi.ai curriculum generation.
 * Output JSON matches the shared Curriculum type in types/curriculum.ts.
 * ─────────────────────────────────────────────────────────────
 */

import type { GenerateRequest, AudienceLevel, CourseLength, TeachingStyle, OutputStructure } from "@/types/curriculum";

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
  crash:       "1-2 modules with 4-6 lessons total. Tight, focused on one key outcome.",
  short:       "3-4 modules with 8-12 lessons total. Solid foundation with room to explore.",
  full:        "4-6 modules with 12-18 lessons total. In-depth coverage balancing breadth and depth.",
  masterclass: "5-7 modules with 15-25 lessons total. Comprehensive deep dive from foundation to mastery.",
};

const TEACHING_STYLE_DESCRIPTIONS: Record<TeachingStyle, string> = {
  academic:
    "Use a formal, research-backed tone. Cite studies and frameworks. Structure content like a university lecture with clear definitions and rigorous explanations.",
  conversational:
    "Write as if explaining to a friend over coffee. Use contractions, rhetorical questions, and relatable analogies. Keep it warm and approachable.",
  "hands-on":
    "Focus on practical exercises and projects. Every concept should be introduced through a 'build something' approach. Minimize theory — maximize doing.",
  storytelling:
    "Teach through narratives, case studies, and real-world stories. Open each lesson with a compelling scenario. Make the learner the protagonist of their learning journey.",
};

const OUTPUT_STRUCTURE_DESCRIPTIONS: Record<OutputStructure, string> = {
  modules:
    "Organize as traditional course modules, each containing sequential lessons. Best for self-paced learning.",
  workshop:
    "Organize as interactive workshop sessions. Each module is a standalone session with warm-up, core activity, breakout exercises, and wrap-up. Name modules as 'Session 1', 'Session 2', etc.",
  bootcamp:
    "Organize as an intensive day-by-day bootcamp schedule. Each module represents one day. Include morning theory, afternoon practice, and daily challenges. Name modules as 'Day 1', 'Day 2', etc.",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", pt: "Portuguese", fr: "French",
  de: "German", it: "Italian", nl: "Dutch", pl: "Polish",
  ja: "Japanese", ko: "Korean", zh: "Chinese", ar: "Arabic",
  hi: "Hindi", ru: "Russian", tr: "Turkish", sv: "Swedish",
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
  const {
    topic, audience, length, niche, abstract, learnerProfile,
    language = "en", includeQuizzes = true,
    teachingStyle = "conversational", outputStructure = "modules",
  } = params;
  const now = new Date().toISOString();

  const abstractBlock = abstract
    ? `\nCONTEXT / ABSTRACT:\n"""\n${abstract.slice(0, 4000)}\n"""\nUse the above abstract as the primary source material. Structure the course around its key themes, arguments, and concepts.\n`
    : "";

  const learnerBlock = learnerProfile
    ? `\nTARGET AUDIENCE PROFILE:\n"""\n${learnerProfile.slice(0, 500)}\n"""\nThis describes the target audience for the course. Adapt examples, exercises, depth, and language to their background, goals, and experience level. Make the content feel designed specifically for this audience.\n`
    : "";

  const languageBlock = language !== "en"
    ? `\nLANGUAGE: Generate ALL course content (title, subtitle, description, objectives, lessons, quizzes, resources) in ${LANGUAGE_NAMES[language] || language}. Only the JSON keys should remain in English.\n`
    : "";

  const quizBlock = !includeQuizzes
    ? `\nQUIZZES: Do NOT include any quiz questions. Set "quiz" to an empty array [] for every module.\n`
    : "";

  return `
Generate a complete course for:

TOPIC: "${topic}"
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
LENGTH: ${LENGTH_DESCRIPTIONS[length]}
NICHE: ${niche ? `"${niche}"` : "general / not specified"}
TEACHING STYLE: ${teachingStyle} — ${TEACHING_STYLE_DESCRIPTIONS[teachingStyle]}
STRUCTURE: ${outputStructure} — ${OUTPUT_STRUCTURE_DESCRIPTIONS[outputStructure]}${languageBlock}${quizBlock}${learnerBlock}${abstractBlock}

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
- Each module must have 2-5 lessons${includeQuizzes ? " and 2-3 quiz questions" : " (NO quiz questions — set quiz to empty array)"}
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

// ─── Chunked generation prompts ─────────────────────────────────
// These are used for the two-phase generation pipeline:
//   Phase 1: Generate the course skeleton (outline with module/lesson stubs)
//   Phase 2: Generate full content for each module individually

/**
 * System prompt for the skeleton phase.
 * Focuses on high-level structure — no lesson body content.
 */
export const SKELETON_SYSTEM_PROMPT = `
You are an expert instructional designer with 20 years of experience building online courses.

Follow these pedagogical principles:
• Bloom's Taxonomy for ALL objectives (Remember → Understand → Apply → Analyse → Evaluate → Create)
• Progressive difficulty — each lesson/module is slightly harder than the last
• Course titles must be compelling and marketable

OUTPUT RULES (CRITICAL):
- Respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- Every id field must be a short slug (e.g. "mod-1", "lesson-1-2").
- durationMinutes must be a number (integer), not a string.
- All arrays must have at least the minimum required items.
- Do NOT generate lesson content, keyPoints, suggestedResources, or quiz questions — those will be filled in later.
`.trim();

/**
 * Builds the user prompt for Phase 1 (skeleton).
 * Asks for the full course structure but with lesson stubs only (title, description, format, duration, order).
 */
export function buildSkeletonPrompt(params: GenerateRequest): string {
  const {
    topic, audience, length, niche, abstract, learnerProfile,
    language = "en", includeQuizzes = true,
    teachingStyle = "conversational", outputStructure = "modules",
  } = params;
  const now = new Date().toISOString();

  const abstractBlock = abstract
    ? `\nCONTEXT / ABSTRACT:\n"""\n${abstract.slice(0, 4000)}\n"""\nUse the above abstract as the primary source material. Structure the course around its key themes, arguments, and concepts.\n`
    : "";

  const learnerBlock = learnerProfile
    ? `\nTARGET AUDIENCE PROFILE:\n"""\n${learnerProfile.slice(0, 500)}\n"""\nThis describes the target audience. Adapt structure and depth for their background and goals.\n`
    : "";

  const languageBlock = language !== "en"
    ? `\nLANGUAGE: Generate ALL content in ${LANGUAGE_NAMES[language] || language}. Only JSON keys stay in English.\n`
    : "";

  return `
Generate the OUTLINE (skeleton) for a course. Do NOT write lesson body content, keyPoints, suggestedResources, or quiz questions — just the structure.

TOPIC: "${topic}"
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
LENGTH: ${LENGTH_DESCRIPTIONS[length]}
NICHE: ${niche ? `"${niche}"` : "general / not specified"}
TEACHING STYLE: ${teachingStyle} — ${TEACHING_STYLE_DESCRIPTIONS[teachingStyle]}
STRUCTURE: ${outputStructure} — ${OUTPUT_STRUCTURE_DESCRIPTIONS[outputStructure]}${languageBlock}${learnerBlock}${abstractBlock}

Return ONLY this JSON structure (lessons are stubs with NO content/keyPoints/suggestedResources/quiz):

{
  "id": "curriculum-slug",
  "title": "Compelling course title",
  "subtitle": "One-liner subtitle",
  "description": "2-3 sentence value proposition",
  "targetAudience": "Who this course is for",
  "difficulty": "${audience}",
  "objectives": ["3-5 high-level learning outcomes using Bloom's verbs"],
  "prerequisites": ["0-3 prerequisites"],
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
          "description": "2-3 sentence description",
          "format": "video",
          "durationMinutes": 20,
          "objectives": ["Single lesson learning objective using a Bloom's verb"],
          "order": 0
        }
      ],
      "quiz": []
    }
  ],
  "pacing": {
    "style": "self-paced",
    "totalHours": 10,
    "hoursPerWeek": 3,
    "totalWeeks": 4,
    "weeklyPlan": [
      { "week": 1, "label": "Week label", "moduleIds": ["mod-1"] }
    ]
  },
  "bonusResources": [
    {
      "id": "res-1",
      "title": "Resource title",
      "type": "book",
      "url": "https://example.com",
      "description": "Why this helps",
      "isFree": true
    }
  ],
  "createdBy": "syllabi-ai",
  "createdAt": "${now}",
  "updatedAt": "${now}",
  "version": "1.0.0"
}

Requirements:
- Each module must have 2-5 lesson STUBS (title + description + format + duration + objectives + order ONLY)
- Do NOT include keyPoints, content, suggestedResources, or quiz in lessons — leave them out
- Set quiz to empty array [] for every module (quizzes are generated later)
- ${includeQuizzes ? "Quizzes WILL be added later — just plan the right number of lessons per module" : "No quizzes will be added"}
- weeklyPlan must cover ALL module IDs
- lesson format must be one of: video, reading, interactive, discussion, project, live-session
- Include 3-5 bonusResources with real, working URLs
`.trim();
}

/**
 * System prompt for Phase 2 (module detail generation).
 * Generates full lesson content for a single module.
 */
export const MODULE_DETAIL_SYSTEM_PROMPT = `
You are an expert instructional designer. You are generating the DETAILED CONTENT for one module of an existing course.

Follow these principles:
• 70/30 theory-to-practice — every lesson must include a practical exercise or real-world task
• Quiz questions test UNDERSTANDING, not memorisation
• Every lesson MUST include detailed "keyPoints", "suggestedResources" with REAL URLs, and "content" with rich markdown

OUTPUT RULES (CRITICAL):
- Respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- Return a JSON object with "lessons" array and "quiz" array.
- durationMinutes must be a number (integer), not a string.
`.trim();

/**
 * Builds the user prompt for Phase 2 (module detail).
 * Given the course context and a module skeleton, generates full lesson content + quiz.
 *
 * @param params - Original generation request (for context)
 * @param courseTitle - The course title from the skeleton
 * @param courseDescription - The course description from the skeleton
 * @param moduleData - The module skeleton (id, title, description, objectives, lessons stubs)
 * @param moduleIndex - 0-indexed position of this module in the course
 * @param totalModules - Total number of modules in the course
 */
export function buildModuleDetailPrompt(
  params: GenerateRequest,
  courseTitle: string,
  courseDescription: string,
  moduleData: { id: string; title: string; description: string; objectives: string[]; lessons: Array<{ id: string; title: string; description: string; format: string; durationMinutes: number; objectives?: string[]; order: number }> },
  moduleIndex: number,
  totalModules: number,
): string {
  const {
    audience, language = "en", includeQuizzes = true,
    teachingStyle = "conversational",
  } = params;

  const languageBlock = language !== "en"
    ? `\nLANGUAGE: Generate ALL content in ${LANGUAGE_NAMES[language] || language}. Only JSON keys stay in English.\n`
    : "";

  const quizBlock = includeQuizzes
    ? `\nGenerate 2-3 quiz questions for this module that test understanding of the key concepts across all lessons.`
    : `\nDo NOT include any quiz questions. Set "quiz" to an empty array [].`;

  const lessonsJson = JSON.stringify(moduleData.lessons, null, 2);

  return `
You are generating detailed content for MODULE ${moduleIndex + 1} of ${totalModules} in the course "${courseTitle}".

COURSE CONTEXT: ${courseDescription}
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
TEACHING STYLE: ${teachingStyle} — ${TEACHING_STYLE_DESCRIPTIONS[teachingStyle]}${languageBlock}

MODULE: "${moduleData.title}"
MODULE DESCRIPTION: ${moduleData.description}
MODULE OBJECTIVES: ${moduleData.objectives.join("; ")}

Here are the lesson stubs you must flesh out with full content:

${lessonsJson}

For EACH lesson above, generate:
- "keyPoints": array of 3-5 strings — core concepts, practical tips, actionable takeaways
- "content": string — 2-4 paragraphs of rich markdown with real explanations, examples, exercises. Use ## headers, **bold**, > blockquotes, code blocks where relevant.
- "suggestedResources": array of 1-3 objects { "title": string, "url": string, "type": string } — REAL, working URLs to well-known authoritative sites (MDN, official docs, Wikipedia, real blogs, YouTube). type must be one of: article, video, podcast, book, tool, documentation.
${quizBlock}

Return ONLY this JSON structure:

{
  "lessons": [
    {
      "id": "lesson-X-Y",
      "title": "Same title as stub",
      "description": "Same description as stub",
      "format": "same as stub",
      "durationMinutes": same_as_stub,
      "objectives": ["same as stub"],
      "keyPoints": ["Core concept 1", "Practical tip 2", "Common mistake 3", "Connection to next topic 4"],
      "content": "## Key Concept\\n\\nRich markdown content (2-4 paragraphs)...\\n\\n### Try It Yourself\\n\\nHands-on exercise...\\n\\n> **Pro Tip:** Practical insight.",
      "suggestedResources": [
        { "title": "Real Resource", "url": "https://real-domain.com/page", "type": "article" }
      ],
      "order": 0
    }
  ],
  "quiz": [
    {
      "id": "q-${moduleIndex + 1}-1",
      "type": "multiple-choice",
      "question": "Question testing understanding",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "points": 1
    }
  ]
}

Requirements:
- Keep EXACTLY the same id, title, description, format, durationMinutes, objectives, and order from each lesson stub
- ADD keyPoints, content, and suggestedResources to each lesson
- URLs must be real and point to actual pages on well-known domains — never use example.com
- correctAnswer for multiple-choice must be the INDEX (0-3) of the correct option
- suggestedResources type must be one of: article, video, podcast, book, tool, documentation
`.trim();
}

/**
 * Convenience builder for the skeleton phase.
 */
export function buildSkeletonCurriculumPrompt(params: GenerateRequest): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  return {
    system: SKELETON_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildSkeletonPrompt(params) }],
  };
}

/**
 * Convenience builder for the module detail phase.
 */
export function buildModuleDetailCurriculumPrompt(
  params: GenerateRequest,
  courseTitle: string,
  courseDescription: string,
  moduleData: { id: string; title: string; description: string; objectives: string[]; lessons: Array<{ id: string; title: string; description: string; format: string; durationMinutes: number; objectives?: string[]; order: number }> },
  moduleIndex: number,
  totalModules: number,
): {
  system: string;
  messages: Array<{ role: "user"; content: string }>;
} {
  return {
    system: MODULE_DETAIL_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: buildModuleDetailPrompt(params, courseTitle, courseDescription, moduleData, moduleIndex, totalModules),
    }],
  };
}
