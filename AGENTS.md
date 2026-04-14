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
