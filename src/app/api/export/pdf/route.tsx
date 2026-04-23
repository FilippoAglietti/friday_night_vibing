import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CourseDocument } from "@/components/export";
import { renderHtml } from "@/lib/export/renderHtml";
import { renderPdf } from "@/lib/export/renderPdf";
import { uploadToBucket } from "@/lib/export/uploadToBucket";
import { decideExportPath } from "@/lib/export/decideExportPath";
import { resolveBranding } from "@/lib/export/branding";
import { isExportV2Enabled } from "@/lib/flags";
import { inngest } from "@/lib/inngest/client";
import type { Curriculum } from "@/types/curriculum";

export const runtime = "nodejs";
export const maxDuration = 300;

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
            // set() can throw in read-only contexts — safe to ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Same as above — safe to ignore
          }
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  if (!isExportV2Enabled()) {
    return NextResponse.json(
      { error: "Export v2 is not enabled for this deployment" },
      { status: 404 },
    );
  }

  const { courseId } = (await req.json()) as { courseId?: string };
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, user_id, data")
    .eq("id", courseId)
    .single();
  if (error || !course) {
    return NextResponse.json({ error: "course not found" }, { status: 404 });
  }
  if (course.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const curriculum = course.data as Curriculum;
  const path = decideExportPath(curriculum);

  if (path === "async") {
    // Long courses dispatch to Inngest; client polls /api/export/pdf/status/[courseId]
    // The Inngest function that consumes this event is registered in Task 19.
    await (inngest.send as (e: unknown) => Promise<unknown>)({
      name: "course/export.requested",
      data: { courseId, userId: user.id, format: "pdf" },
    });
    return NextResponse.json({ status: "pending", courseId, format: "pdf" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const branding = resolveBranding(profile);
  const html = renderHtml(
    <CourseDocument curriculum={curriculum} branding={branding} />,
  );
  const buffer = await renderPdf(html);
  const { signedUrl } = await uploadToBucket({
    buffer,
    userId: user.id,
    courseId,
    ext: "pdf",
    contentType: "application/pdf",
  });

  return NextResponse.json({ status: "ready", url: signedUrl });
}
