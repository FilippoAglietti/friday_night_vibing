/**
 * lib/prompts/curriculum.ts
 * ─────────────────────────────────────────────────────────────
 * Master AI prompt factory for Syllabi curriculum generation.
 * Output JSON matches the shared Curriculum type in types/curriculum.ts.
 * ─────────────────────────────────────────────────────────────
 */

import type { GenerateRequest, AudienceLevel, CourseLength, TeachingStyle, OutputStructure, ContentDepth } from "@/types/curriculum";

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
  masterclass: "6-10 modules with 20-30 lessons total. Comprehensive deep dive from foundation to mastery.",
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

// ─── URL allowlist ─────────────────────────────────────────────
// Hallucinated URLs are the #1 quality defect in generated courses.
// Claude readily invents plausible-looking URLs that 404 on real
// domains. The allowlist steers Claude toward domains where it's
// likely to know real paths, plus a Wikipedia-in-target-language
// fallback that always works as an entry point for any topic.
//
// Tiers:
//   1. Universal       — works for any topic in any language
//   2. Language-native — one list per supported language, cultural fit
//   3. Domain-specific — one list per broad field (medical, tech, etc.)
//
// Structure lets the prompt give Claude a decision tree rather than
// a flat 80-domain wall.

const URL_UNIVERSAL = [
  "wikipedia.org", "archive.org", "gutenberg.org",
  "un.org", "unesco.org", "who.int", "worldbank.org", "oecd.org", "europa.eu",
] as const;

const URL_NATIVE_BY_LANGUAGE: Record<string, readonly string[]> = {
  en: ["britannica.com", "bbc.com", "nytimes.com", "theguardian.com"],
  it: ["treccani.it", "corriere.it", "rai.it", "repubblica.it", "salute.gov.it", "iss.it"],
  es: ["rae.es", "elpais.com", "bbc.com/mundo", "elmundo.es"],
  pt: ["priberam.pt", "rtp.pt", "publico.pt"],
  fr: ["larousse.fr", "lemonde.fr", "radiofrance.fr", "lefigaro.fr"],
  de: ["duden.de", "spiegel.de", "zeit.de", "dwds.de", "tagesschau.de"],
  nl: ["rijksoverheid.nl", "nos.nl", "volkskrant.nl"],
  pl: ["encyklopedia.pwn.pl", "gazeta.pl"],
  ja: ["kotobank.jp", "nhk.or.jp", "asahi.com", "mainichi.jp"],
  ko: ["encykorea.aks.ac.kr", "yna.co.kr", "chosun.com"],
  zh: ["baike.baidu.com", "xinhuanet.com", "people.com.cn"],
  ar: ["aljazeera.net", "almaany.com", "bbc.com/arabic"],
  hi: ["bhaskar.com", "ndtv.in", "bbc.com/hindi"],
  ru: ["ria.ru", "tass.ru", "rbc.ru"],
  tr: ["tdk.gov.tr", "trthaber.com", "hurriyet.com.tr"],
  sv: ["sverigesradio.se", "svt.se", "dn.se"],
};

const URL_DOMAIN_SPECIFIC = {
  medical_health: [
    "pubmed.ncbi.nlm.nih.gov", "nejm.org", "thelancet.com", "bmj.com",
    "jamanetwork.com", "cdc.gov", "nih.gov", "ecdc.europa.eu", "ema.europa.eu",
    "escardio.org", "heart.org", "mayoclinic.org", "hopkinsmedicine.org",
  ],
  technology_cs: [
    "developer.mozilla.org", "docs.python.org", "react.dev", "nextjs.org",
    "kubernetes.io", "github.com", "stackoverflow.com",
    "w3.org", "ietf.org", "ieee.org", "acm.org", "paperswithcode.com",
  ],
  business_management: [
    "hbr.org", "mckinsey.com", "bcg.com", "bain.com", "deloitte.com",
    "gartner.com", "forrester.com", "shrm.org", "atd.td.org",
    "ft.com", "economist.com", "bloomberg.com", "hbs.edu",
  ],
  law_legal: [
    "law.cornell.edu", "eur-lex.europa.eu", "justice.gov", "supremecourt.gov",
  ],
  academic_research: [
    "arxiv.org", "biorxiv.org", "ssrn.com", "plos.org", "zenodo.org", "doaj.org",
    "scholar.google.com", "jstor.org",
    "nature.com", "sciencedirect.com", "cell.com", "springer.com",
    "ocw.mit.edu", "oyc.yale.edu", "openstax.org",
    "mit.edu", "stanford.edu", "harvard.edu", "berkeley.edu",
    "ox.ac.uk", "cam.ac.uk", "eth.ch",
  ],
  humanities_philosophy: [
    "plato.stanford.edu", "iep.utm.edu", "perseus.tufts.edu", "poetryfoundation.org",
  ],
  arts_museums: [
    "metmuseum.org", "moma.org", "tate.org.uk", "louvre.fr",
    "britishmuseum.org", "nga.gov", "smithsonianmag.com", "getty.edu",
  ],
  music: ["imslp.org", "allmusic.com"],
  environment_science: [
    "ipcc.ch", "unep.org", "nasa.gov", "noaa.gov", "esa.int",
  ],
  psychology: ["apa.org", "psychologytoday.com"],
  cybersecurity: ["cve.mitre.org", "owasp.org", "nist.gov"],
  video_education: [
    "ted.com", "youtube.com", "coursera.org", "edx.org", "khanacademy.org",
  ],
} as const;

