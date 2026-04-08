/**
 * app/api/curriculum/[id]/title/route.ts
 * ─────────────────────────────────────────────────────────────
 * PATCH /api/curriculum/:id/title
 *
 * Updates the title of a course.  The title lives in two places:
 *   • courses.title  (top-level column used by listings & share URLs)
 *   • curriculum.title  (inside the JSON blob, used by the viewer)
 *
 * We keep both in sync in a single transaction so the UI never drifts.
 *
 * Body:    { title: string }
 * Returns: { success: true, title: string }
 * Auth:    Required. Only the course owner can rename their course.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { loadCourseForEdit } from "@/lib/curriculum/loadForEdit";

export const dynamic = "force-dynamic";

/** Upper bound to prevent abusive payloads. */
const MAX_TITLE_LENGTH = 200;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate body
    const body = await req.json().catch(() => ({}));
    const rawTitle = body?.title;
    if (typeof rawTitle !== "string") {
      return NextResponse.json(
        { error: "title is required and must be a string." },
        { status: 400 }
      );
    }
    const title = rawTitle.trim();
    if (title.length === 0) {
      return NextResponse.json({ error: "title cannot be empty." }, { status: 400 });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `title must be ${MAX_TITLE_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const loaded = await loadCourseForEdit(id);
    if (loaded.kind === "error") {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    }

    // Merge title into the curriculum JSON blob while keeping updatedAt fresh.
    const nextCurriculum = {
      ...loaded.course.curriculum!,
      title,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await loaded.admin
      .from("courses")
      .update({
        title,
        // Round-trip through JSON so the typed client accepts the object
        // as a plain JSONB payload (Curriculum has nested arrays/objects
        // that don't match the generated Json type verbatim).
        curriculum: JSON.parse(JSON.stringify(nextCurriculum)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[/api/curriculum/:id/title] update error:", error);
      return NextResponse.json(
        { error: "Could not update title." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, title }, { status: 200 });
  } catch (err) {
    console.error("[/api/curriculum/:id/title] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
