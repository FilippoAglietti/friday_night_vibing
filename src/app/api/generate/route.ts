/**
 * app/api/generate/route.ts
 * ─────────────────────────────────────────────────────────────
 * Next.js App Router API route: POST /api/generate
 *
 * Synchronous course generation endpoint. Accepts a curriculum generation request,
 * validates it, checks auth + rate limits, creates a course record with
 * status="generating", runs generation synchronously, then returns courseId.
 *
 * Request body:  { topic, difficulty, courseLength, niche?, abstract?, learnerProfile? }
 * Success:       { success: true, courseId: string } [HTTP 202 Accepted]
 * Error:         { success: false, error: string, details?: string }
 *
 * The frontend receives courseId immediately and polls GET /api/courses/[id]/status
 * every 3 seconds until generation completes (status="ready" or "failed").
 *
 * Rate limit:    5 requests per IP per hour (in-memory, resets on restart)
 * Auth:          Required — Supabase session cookie (user must be authenticated)
 * Max tokens:    Scaled by course length (mini=8k, beginner=16k, intermediate=24k, advanced=32k)
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * maxDuration extends the Vercel serverless function timeout.
 * The after() callback runs the Claude API call AFTER the 202 response,
 * but still within the same function invocation. 300s (5 min) is the
 * max for Vercel Pro plan — enough for masterclass courses (32k tokens).
 */
export const maxDuration = 300;

import {
  buildCurriculumPrompt,
  buildSkeletonCurriculumPrompt,
  buildModuleDetailCurriculumPrompt,
} from "@/lib/prompts/curriculum";
import type {
  GenerateRequest,
  GenerateAsyncResponse,
  GenerateErrorResponse,
  Curriculum,
  Module,
  AudienceLevel,
  CourseLength,
  TeachingStyle,
  OutputStructure,
  CourseLanguage,
} from "@/types/curriculum";

// ─── Rate limiter (in-memory) ─────────────────────────────────

/**
 * Simple in-memory rate limiter.
 * Maps IP → { count, windowStart }.
 * Resets the window every RATE_WINDOW_MS milliseconds.
 *
 * NOTE: This resets on every serverless cold-start.
 *       Replace with Redis/Upstash for production resilience.
 */
const RATE_LIMIT_MAX = 5; // max requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Checks whether the given IP has exceeded the rate limit.
 * Increments the counter if within the window.
 *
 * @param ip - Client IP address
 * @returns true if the request is allowed, false if rate-limited
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    // First request or window expired — reset counter
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    // Too many requests in the current window
    return false;
  }

  // Increment counter within the current window
  entry.count += 1;
  return true;
}

// ─── Input validation ─────────────────────────────────────────

/** Valid values for the audience field */
const VALID_AUDIENCES: AudienceLevel[] = ["beginner", "intermediate", "advanced"];

/** Valid values for the length field */
const VALID_LENGTHS: CourseLength[] = ["crash", "short", "full", "masterclass"];
const VALID_TEACHING_STYLES: TeachingStyle[] = ["academic", "conversational", "hands-on", "storytelling"];
const VALID_OUTPUT_STRUCTURES: OutputStructure[] = ["modules", "workshop", "bootcamp"];
const VALID_LANGUAGES: CourseLanguage[] = ["en", "es", "pt", "fr", "de", "it", "nl", "pl", "ja", "ko", "zh", "ar", "hi", "ru", "tr", "sv"];

/**
 * Validates and parses the incoming request body.
 * Returns a typed GenerateRequest or throws with a descriptive error message.
 *
 * @param body - Raw parsed JSON from the request
 * @returns Validated GenerateRequest
 * @throws Error with a user-facing message if validation fails
 */