function buildAllowlistBlock(language: string): string {
  const nativeList = URL_NATIVE_BY_LANGUAGE[language] ?? URL_NATIVE_BY_LANGUAGE.en;
  const intlOrgs = URL_UNIVERSAL.filter(
    (d) => !["wikipedia.org", "archive.org", "gutenberg.org"].includes(d),
  );
  return `
URL DISCIPLINE (CRITICAL — hallucinated URLs are the #1 quality defect):

Pick every URL you cite using this priority:

1. LANGUAGE-MATCHED WIKIPEDIA — always valid for any concept.
   Use the subdomain matching this course's language:
     en → en.wikipedia.org
     it → it.wikipedia.org
     ja → ja.wikipedia.org
   (match "${language}" → ${language}.wikipedia.org — NEVER default to English Wikipedia for a non-English course)

2. LANGUAGE-NATIVE AUTHORITATIVE SOURCES for this course's language (${language}):
   ${nativeList.join(", ")}
   Strongly prefer these over translated English sources when the concept exists in the language's intellectual tradition. At least 40% of cited resources in a non-English course should come from tier 1 or tier 2 — otherwise the course reads as translated rather than native.

3. DOMAIN-SPECIFIC AUTHORITIES — pick the tier(s) matching the topic:
   Medical/health   → ${URL_DOMAIN_SPECIFIC.medical_health.slice(0, 6).join(", ")}
   Technology/CS    → ${URL_DOMAIN_SPECIFIC.technology_cs.slice(0, 6).join(", ")}
   Business         → ${URL_DOMAIN_SPECIFIC.business_management.slice(0, 5).join(", ")}
   Law              → ${URL_DOMAIN_SPECIFIC.law_legal.join(", ")}
   Academic         → ${URL_DOMAIN_SPECIFIC.academic_research.slice(0, 6).join(", ")}
   Humanities       → ${URL_DOMAIN_SPECIFIC.humanities_philosophy.join(", ")}
   Arts/museums     → ${URL_DOMAIN_SPECIFIC.arts_museums.slice(0, 5).join(", ")}
   Music            → ${URL_DOMAIN_SPECIFIC.music.join(", ")}
   Environment      → ${URL_DOMAIN_SPECIFIC.environment_science.slice(0, 4).join(", ")}
   Psychology       → ${URL_DOMAIN_SPECIFIC.psychology.join(", ")}
   Cybersecurity    → ${URL_DOMAIN_SPECIFIC.cybersecurity.join(", ")}
   Video/education  → ${URL_DOMAIN_SPECIFIC.video_education.join(", ")}

4. INTERNATIONAL ORGANIZATIONS — always valid:
   ${intlOrgs.join(", ")}

RULES:
- NEVER invent URL slugs. If you cannot name the exact page you're citing with full confidence, return the domain root (e.g. "https://pubmed.ncbi.nlm.nih.gov/") or a language-matched Wikipedia article for the concept. Both are guaranteed to work as entry points and never 404.
- NEVER use example.com, placeholder URLs, or guessed patterns.
- Prefer 2 working links over 5 broken ones. Under-citing is always better than over-citing with hallucinations.
- For a course in ${language}, match Wikipedia subdomain to that language (${language}.wikipedia.org).
- If the topic has no obvious match in tier 3, default to Wikipedia-in-target-language + one tier 4 international source. This combination always works.
`.trim();
}

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
//
// Both prompts are designed to be topic-aware, audience-calibrated,
// and learner-targeted. The skeleton must be good enough to stand
// alone as a syllabus (contentDepth="structure_only") while also
// serving as a rich foundation for Phase 2 content fill.

