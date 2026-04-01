/**
 * app/api/generate/route.ts
 * ─────────────────────────────────────────────────────────────
 * Next.js App Router API route: POST /api/generate
 *
 * Accepts a curriculum generation request from the frontend form,
 * validates it, checks auth + rate limits, calls the Claude API,
 * saves the result to Supabase, and returns the curriculum JSON.
 *
 * Request body:  { topic, difficulty, courseLength, niche? }
 * Success:       { success: true, data: Curriculum }
 * Error:         { success: false, error: string, details?: string }
 *
 * Rate limit:    5 requests per IP per hour (in-memory, resets on restart)
 * Auth:          Supabase session cookie (optional for free tier — 1 free generation)
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

import { buildCurriculumPrompt } from "@/lib/prompts/curriculum";
import type {
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
  Curriculum,
  AudienceLevel,
  CourseLength,
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
const VALID_LENGTHS: CourseLength[] = ["mini", "standard", "bootcamp"];

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
 * Calls the Claude API with retry logic and timeout.
 * - Retries once with exponential backoff (2s delay) on API failure
 * - Includes 60-second timeout per API call
 * - Logs all retry attempts to console
 *
 * @param anthropic - Anthropic SDK instance
 * @param system - System prompt
 * @param messages - User messages
 * @param attempt - Current attempt number (1 or 2)
 * @returns Claude API response
 * @throws Error if both attempts fail
 */
async function callClaudeWithRetry(
  anthropic: Anthropic,
  system: string,
  messages: Anthropic.MessageParam[],
  attempt: number = 1
): Promise<Anthropic.Message> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      system,
      messages,
    });

    clearTimeout(timeout);
    return response;
  } catch (err) {
    if (attempt < 2) {
      console.warn(
        `[/api/generate] Attempt ${attempt} failed, retrying in 2s...`,
        err
      );
      await new Promise((r) => setTimeout(r, 2000));
      return callClaudeWithRetry(anthropic, system, messages, attempt + 1);
    }
    throw err;
  }
}

/**
 * Calls the Anthropic Claude API with the curriculum generation prompt
 * and parses the JSON response into a typed Curriculum object.
 *
 * Uses claude-sonnet-4-6 for the best balance of quality and speed.
 * max_tokens 16384 is needed for long bootcamp curricula.
 * Includes retry logic with exponential backoff and 60-second timeout.
 *
 * @param request - Validated generation request
 * @returns Parsed Curriculum object
 * @throws Error if the API call fails or returns invalid JSON
 */
async function generateCurriculum(request: GenerateRequest): Promise<Curriculum> {
  // Initialise the Anthropic SDK with the API key from environment variables
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build the system + user messages from the prompt factory
  const { system, messages } = buildCurriculumPrompt(request);

  // Call Claude with retry logic and timeout
  // 16384 tokens ensures even large bootcamp curricula (6-10 modules) are not truncated
  const response = await callClaudeWithRetry(anthropic, system, messages);

  // Extract the text content from the response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned an empty or non-text response.");
  }

  const rawText = textBlock.text.trim();

  // Check if the response was truncated (stop_reason === "max_tokens")
  // A truncated JSON will never parse correctly, so warn early
  if (response.stop_reason === "max_tokens") {
    console.warn("[/api/generate] Response was truncated (hit max_tokens). Attempting JSON repair...");
  }

  // Parse the JSON — Claude should return pure JSON per our prompt instructions.
  // Sometimes Claude wraps JSON in markdown fences or adds preamble text,
  // so we try multiple extraction strategies.
  let curriculum: Curriculum | undefined;
  try {
    // Strategy 1: Direct parse (ideal case — pure JSON)
    curriculum = JSON.parse(rawText) as Curriculum;
  } catch {
    let parsed = false;

    // Strategy 2: Extract from markdown code fences ```json ... ```
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        curriculum = JSON.parse(jsonMatch[1]) as Curriculum;
        parsed = true;
      } catch { /* fall through to strategy 3 */ }
    }

    // Strategy 3: Find the first '{' and last '}' to extract the JSON object
    if (!parsed) {
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          curriculum = JSON.parse(
            rawText.slice(firstBrace, lastBrace + 1)
          ) as Curriculum;
          parsed = true;
        } catch { /* fall through to strategy 4 */ }
      }
    }

    // Strategy 4: Repair truncated JSON (when response hit max_tokens)
    // Extract from first '{' and attempt to close unclosed brackets/braces
    if (!parsed) {
      const firstBrace = rawText.indexOf("{");
      if (firstBrace !== -1) {
        const truncatedJson = rawText.slice(firstBrace);
        const repairedJson = repairTruncatedJson(truncatedJson);
        try {
          curriculum = JSON.parse(repairedJson) as Curriculum;
          parsed = true;
          console.warn("[/api/generate] JSON was repaired after truncation — some content may be incomplete.");
        } catch { /* fall through to error */ }
      }
    }

    if (!parsed) {
      console.error("[/api/generate] Raw Claude response (first 500 chars):", rawText.substring(0, 500));
      console.error("[/api/generate] Raw Claude response (last 200 chars):", rawText.substring(rawText.length - 200));
      throw new Error(
        "Claude returned a response that could not be parsed as JSON."
      );
    }
  }

  if (!curriculum) {
    throw new Error("Failed to parse curriculum JSON");
  }
  return curriculum;
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
 * Saves the generated curriculum to Supabase and increments the user's
 * generation counter.
 *
 * @param userId - The authenticated user's UUID (or null for anonymous)
 * @param request - The original generation request
 * @param curriculum - The generated curriculum to save
 */