function validateRequest(body: unknown): GenerateRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const b = body as Record<string, unknown>;

  // topic — required, string, min 3 chars
  if (!b.topic || typeof b.topic !== "string" || b.topic.trim().length < 3) {
    throw new Error("'topic' is required and must be at least 3 characters.");
  }

  // difficulty (audience) — accept both field names for compatibility
  const audience = (b.difficulty ?? b.audience) as AudienceLevel | undefined;
  if (!audience || !VALID_AUDIENCES.includes(audience)) {
    throw new Error(`'difficulty' must be one of: ${VALID_AUDIENCES.join(", ")}.`);
  }

  // courseLength (length) — accept both field names for compatibility
  const length = (b.courseLength ?? b.length) as CourseLength | undefined;
  if (!length || !VALID_LENGTHS.includes(length)) {
    throw new Error(`'courseLength' must be one of: ${VALID_LENGTHS.join(", ")}.`);
  }

  // niche — optional, string or undefined
  if (b.niche !== undefined && typeof b.niche !== "string") {
    throw new Error("'niche' must be a string if provided.");
  }

  // abstract — optional, string or undefined, max 4000 chars
  if (b.abstract !== undefined && typeof b.abstract !== "string") {
    throw new Error("'abstract' must be a string if provided.");
  }

  // learnerProfile — optional, string or undefined, max 500 chars
  if (b.learnerProfile !== undefined && typeof b.learnerProfile !== "string") {
    throw new Error("'learnerProfile' must be a string if provided.");
  }

  // language — optional, defaults to "en"
  const language = (b.language as CourseLanguage | undefined) ?? "en";
  if (!VALID_LANGUAGES.includes(language)) {
    throw new Error(`'language' must be one of: ${VALID_LANGUAGES.join(", ")}.`);
  }

  // includeQuizzes — optional boolean, defaults to true
  const includeQuizzes = b.includeQuizzes !== undefined ? Boolean(b.includeQuizzes) : true;

  // teachingStyle — optional, defaults to "conversational"
  const teachingStyle = (b.teachingStyle as TeachingStyle | undefined) ?? "conversational";
  if (!VALID_TEACHING_STYLES.includes(teachingStyle)) {
    throw new Error(`'teachingStyle' must be one of: ${VALID_TEACHING_STYLES.join(", ")}.`);
  }

  // outputStructure — optional, defaults to "modules"
  const outputStructure = (b.outputStructure as OutputStructure | undefined) ?? "modules";
  if (!VALID_OUTPUT_STRUCTURES.includes(outputStructure)) {
    throw new Error(`'outputStructure' must be one of: ${VALID_OUTPUT_STRUCTURES.join(", ")}.`);
  }

  // hasAttachments — optional boolean, defaults to false
  const hasAttachments = b.hasAttachments !== undefined ? Boolean(b.hasAttachments) : false;

  // Sanitize: strip HTML tags and limit length
  const sanitizedTopic = b.topic
    .trim()
    .replace(/<[^>]*>/g, "")
    .substring(0, 200);

  return {
    topic: sanitizedTopic,
    audience,
    length,
    niche: b.niche
      ? (b.niche as string).trim().replace(/<[^>]*>/g, "").substring(0, 100)
      : undefined,
    abstract: b.abstract ? (b.abstract as string).trim().slice(0, 4000) : undefined,
    learnerProfile: b.learnerProfile ? (b.learnerProfile as string).trim().slice(0, 500) : undefined,
    language,
    includeQuizzes,
    teachingStyle,
    outputStructure,
    hasAttachments,
  };
}

// ─── JSON repair helper ──────────────────────────────────────

/**
 * Attempts to repair truncated JSON by closing any unclosed brackets/braces
 * and removing trailing incomplete key-value pairs.
 *
 * This is a best-effort approach for when Claude's response is cut off
 * mid-JSON due to hitting the max_tokens limit.
 *
 * @param json - Potentially truncated JSON string
 * @returns Repaired JSON string, or the original if repair fails
 */
function repairTruncatedJson(json: string): string {
  // Remove any trailing incomplete string (cut off mid-value)
  // Look for the last complete key-value pair
  let repaired = json;

  // Remove trailing incomplete string value (e.g., "key": "value that got cut)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*"[^"]*$/, "");
  // Remove trailing incomplete number/boolean (e.g., "key": 12)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*[\d.tfn][^,}\]]*$/, "");
  // Remove trailing incomplete key (e.g., , "incomplet)
  repaired = repaired.replace(/,\s*"[^"]*$/, "");

  // Count unclosed brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (const char of repaired) {
    if (escapeNext) { escapeNext = false; continue; }
    if (char === "\\") { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") openBraces++;
    if (char === "}") openBraces--;
    if (char === "[") openBrackets++;
    if (char === "]") openBrackets--;
  }

  // Close any unclosed brackets and braces (brackets first, then braces)
  while (openBrackets > 0) { repaired += "]"; openBrackets--; }
  while (openBraces > 0) { repaired += "}"; openBraces--; }

  return repaired;
}