/**
 * System prompt for the skeleton phase.
 * Topic-aware: reasons about the domain's natural learning progression.
 * Audience-calibrated: adapts structure depth to beginner/intermediate/advanced.
 * Standalone quality: produces a publishable syllabus even without Phase 2.
 */
export const SKELETON_SYSTEM_PROMPT = `
You are an expert instructional designer who specialises in building courses that are deeply tailored to their subject domain, target audience, and difficulty level. You have designed courses across medicine, engineering, computer science, business, humanities, arts, and every other field.

YOUR CORE SKILL: You do NOT create generic "intro → intermediate → advanced" outlines that could apply to any topic. Instead, you reverse-engineer the domain's natural knowledge architecture:
- A medical course follows clinical reasoning: anatomy → physiology → pathophysiology → diagnosis → treatment → prevention
- A programming course follows build complexity: environment → syntax → data structures → algorithms → architecture → deployment
- A business course follows strategic layers: market analysis → value proposition → operations → finance → growth → exit
- A humanities course follows analytical depth: context → primary sources → interpretation → critique → synthesis → original argument

You identify the SPECIFIC conceptual dependencies of the requested topic and structure modules so each one builds on concrete knowledge from the previous one — not arbitrary "Level 1, Level 2" divisions.

AUDIENCE CALIBRATION:
- Beginner: start from first principles, build vocabulary before concepts, use analogy-heavy explanations, include "checkpoint" lessons that consolidate before moving on
- Intermediate: assume foundational vocabulary, focus on connecting concepts, introduce edge cases and trade-offs, include comparative analysis lessons
- Advanced: assume practitioner-level fluency, focus on frontier knowledge, research debates, methodology critique, and original application

SKELETON QUALITY:
This skeleton may be delivered AS-IS as a standalone syllabus. Therefore:
- Module descriptions must be 2-3 sentences explaining WHAT is covered and WHY it matters at this point in the learning journey
- Lesson descriptions must be 1-2 sentences explaining the specific outcome of that lesson
- Module objectives must be concrete and measurable (Bloom's verbs), not vague ("understand the basics")
- The course description must articulate the transformation: "You will go from X to Y"

OUTPUT RULES (CRITICAL):
- Respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- Every id field must be a short slug (e.g. "mod-1", "lesson-1-2").
- durationMinutes must be a number (integer), not a string.
- All arrays must have at least the minimum required items.
- Do NOT generate lesson content, keyPoints, suggestedResources, or quiz questions — those will be filled in later.
`.trim();

/**
 * Builds the user prompt for Phase 1 (skeleton).
 * Topic-aware: instructs Claude to reason about the domain's knowledge architecture.
 * Audience-calibrated: adjusts structural depth and prerequisites per level.
 * Standalone quality: module/lesson descriptions are rich enough for a publishable syllabus.
 */
