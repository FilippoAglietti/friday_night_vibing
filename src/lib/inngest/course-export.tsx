import { inngest } from "@/lib/inngest/client";
import { createClient } from "@supabase/supabase-js";
import { CourseDocument } from "@/components/export";
import { renderHtml } from "@/lib/export/renderHtml";
import { renderPdf } from "@/lib/export/renderPdf";
import { uploadToBucket } from "@/lib/export/uploadToBucket";
import { resolveBranding } from "@/lib/export/branding";
import type { Database } from "@/types/database.types";
import type { Curriculum } from "@/types/curriculum";

export const courseExport = inngest.createFunction(
  {
    id: "course-export",
    retries: 1,
    concurrency: { limit: 2 }, // Chromium is memory-heavy — matches Cloud Run concurrency cap
  },
  { event: "course/export.requested" },
  async ({ event, step }) => {
    const { courseId, userId, format } = event.data;

    if (format !== "pdf") {
      return { skipped: true, reason: "format-not-supported" };
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { course, profile } = await step.run("fetch-inputs", async () => {
      const [{ data: course }, { data: profile }] = await Promise.all([
        supabase.from("courses").select("id, user_id, curriculum").eq("id", courseId).single(),
        supabase.from("profiles").select("*").eq("id", userId).single(),
      ]);
      if (!course) throw new Error(`course ${courseId} not found`);
      if (course.user_id !== userId) throw new Error(`course ${courseId} not owned by ${userId}`);
      if (!course.curriculum) throw new Error(`course ${courseId} has no curriculum yet`);
      return { course, profile };
    });

    // Render + upload deliberately run outside step.run — Inngest memoizes step
    // results, so on retry a previous failed upload would reuse the stale render.
    const curriculum = course.curriculum as unknown as Curriculum;
    const branding = resolveBranding(profile);
    const html = await renderHtml(
      <CourseDocument curriculum={curriculum} branding={branding} />,
    );
    const buffer = await renderPdf(html);
    const { signedUrl, path } = await uploadToBucket({
      buffer,
      userId,
      courseId,
      ext: "pdf",
      contentType: "application/pdf",
    });

    await step.run("persist-pointer", async () => {
      await supabase
        .from("course_exports")
        .upsert(
          {
            course_id: courseId,
            format: "pdf",
            storage_path: path,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "course_id,format" },
        );
    });

    return { signedUrl };
  },
);