// ─── Claude API call with retry logic ─────────────────────────

/**
 * Determines the appropriate max_tokens limit based on the requested course length.
 * Longer courses need more tokens to generate complete curricula.
 *
 * @param length - CourseLength: crash | short | full | masterclass
 * @returns max_tokens value to use in Claude API call
 */
function getMaxTokensForLength(_length: CourseLength): number {
  // Use the maximum output tokens for all course lengths.
  // Claude Sonnet 4.6 supports up to 64k output tokens.
  // You only pay for tokens actually generated, not the max limit,
  // so there's no cost penalty — only reliability benefit.
  // A crash course generates ~10k tokens, masterclass ~40-50k.
  return 65536;
}

/**
 * Calls the Claude API with retry logic and timeout.
 * - Retries once with exponential backoff (2s delay) on API failure
 * - Includes 60-second timeout per API call
 * - Logs all retry attempts to console
 * - Scales max_tokens based on requested course length
 *
 * @param anthropic - Anthropic SDK instance
 * @param system - System prompt
 * @param messages - User messages
 * @param length - CourseLength to determine token budget
 * @param attempt - Current attempt number (1 or 2)
 * @returns Claude API response
 * @throws Error if both attempts fail
 */
async function callClaudeWithRetry(
  anthropic: Anthropic,
  system: string,
  messages: Anthropic.MessageParam[],
  length: CourseLength,
  attempt: number = 1,
  overrideMaxTokens?: number
): Promise<Anthropic.Message> {
  try {
    const maxTokens = overrideMaxTokens ?? getMaxTokensForLength(length);

    // Use streaming to avoid the SDK's 10-minute timeout restriction.
    // The SDK requires streaming for high max_tokens values (65536)
    // because the non-streaming HTTP request could exceed its timeout.
    // .stream() returns chunks in real-time, then .finalMessage()
    // assembles them into the same Anthropic.Message shape.
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages,
    });

    const response = await stream.finalMessage();
    return response;
  } catch (err) {
    if (attempt < 2) {
      console.warn(
        `[/api/generate] Attempt ${attempt} failed, retrying in 2s...`,
        err
      );
      await new Promise((r) => setTimeout(r, 2000));
      return callClaudeWithRetry(anthropic, system, messages, length, attempt + 1, overrideMaxTokens);
    }
    throw err;
  }
}

// ─── JSON parsing helper ─────────────────────────────────────

/**
 * Parses a raw Claude response string into a JSON object.
 * Handles code fences, preamble text, and truncated JSON.
 *
 * @param rawText - Raw text from Claude's response
 * @param stopReason - Claude's stop_reason for logging
 * @param label - Label for log messages (e.g. "skeleton", "module mod-1")
 * @returns Parsed JSON object
 * @throws Error if parsing fails after all strategies
 */
function parseClaudeJson<T>(rawText: string, stopReason: string | null, label: string): T {
  if (stopReason === "max_tokens") {
    console.warn(`[/api/generate] [${label}] Response truncated (hit max_tokens). Attempting repair...`);
  }

  // Pre-process: strip markdown code fences
  let cleanText = rawText;
  const fenceStart = cleanText.match(/^```(?:json)?\s*\n?/);
  if (fenceStart) {
    cleanText = cleanText.slice(fenceStart[0].length);
    const fenceEnd = cleanText.lastIndexOf("```");
    if (fenceEnd !== -1) {
      cleanText = cleanText.slice(0, fenceEnd).trim();
    }
  }

  // Strategy 1: Direct parse
  try {
    return JSON.parse(cleanText) as T;
  } catch { /* continue */ }

  // Strategy 2: Extract JSON object between first { and last }
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1)) as T;
    } catch { /* continue */ }
  }

  // Strategy 3: Repair truncated JSON
  if (firstBrace !== -1) {
    const repairedJson = repairTruncatedJson(cleanText.slice(firstBrace));
    try {
      const result = JSON.parse(repairedJson) as T;
      console.warn(`[/api/generate] [${label}] JSON repaired after truncation — content may be incomplete.`);
      return result;
    } catch { /* continue */ }
  }

  // All strategies failed
  const preview = rawText.substring(0, 300).replace(/\n/g, "\\n");
  const tail = rawText.substring(Math.max(0, rawText.length - 150)).replace(/\n/g, "\\n");
  console.error(`[/api/generate] [${label}] Raw response (first 300):`, preview);
  console.error(`[/api/generate] [${label}] Raw response (last 150):`, tail);
  console.error(`[/api/generate] [${label}] Length: ${rawText.length}, stop: ${stopReason}`);
  throw new Error(
    `[${label}] JSON parse failed (len=${rawText.length}, stop=${stopReason}). Start: ${preview.substring(0, 120)}...`
  );
}

