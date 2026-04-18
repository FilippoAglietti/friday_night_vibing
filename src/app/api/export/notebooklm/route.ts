import { NextRequest, NextResponse } from "next/server";
import { loadCourseForEdit } from "@/lib/curriculum/loadForEdit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { TIERS, tierOrFallback } from "@/lib/pricing/tiers";
import {
  generateNotebookLMMarkdown,
  notebookLMFilename,
} from "@/lib/exports/generateNotebookLMMarkdown";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("course_id");
  if (!courseId) {
    return NextResponse.json({ error: "course_id is required." }, { status: 400 });
  }

  const loaded = await loadCourseForEdit(courseId);
  if (loaded.kind === "error") {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", loaded.userId)
    .maybeSingle();

  const tier = tierOrFallback(profile?.plan);
  if (!TIERS[tier].hasNotebookLMExport) {
    return NextResponse.json(
      {
        error: "NotebookLM export is a Masterclass feature.",
        upgradeTo: "masterclass",
      },
      { status: 402 },
    );
  }

  const md = generateNotebookLMMarkdown(loaded.course.curriculum!);
  const filename = notebookLMFilename(loaded.course.curriculum!, loaded.course.length);

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