export function buildSkeletonPrompt(params: GenerateRequest): string {
  const {
    topic, audience, length, niche, abstract, learnerProfile,
    language = "en", includeQuizzes = true,
    teachingStyle = "conversational", outputStructure = "modules",
  } = params;
  const now = new Date().toISOString();

  const abstractBlock = abstract
    ? `\nCONTEXT / ABSTRACT:\n"""\n${abstract.slice(0, 4000)}\n"""\nUse the above abstract as the primary source material. Structure the course around its key themes, arguments, and concepts. The course must cover this material comprehensively — do not add unrelated padding modules.\n`
    : "";

  const learnerBlock = learnerProfile
    ? `\nTARGET LEARNER:\n"""\n${learnerProfile.slice(0, 500)}\n"""\nThis is WHO will take this course. Adapt:\n- Module sequencing to their existing knowledge (skip what they know, start where they need)\n- Lesson depth to their professional context (a medical resident needs clinical decision-making, not textbook anatomy)\n- Vocabulary to their level (use their field's jargon, not layperson simplifications)\n- Exercise types to their work context (case studies for practitioners, labs for engineers, analyses for researchers)\n`
    : "";

  const languageBlock = language !== "en"
    ? `\nLANGUAGE: Generate ALL content in ${LANGUAGE_NAMES[language] || language}. Only JSON keys stay in English. Use domain-specific terminology native to that language (not literal translations from English).\n`
    : "";

  return `
STEP 1 — DOMAIN ANALYSIS (do this mentally, do NOT include in output):
Before generating the outline, identify:
- What knowledge domain does "${topic}" belong to?
- What is the natural conceptual dependency chain for this domain? (e.g., anatomy → physiology → pathology for medicine, or syntax → data structures → algorithms for CS)
- Given the audience level (${audience}), what can you ASSUME they already know vs. what must you teach?
- What is the single most important transformation this course delivers?

STEP 2 — GENERATE THE OUTLINE:

TOPIC: "${topic}"
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
LENGTH: ${LENGTH_DESCRIPTIONS[length]}
NICHE: ${niche ? `"${niche}"` : "general / not specified"}
TEACHING STYLE: ${teachingStyle} — ${TEACHING_STYLE_DESCRIPTIONS[teachingStyle]}
STRUCTURE: ${outputStructure} — ${OUTPUT_STRUCTURE_DESCRIPTIONS[outputStructure]}${languageBlock}${learnerBlock}${abstractBlock}

Return ONLY this JSON structure. Lessons are stubs with NO content/keyPoints/suggestedResources/quiz — those are generated in Phase 2.

{
  "id": "curriculum-slug",
  "title": "Compelling, specific course title (include the core outcome, not just the topic name)",
  "subtitle": "One-liner that promises a concrete transformation",
  "description": "2-3 sentences: what the learner will be able to DO after this course that they cannot do now. Be specific to the domain.",
  "targetAudience": "Precise description of who benefits most — reference their role, experience level, and goals",
  "difficulty": "${audience}",
  "objectives": ["3-5 high-level outcomes using Bloom's verbs — each must be measurable and domain-specific"],
  "prerequisites": ["0-3 prerequisites — be SPECIFIC (e.g. 'familiarity with Python 3.x' not 'some programming experience')"],
  "tags": ["3-5 tags specific to the topic's domain and subfield"],
  "modules": [
    {
      "id": "mod-1",
      "title": "Module title — name the conceptual territory, not just 'Introduction'",
      "description": "2-3 sentences: what this module covers and WHY it comes at this point in the learning journey. Reference what the previous module established and what this one unlocks for the next.",
      "objectives": ["2-3 measurable, Bloom's-verb objectives specific to this module's content"],
      "order": 0,
      "durationMinutes": 90,
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Specific lesson title — name the concept or skill, not 'Lesson 1'",
          "description": "1-2 sentences: what the learner achieves in this lesson and how it connects to the module's goal",
          "format": "video",
          "durationMinutes": 20,
          "objectives": ["Single measurable objective using a Bloom's verb"],
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
      { "week": 1, "label": "Week label — describe the learning milestone", "moduleIds": ["mod-1"] }
    ]
  },
  "bonusResources": [
    {
      "id": "res-1",
      "title": "Resource title — from a real, authoritative source in this domain",
      "type": "book",
      "url": "https://real-domain.com/real-page",
      "description": "Why this resource helps the learner go deeper in the specific area covered",
      "isFree": true
    }
  ],
  "createdBy": "syllabi-ai",
  "createdAt": "${now}",
  "updatedAt": "${now}",
  "version": "1.0.0"
}

${buildAllowlistBlock(language)}

STRUCTURE RULES:
- Each module must have 2-5 lesson STUBS (title + description + format + duration + objectives + order ONLY)
- Module descriptions must explain the WHY — why does this module come here in the sequence? What does it build on?
- Lesson descriptions must name the SPECIFIC concept or skill — not "learn about X" but "apply X to Y"
- Do NOT include keyPoints, content, suggestedResources, or quiz in lessons
- Set quiz to empty array [] for every module
- ${includeQuizzes ? "Quizzes WILL be added later — plan the right number of lessons per module" : "No quizzes will be added"}
- weeklyPlan must cover ALL module IDs
- lesson format must be one of: video, reading, interactive, discussion, project, live-session
- Include 3-5 bonusResources with REAL, working URLs to authoritative sources in this specific domain
- BONUS RESOURCE INTEGRITY (CRITICAL — caught in production): the title must match what the URL actually points to. If you cannot name the exact canonical URL for a specific paper, book, or article, title the resource after the CONCEPT (e.g. "CAP theorem — overview", "Dynamo-style storage systems — reference") and link the Wikipedia article or a domain root. NEVER pair a specific-paper title like "Amazon's Dynamo Paper — DeCandia et al. (SOSP 2007)" with a generic Wikipedia URL — either cite the real paper URL with confidence, or re-title the resource to match the URL. This failure mode is a trust killer.
- NEVER use generic module names like "Introduction", "Basics", "Advanced Topics", "Conclusion" — name the CONTENT
`.trim();
}