// ─── Single-shot generation (for crash/short courses) ────────

/**
 * Generates a complete curriculum in a single Claude call.
 * Best for crash and short courses (~5-12 lessons) that fit within
 * the 5-minute Vercel Pro timeout.
 *
 * @param request - Validated generation request
 * @returns Parsed Curriculum object
 */
async function generateCurriculumSingleShot(request: GenerateRequest): Promise<Curriculum> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { system, messages } = buildCurriculumPrompt(request);
  const response = await callClaudeWithRetry(anthropic, system, messages, request.length);

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned an empty or non-text response.");
  }

  return parseClaudeJson<Curriculum>(textBlock.text.trim(), response.stop_reason, "single-shot");
}

// ─── Chunked generation (for full/masterclass courses) ───────

/**
 * Generates a curriculum in two phases:
 *   Phase 1: Generate skeleton (outline with module/lesson stubs) — ~2-4k tokens, ~30-60s
 *   Phase 2: Generate full content for each module in parallel — ~5-8k tokens each, ~1-2 min
 *
 * This keeps every individual Claude call under 2 minutes, well within
 * Vercel Pro's 300s timeout even for masterclass courses with 10 modules.
 *
 * Progress is written to the course record after each module completes,
 * so the frontend can show "Generating module 3 of 6..." in real-time.
 *
 * @param request - Validated generation request
 * @param courseId - The course ID for progress updates
 * @returns Assembled Curriculum object
 */
