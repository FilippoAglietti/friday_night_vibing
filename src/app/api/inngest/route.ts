/**
 * src/app/api/inngest/route.ts
 * ─────────────────────────────────────────────────────────────
 * Inngest HTTP endpoint.
 *
 * This is the single URL that Inngest calls to introspect our
 * functions and to invoke them when events fire. The `serve()`
 * helper from the Inngest SDK wires up three HTTP methods:
 *
 *   PUT  /api/inngest — Inngest SDK introspection. Called by
 *                        Inngest when our app first boots, to
 *                        discover which functions exist. This
 *                        is how app.inngest.com ends up showing
 *                        the syllabi-ai app and its 3 functions
 *                        in the dashboard.
 *
 *   POST /api/inngest — Inngest runs a step. Body is a signed
 *                        payload. Signature verification uses
 *                        INNGEST_SIGNING_KEY.
 *
 *   GET  /api/inngest — Health check / landing page, shows the
 *                        list of registered functions. Safe to
 *                        open in a browser for a quick sanity
 *                        check after deploy.
 *
 * Env vars:
 *   • INNGEST_EVENT_KEY  — NOT needed here (only `send()` uses it)
 *   • INNGEST_SIGNING_KEY — required for POST request verification
 *
 * maxDuration: 300 because this route ultimately runs our Claude
 * calls (via the module.generate function). Each module needs up
 * to ~180s for Claude + margin for DB writes. This matches the
 * existing /api/generate cap so Vercel enforces the same limit
 * on both paths.
 * ─────────────────────────────────────────────────────────────
 */

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { inngestFunctions } from "@/lib/inngest/functions";

// Vercel serverless function limit. The module.generate function
// holds a single Claude stream that can run up to ~180s, so we
// need headroom above that. 300s matches /api/generate and is the
// max allowed on Vercel Pro.
export const maxDuration = 300;

// Force dynamic because Inngest signatures are per-request.
export const dynamic = "force-dynamic";

// Wire up the three HTTP methods. `serve()` returns an object with
// GET/POST/PUT handlers, which Next.js App Router picks up via
// named exports.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