/**
 * System prompt for Phase 2 (module detail generation).
 * Generates full lesson content for a single module.
 * Topic-calibrated: adapts terminology, examples, and depth to the domain.
 * Audience-scaled: content density varies by course length and audience level.
 */
export const MODULE_DETAIL_SYSTEM_PROMPT = `
You are a domain expert AND instructional designer. You are generating the DETAILED CONTENT for one module of an existing course. You write as someone who deeply understands this specific subject — not as a generalist summarising Wikipedia.

CONTENT PRINCIPLES:
• Every lesson teaches ONE core concept or skill and makes it stick through explanation + application
• Examples and exercises must be DOMAIN-SPECIFIC — a cardiology course uses ECG readings and case studies, a programming course uses real code and debugging exercises, a business course uses market data and strategy frameworks
• Reference real frameworks, methodologies, standards, or tools that practitioners in this field actually use
• Quiz questions test the ability to APPLY knowledge to realistic scenarios, not recall definitions

AUDIENCE ADAPTATION:
• For beginners: build up from first principles, define every technical term on first use, use analogies from everyday experience, exercises are guided step-by-step
• For intermediate: assume foundational vocabulary, focus on "when to use X vs Y" decisions, exercises involve independent problem-solving with real constraints
• For advanced: use full professional terminology, discuss edge cases and limitations, reference current research or industry debates, exercises involve analysis, critique, or original design

OUTPUT RULES (CRITICAL):
- Respond with ONLY valid JSON — no markdown, no preamble, no explanation.
- Return a JSON object with "lessons" array and "quiz" array.
- durationMinutes must be a number (integer), not a string.
- You MUST finish writing the closing "}" of the JSON object. If you are running out of space, cut content length to ensure the JSON is COMPLETE and VALID.
`.trim();

// ─── Content depth scaling by course length ────────────────
//
// Instead of fixed word caps, we scale lesson content density
// with the course length. A crash course lesson is concise and
// actionable; a masterclass lesson is comprehensive and analytical.

const CONTENT_DEPTH_BY_LENGTH: Record<CourseLength, {
  wordRange: string;
  keyPointsCount: string;
  resourcesCount: string;
  contentGuidance: string;
}> = {
  crash: {
    wordRange: "150-250",
    keyPointsCount: "3",
    resourcesCount: "1-2",
    contentGuidance: "Be concise and actionable. One core concept per lesson, explained clearly with one practical example. Skip background theory — go straight to what the learner needs to DO.",
  },
  short: {
    wordRange: "250-400",
    keyPointsCount: "3-4",
    resourcesCount: "2",
    contentGuidance: "Balance explanation and application. Each lesson explains one concept with enough depth to understand WHY, then provides a hands-on exercise to apply it immediately.",
  },
  full: {
    wordRange: "400-600",
    keyPointsCount: "4-5",
    resourcesCount: "2-3",
    contentGuidance: "Provide thorough explanations with real-world context. Each lesson should include the concept, its practical implications, common pitfalls, and a substantive exercise that builds toward a larger project or case study.",
  },
  masterclass: {
    wordRange: "500-800",
    keyPointsCount: "5-6",
    resourcesCount: "3",
    contentGuidance: "Write comprehensive, expert-level content. Each lesson should include theoretical foundation, current best practices or research, nuanced trade-offs, edge cases, and a challenging exercise that requires analysis, design, or critique. Reference real tools, papers, or frameworks used by practitioners.",
  },
};