async function generateCurriculumChunked(
  request: GenerateRequest,
  courseId: string,
): Promise<Curriculum> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = getSupabaseAdmin();

  // ── Phase 1: Generate skeleton ─────────────────────────────
  console.log(`[/api/generate] [${courseId}] Phase 1: Generating course skeleton...`);

  await supabase.from("courses").update({
    generation_progress: "Designing course structure...",
    generation_total_modules: 0,
    generation_completed_modules: 0,
  }).eq("id", courseId);

  const { system: skelSystem, messages: skelMessages } = buildSkeletonCurriculumPrompt(request);

  // Diagnostic: mark that we're about to call Claude
  await supabase.from("courses").update({
    generation_progress: "Calling Claude for skeleton...",
  }).eq("id", courseId);

  // Skeleton is structure-only (titles, descriptions, order) — 8k tokens is plenty.
  // Using 65536 here caused Vercel 300s timeouts because Claude would generate
  // a massive response. Capping at 8192 keeps it under 60s.
  // Wrap in a 120s timeout to prevent silent hangs inside after().
  const skelResponse = await Promise.race([
    callClaudeWithRetry(anthropic, skelSystem, skelMessages, request.length, 1, 8192),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Skeleton Claude call timed out after 120s")), 120_000)
    ),
  ]);

  const skelTextBlock = skelResponse.content.find((block) => block.type === "text");
  if (!skelTextBlock || skelTextBlock.type !== "text") {
    throw new Error("Skeleton: Claude returned an empty or non-text response.");
  }

  const skeleton = parseClaudeJson<Curriculum>(skelTextBlock.text.trim(), skelResponse.stop_reason, "skeleton");

  const totalModules = skeleton.modules.length;
  console.log(`[/api/generate] [${courseId}] Phase 1 complete: ${totalModules} modules, ${skeleton.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons`);

  // Update progress with module count
  await supabase.from("courses").update({
    generation_progress: `Generating module 1 of ${totalModules}...`,
    generation_total_modules: totalModules,
    generation_completed_modules: 0,
  }).eq("id", courseId);

  // ── Phase 2: Generate module details in parallel batches ────
  // Run modules in parallel batches of 3 to avoid overwhelming the API
  // while still being much faster than sequential generation.
  const BATCH_SIZE = 3;
  const detailedModules: Module[] = new Array(totalModules);
  let completedModules = 0;

  for (let batchStart = 0; batchStart < totalModules; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, totalModules);
    const batchIndices = Array.from({ length: batchEnd - batchStart }, (_, i) => batchStart + i);

    console.log(`[/api/generate] [${courseId}] Phase 2: Generating modules ${batchStart + 1}-${batchEnd} of ${totalModules}...`);

    // Run this batch in parallel
    const batchResults = await Promise.all(
      batchIndices.map(async (moduleIndex) => {
        const moduleData = skeleton.modules[moduleIndex];
        const { system: modSystem, messages: modMessages } = buildModuleDetailCurriculumPrompt(
          request,
          skeleton.title,
          skeleton.description,
          moduleData,
          moduleIndex,
          totalModules,
        );

        // Each module needs ~5-8k tokens for full lesson content + quiz.
        // Cap at 16384 to keep each call fast (~60-90s) and avoid timeouts.
        // 180s timeout to prevent silent hangs.
        const modResponse = await Promise.race([
          callClaudeWithRetry(anthropic, modSystem, modMessages, request.length, 1, 16384),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Module ${moduleData.id} Claude call timed out after 180s`)), 180_000)
          ),
        ]);

        const modTextBlock = modResponse.content.find((block) => block.type === "text");
        if (!modTextBlock || modTextBlock.type !== "text") {
          throw new Error(`Module ${moduleData.id}: Claude returned an empty response.`);
        }

        const moduleDetail = parseClaudeJson<{ lessons: Module["lessons"]; quiz: Module["quiz"] }>(
          modTextBlock.text.trim(),
          modResponse.stop_reason,
          `module ${moduleData.id}`,
        );

        // Merge the detailed lessons/quiz into the skeleton module
        return {
          ...moduleData,
          lessons: moduleDetail.lessons,
          quiz: moduleDetail.quiz || [],
        } as Module;
      })
    );

    // Store results and update progress
    for (let i = 0; i < batchResults.length; i++) {
      detailedModules[batchIndices[i]] = batchResults[i];
      completedModules++;
    }

    // Update progress in DB after each batch
    const progressMsg = completedModules < totalModules
      ? `Generating module ${completedModules + 1} of ${totalModules}...`
      : "Finalizing course...";

    await supabase.from("courses").update({
      generation_progress: progressMsg,
      generation_completed_modules: completedModules,
    }).eq("id", courseId);

    console.log(`[/api/generate] [${courseId}] Phase 2: ${completedModules}/${totalModules} modules complete`);
  }

  // ── Phase 3: Assemble final curriculum ─────────────────────
  const finalCurriculum: Curriculum = {
    ...skeleton,
    modules: detailedModules,
  };

  console.log(`[/api/generate] [${courseId}] Chunked generation complete: ${totalModules} modules assembled`);
  return finalCurriculum;
}

/**
 * Main entry point for curriculum generation.
 * Routes to single-shot or chunked generation based on course length.
 *
 * - crash / short → single-shot (fast, fits in one call)
 * - full / masterclass → chunked (skeleton + per-module, parallel)
 *
 * @param request - Validated generation request
 * @param courseId - The course ID for progress updates (used by chunked)
 * @returns Parsed Curriculum object
 */
async function generateCurriculum(request: GenerateRequest, courseId: string): Promise<Curriculum> {
  if (request.length === "crash" || request.length === "short") {
    console.log(`[/api/generate] [${courseId}] Using single-shot generation for ${request.length} course`);
    return generateCurriculumSingleShot(request);
  } else {
    console.log(`[/api/generate] [${courseId}] Using chunked generation for ${request.length} course`);
    return generateCurriculumChunked(request, courseId);
  }
}

// ─── Supabase helpers ─────────────────────────────────────────

/**
 * Creates a Supabase server client using Next.js cookies.
 * Used to read the user session and save generations.
 */
async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // set() can throw in read-only contexts (e.g. during static generation)
            // This is safe to ignore — the session refresh will be retried on next request
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Same as above — safe to ignore in read-only contexts
          }
        },
      },
    }
  );
}

/**
 * Checks whether the authenticated user is allowed to generate a curriculum.
 * Free plan: 1 generation total.
 * Pro plan: unlimited.
 *
 * @param userId - The authenticated user's UUID
 * @returns true if generation is allowed, false if the limit is reached
 */
async function checkGenerationLimit(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServer();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, generations_used, generations_limit")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    // Profile not found — allow generation (will be created on first save)
    return true;
  }

  // Pro users have unlimited generations
  if (profile.plan === "pro") return true;

  // Free users are limited by generations_limit (default: 1)
  return profile.generations_used < profile.generations_limit;
}

/**
 * Creates a new course record with status="generating" in Supabase.
 * Returns the course ID which is used for polling the generation status.
 *
 * @param userId - The authenticated user's UUID (or null for anonymous)
 * @param request - The original generation request
 * @returns The newly created course ID
 * @throws Error if the database insert fails
 */
async function createCourseRecord(
  userId: string | null,
  request: GenerateRequest
): Promise<string> {
  if (!userId) {
    throw new Error("Cannot create course record without a user ID");
  }

  console.log("[/api/generate] Creating course record with status=generating for user:", userId);
  const supabase = await createSupabaseServer();

  // Create course record with status="generating" and ALL generation settings
  const { data: course, error } = await supabase.from("courses").insert({
    user_id: userId,
    title: request.topic,
    topic: request.topic,
    audience: request.audience,
    length: request.length,
    niche: request.niche ?? null,
    language: request.language ?? "en",
    level: request.audience as "beginner" | "intermediate" | "advanced",
    content_type: "text",
    curriculum: null,
    description: null,
    status: "generating", // Start with generating state
    error_message: null,
    // Generation settings — saved so we can show/reproduce what the user chose
    teaching_style: request.teachingStyle ?? "conversational",
    output_structure: request.outputStructure ?? "modules",
    include_quizzes: request.includeQuizzes ?? true,
    learner_profile: request.learnerProfile ?? null,
    course_abstract: request.abstract ?? null,
    has_attachments: request.hasAttachments ?? false,
  }).select("id").single();

  if (error) {
    console.error("[/api/generate] Failed to create course record:", error.message, error.details);
    throw new Error("Failed to create course record");
  }

  if (!course?.id) {
    throw new Error("No course ID returned from insert");
  }

  console.log("[/api/generate] Course record created with ID:", course.id);
  return course.id;
}

/**
 * Updates an existing course record with the generated curriculum or error.
 * Sets status to "ready" on success or "failed" on error.
 * Also increments the user's generation counter.
 *
 * @param userId - The authenticated user's UUID
 * @param courseId - The course ID to update
 * @param curriculum - The generated curriculum (if successful)
 * @param error - The error message (if generation failed)
 */
async function updateCourseRecord(
  userId: string,
  courseId: string,
  curriculum?: Curriculum,
  error?: string
): Promise<void> {
  // Use supabaseAdmin (service role) for background operations inside after().
  // The cookies-based createSupabaseServer() is unreliable after the response
  // has been sent — the cookie context may be gone.
  const supabase = getSupabaseAdmin();

  if (curriculum) {
    // Update with successful curriculum
    console.log("[/api/generate] Updating course", courseId, "with generated curriculum");
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        curriculum: JSON.parse(JSON.stringify(curriculum)),
        status: "ready",
        title: curriculum.title ?? curriculum.id,
        description: curriculum.subtitle ?? null,
      })
      .eq("id", courseId);

    if (updateError) {
      console.error("[/api/generate] Failed to update course record:", updateError.message, updateError.details);
      return;
    }

    console.log("[/api/generate] Course record updated successfully");

    // Increment generation counter and log usage event atomically
    const { error: rpcError } = await supabase.rpc("increment_generation_usage", {
      p_user_id: userId,
      p_course_id: courseId,
      p_event_type: "course_generated",
    });
    if (rpcError) {
      console.error("[/api/generate] increment_generation_usage RPC failed:", rpcError.message);
    } else {
      console.log("[/api/generate] Generation counter incremented for user:", userId);
    }
  } else if (error) {
    // Update with error state
    console.log("[/api/generate] Updating course", courseId, "with error:", error);
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        status: "failed",
        error_message: error,
      })
      .eq("id", courseId);

    if (updateError) {
      console.error("[/api/generate] Failed to update course error state:", updateError.message, updateError.details);
    }
  }
}

// ─── Route handler ────────────────────────────────────────────

/**
 * POST /api/generate
 *
 * Main request handler. Implements synchronous course generation:
 *   1. Rate limit check by IP
 *   2. Input validation
 *   3. Auth check + generation limit enforcement
 *   4. Create course record with status="generating"
 *   5. Run generation synchronously (chunked for full/masterclass)
 *   6. Update course record with curriculum or error
 *   7. Return courseId
 *
 * The frontend polls GET /api/courses/[id]/status every 3-5s and shows
 * real-time progress (module X of Y) during chunked generation.
 *
 * We use synchronous generation because Vercel's after() callback gets
 * killed before long-running Claude API calls complete, even with
 * maxDuration=300. Running synchronously within the request works
 * reliably with the 5-minute Pro timeout.
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateAsyncResponse | GenerateErrorResponse>> {
  // ── Step 1: Rate limit ──────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait before generating again." },
      { status: 429 }
    );
  }

  // ── Step 2: Parse + validate request body ──────────────────
  let generateRequest: GenerateRequest;
  try {
    const body = await req.json();
    generateRequest = validateRequest(body);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request.",
        details: err instanceof Error ? err.message : "Unknown validation error.",
      },
      { status: 400 }
    );
  }

  // ── Step 3: Auth + generation limit check ──────────────────
  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.warn("[/api/generate] auth.getUser() returned error:", authError.message);
    }

    if (user) {
      userId = user.id;
      console.log("[/api/generate] Authenticated user:", userId, user.email);
      const canGenerate = await checkGenerationLimit(userId);
      if (!canGenerate) {
        return NextResponse.json(
          {
            success: false,
            error: "Generation limit reached.",
            details:
              "You have used all your free generations. Upgrade to Pro for unlimited access.",
          },
          { status: 403 }
        );
      }
    } else {
      console.warn("[/api/generate] No user session found — cannot generate without authentication");
      // For async generation, we require authentication because we need to save to a user's course
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
          details: "You must be signed in to generate a course.",
        },
        { status: 401 }
      );
    }
  } catch (err) {
    // Auth errors are non-fatal — proceed without user context
    console.error("[/api/generate] Auth check exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication check failed.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  // ── Step 4: Create course record with status="generating" ────
  let courseId: string;
  try {
    courseId = await createCourseRecord(userId, generateRequest);
  } catch (err) {
    console.error("[/api/generate] Failed to create course record:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course record.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  // ── Step 5: Synchronous generation ──────────────────────────
  // Run generation synchronously within the same request. Vercel Pro
  // allows maxDuration=300 (5 min), which is enough for masterclass
  // courses with chunked generation (skeleton ~30-60s + modules in
  // parallel batches ~60-90s each).
  //
  // We tried after() but Vercel kills the callback before long-running
  // Claude API calls can complete — even with maxDuration=300.
  //
  // The frontend has already received a "generating" card from the
  // course record and is polling /api/courses/[id]/status every 3-5s.
  // When this function finishes, the next poll sees status="ready".
  try {
    console.log("[/api/generate] Starting synchronous generation for course:", courseId);
    const curriculum = await generateCurriculum(generateRequest, courseId);
    await updateCourseRecord(userId!, courseId, curriculum, undefined);
    console.log("[/api/generate] Generation completed for course:", courseId);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error during generation";
    console.error("[/api/generate] Generation failed:", errorMessage);
    try {
      await updateCourseRecord(userId!, courseId, undefined, errorMessage);
    } catch (updateErr) {
      console.error("[/api/generate] Failed to update error state:", updateErr);
    }
  }

  // ── Step 6: Return courseId ─────────────────────────────────
  const res = NextResponse.json(
    { success: true as const, courseId },
    { status: 202 }
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}
