/**
 * app/api/leads/route.ts
 * ─────────────────────────────────────────────────────────────
 * Lead capture / email gate endpoint.
 *
 *   POST /api/leads
 *     body: {
 *       email: string,            // required — GDPR-minimal identifier
 *       name?: string,            // optional display name
 *       curriculum_id: uuid,      // required — id of the shared course
 *       source?: string,          // e.g. "share_page", "embed", "campaign:x"
 *       consent_marketing?: bool  // opt-in checkbox state
 *     }
 *     returns 200 { success: true, lead_id } on success or existing lead
 *             400 on validation errors
 *             404 if curriculum_id does not match a public/published course
 *
 *   GET /api/leads?curriculum_id=uuid
 *     Owner-only listing of leads captured for one of their courses.
 *     Requires authentication; enforced via RLS.
 *
 * Notes:
 *   • INSERT bypasses RLS via the service role key, because the lead
 *     submitter is an anonymous visitor. Validation of the target course
 *     (must be public) prevents abuse of the endpoint as an open relay.
 *   • The (email, curriculum_id) pair is unique at the DB level, so
 *     duplicate submissions are idempotent — we just return the existing
 *     row and the unlock flow continues.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────

/** Normalise an email string: trim + lowercase. */
function normaliseEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  // Same regex used by the DB check constraint
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed) ? trimmed : null;
}

/** Admin client — bypasses RLS. Only used in the INSERT path. */
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Server client bound to the user's cookies — used for the GET path. */
async function userClient() {
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
            /* read-only context */
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            /* read-only context */
          }
        },
      },
    }
  );
}

// ─── POST /api/leads ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normaliseEmail(body?.email);
    const curriculumId: unknown = body?.curriculum_id;
    const name: string | null =
      typeof body?.name === "string" && body.name.trim().length > 0
        ? body.name.trim().slice(0, 120)
        : null;
    const source: string | null =
      typeof body?.source === "string" && body.source.trim().length > 0
        ? body.source.trim().slice(0, 80)
        : null;
    const consentMarketing: boolean = !!body?.consent_marketing;

    // ── Validation ──
    if (!email) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (typeof curriculumId !== "string" || curriculumId.length < 10) {
      return NextResponse.json(
        { error: "curriculum_id is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = adminClient();

    // ── Verify the target course exists and is publicly shareable ──
    // This prevents the endpoint being abused as an unrelated email sink.
    const { data: course, error: courseErr } = await supabaseAdmin
      .from("courses")
      .select("id, user_id, is_public, is_published, status")
      .eq("id", curriculumId)
      .maybeSingle();

    if (courseErr) {
      console.error("[/api/leads] course lookup error:", courseErr);
      return NextResponse.json(
        { error: "Could not verify course." },
        { status: 500 }
      );
    }
    if (!course) {
      return NextResponse.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }
    // Course must be in a shareable state: ready + (public OR published)
    if (course.status !== "ready" || !(course.is_public || course.is_published)) {
      return NextResponse.json(
        { error: "This course is not available for lead capture." },
        { status: 403 }
      );
    }

    // ── Capture request metadata for provenance ──
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent");

    // ── Upsert: unique (email, curriculum_id) → idempotent ──
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("leads")
      .upsert(
        {
          email,
          name,
          curriculum_id: curriculumId,
          course_owner_id: course.user_id,
          source,
          consent_marketing: consentMarketing,
          ip_address: ip,
          user_agent: userAgent,
        },
        {
          onConflict: "email,curriculum_id",
          ignoreDuplicates: false, // so we return the existing row's id
        }
      )
      .select("id")
      .maybeSingle();

    if (insertErr) {
      console.error("[/api/leads] insert error:", insertErr);
      return NextResponse.json(
        { error: "Could not save your email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, lead_id: inserted?.id ?? null },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/leads] unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

// ─── GET /api/leads?curriculum_id=... (owner only) ────────────

export async function GET(req: NextRequest) {
  try {
    const curriculumId = req.nextUrl.searchParams.get("curriculum_id");
    if (!curriculumId) {
      return NextResponse.json(
        { error: "curriculum_id query parameter is required." },
        { status: 400 }
      );
    }

    const supabase = await userClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // RLS enforces course_owner_id = auth.uid(), so we don't need an
    // extra ownership check here — the query will silently return [] for
    // non-owners, which is the desired behaviour.
    const { data, error } = await supabase
      .from("leads")
      .select("id, email, name, source, consent_marketing, created_at")
      .eq("curriculum_id", curriculumId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/leads] list error:", error);
      return NextResponse.json(
        { error: "Could not fetch leads." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, leads: data ?? [], count: data?.length ?? 0 },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/leads] GET unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}
