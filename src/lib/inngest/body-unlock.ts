import { inngest } from "@/lib/inngest/client";
import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";

/**
 * course/body-unlock.requested handler.
 *
 * Triggered by Stripe webhook after a Planner user pays €5 for body
 * generation on a skeleton-only course. Reuses the existing module-
 * generation path by emitting `module/generate.requested` events for
 * each skeleton module.
 *
 * Per spec §5.4: Opus polish is NOT applied on Planner body unlocks
 * (polish is Masterclass-only).
 */
export const bodyUnlock = inngest.createFunction(
  {
    id: "course-body-unlock",
    name: "Course: Body Unlock (Planner €5)",
    retries: 2,
    onFailure: async ({ event, error }) => {
      const data = (event.data as { event: { data: { courseId: string } } }).event.data;
      console.error(
        `[body-unlock] exhausted retries for course ${data.courseId}: ${error.message}`
      );
    },
  },
  { event: "course/body-unlock.requested" },
  async ({ event, step }) => {
    const { courseId, userId } = event.data;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const course = await step.run("fetch-course", async () => {
      const { data, error } = await admin
        .from("courses")
        .select(
          "id, user_id, curriculum, topic, audience, length, niche, language, level, teaching_style, output_structure, include_quizzes"
        )
        .eq("id", courseId)
        .single();
      if (error || !data) throw new NonRetriableError("course not found");
      if (data.user_id !== userId) throw new NonRetriableError("course owner mismatch");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(data.curriculum as any)?.modules) throw new NonRetriableError("no skeleton to unlock");
      return data;
    });

    await step.run("mark-generating", async () => {
      await admin.from("courses").update({ status: "generating" }).eq("id", courseId);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const curriculum = course.curriculum as any;
    const modules = curriculum.modules as Array<{ id?: string; [k: string]: unknown }>;

    for (let i = 0; i < modules.length; i++) {
      await step.sendEvent(`module-${i}`, {
        name: "module/generate.requested",
        data: {
          courseId,
          moduleIndex: i,
          moduleId: modules[i].id ?? `m${i}`,
          request: {
            topic: course.topic,
            audience: course.audience,
            length: course.length,
            niche: course.niche,
            language: course.language,
            teachingStyle: course.teaching_style,
            outputStructure: course.output_structure,
            includeQuizzes: course.include_quizzes,
          },
          skeletonTitle: curriculum.title ?? course.topic,
          skeletonDescription: curriculum.description ?? "",
          skeletonModule: modules[i],
          totalModules: modules.length,
        },
      });
    }

    return { ok: true, moduleCount: modules.length };
  }
);
