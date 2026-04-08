/**
 * app/api/audio/generate/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/audio/generate
 *
 * Generates a narrated audio track for a single lesson in a course.
 *
 * Flow:
 *   1. Authenticate caller and verify ownership of the target course.
 *   2. Extract the lesson's teachable text (title + content + keypoints).
 *   3. Create a media_assets row with status="pending" and return it
 *      immediately so the frontend has something to poll.
 *   4. In after(), call the TTS provider (OpenAI TTS by default,
 *      ElevenLabs if configured) and upload the MP3 to the
 *      `course-audio` Supabase Storage bucket.
 *   5. Update the media_assets row with the storage path, a signed
 *      URL (valid 7 days), and status="ready" (or "failed" on error).
 *
 * This is intentionally scoped to ONE lesson per request so the
 * per-invocation budget stays comfortable. A client that wants to
 * generate audio for a whole module should call this endpoint once
 * per lesson in parallel.
 *
 * Body:
 *   {
 *     course_id: uuid,
 *     lesson_id: string,       // matches curriculum.modules[].lessons[].id
 *     voice?: string,          // override default voice
 *     provider?: "openai" | "elevenlabs",
 *   }
 *
 * Returns 202:
 *   {
 *     success: true,
 *     media_asset_id: uuid,
 *     status: "pending",
 *     provider: "openai" | "elevenlabs"
 *   }
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse, after } from "next/server";
import { loadCourseForEdit } from "@/lib/curriculum/loadForEdit";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Curriculum, Lesson, Module } from "@/types/curriculum";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ─── Config ──────────────────────────────────────────────────

/** Supabase Storage bucket used for generated audio. */
const AUDIO_BUCKET = "course-audio";

/** Default OpenAI voice. See https://platform.openai.com/docs/guides/text-to-speech */
const OPENAI_DEFAULT_VOICE = "alloy";
const OPENAI_TTS_MODEL = "tts-1";

/** Default ElevenLabs voice id (Rachel). */
const ELEVENLABS_DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

/** Hard cap on the text we send to the TTS provider. ~4096 chars ≈ 5 min audio. */
const MAX_TTS_INPUT = 4096;

// ─── Helpers ──────────────────────────────────────────────────

interface ResolvedLesson {
  module: Module;
  lesson: Lesson;
}

/** Flatten the curriculum tree and find a single lesson by id. */
function findLesson(curriculum: Curriculum, lessonId: string): ResolvedLesson | null {
  for (const m of curriculum.modules) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return { module: m, lesson: l };
  }
  return null;
}

/**
 * Build the narratable script for a lesson.
 * Strategy: title + key points + content (stripped of markdown).
 * Keep it under MAX_TTS_INPUT chars so the TTS provider is happy.
 */
function buildNarrationScript(lesson: Lesson): string {
  // Very conservative markdown stripping — we just want clean prose.
  const stripMd = (s: string): string =>
    s
      .replace(/```[\s\S]*?```/g, " ") // fenced code
      .replace(/`([^`]+)`/g, "$1") // inline code
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
      .replace(/^>\s?/gm, "") // blockquotes
      .replace(/^#{1,6}\s+/gm, "") // headers
      .replace(/[*_~]{1,3}/g, "") // emphasis
      .replace(/\s+\n/g, "\n")
      .trim();

  const parts: string[] = [];
  parts.push(lesson.title);
  if (lesson.description) parts.push(lesson.description);
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    parts.push("Key points: " + lesson.keyPoints.join(". "));
  }
  if (lesson.content) parts.push(stripMd(lesson.content));

  const full = parts.join("\n\n");
  return full.length > MAX_TTS_INPUT ? full.slice(0, MAX_TTS_INPUT - 3) + "..." : full;
}

/**
 * Call OpenAI TTS and return an MP3 as a Buffer.
 * Throws with a readable message on failure so the background job
 * can persist the error into media_assets.
 */
async function synthesizeOpenAI({
  text,
  voice,
}: {
  text: string;
  voice: string;
}): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`OpenAI TTS ${res.status}: ${msg.slice(0, 200)}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Call ElevenLabs TTS and return an MP3 as a Buffer.
 */
async function synthesizeElevenLabs({
  text,
  voice,
}: {
  text: string;
  voice: string;
}): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${res.status}: ${msg.slice(0, 200)}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Pick a provider based on body override + env var availability.
 * Returns `null` if neither provider is configured — the caller
 * should return 501 in that case.
 */
function pickProvider(
  requested: string | undefined
): "openai" | "elevenlabs" | null {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasEleven = !!process.env.ELEVENLABS_API_KEY;

  if (requested === "openai" && hasOpenAI) return "openai";
  if (requested === "elevenlabs" && hasEleven) return "elevenlabs";

  if (hasOpenAI) return "openai";
  if (hasEleven) return "elevenlabs";
  return null;
}