async function saveGeneration(
  userId: string | null,
  request: GenerateRequest,
  curriculum: Curriculum
): Promise<void> {
  if (!userId) {
    console.warn("[/api/generate] Skipping save — no userId (anonymous generation)");
    return;
  }

  console.log("[/api/generate] Saving course for user:", userId);
  const supabase = await createSupabaseServer();

  // Save to courses table (new schema v2)
  const { data: course, error } = await supabase.from("courses").insert({
    user_id: userId,
    title: curriculum.title ?? request.topic,
    topic: request.topic,
    audience: request.audience,
    length: request.length,
    niche: request.niche ?? null,
    language: "en",
    level: request.audience as "beginner" | "intermediate" | "advanced",
    content_type: "text",
    curriculum: curriculum as unknown as Record<string, unknown>,
    description: curriculum.subtitle ?? null,
    status: "ready",
  }).select("id").single();

  if (error) {
    console.error("[/api/generate] Failed to save course:", error.message, error.details);
    return;
  }

  console.log("[/api/generate] Course saved successfully, id:", course?.id);

  // Increment generation counter and log usage event atomically
  if (course?.id) {
    const { error: rpcError } = await supabase.rpc("increment_generation_usage", {
      p_user_id: userId,
      p_course_id: course.id,
      p_event_type: "course_generated",
    });
    if (rpcError) {
      console.error("[/api/generate] increment_generation_usage RPC failed:", rpcError.message);
    }
  }
}

// ─── Route handler ────────────────────────────────────────────

/**
 * POST /api/generate
 *
 * Main request handler. Orchestrates:
 *   1. Rate limit check by IP
 *   2. Input validation
 *   3. Auth check + generation limit enforcement
 *   4. Claude API call
 *   5. Save to Supabase
 *   6. Return the curriculum
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
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
      console.warn("[/api/generate] No user session found — proceeding as anonymous");
    }
  } catch (err) {
    // Auth errors are non-fatal — proceed without user context
    console.error("[/api/generate] Auth check exception:", err);
  }

  // ── Step 4: Generate curriculum via Claude ──────────────────
  let curriculum: Curriculum;
  try {
    curriculum = await generateCurriculum(generateRequest);
  } catch (err) {
    console.error("[/api/generate] Claude API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate course.",
        details: err instanceof Error ? err.message : "Unexpected error from AI engine.",
      },
      { status: 500 }
    );
  }

  // ── Step 5: Save to Supabase (fire and forget) ──────────────
  saveGeneration(userId, generateRequest, curriculum).catch((err) => {
    console.error("[/api/generate] Failed to save generation:", err);
  });

  // ── Step 6: Return the curriculum ──────────────────────────
  // Return { success: true, data: curriculum } to match GenerateResponse type
  const res = NextResponse.json(
    { success: true as const, data: curriculum },
    { status: 200 }
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}
