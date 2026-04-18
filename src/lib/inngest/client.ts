/**
 * src/lib/inngest/client.ts
 * ─────────────────────────────────────────────────────────────
 * Inngest client singleton.
 *
 * Why Inngest: Vercel serverless functions cap at 300s per
 * invocation, which was the hard wall we kept hitting in Tentativi
 * 5-13 (masterclass generation needs ~200-300s and kept flirting
 * with the ceiling). Inngest lets us break a single long-running
 * generation into durable steps that run on Inngest's infrastructure
 * — each step is its own Vercel function call, so the 300s cap
 * applies per-step instead of per-course. A 10-module masterclass
 * becomes ~12 independent step invocations: 1 skeleton + 10 modules
 * + 1 finalize. Each step is well under 300s with room to spare.
 *
 * We ship events to Inngest via the `.send()` method below from
 * /api/generate. Inngest then invokes our function handlers at
 * /api/inngest (registered via `serve()` from the SDK). Retries,
 * concurrency, and deduplication are handled by Inngest's runtime.
 *
 * Env vars (set in Vercel → Environment Variables):
 *   • INNGEST_EVENT_KEY   — used by send() to auth with Inngest
 *   • INNGEST_SIGNING_KEY — used by serve() to verify requests from
 *                            Inngest back to our /api/inngest route
 *
 * The client itself only needs INNGEST_EVENT_KEY (the signing key
 * is read by the serve handler, not here). Both are loaded from
 * process.env by the SDK automatically — we only pass an `id`.
 * ─────────────────────────────────────────────────────────────
 */

import { Inngest, EventSchemas } from "inngest";

/**
 * Event type definitions. We use EventSchemas so TypeScript gives
 * us autocomplete on event names AND data payloads at both the
 * send site (/api/generate) and the handler site (inngest/functions.ts).
 *
 * Every event name is namespaced with `<domain>/<action>` so we
 * can wildcard-route in the future if we add audio, export, or
 * other async workloads.
 */
type CourseGenerateRequestedData = {
  // The course row ID. The skeleton phase will populate
  // courses.curriculum from this, then fan out per-module events.
  courseId: string;
  // The validated generation request (topic, audience, length, etc).
  // Passed through as the payload so the Inngest function doesn't
  // have to re-fetch it from the DB. Shape mirrors GenerateRequest.
  request: unknown;
  // The authenticated user ID, for audit/cost attribution. Optional
  // so anon-allowed development setups still work.
  userId?: string | null;
};

type ModuleGenerateRequestedData = {
  courseId: string;
  // 0-based module index in the skeleton.modules array.
  moduleIndex: number;
  // Human-readable module ID ("mod-1") from the skeleton.
  moduleId: string;
  // The original validated request — needed to build the per-module
  // detail prompt (language, teachingStyle, etc).
  request: unknown;
  // The skeleton's title and description so the per-module prompt
  // can reference them for cohesion.
  skeletonTitle: string;
  skeletonDescription: string;
  // The skeleton module object (id, title, description, lessons[]
  // stubs). Used by buildModuleDetailCurriculumPrompt.
  skeletonModule: unknown;
  // Total modules in the skeleton, so the prompt can say "module 3
  // of 10" for better cross-module consistency.
  totalModules: number;
};

type CourseFinalizeRequestedData = {
  courseId: string;
};

type CourseValidateRequestedData = {
  courseId: string;
};

/**
 * Inngest event map. Keys are event names, values are payload shapes.
 * Adding a new event means adding a key here and a function handler
 * in inngest/functions.ts — the type system will light up at the
 * send call site until both are wired.
 */
type Events = {
  "course/generate.requested": { data: CourseGenerateRequestedData };
  "module/generate.requested": { data: ModuleGenerateRequestedData };
  "course/finalize.requested": { data: CourseFinalizeRequestedData };
  "course/validate.requested": { data: CourseValidateRequestedData };
  "course/body-unlock.requested": {
    data: { courseId: string; userId: string };
  };
  "course/polish.requested": {
    data: { courseId: string };
  };
};

/**
 * The singleton client. `id` must be stable across deploys — it's
 * what Inngest uses to group functions under a single app in the
 * dashboard. Don't rename it without updating the Inngest dashboard.
 */
export const inngest = new Inngest({
  id: "syllabi-ai",
  schemas: new EventSchemas().fromRecord<Events>(),
});