// ─── Route handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const courseId: unknown = body?.course_id;
    const lessonId: unknown = body?.lesson_id;
    const requestedProvider: string | undefined = body?.provider;
    const requestedVoice: string | undefined = body?.voice;

    if (typeof courseId !== "string" || typeof lessonId !== "string") {
      return NextResponse.json(
        { error: "course_id and lesson_id are required." },
        { status: 400 }
      );
    }

    const loaded = await loadCourseForEdit(courseId);
    if (loaded.kind === "error") {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    }

    // Resolve lesson inside curriculum JSON
    const resolved = findLesson(loaded.course.curriculum!, lessonId);
    if (!resolved) {
      return NextResponse.json(
        { error: "Lesson not found in this course." },
        { status: 404 }
      );
    }

    // Decide which TTS provider to use
    const provider = pickProvider(requestedProvider);
    if (!provider) {
      return NextResponse.json(
        {
          error:
            "No TTS provider configured. Set OPENAI_API_KEY or ELEVENLABS_API_KEY.",
        },
        { status: 501 }
      );
    }

    // Create the media_assets row immediately so the frontend has a handle
    const admin = getSupabaseAdmin();
    const { data: asset, error: insertErr } = await admin
      .from("media_assets")
      .insert({
        course_id: courseId,
        user_id: loaded.userId,
        type: "audio",
        // The `url` column is NOT NULL in the DB; seed with an empty
        // string while the job is pending and fill it in once the
        // upload completes.
        url: "",
        status: "pending",
        metadata: {
          lesson_id: lessonId,
          module_id: resolved.module.id,
          provider,
          voice: requestedVoice ?? null,
          language: loaded.course.language,
        },
      })
      .select("id")
      .single();

    if (insertErr || !asset) {
      console.error("[/api/audio/generate] insert error:", insertErr);
      return NextResponse.json(
        { error: "Could not create media asset." },
        { status: 500 }
      );
    }

    // Hand the heavy work off to the background. `after()` keeps running
    // after the 202 response is sent, within the same function budget.
    after(async () => {
      const mediaId = asset.id;
      try {
        const script = buildNarrationScript(resolved.lesson);
        if (!script.trim()) throw new Error("Empty narration script");

        const voice =
          requestedVoice ||
          (provider === "openai" ? OPENAI_DEFAULT_VOICE : ELEVENLABS_DEFAULT_VOICE);

        const buffer =
          provider === "openai"
            ? await synthesizeOpenAI({ text: script, voice })
            : await synthesizeElevenLabs({ text: script, voice });

        // Upload to Supabase Storage
        const storagePath = `${loaded.userId}/${courseId}/${lessonId}-${Date.now()}.mp3`;
        const { error: uploadErr } = await admin.storage
          .from(AUDIO_BUCKET)
          .upload(storagePath, buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

        // Generate a long-lived signed URL (7 days) for the frontend
        const { data: signed, error: signErr } = await admin.storage
          .from(AUDIO_BUCKET)
          .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

        if (signErr || !signed?.signedUrl)
          throw new Error(`Signed URL failed: ${signErr?.message || "unknown"}`);

        // Mark the asset as ready
        const { error: updErr } = await admin
          .from("media_assets")
          .update({
            url: signed.signedUrl,
            storage_path: storagePath,
            file_size_kb: Math.round(buffer.byteLength / 1024),
            status: "ready",
          })
          .eq("id", mediaId);

        if (updErr) throw new Error(`Media asset update failed: ${updErr.message}`);

        // Also mirror the audio URL into the curriculum JSON so the
        // viewer can render a play button without a second DB lookup.
        const fresh = await admin
          .from("courses")
          .select("curriculum")
          .eq("id", courseId)
          .single();

        if (!fresh.error && fresh.data?.curriculum) {
          const curr = fresh.data.curriculum as unknown as Curriculum;
          const nextModules = curr.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId
                ? ({
                    ...l,
                    // Extend the lesson shape with an audio pointer. This
                    // is a soft extension — the Lesson type doesn't have
                    // this field yet but the viewer tolerates unknown keys.
                    audioUrl: signed.signedUrl,
                  } as Lesson & { audioUrl: string })
                : l
            ),
          }));
          const updatedCurriculum = {
            ...curr,
            modules: nextModules,
            updatedAt: new Date().toISOString(),
          };
          await admin
            .from("courses")
            .update({
              // Round-trip through JSON so the typed client accepts the
              // object as a plain JSONB payload.
              curriculum: JSON.parse(JSON.stringify(updatedCurriculum)),
              updated_at: new Date().toISOString(),
            })
            .eq("id", courseId);
        }

        console.log(
          `[/api/audio/generate] ${mediaId} ready (${provider}, ${Math.round(
            buffer.byteLength / 1024
          )} KB)`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[/api/audio/generate] ${mediaId} failed:`, msg);
        await admin
          .from("media_assets")
          .update({
            status: "failed",
            metadata: {
              lesson_id: lessonId,
              module_id: resolved.module.id,
              provider,
              error: msg,
            },
          })
          .eq("id", mediaId);
      }
    });

    return NextResponse.json(
      {
        success: true,
        media_asset_id: asset.id,
        status: "pending",
        provider,
      },
      { status: 202 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/audio/generate] unexpected error:", msg);
    return NextResponse.json(
      { error: "Unexpected error.", details: msg },
      { status: 500 }
    );
  }
}

// ─── GET /api/audio/generate?id=<media_asset_id> ──────────────
// Small helper so the frontend can poll the status of a job.

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("media_assets")
      .select("id, status, url, storage_path, metadata, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[/api/audio/generate][GET] error:", error);
      return NextResponse.json(
        { error: "Could not load media asset." },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset: data }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Unexpected error.", details: msg },
      { status: 500 }
    );
  }
}
