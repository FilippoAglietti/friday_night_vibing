/**
 * app/api/generate/route.ts
 * ─────────────────────────────────────────────────────────────
 * Next.js App Router API route: POST /api/generate
 *
 * Accepts a curriculum generation request from the frontend form,
 * validates it, checks auth + rate limits, calls the Claude API,
 * saves the result to Supabase, and returns the curriculum JSON.
 *
 * Request body:  { topic, audience, length, niche? }
 * Success:       { curriculum: Curriculum }
 * Error:         { error: string, details?: string }
 *
 * Rate limit:    5 requests per IP per hour (in-memory, resets on restart)
 * Auth:          Supabase session cookie (optional for free tier — 1 free generation)
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  // audience — required, must be a valid enum value
  if (!b.audience || !VALID_AUDIENCES.includes(b.audience as AudienceLevel)) {
    throw new Error(
      `'audience' must be one of: ${VALID_AUDIENCES.join(", ")}.`
    );
  }

  // length — required, must be a valid enum value
  if (!b.length || !VALID_LENGTHS.includes(b.length as CourseLength)) {
    throw new Error(
      `'length' must be one of: ${VALID_LENGTHS.join(", ")}.`
    );
  }

  // niche — optional, string or undefined
  if (b.niche !== undefined && typeof b.niche !== "string") {
    throw new Error("'niche' must be a string if provided.");
  }

  return {
    topic: b.topic.trim(),
    audience: b.audience as AudienceLevel,
    length: b.length as CourseLength,
    niche: b.niche ? (b.niche as string).trim() : undefined,
  };
}

// ─── Claude API call ──────────────────────────────────────────

/**
 * Calls the Anthropic Claude API with the curriculum generation prompt
 * and parses the JSON response into a typed Curriculum object.
 *
 * Uses claude-sonnet-4-6 for the best balance of quality and speed.
 * max_tokens 8192 is needed for long bootcamp curricula.
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

  // Call Claude — no streaming for now (simpler to parse)
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system,
    messages,
  });

  // Extract the text content from the response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned an empty or non-text response.");
  }

  const rawText = textBlock.text.trim();

  // Parse the JSON — Claude should return pure JSON per our prompt instructions
  let curriculum: Curriculum;
  try {
    curriculum = JSON.parse(rawText) as Curriculum;
  } catch {
    // If JSON parsing fails, attempt to extract JSON from markdown code fences
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      curriculum = JSON.parse(jsonMatch[1]) as Curriculum;
    } else {
      throw new Error(
        "Claude returned a response that could not be parsed as JSON."
      );
    }
  }

  return curriculum;
}

// ─── Supabase helpers ─────────────────────────────────────────

/**
 * Creates a Supabase server client using Next.js cookies.
 * Used to read the user session and save generations.
 */
function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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
  const supabase = createSupabaseServer();

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
  if (!userId) return; // Don't save anonymous generations

  const supabase = createSupabaseServer();

  // Save the generation to the generations table
  await supabase.from("generations").insert({
    user_id: userId,
    topic: request.topic,
    audience: request.audience,
    length: request.length,
    niche: request.niche ?? null,
    curriculum: curriculum, // stored as jsonb in Supabase
  });

  // Increment the user's generation counter
  await supabase.rpc("increment_generations_used", { user_id: userId });
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
      { error: "Too many requests. Please wait before generating again." },
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
        error: "Invalid request.",
        details: err instanceof Error ? err.message : "Unknown validation error.",
      },
      { status: 400 }
    );
  }

  // ── Step 3: Auth + generation limit check ──────────────────
  let userId: string | null = null;
  try {
    const supabase = createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const canGenerate = await checkGenerationLimit(userId);
      if (!canGenerate) {
        return NextResponse.json(
          {
            error: "Generation limit reached.",
            details:
              "You have used all your free generations. Upgrade to Pro for unlimited access.",
          },
          { status: 403 }
        );
      }
    }
    // If no user, allow 1 anonymous generation (rate-limited above)
  } catch {
    // Auth errors are non-fatal — proceed without user context
    console.warn("[/api/generate] Auth check failed, proceeding anonymously.");
  }

  // ── Step 4: Generate curriculum via Claude ──────────────────
  let curriculum: Curriculum;
  try {
    curriculum = await generateCurriculum(generateRequest);
  } catch (err) {
    console.error("[/api/generate] Claude API error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate curriculum.",
        details:
          err instanceof Error ? err.message : "Unexpected error from AI engine.",
      },
      { status: 500 }
    );
  }

  // ── Step 5: Save to Supabase (fire and forget) ──────────────
  saveGeneration(userId, generateRequest, curriculum).catch((err) => {
    console.error("[/api/generate] Failed to save generation:", err);
  });

  // ── Step 6: Return the curriculum ──────────────────────────
  return NextResponse.json({ curriculum }, { status: 200 });
}
