// src/lib/inngest/validate-urls.ts
// ─────────────────────────────────────────────────────────────
// Async URL validator. Runs after courseFinalize marks a course
// ready/partial. HEAD-checks every URL in the curriculum and
// rewrites `status` in place on SuggestedResource / BonusResource
// entries. Never blocks the user — the course is already usable
// before this runs. The UI filters `status === 'unreachable'`
// at render time.
// ─────────────────────────────────────────────────────────────

import { inngest } from "./client";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkUrl } from "@/lib/validators/url-check";
import type {
  Curriculum,
  SuggestedResource,
  BonusResource,
  UrlStatus,
} from "@/types/curriculum";
import type { Json } from "@/types/database.types";

/**
 * Bounded-concurrency parallel worker. Runs `worker` over `items`
 * with at most `concurrency` in-flight at any time. Preserves
 * result order by index.
 */
async function runConcurrent<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  async function next(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, next),
  );
  return results;
}

function collectUrls(curriculum: Curriculum): string[] {
  const urls = new Set<string>();
  for (const r of curriculum.bonusResources ?? []) {
    if (r.url) urls.add(r.url);
  }
  for (const m of curriculum.modules ?? []) {
    for (const l of m.lessons ?? []) {
      for (const r of l.suggestedResources ?? []) {
        if (r.url) urls.add(r.url);
      }
    }
  }
  return Array.from(urls);
}

function applyStatuses(
  curriculum: Curriculum,
  statuses: Map<string, UrlStatus>,
): Curriculum {
  const mapSuggested = (r: SuggestedResource): SuggestedResource => ({
    ...r,
    status: r.url ? (statuses.get(r.url) ?? "unchecked") : "unchecked",
  });
  const mapBonus = (r: BonusResource): BonusResource => ({
    ...r,
    status: r.url ? (statuses.get(r.url) ?? "unchecked") : "unchecked",
  });
  return {
    ...curriculum,
    bonusResources: curriculum.bonusResources?.map(mapBonus),
    modules: curriculum.modules?.map((m) => ({
      ...m,
      lessons: m.lessons?.map((l) => ({
        ...l,
        suggestedResources: l.suggestedResources?.map(mapSuggested),
      })),
    })),
  };
}

export const validateCourseUrls = inngest.createFunction(
  { id: "course-validate-urls", name: "Course: Validate URLs (async)", retries: 1 },
  { event: "course/validate.requested" },
  async ({ event }) => {
    const { courseId } = event.data as { courseId: string };
    const supabase = getSupabaseAdmin();

    const { data: course, error: loadErr } = await supabase
      .from("courses")
      .select("curriculum")
      .eq("id", courseId)
      .single();
    if (loadErr || !course?.curriculum) {
      return { skipped: true, reason: "no-curriculum" };
    }

    const curriculum = course.curriculum as unknown as Curriculum;
    const urls = collectUrls(curriculum);
    if (urls.length === 0) return { checked: 0 };

    const results = await runConcurrent(
      urls,
      10,
      async (u): Promise<[string, UrlStatus]> => [u, await checkUrl(u)],
    );
    const statusMap = new Map(results);
    const updated = applyStatuses(curriculum, statusMap);

    const { error: writeErr } = await supabase
      .from("courses")
      .update({ curriculum: updated as unknown as Json })
      .eq("id", courseId);
    if (writeErr) {
      throw new Error(`validateCourseUrls: write failed: ${writeErr.message}`);
    }

    const okCount = results.filter(([, s]) => s === "ok").length;
    const unreachableCount = results.filter(([, s]) => s === "unreachable").length;
    return {
      checked: urls.length,
      ok: okCount,
      unreachable: unreachableCount,
      okRate: okCount / urls.length,
    };
  },
);