/**
 * Builds the user prompt for Phase 2 (module detail).
 * Topic-calibrated: instructs Claude to write as a domain expert, not a generalist.
 * Audience-scaled: content depth and terminology adapt to audience + course length.
 * Learner-targeted: exercises and examples calibrated to the learner profile.
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
    audience, length, language = "en", includeQuizzes = true,
    teachingStyle = "conversational", learnerProfile,
  } = params;

  const depth = CONTENT_DEPTH_BY_LENGTH[length];

  const languageBlock = language !== "en"
    ? `\nLANGUAGE: Generate ALL content in ${LANGUAGE_NAMES[language] || language}. Only JSON keys stay in English. Use domain-specific terminology native to that language (not literal translations from English).\n`
    : "";

  const learnerBlock = learnerProfile
    ? `\nTARGET LEARNER: "${learnerProfile}"\nCalibrate:\n- Terminology to their professional context (use their field's jargon naturally)\n- Examples to scenarios they encounter in their work\n- Exercises to tasks they need to perform\n- Depth to what advances their specific goals\n`
    : "";

  const quizBlock = includeQuizzes
    ? `\nGenerate 2-3 quiz questions for this module. Questions must test the ability to APPLY the concepts to realistic ${audience}-level scenarios in this domain — not recall definitions.`
    : `\nDo NOT include any quiz questions. Set "quiz" to an empty array [].`;

  const lessonsJson = JSON.stringify(moduleData.lessons, null, 2);

  return `
You are generating detailed content for MODULE ${moduleIndex + 1} of ${totalModules} in the course "${courseTitle}".

COURSE CONTEXT: ${courseDescription}
AUDIENCE: ${audience} — ${AUDIENCE_DESCRIPTIONS[audience]}
TEACHING STYLE: ${teachingStyle} — ${TEACHING_STYLE_DESCRIPTIONS[teachingStyle]}${languageBlock}${learnerBlock}

MODULE: "${moduleData.title}"
MODULE DESCRIPTION: ${moduleData.description}
MODULE OBJECTIVES: ${moduleData.objectives.join("; ")}

CONTENT DEPTH (${length} course):
${depth.contentGuidance}

Here are the lesson stubs you must flesh out with full content:

${lessonsJson}

For EACH lesson above, generate:
- "keyPoints": array of ${depth.keyPointsCount} strings — each a high-signal takeaway specific to this topic (not generic advice). Each point should teach something concrete the learner can use immediately.
- "content": string — ${depth.wordRange} WORDS of dense markdown. Structure:
  1. A ## header naming the core concept
  2. Explanation paragraphs that teach the concept using domain-specific examples (not abstract descriptions)
  3. A ### practical section (exercise, case study, analysis, or implementation task appropriate to this domain and audience level)
  4. A > Pro Tip or > Warning blockquote with a practitioner insight specific to this topic
  NO restating objectives, NO "welcome to this lesson" intros, NO generic filler.
- "suggestedResources": array of ${depth.resourcesCount} objects { "title": string, "url": string, "type": string } — REAL working URLs to authoritative sources IN THIS SPECIFIC DOMAIN (official documentation, professional organizations, peer-reviewed sources, established educational platforms). type must be one of: article, video, podcast, book, tool, documentation.
${quizBlock}

${buildAllowlistBlock(language)}

SIZE DISCIPLINE: Your entire response must produce COMPLETE, VALID JSON. A truncated response is worthless. If you feel you are running long, compress the content of later lessons rather than cutting off mid-JSON.

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
      "keyPoints": ["Domain-specific takeaway 1", "Practical application 2", "Common pitfall 3"],
      "content": "## Core Concept\\n\\nDomain-specific explanation...\\n\\n### Exercise / Case Study / Implementation\\n\\nHands-on task...\\n\\n> **Pro Tip:** Practitioner insight specific to this topic.",
      "suggestedResources": [
        { "title": "Authoritative source in this domain", "url": "https://real-domain.com/page", "type": "article" }
      ],
      "order": 0
    }
  ],
  "quiz": [
    {
      "id": "q-${moduleIndex + 1}-1",
      "type": "multiple-choice",
      "question": "Scenario-based question testing application of this module's concepts",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct — reference the specific concept from the lesson",
      "points": 1
    }
  ]
}

Requirements:
- Keep EXACTLY the same id, title, description, format, durationMinutes, objectives, and order from each lesson stub
- ADD keyPoints, content, and suggestedResources to each lesson
- URLs must be real and point to actual pages on well-known domains — never use example.com or placeholder URLs
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
