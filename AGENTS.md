<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment topology

Frontend + user-facing API routes run on Vercel. The Inngest background worker
(`src/app/api/inngest/route.ts` + `src/lib/inngest/*`) runs on Google Cloud Run
— NOT on Vercel — because Vercel's 300s function cap kills long Claude
generations. See `docs/cloud-run.md` before touching anything Inngest-related
or adding a new background workflow.

When changing env vars, note that `NEXT_PUBLIC_*` values are inlined by Next.js
at build time (even in server code), so the Cloud Run Dockerfile bakes them in
during the `builder` stage. Non-public secrets are injected at runtime via
Secret Manager.

# Export v2 (Phase 1 shipped 2026-04-23)

The export pipeline is being rebuilt. Legacy jsPDF lives at `src/lib/pdf/generatePDF.ts`
and is marked deprecated. The new pipeline lives at `src/lib/export/*` and
`src/components/export/*` and renders React → HTML → Playwright PDF. Short
courses render sync on Vercel via `@sparticuz/chromium`; masterclass-length
courses dispatch `course/export.requested` to Inngest on Cloud Run. Bucket:
`exports` (private, per-user RLS). Feature flag: `EXPORT_V2_ENABLED=true`
(server) and `NEXT_PUBLIC_EXPORT_V2_ENABLED=true` (client).

If you touch the export layer, read:
- `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` (spec)
- `docs/superpowers/plans/2026-04-23-premium-export-phase-1-foundation.md` (this phase's plan)
