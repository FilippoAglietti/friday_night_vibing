# Syllabi (syllabi.online) — Repo Conventions

> Claude in the Syllabi repo. Audience: Gianmarco + Filippo (collaborator).
> Strategy lives in Notion; this file is operational.

## READ FIRST

**Notion context page:** https://www.notion.so/34315a619d1f81c79fd1cce8deaeef54

Always fetch this first on every Syllabi session — it carries current state, branch context, decisions, the Tier-2 / Haiku-override situation, and export-v2 status. If this file ever drifts from the Notion page, trust Notion.

## Where things live

- **Code:** this repo (`~/Projects/syllabi.online/`).
- **In-repo specs/plans:** `docs/superpowers/{specs,plans}/` — feature-scoped, lives next to the code that implements them.
- **Cross-venture specs/plans:** `~/Documents/Cortex/{specs,plans}/` — architecture work that spans repos (e.g. `2026-04-25-knowledge-architecture-design.md`).
- **Strategy + decisions:** Notion (see READ FIRST). Don't restate strategy in this repo.

## Conventions

- **Workshop conventions** (commit style, scratch handling, recall semantic memory) live once in `~/Documents/Cortex/CLAUDE.md` — defer there rather than duplicating.
- **Notion publishing rule:** every spec or plan in `docs/superpowers/` must be mirrored to Notion under the Syllabi parent page so Filippo can review.

## Operational notes (this repo's quirks)

<!-- BEGIN:nextjs-agent-rules -->
### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

### Deployment topology

Frontend + user-facing API routes run on Vercel. The Inngest background worker (`src/app/api/inngest/route.ts` + `src/lib/inngest/*`) runs on Google Cloud Run — NOT on Vercel — because Vercel's 300s function cap kills long Claude generations. See `docs/cloud-run.md` before touching anything Inngest-related or adding a new background workflow.

When changing env vars, note that `NEXT_PUBLIC_*` values are inlined by Next.js at build time (even in server code), so the Cloud Run Dockerfile bakes them in during the `builder` stage. Non-public secrets are injected at runtime via Secret Manager.

### Export v2 (Phase 1 shipped 2026-04-23)

The export pipeline is being rebuilt. Legacy jsPDF lives at `src/lib/pdf/generatePDF.ts` and is marked deprecated. The new pipeline lives at `src/lib/export/*` and `src/components/export/*` and renders React → HTML → Playwright PDF. Short courses render sync on Vercel via `@sparticuz/chromium`; masterclass-length courses dispatch `course/export.requested` to Inngest on Cloud Run. Bucket: `exports` (private, per-user RLS). Feature flag: `EXPORT_V2_ENABLED=true` (server) and `NEXT_PUBLIC_EXPORT_V2_ENABLED=true` (client).

If you touch the export layer, read:
- `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` (spec)
- `docs/superpowers/plans/2026-04-23-premium-export-phase-1-foundation.md` (this phase's plan)

## Current state (volatile — verify against Notion)

- **Anthropic tier:** Tier 2 (Sonnet OTPM ≥32k). Stale docs may still say "pending"; ignore them.
- **Generation model override:** Cloud Run env `GENERATION_MODEL=claude-haiku-4-5-20251001` — emergency override 2026-04-20 because the Sonnet alias broke prefill. Revert only after pinning a Sonnet snapshot.
- **Stripe + Vercel access:** Gianmarco only has Sandbox Stripe + own Vercel team. Live Stripe (`acct_1TFx2k3kBvceiBKL`) and the `filippoaglietti/syllabi.ai` Vercel project = Filippo-gated. Verify the access map BEFORE proposing fixes that touch them.
