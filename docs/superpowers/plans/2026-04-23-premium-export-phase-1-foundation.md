# Premium Export — Phase 1: Foundation + Shared Core PDF

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 1,746-line procedural jsPDF generator with an HTML→Playwright PDF pipeline rendering a shared "Handbook Core" design (6 components, no dialect features yet). Ships behind `EXPORT_V2_ENABLED` flag with jsPDF kept as fallback.

**Architecture:** React components render server-side to HTML → Chromium (Playwright) converts HTML to PDF → uploaded to Supabase Storage → signed URL returned. Short courses render sync on Vercel with serverless Chromium (`@sparticuz/chromium`); masterclass-length courses dispatch `course/export.requested` on Inngest and render on Cloud Run with full Chromium from the reworked Dockerfile.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Playwright 1.48+, `@sparticuz/chromium` for Vercel, Inngest (existing), Supabase Storage (new bucket), Cloud Run (existing service — Dockerfile reworked), feature flag via env var.

**Depends on:** None. This is the first phase.
**Parent spec:** `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` (commit `396b36e`).

---

## Scope

**In this phase:**
- Dependency install + Dockerfile rework for Chromium
- Supabase Storage bucket for exports
- Shared Core component library (6 components + assembly) — no dialect features
- Server-side React → HTML SSR + Playwright PDF render
- `/api/export/pdf` sync endpoint (Vercel, short courses)
- Inngest `course/export.requested` async flow (Cloud Run, masterclass)
- Polling endpoint for async result
- Client wiring behind feature flag
- Visual regression harness
- jsPDF deprecated (file kept, no longer invoked from client)

**Not in this phase** (future phases):
- Web Share / `/course/[id]` rewrite (Phase 2)
- SCORM bundle rewrite (Phase 2)
- 4 dialects + `Citation` type + prompt updates (Phase 3)
- Marp slides + secondary format refresh (Phase 4)
- Personalisation UI, branding upload, migration 018 (Phase 5)

**Key product constraint (§7 of spec):** Zero Syllabi branding on any generated artifact. Cover, footer, PDF metadata, SCORM manifest — all creator-only or blank. This phase bakes it in.

---

## File structure — what will exist when Phase 1 is done

```
package.json                                [modified — add playwright, @sparticuz/chromium]
Dockerfile                                  [rewritten — switch to debian base + Chromium]
docs/cloud-run.md                           [modified — Playwright + concurrency note]
AGENTS.md                                   [modified — export v2 pipeline note]

supabase/migrations/018b_export_storage.sql  [NEW — storage bucket + RLS policies only; personalisation columns land in Phase 5]

src/lib/export/
├── index.ts                                [NEW — public surface]
├── renderHtml.ts                           [NEW — React SSR → HTML string]
├── renderPdf.ts                            [NEW — HTML → PDF via Playwright (Cloud Run) or @sparticuz/chromium (Vercel)]
├── branding.ts                             [NEW — profile → branding tokens; Syllabi-free fallback]
├── decideExportPath.ts                     [NEW — sync vs async heuristic based on page count estimate]
├── uploadToBucket.ts                       [NEW — Supabase Storage upload + signed URL]
└── __tests__/
    ├── branding.test.ts
    ├── decideExportPath.test.ts
    └── renderPdf.integration.test.ts

src/components/export/
├── index.ts                                [NEW]
├── CourseDocument.tsx                      [NEW — assembles the full document in page order]
├── Core/
│   ├── Cover.tsx                           [NEW]
│   ├── TableOfContents.tsx                 [NEW]
│   ├── ModuleOpener.tsx                    [NEW]
│   ├── LessonPage.tsx                      [NEW — core variant, no dialect features]
│   ├── QuizBlock.tsx                       [NEW]
│   └── Certificate.tsx                     [NEW]
├── branding/
│   └── CreatorIdentity.tsx                 [NEW — renders name/logo/hero slot; zero Syllabi fallback]
├── page-css/
│   ├── tokens.css                          [NEW — design tokens as CSS vars]
│   ├── handbook-core.css                   [NEW — grid, typography, spacing]
│   └── print.css                           [NEW — @page rules, running header/footer, page breaks]
└── __tests__/
    ├── Cover.test.tsx
    ├── TableOfContents.test.tsx
    ├── ModuleOpener.test.tsx
    ├── LessonPage.test.tsx
    ├── QuizBlock.test.tsx
    ├── Certificate.test.tsx
    └── CourseDocument.test.tsx

src/app/api/export/pdf/
├── route.ts                                [NEW — POST: sync Vercel OR dispatch to Inngest]
└── status/[courseId]/
    └── route.ts                            [NEW — GET: polling endpoint for async result]

src/lib/inngest/
├── client.ts                               [modified — add course/export.requested event schema]
└── functions.ts                            [modified — add courseExport function]

src/lib/flags.ts                            [NEW — typed feature flag reader]

src/lib/pdf/generatePDF.ts                  [UNCHANGED — kept as fallback, client call-site no longer invokes when flag is on]

src/components/dashboard/ExportTile.tsx     [modified — route PDF clicks through flag check]
src/components/dashboard/ExportGrid.tsx     [modified — pass flag state to ExportTile if needed]

tests/visual/
├── regression-harness.ts                   [NEW — renders a fixture course to PDF, diffs screenshots of each page]
├── baselines/                              [NEW — golden PNGs for 12-course regression suite]
└── fixtures/                               [NEW — JSON fixtures for 12 courses]

docs/superpowers/plans/
└── 2026-04-23-premium-export-phase-1-foundation.md  [this file]
```

---

## Task 0 · Setup worktree, branch, and orient

**Files:** none yet — this task prepares the workspace.

- [ ] **Step 1: Create a worktree for Phase 1 work**

From `/Users/gianmarcopaglierani/Projects/syllabi.online`:

```bash
git worktree add ../syllabi.online-export-v2-phase-1 -b feat/export-v2-phase-1
cd ../syllabi.online-export-v2-phase-1
```

Work in the worktree from this point on. The main checkout keeps any other work untouched.

- [ ] **Step 2: Read the spec and the Notion context doc**

Read, in order:
1. `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` — **the spec** (~360 lines)
2. `docs/cloud-run.md` — **Cloud Run deployment details**
3. `AGENTS.md` — **repo guardrails**
4. `src/lib/pdf/generatePDF.ts` lines 1–120 — **what the current PDF looks like conceptually** (we're replacing it; know what it does)
5. `src/types/curriculum.ts` — **the content contract** (don't modify in this phase)

Do NOT read the whole `generatePDF.ts` (1,746 lines of procedural code). The *output* matters, not the internals. The goal is to produce a better output; we're not porting logic.

- [ ] **Step 3: Verify Cloud Run access**

```bash
gcloud auth list
gcloud config get-value project
# expected: arboreal-inn-493219-t7
```

If not authenticated, tell the user: "I need `gcloud auth login` to deploy the Cloud Run change in Task 2. Please run `! gcloud auth login` in this session."

- [ ] **Step 4: Confirm pnpm is the active package manager**

```bash
cat package.json | grep -E '"packageManager"|"engines"'
# expected packageManager: pnpm@...
```

Every install in this plan uses `pnpm`, never `npm` or `yarn`.

- [ ] **Step 5: Commit nothing yet — just create the TODO tracker**

No git commit needed. Worktree is clean. Move to Task 1.

---

## Task 1 · Install Playwright and @sparticuz/chromium dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install Playwright as a dependency (not devDep — it runs on the server)**

```bash
pnpm add playwright@^1.48.0
```

Playwright is a runtime dep because Cloud Run renders PDFs in production. Do NOT use `playwright-core` — the full `playwright` package handles the browser binary download lifecycle we need on Cloud Run.

- [ ] **Step 2: Install serverless Chromium for Vercel sync path**

```bash
pnpm add @sparticuz/chromium@^131.0.0 playwright-core@^1.48.0
```

Why both: on Vercel, we use `playwright-core` (no bundled browser) with `@sparticuz/chromium` providing a Lambda-compatible headless Chromium. On Cloud Run, we use full `playwright` with the system-installed Chromium from the Dockerfile. `renderPdf.ts` picks one based on env.

- [ ] **Step 3: Install testing + SSR helpers**

```bash
pnpm add react-dom@^19 && pnpm add -D pixelmatch@^6.0.0 pngjs@^7.0.0
```

- `react-dom/server` ships with React 19 (the repo is on 19 already — this line is defensive for the case where `react-dom` was only a transitive dep).
- `pixelmatch` + `pngjs` are for visual regression diff tests (Task 24).

- [ ] **Step 4: Verify install and types resolve**

```bash
pnpm typecheck
```

Expected: no new errors from these packages. If Playwright's ambient types conflict with existing Cypress/Jest types, add `"skipLibCheck": true` (it should already be on in `tsconfig.json` — verify).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(export): add playwright + @sparticuz/chromium deps for PDF pipeline"
```

---

## Task 2 · Rework the Cloud Run Dockerfile for Chromium support

**Files:**
- Modify: `Dockerfile` (full rewrite)
- Modify: `docs/cloud-run.md` (install + concurrency notes)

**Context:** The current Dockerfile is Alpine + Node 20, which cannot run Chromium without a lot of Alpine-specific Chromium packages that are fragile. We switch to Debian slim (`node:20-bookworm-slim`) and install Chromium + the fonts we need. Image size goes up (~500 MB) but it is stable, and this is the same base Playwright officially supports.

- [ ] **Step 1: Replace the Dockerfile**

Write this exact content to `Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-bookworm-slim

# ─── deps stage ────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ─── builder stage ─────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdteHNldXR0cHVybnhibHV2Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDUwODAsImV4cCI6MjA5MDIyMTA4MH0.xJ23Mr1hJ5F2vPnJOPDiJxtFkBqXtAko1dD02NNlris
ENV NEXT_PUBLIC_APP_URL=https://www.syllabi.online
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role
ENV SUPABASE_URL=https://gmxseuttpurnxbluvcwx.supabase.co
ENV SUPABASE_ANON_KEY=placeholder_anon_key
ENV ANTHROPIC_API_KEY=placeholder
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV INTERNAL_API_SECRET=placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# ─── runner stage ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Chromium runtime deps + fonts covering our 16 locales (incl. CJK, Arabic, Cyrillic)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-noto-extra \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    wget \
  && rm -rf /var/lib/apt/lists/*

# Install Playwright's bundled Chromium into /ms-playwright (deterministic path)
RUN corepack enable pnpm && pnpm dlx playwright@1.48.0 install chromium --with-deps

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# Ensure the nextjs user can read the Chromium install
RUN chown -R nextjs:nodejs /ms-playwright

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
```

Key differences from the current Dockerfile:
- `node:20-alpine` → `node:20-bookworm-slim` (Debian base)
- Added `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` env var
- Added Chromium runtime libs + Noto fonts for all 16 locales (inc. CJK, Arabic)
- `playwright install chromium --with-deps` pulls the exact Chromium version Playwright 1.48 is tested against
- The `apk add libc6-compat` line is removed (Debian, not Alpine)

- [ ] **Step 2: Test the build locally if Docker is available, otherwise skip to deploy**

```bash
docker build -t syllabi-worker:test .
```

Expected: build succeeds. Build time ~5 min (cold) / ~2 min (warm).

If Docker is not available locally, skip to step 3.

- [ ] **Step 3: Deploy the new image to Cloud Run and lower concurrency**

Chromium is memory-heavy. Each active render uses ~400 MB. With the current 2 GiB RAM, concurrency must drop from 10 → 2.

```bash
./deploy/cloud-run.sh
# then:
gcloud run services update inngest-worker \
  --region=europe-west8 \
  --concurrency=2 \
  --memory=4Gi
```

We also bump memory from 2 GiB → 4 GiB so masterclass-length PDFs (60–120 pages) have headroom.

Expected output: `Service [inngest-worker] revision [inngest-worker-NNNNN-xxx] has been deployed and is serving 100 percent of traffic.`

- [ ] **Step 4: Verify Chromium runs inside the container**

```bash
gcloud run services proxy inngest-worker --region=europe-west8 &
# in another terminal:
curl http://localhost:8080/api/healthz
```

If there's no `/api/healthz` route yet, skip. Actual verification will happen in Task 17 when we first render a PDF. If the Dockerfile has a problem, Cloud Run boot will fail and `gcloud run services describe` will show the error.

- [ ] **Step 5: Update `docs/cloud-run.md`**

Append a new section to `docs/cloud-run.md`:

```markdown
## Chromium (added 2026-04-23 for export v2)

The runner stage of the Dockerfile installs Chromium via Playwright, stored at
`/ms-playwright`. This is what the new export pipeline (`src/lib/export/renderPdf.ts`)
uses to render React → PDF on the Inngest worker.

**Concurrency:** the Cloud Run service is set to `--concurrency=2` because
each active PDF render uses ~400 MB of memory.

**Memory:** bumped to 4 GiB for masterclass-length PDFs (60–120 pages).

**Font coverage:** Noto family installed for all 16 languages including CJK,
Arabic (RTL), and emoji. If a new locale is added later, check its script
is covered and add the matching `fonts-noto-*` package.

**If PDF renders are failing with "browser not found":** the Playwright
version in `package.json` must match the version installed in the Dockerfile
(`RUN pnpm dlx playwright@X.X.X install chromium`). Keep them in lockstep.
```

- [ ] **Step 6: Commit**

```bash
git add Dockerfile docs/cloud-run.md
git commit -m "feat(infra): rework Dockerfile to support Chromium for PDF rendering

Switch base image from node:20-alpine to node:20-bookworm-slim so Playwright's
Chromium can run. Install Noto fonts for all 16 locales. Cloud Run concurrency
drops from 10 to 2 and memory bumps from 2Gi to 4Gi — Chromium is memory-heavy.

Documents the new config in docs/cloud-run.md."
```

---

## Task 3 · Supabase Storage bucket for exports

**Files:**
- Create: `supabase/migrations/018b_export_storage.sql`

**Context:** Generated PDFs need somewhere to live that gives us signed-URL delivery and RLS protection. Supabase Storage bucket `exports`, scoped per user. Phase 5 will add personalisation *columns* on `profiles`; this phase only creates the bucket and policies.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/018b_export_storage.sql
-- Phase 1 of export v2: storage bucket for generated PDFs (and later SCORM zips, Marp decks).

insert into storage.buckets (id, name, public)
  values ('exports', 'exports', false)
  on conflict (id) do nothing;

-- Only the course owner can read/write their own exports.
-- Path convention: exports/<user_id>/<course_id>/<hash>.<ext>
create policy "exports_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exports_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exports_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role always has access (bypasses RLS) — used by Inngest worker.
-- No explicit policy needed for service_role.
```

- [ ] **Step 2: Apply migration locally and to prod**

```bash
# Against prod Supabase (project gmxseuttpurnxbluvcwx)
supabase db push
```

Expected: `Applying migration 018b_export_storage.sql...` followed by `Finished supabase db push.`

- [ ] **Step 3: Verify the bucket exists**

```bash
supabase storage ls exports --project-ref gmxseuttpurnxbluvcwx 2>&1 | head -5
```

Expected: empty listing (bucket exists, no objects).

If `supabase` CLI rejects that command, verify via the Supabase dashboard: **Storage** → should see `exports` bucket listed.

- [ ] **Step 4: Regenerate types (no new tables, but confirm regen works)**

```bash
npx supabase gen types typescript --project-id gmxseuttpurnxbluvcwx > src/types/database.types.ts
```

Expected: file is rewritten with identical (or near-identical) content. No new tables, so the diff should be minimal or none.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/018b_export_storage.sql src/types/database.types.ts
git commit -m "feat(storage): add exports bucket with owner-scoped RLS

Bucket 'exports' stores generated PDFs (and later SCORM/Marp). Path convention
exports/<user_id>/<course_id>/<hash>.<ext>. Only the course owner can read/write
their own objects. Service role bypasses RLS for the Inngest worker."
```

---

## Task 4 · Feature flag wiring (`EXPORT_V2_ENABLED`)

**Files:**
- Create: `src/lib/flags.ts`
- Create: `src/lib/__tests__/flags.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/__tests__/flags.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isExportV2Enabled } from "../flags";

describe("isExportV2Enabled", () => {
  const original = process.env.EXPORT_V2_ENABLED;
  afterEach(() => {
    if (original === undefined) delete process.env.EXPORT_V2_ENABLED;
    else process.env.EXPORT_V2_ENABLED = original;
  });

  it("is false when env var is unset", () => {
    delete process.env.EXPORT_V2_ENABLED;
    expect(isExportV2Enabled()).toBe(false);
  });

  it("is true only when env var is exactly 'true'", () => {
    process.env.EXPORT_V2_ENABLED = "true";
    expect(isExportV2Enabled()).toBe(true);
  });

  it("is false for other truthy-looking values", () => {
    for (const v of ["1", "yes", "True", "TRUE", " true"]) {
      process.env.EXPORT_V2_ENABLED = v;
      expect(isExportV2Enabled()).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
pnpm vitest run src/lib/__tests__/flags.test.ts
```

Expected: FAIL — `Cannot find module '../flags'`.

- [ ] **Step 3: Implement**

`src/lib/flags.ts`:

```typescript
/**
 * Feature flags — read from env vars at call time.
 *
 * Why a dedicated reader: env var checks are easy to typo and hard to grep.
 * Keep them in one module with named exports so feature flags have a single
 * source of truth the entire app reads.
 *
 * Export v2 flag toggles the new HTML → Playwright → PDF pipeline. Default
 * OFF; the old jsPDF path stays active until we explicitly turn it on in
 * Vercel + Cloud Run env.
 */
export function isExportV2Enabled(): boolean {
  return process.env.EXPORT_V2_ENABLED === "true";
}
```

Strict `=== "true"` (not `!!` or truthy check) because env vars are strings and we want a deliberate enable, not a typo like `EXPORT_V2_ENABLED=1` sneaking through.

- [ ] **Step 4: Run the test, confirm it passes**

```bash
pnpm vitest run src/lib/__tests__/flags.test.ts
```

Expected: 3/3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flags.ts src/lib/__tests__/flags.test.ts
git commit -m "feat(export): add EXPORT_V2_ENABLED feature flag"
```

---

## Task 5 · Scaffold export directories + index files

**Files:**
- Create: `src/lib/export/index.ts`
- Create: `src/lib/export/__tests__/.gitkeep`
- Create: `src/components/export/index.ts`
- Create: `src/components/export/Core/index.ts`
- Create: `src/components/export/branding/index.ts`
- Create: `src/components/export/page-css/.gitkeep`
- Create: `src/components/export/__tests__/.gitkeep`

- [ ] **Step 1: Create directory structure with placeholder index files**

```bash
mkdir -p src/lib/export/__tests__
mkdir -p src/components/export/Core
mkdir -p src/components/export/branding
mkdir -p src/components/export/page-css
mkdir -p src/components/export/__tests__
mkdir -p src/app/api/export/pdf/status/\[courseId\]
mkdir -p tests/visual/baselines
mkdir -p tests/visual/fixtures
touch src/lib/export/__tests__/.gitkeep
touch src/components/export/page-css/.gitkeep
touch src/components/export/__tests__/.gitkeep
```

- [ ] **Step 2: Write library public surface**

`src/lib/export/index.ts`:

```typescript
/**
 * Export pipeline — public surface.
 *
 * Phase 1 ships PDF rendering only. Phase 2 adds web share + SCORM re-use.
 * Phase 3 adds dialect components. Phase 4 adds Marp + secondary format refresh.
 * Phase 5 adds personalisation + upload pipeline.
 */
export { renderHtml } from "./renderHtml";
export { renderPdf } from "./renderPdf";
export { uploadToBucket } from "./uploadToBucket";
export { decideExportPath } from "./decideExportPath";
export { resolveBranding } from "./branding";
```

This file is a stub — each import will be filled in as later tasks add the module. TypeScript will complain until Task 17. That's fine; the file is small and the compile fix is a one-line import once the target exists.

- [ ] **Step 3: Write component library index**

`src/components/export/index.ts`:

```typescript
export { CourseDocument } from "./CourseDocument";
export { Cover } from "./Core/Cover";
export { TableOfContents } from "./Core/TableOfContents";
export { ModuleOpener } from "./Core/ModuleOpener";
export { LessonPage } from "./Core/LessonPage";
export { QuizBlock } from "./Core/QuizBlock";
export { Certificate } from "./Core/Certificate";
export { CreatorIdentity } from "./branding/CreatorIdentity";
```

`src/components/export/Core/index.ts`:

```typescript
export { Cover } from "./Cover";
export { TableOfContents } from "./TableOfContents";
export { ModuleOpener } from "./ModuleOpener";
export { LessonPage } from "./LessonPage";
export { QuizBlock } from "./QuizBlock";
export { Certificate } from "./Certificate";
```

`src/components/export/branding/index.ts`:

```typescript
export { CreatorIdentity } from "./CreatorIdentity";
```

- [ ] **Step 4: Typecheck (expected to fail — that's fine)**

```bash
pnpm typecheck
```

Expected: fails with a cluster of `Cannot find module './renderHtml'`-style errors. These clear as we fill each file in later tasks. Do NOT patch TypeScript to ignore them; we want the compile errors as a to-do list.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export src/components/export src/app/api/export tests/visual
git commit -m "chore(export): scaffold src/lib/export + src/components/export directories

Placeholder index files that re-export from modules added in later tasks.
Typecheck will fail until Task 17 completes the dependency chain."
```

---

## Task 6 · Design tokens CSS (`tokens.css`)

**Files:**
- Create: `src/components/export/page-css/tokens.css`

- [ ] **Step 1: Write the design tokens file**

`src/components/export/page-css/tokens.css`:

```css
/* ─────────────────────────────────────────────
 * Syllabi export — design tokens
 *
 * Single source of truth for spacing, typography, and color in every
 * export artifact. Imported by handbook-core.css and dialect CSS files.
 *
 * Naming mirrors Tailwind where possible (spacing rhythm, color scale)
 * so devs can read these and the web UI in one mental model.
 * ───────────────────────────────────────────── */

:root {
  /* ── Spacing rhythm (4px base, 8/12/16/24/32/48/64) ── */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-12: 48px;
  --sp-16: 64px;

  /* ── Typography ── */
  --ff-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ff-serif: "Source Serif 4", "Iowan Old Style", Georgia, serif;
  --ff-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;

  --fs-micro: 9pt;
  --fs-xs: 10pt;
  --fs-sm: 11pt;
  --fs-body: 12pt;
  --fs-lg: 14pt;
  --fs-h3: 16pt;
  --fs-h2: 22pt;
  --fs-h1: 30pt;
  --fs-display: 48pt;

  --lh-tight: 1.15;
  --lh-normal: 1.5;
  --lh-loose: 1.7;

  /* ── Colors — neutral core (unchanged across dialects) ── */
  --c-ink: #0f172a;       /* primary body text */
  --c-ink-sec: #334155;   /* secondary text */
  --c-ink-muted: #64748b; /* captions, page numbers */
  --c-paper: #ffffff;     /* page background */
  --c-paper-alt: #f8fafc; /* callout backgrounds */
  --c-rule: #e2e8f0;      /* hairlines */
  --c-rule-strong: #cbd5e1;

  /* ── Accent — dialect-specific; Core uses handbook violet default ── */
  --c-accent: #6366f1;       /* indigo-500 */
  --c-accent-ink: #ffffff;
  --c-accent-soft: #eef2ff;
  --c-accent-rule: #c7d2fe;

  /* ── Grid ── */
  --grid-cols: 12;
  --grid-gutter: var(--sp-4);
  --content-width: 166mm; /* A4 (210mm) minus 22mm outer margins */

  /* ── Page ── */
  --page-width: 210mm;
  --page-height: 297mm;
  --page-margin-outer: 22mm;
  --page-margin-inner: 24mm;
}
```

- [ ] **Step 2: Verify file was written correctly**

```bash
wc -l src/components/export/page-css/tokens.css
# expected: 58 or similar
grep -c '^  --' src/components/export/page-css/tokens.css
# expected: 30+ (all CSS custom properties)
```

- [ ] **Step 3: Commit**

```bash
git add src/components/export/page-css/tokens.css
git commit -m "feat(export): add design tokens (spacing, typography, color, grid)"
```

---

## Task 7 · Handbook core + print CSS

**Files:**
- Create: `src/components/export/page-css/handbook-core.css`
- Create: `src/components/export/page-css/print.css`

- [ ] **Step 1: Write the core layout CSS**

`src/components/export/page-css/handbook-core.css`:

```css
/* ─────────────────────────────────────────────
 * Handbook core — shared across all four dialects.
 * Typography scale, grid, heading rhythm, callouts, running elements.
 * Dialects add components on top; they do not override these rules.
 * ───────────────────────────────────────────── */

@import "./tokens.css";

html, body {
  margin: 0;
  padding: 0;
  font-family: var(--ff-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-normal);
  color: var(--c-ink);
  background: var(--c-paper);
  /* Ensure web (preview) view respects the page width */
  max-width: var(--page-width);
}

/* ── Typography ─────────────────────────────── */

h1 {
  font-size: var(--fs-h1);
  line-height: var(--lh-tight);
  margin: 0 0 var(--sp-4);
  font-weight: 700;
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin: var(--sp-12) 0 var(--sp-3);
  font-weight: 700;
  letter-spacing: -0.015em;
}

h3 {
  font-size: var(--fs-h3);
  line-height: var(--lh-tight);
  margin: var(--sp-6) 0 var(--sp-2);
  font-weight: 600;
}

p {
  margin: 0 0 var(--sp-4);
  max-width: 68ch;
}

a {
  color: var(--c-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

/* ── Callouts — used by Core and dialects alike ─ */

.callout {
  background: var(--c-paper-alt);
  border-left: 3px solid var(--c-accent);
  padding: var(--sp-3) var(--sp-4);
  margin: var(--sp-4) 0;
  border-radius: 0 4px 4px 0;
  break-inside: avoid;
}

.callout-label {
  font-size: var(--fs-micro);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin-bottom: var(--sp-1);
}

/* ── Grid helpers — used by module/lesson layouts ─ */

.page {
  width: var(--content-width);
  margin: 0 auto;
  padding-top: var(--sp-8);
  padding-bottom: var(--sp-8);
}

.page-grid-12 {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  gap: var(--grid-gutter);
}

.span-main  { grid-column: 1 / span 8; }
.span-side  { grid-column: 9 / span 4; }
.span-full  { grid-column: 1 / -1; }

/* ── Code blocks — hero treatment in hands-on later, baseline here ─ */

code, pre {
  font-family: var(--ff-mono);
  font-size: var(--fs-sm);
}

pre {
  background: var(--c-ink);
  color: var(--c-paper);
  padding: var(--sp-4);
  border-radius: 6px;
  overflow-x: auto;
  break-inside: avoid;
}
```

- [ ] **Step 2: Write the print CSS**

`src/components/export/page-css/print.css`:

```css
/* ─────────────────────────────────────────────
 * Print rules for PDF export.
 * Applied only when Playwright renders with emulateMedia("print").
 * Web share view does NOT import this file (it keeps the web viewport).
 * ───────────────────────────────────────────── */

@page {
  size: A4;
  margin: var(--page-margin-outer);
  /* Running header left — creator name when set, blank otherwise (NO Syllabi) */
  @top-left {
    content: string(creator-name);
    font-family: var(--ff-sans);
    font-size: var(--fs-micro);
    color: var(--c-ink-muted);
  }
  /* Running header right — course title */
  @top-right {
    content: string(course-title);
    font-family: var(--ff-sans);
    font-size: var(--fs-micro);
    color: var(--c-ink-muted);
  }
  /* Page numbers only — never "Page X of Y / Syllabi" */
  @bottom-center {
    content: counter(page);
    font-family: var(--ff-sans);
    font-size: var(--fs-micro);
    color: var(--c-ink-muted);
  }
}

/* First page (cover) — no running header/footer */
@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
}

/* Set running element values from hidden strings in the DOM */
.running-creator-name {
  string-set: creator-name content();
  display: none;
}
.running-course-title {
  string-set: course-title content();
  display: none;
}

/* ── Page breaks ──────────────────────────────── */

.page-break-before { break-before: page; }
.page-break-after  { break-after: page; }
.avoid-break       { break-inside: avoid; }

/* Never split headings from their next paragraph */
h1, h2, h3 {
  break-after: avoid;
}

/* Never orphan a module opener */
.module-opener {
  break-before: page;
  break-inside: avoid;
}

/* Certificate occupies its own page */
.certificate {
  break-before: page;
  break-after: page;
}

/* Force table cell content to stay together */
table, tr, td, th {
  break-inside: avoid;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/export/page-css/handbook-core.css src/components/export/page-css/print.css
git commit -m "feat(export): add handbook core + print CSS

Shared typography scale, grid, callout styles, code blocks, and @page rules.
Running header shows creator name + course title — never Syllabi branding."
```

---

## Task 8 · `branding.ts` — profile → tokens (Syllabi-free)

**Files:**
- Create: `src/lib/export/branding.ts`
- Create: `src/lib/export/__tests__/branding.test.ts`

**Context:** Every component reads branding via this helper. Phase 1 only uses `displayName` (from `profiles.full_name`). Logo / accent / hero / footer fields land in Phase 5; the helper returns `null` for them now so component code is Phase-5-ready.

- [ ] **Step 1: Write the failing test**

`src/lib/export/__tests__/branding.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolveBranding } from "../branding";

describe("resolveBranding", () => {
  it("returns a name-only shape when profile is minimal", () => {
    const result = resolveBranding({ full_name: "Maria Rossi" } as never);
    expect(result).toEqual({
      displayName: "Maria Rossi",
      logoUrl: null,
      accent: null,
      heroUrl: null,
      footer: null,
    });
  });

  it("returns null displayName when profile is null", () => {
    const result = resolveBranding(null);
    expect(result).toEqual({
      displayName: null,
      logoUrl: null,
      accent: null,
      heroUrl: null,
      footer: null,
    });
  });

  it("returns null displayName when full_name is empty or whitespace", () => {
    expect(resolveBranding({ full_name: "" } as never).displayName).toBeNull();
    expect(resolveBranding({ full_name: "   " } as never).displayName).toBeNull();
  });

  it("trims display name whitespace", () => {
    expect(resolveBranding({ full_name: "  Maria Rossi  " } as never).displayName)
      .toBe("Maria Rossi");
  });

  it("never contains the string 'Syllabi' anywhere in the output", () => {
    // Hard constraint §7 of the spec.
    const result = resolveBranding({ full_name: "Maria Rossi" } as never);
    const json = JSON.stringify(result);
    expect(json.toLowerCase()).not.toContain("syllabi");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
pnpm vitest run src/lib/export/__tests__/branding.test.ts
```

Expected: module not found.

- [ ] **Step 3: Implement**

`src/lib/export/branding.ts`:

```typescript
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface BrandingTokens {
  displayName: string | null;
  logoUrl: string | null;    // Phase 5 — always null in Phase 1
  accent: string | null;     // Phase 5 — always null in Phase 1
  heroUrl: string | null;    // Phase 5 — always null in Phase 1
  footer: string | null;     // Phase 5 — always null in Phase 1
}

/**
 * Resolve the branding tokens used by export components.
 *
 * Hard constraint (spec §7): never include any Syllabi branding. When a creator
 * has no display name, every field is null and the renderer falls back to
 * title-only covers / blank metadata.
 *
 * Phase 1 reads only `full_name`. Phase 5 extends this helper to read
 * `branding_logo_url`, `branding_accent`, `branding_hero_url`, `branding_footer`
 * once migration 018 adds those columns.
 */
export function resolveBranding(profile: Profile | null): BrandingTokens {
  const raw = profile?.full_name?.trim();
  const displayName = raw && raw.length > 0 ? raw : null;
  return {
    displayName,
    logoUrl: null,
    accent: null,
    heroUrl: null,
    footer: null,
  };
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/lib/export/__tests__/branding.test.ts
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/branding.ts src/lib/export/__tests__/branding.test.ts
git commit -m "feat(export): add resolveBranding helper (Phase 1 name-only, Syllabi-free)"
```

---

## Task 9 · Cover component

**Files:**
- Create: `src/components/export/Core/Cover.tsx`
- Create: `src/components/export/__tests__/Cover.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/Cover.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Cover } from "../Core/Cover";
import type { Curriculum } from "@/types/curriculum";

const fixture: Pick<Curriculum, "title" | "subtitle" | "modules"> & {
  totalHours: number;
  totalLessons: number;
} = {
  title: "Intro to Machine Learning",
  subtitle: "From first principles to a deployed model",
  modules: [],
  totalHours: 20,
  totalLessons: 24,
};

describe("<Cover />", () => {
  it("renders the course title", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html).toContain("Intro to Machine Learning");
  });

  it("renders the creator name when provided", () => {
    const html = renderToString(
      <Cover
        curriculum={fixture as never}
        branding={{ displayName: "Maria Rossi", logoUrl: null, accent: null, heroUrl: null, footer: null }}
        volume={1}
      />
    );
    expect(html).toContain("Maria Rossi");
  });

  it("omits the 'by' byline when creator name is null", () => {
    const html = renderToString(
      <Cover
        curriculum={fixture as never}
        branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
        volume={1}
      />
    );
    expect(html).not.toMatch(/\bby\b/i);
  });

  it("renders course stats (lessons, hours)", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html).toContain("24");
    expect(html).toContain("20");
  });

  it("never contains the string 'Syllabi'", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html.toLowerCase()).not.toContain("syllabi");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
pnpm vitest run src/components/export/__tests__/Cover.test.tsx
```

Expected: module not found.

- [ ] **Step 3: Implement**

`src/components/export/Core/Cover.tsx`:

```tsx
import type { Curriculum } from "@/types/curriculum";
import type { BrandingTokens } from "@/lib/export/branding";

interface CoverProps {
  curriculum: Pick<Curriculum, "title" | "subtitle" | "modules"> & {
    totalHours?: number;
    totalLessons?: number;
  };
  branding: BrandingTokens;
  volume: number;
}

/**
 * Cover — first page of every export.
 *
 * Type-led design. No Syllabi branding. When `branding.displayName` is null
 * the byline is omitted entirely — cover shows course title and stats alone.
 *
 * Masterclass hero image / logo slots are honored in Phase 5 via the
 * `branding.heroUrl` and `branding.logoUrl` fields; in Phase 1 both are null.
 */
export function Cover({ curriculum, branding, volume }: CoverProps) {
  const totalHours = curriculum.totalHours ?? 0;
  const totalLessons =
    curriculum.totalLessons ??
    curriculum.modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0);

  return (
    <section className="cover page-break-after avoid-break"
             style={{
               width: "var(--content-width)",
               minHeight: "calc(var(--page-height) - (2 * var(--page-margin-outer)))",
               margin: "0 auto",
               display: "flex",
               flexDirection: "column",
               justifyContent: "space-between",
               paddingTop: "var(--sp-16)",
               paddingBottom: "var(--sp-12)",
             }}>
      {/* Hidden string-set anchors for @page running headers — spec §7: creator + title only */}
      {branding.displayName && (
        <span className="running-creator-name">{branding.displayName}</span>
      )}
      <span className="running-course-title">{curriculum.title}</span>

      <header>
        <div style={{
          fontSize: "var(--fs-micro)",
          letterSpacing: "0.2em",
          color: "var(--c-ink-muted)",
          textTransform: "uppercase",
        }}>
          Volume {String(volume).padStart(2, "0")}
        </div>
      </header>

      <div>
        <h1 style={{ fontSize: "var(--fs-display)", lineHeight: 1.02, letterSpacing: "-0.025em", marginBottom: "var(--sp-4)" }}>
          {curriculum.title}
        </h1>
        {curriculum.subtitle && (
          <p style={{ fontSize: "var(--fs-lg)", color: "var(--c-ink-sec)", maxWidth: "60ch", marginTop: 0 }}>
            {curriculum.subtitle}
          </p>
        )}
        {branding.displayName && (
          <p style={{ marginTop: "var(--sp-8)", fontSize: "var(--fs-body)", color: "var(--c-ink-sec)" }}>
            by {branding.displayName}
          </p>
        )}
      </div>

      <footer style={{ display: "flex", gap: "var(--sp-8)", fontSize: "var(--fs-micro)", color: "var(--c-ink-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        <span>{totalLessons} lessons</span>
        <span>{totalHours}h</span>
      </footer>
    </section>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/Cover.test.tsx
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/Cover.tsx src/components/export/__tests__/Cover.test.tsx
git commit -m "feat(export): add Cover component (type-led, Syllabi-free)"
```

---

## Task 10 · TableOfContents component

**Files:**
- Create: `src/components/export/Core/TableOfContents.tsx`
- Create: `src/components/export/__tests__/TableOfContents.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/TableOfContents.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { TableOfContents } from "../Core/TableOfContents";
import type { Module } from "@/types/curriculum";

const modules: Module[] = [
  { id: "m1", title: "Foundations", description: "", objectives: [], lessons: [{ id: "l1", title: "Hello World", description: "", format: "reading", durationMinutes: 5, order: 0 }], order: 0, durationMinutes: 5 },
  { id: "m2", title: "Training Models", description: "", objectives: [], lessons: [{ id: "l2", title: "Gradient Descent", description: "", format: "reading", durationMinutes: 12, order: 0 }], order: 1, durationMinutes: 12 },
];

describe("<TableOfContents />", () => {
  it("lists every module title in order", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    const fIdx = html.indexOf("Foundations");
    const tIdx = html.indexOf("Training Models");
    expect(fIdx).toBeGreaterThan(-1);
    expect(tIdx).toBeGreaterThan(-1);
    expect(fIdx).toBeLessThan(tIdx);
  });

  it("numbers modules starting at 01", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    expect(html).toContain("01");
    expect(html).toContain("02");
  });

  it("lists lesson titles nested under their module", () => {
    const html = renderToString(<TableOfContents modules={modules} />);
    expect(html).toContain("Hello World");
    expect(html).toContain("Gradient Descent");
  });

  it("renders nothing extra when modules array is empty", () => {
    const html = renderToString(<TableOfContents modules={[]} />);
    expect(html).toContain("Contents");
    expect(html).not.toContain("undefined");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
pnpm vitest run src/components/export/__tests__/TableOfContents.test.tsx
```

- [ ] **Step 3: Implement**

`src/components/export/Core/TableOfContents.tsx`:

```tsx
import type { Module } from "@/types/curriculum";

interface TableOfContentsProps {
  modules: Module[];
}

/**
 * Table of Contents — second page of every export.
 *
 * Numbered modules with nested lesson titles. Page numbers are filled in
 * at render time by CSS counters (see print.css).
 */
export function TableOfContents({ modules }: TableOfContentsProps) {
  return (
    <section className="toc page-break-after" style={{ paddingTop: "var(--sp-12)" }}>
      <h2 style={{ marginTop: 0 }}>Contents</h2>
      <ol style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {modules.map((module, i) => (
          <li key={module.id} style={{ marginTop: "var(--sp-6)", breakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-3)" }}>
              <span style={{
                fontSize: "var(--fs-micro)",
                fontWeight: 700,
                color: "var(--c-accent)",
                letterSpacing: "0.1em",
                minWidth: "2em",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: "var(--fs-h3)", fontWeight: 600, color: "var(--c-ink)" }}>
                {module.title}
              </span>
            </div>
            {module.lessons?.length > 0 && (
              <ul style={{ listStyle: "none", paddingLeft: "var(--sp-8)", margin: "var(--sp-2) 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} style={{ padding: "2px 0" }}>{lesson.title}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/TableOfContents.test.tsx
```

Expected: 4/4 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/TableOfContents.tsx src/components/export/__tests__/TableOfContents.test.tsx
git commit -m "feat(export): add TableOfContents component"
```

---

## Task 11 · ModuleOpener component

**Files:**
- Create: `src/components/export/Core/ModuleOpener.tsx`
- Create: `src/components/export/__tests__/ModuleOpener.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/ModuleOpener.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ModuleOpener } from "../Core/ModuleOpener";
import type { Module } from "@/types/curriculum";

const module: Module = {
  id: "m1",
  title: "Foundations",
  description: "What a model is and how we train one.",
  objectives: ["Define a model", "Train a linear model", "Evaluate predictions"],
  lessons: [{ id: "l1", title: "Hello", description: "", format: "reading", durationMinutes: 5, order: 0 }],
  order: 0,
  durationMinutes: 5,
};

describe("<ModuleOpener />", () => {
  it("renders the module title and index", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("Foundations");
    expect(html).toContain("01");
  });

  it("renders the module description", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("What a model is");
  });

  it("renders every objective as a list item", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("Define a model");
    expect(html).toContain("Train a linear model");
    expect(html).toContain("Evaluate predictions");
  });

  it("renders duration", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toMatch(/5\s*min/i);
  });

  it("applies module-opener class so print CSS triggers page break", () => {
    const html = renderToString(<ModuleOpener module={module} index={0} />);
    expect(html).toContain("module-opener");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
pnpm vitest run src/components/export/__tests__/ModuleOpener.test.tsx
```

- [ ] **Step 3: Implement**

`src/components/export/Core/ModuleOpener.tsx`:

```tsx
import type { Module } from "@/types/curriculum";

interface ModuleOpenerProps {
  module: Module;
  index: number;
}

/**
 * ModuleOpener — starts each module on a fresh page.
 *
 * The `module-opener` className is consumed by print.css to force
 * `break-before: page` and `break-inside: avoid`.
 */
export function ModuleOpener({ module, index }: ModuleOpenerProps) {
  return (
    <section className="module-opener" style={{ paddingTop: "var(--sp-16)" }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        letterSpacing: "0.2em",
        color: "var(--c-accent)",
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: "var(--sp-3)",
      }}>
        Module {String(index + 1).padStart(2, "0")}
      </div>

      <h2 style={{ fontSize: "var(--fs-h1)", marginTop: 0, marginBottom: "var(--sp-4)" }}>
        {module.title}
      </h2>

      {module.description && (
        <p style={{ fontSize: "var(--fs-lg)", color: "var(--c-ink-sec)", maxWidth: "60ch" }}>
          {module.description}
        </p>
      )}

      {module.objectives.length > 0 && (
        <div style={{ marginTop: "var(--sp-8)" }}>
          <div style={{
            fontSize: "var(--fs-micro)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--c-ink-muted)",
            marginBottom: "var(--sp-3)",
          }}>
            Learning objectives
          </div>
          <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
            {module.objectives.map((obj, i) => (
              <li key={i} style={{ padding: "2px 0" }}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "var(--sp-8)", fontSize: "var(--fs-micro)", color: "var(--c-ink-muted)" }}>
        {module.durationMinutes} min · {module.lessons?.length ?? 0} lessons
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/ModuleOpener.test.tsx
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/ModuleOpener.tsx src/components/export/__tests__/ModuleOpener.test.tsx
git commit -m "feat(export): add ModuleOpener component"
```

---

## Task 12 · LessonPage component (Core-only, no dialect features yet)

**Files:**
- Create: `src/components/export/Core/LessonPage.tsx`
- Create: `src/components/export/__tests__/LessonPage.test.tsx`

**Note:** Phase 1 renders lesson content as plain markdown with a simple converter. Dialect-specific callout parsing (Try-this, Q&A, etc.) lands in Phase 3 when we add `DialectMarkdown.tsx`. Until then, blockquotes render as standard CSS `blockquote`.

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/LessonPage.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { LessonPage } from "../Core/LessonPage";
import type { Lesson } from "@/types/curriculum";

const lesson: Lesson = {
  id: "l1",
  title: "What is a Model?",
  description: "",
  format: "reading",
  durationMinutes: 6,
  objectives: ["Understand the abstraction"],
  keyPoints: ["A model approximates a function", "Training finds the approximation"],
  content: "A model is a mathematical object that maps inputs to outputs.\n\nWe train it on examples.",
  order: 0,
};

describe("<LessonPage />", () => {
  it("renders the lesson title", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("What is a Model?");
  });

  it("renders lesson number as module.lesson (e.g. 1.1)", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={2} lessonIndex={4} />);
    expect(html).toContain("3.5");
  });

  it("renders content paragraphs", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("mathematical object");
    expect(html).toContain("train it on examples");
  });

  it("renders key points in a side panel when present", () => {
    const html = renderToString(<LessonPage lesson={lesson} moduleIndex={0} lessonIndex={0} />);
    expect(html).toContain("A model approximates");
  });

  it("handles null content without throwing", () => {
    const bare = { ...lesson, content: undefined };
    expect(() =>
      renderToString(<LessonPage lesson={bare} moduleIndex={0} lessonIndex={0} />)
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

- [ ] **Step 3: Implement**

`src/components/export/Core/LessonPage.tsx`:

```tsx
import type { Lesson } from "@/types/curriculum";

interface LessonPageProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
}

/**
 * LessonPage (Core) — no dialect features.
 *
 * Markdown body is split on double-newline to paragraphs. Phase 3 swaps this
 * for DialectMarkdown which parses blockquote conventions (> 💡, > ❓, etc.)
 * into dialect-specific callouts. For now, plain paragraphs are enough to
 * validate page flow, typography, and page breaks.
 */
export function LessonPage({ lesson, moduleIndex, lessonIndex }: LessonPageProps) {
  const paragraphs = (lesson.content ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="lesson-page" style={{ paddingTop: "var(--sp-8)" }}>
      <header style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{
          fontSize: "var(--fs-micro)",
          color: "var(--c-accent)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "var(--sp-2)",
        }}>
          Lesson {moduleIndex + 1}.{lessonIndex + 1} · {lesson.durationMinutes} min
        </div>
        <h3 style={{ fontSize: "var(--fs-h2)", marginTop: 0 }}>{lesson.title}</h3>
      </header>

      <div className="page-grid-12">
        <div className="span-main">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <aside className="span-side avoid-break" style={{
            background: "var(--c-paper-alt)",
            padding: "var(--sp-3) var(--sp-4)",
            borderRadius: "4px",
            fontSize: "var(--fs-sm)",
            alignSelf: "start",
          }}>
            <div style={{
              fontSize: "var(--fs-micro)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--c-ink-muted)",
              marginBottom: "var(--sp-2)",
            }}>
              Key points
            </div>
            <ul style={{ paddingLeft: "var(--sp-4)", margin: 0 }}>
              {lesson.keyPoints.map((k, i) => (
                <li key={i} style={{ padding: "2px 0" }}>{k}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/LessonPage.test.tsx
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/LessonPage.tsx src/components/export/__tests__/LessonPage.test.tsx
git commit -m "feat(export): add LessonPage Core component (no dialect features yet)"
```

---

## Task 13 · QuizBlock component

**Files:**
- Create: `src/components/export/Core/QuizBlock.tsx`
- Create: `src/components/export/__tests__/QuizBlock.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/QuizBlock.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { QuizBlock } from "../Core/QuizBlock";
import type { QuizQuestion } from "@/types/curriculum";

const mc: QuizQuestion = {
  id: "q1",
  type: "multiple-choice",
  question: "Which of these is a classification model?",
  options: ["Linear regression", "Logistic regression", "K-means"],
  correctAnswer: 1,
  explanation: "Logistic regression predicts discrete class labels.",
};

const tf: QuizQuestion = {
  id: "q2",
  type: "true-false",
  question: "Gradient descent always finds the global minimum.",
  options: ["True", "False"],
  correctAnswer: 1,
  explanation: "Only convex surfaces guarantee the global minimum.",
};

describe("<QuizBlock />", () => {
  it("renders the question text", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("classification model");
  });

  it("renders every option", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("Linear regression");
    expect(html).toContain("Logistic regression");
    expect(html).toContain("K-means");
  });

  it("marks the correct option with a visible indicator", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    // Correct answer index is 1 → Logistic regression should have a marker
    // Convention in component: ✓ prefix
    const logisticIdx = html.indexOf("Logistic regression");
    expect(logisticIdx).toBeGreaterThan(-1);
    // The ✓ or "Answer:" label appears before the explanation which follows
    expect(html).toMatch(/Answer/i);
  });

  it("renders the explanation when provided", () => {
    const html = renderToString(<QuizBlock question={mc} index={0} />);
    expect(html).toContain("discrete class labels");
  });

  it("handles true/false quizzes", () => {
    const html = renderToString(<QuizBlock question={tf} index={1} />);
    expect(html).toContain("Gradient descent");
    expect(html).toContain("True");
    expect(html).toContain("False");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

- [ ] **Step 3: Implement**

`src/components/export/Core/QuizBlock.tsx`:

```tsx
import type { QuizQuestion } from "@/types/curriculum";

interface QuizBlockProps {
  question: QuizQuestion;
  index: number;
}

function correctOptionIndex(q: QuizQuestion): number | null {
  if (typeof q.correctAnswer === "number") return q.correctAnswer;
  if (!q.options) return null;
  const idx = q.options.findIndex((o) => o === q.correctAnswer);
  return idx >= 0 ? idx : null;
}

/**
 * QuizBlock — single question with options + revealed answer + explanation.
 *
 * Phase 1 always renders answers visible. Phase 2 adds an interactive web
 * variant that hides the answer by default; PDF always shows it (PDFs aren't
 * interactive).
 */
export function QuizBlock({ question, index }: QuizBlockProps) {
  const correctIdx = correctOptionIndex(question);

  return (
    <div className="quiz-block avoid-break" style={{
      background: "var(--c-paper-alt)",
      border: "1px solid var(--c-rule)",
      borderRadius: "6px",
      padding: "var(--sp-4)",
      margin: "var(--sp-6) 0",
    }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--c-accent)",
        marginBottom: "var(--sp-2)",
      }}>
        Question {String(index + 1).padStart(2, "0")}
      </div>

      <p style={{ fontWeight: 600, margin: "0 0 var(--sp-3)", color: "var(--c-ink)" }}>
        {question.question}
      </p>

      {question.options && (
        <ol style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {question.options.map((opt, i) => {
            const correct = i === correctIdx;
            return (
              <li key={i} style={{
                padding: "var(--sp-2) var(--sp-3)",
                border: "1px solid var(--c-rule)",
                borderRadius: "4px",
                marginBottom: "var(--sp-2)",
                display: "flex",
                alignItems: "baseline",
                gap: "var(--sp-2)",
                background: correct ? "var(--c-accent-soft)" : "var(--c-paper)",
              }}>
                <span style={{
                  fontSize: "var(--fs-micro)",
                  fontWeight: 700,
                  color: "var(--c-ink-muted)",
                  minWidth: "1.5em",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
                {correct && (
                  <span style={{ marginLeft: "auto", fontSize: "var(--fs-micro)", fontWeight: 700, color: "var(--c-accent)" }}>
                    ✓ Answer
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {question.explanation && (
        <div style={{ marginTop: "var(--sp-3)", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>
          <strong style={{ color: "var(--c-ink)" }}>Why:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/QuizBlock.test.tsx
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/QuizBlock.tsx src/components/export/__tests__/QuizBlock.test.tsx
git commit -m "feat(export): add QuizBlock component"
```

---

## Task 14 · Certificate component

**Files:**
- Create: `src/components/export/Core/Certificate.tsx`
- Create: `src/components/export/__tests__/Certificate.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/Certificate.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Certificate } from "../Core/Certificate";

const base = {
  courseTitle: "Intro to Machine Learning",
  totalLessons: 24,
  totalHours: 20,
  completedAt: "2026-04-23",
};

describe("<Certificate />", () => {
  it("renders the course title", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("Intro to Machine Learning");
  });

  it("renders the issuer as the creator name — never Syllabi", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("Maria Rossi");
    expect(html.toLowerCase()).not.toContain("syllabi");
  });

  it("omits the issuer line entirely when null", () => {
    const html = renderToString(<Certificate {...base} issuer={null} />);
    expect(html).not.toMatch(/issued by/i);
  });

  it("renders completion metadata", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("24");
    expect(html).toContain("20");
    expect(html).toContain("2026-04-23");
  });

  it("applies certificate class so print.css isolates it on its own page", () => {
    const html = renderToString(<Certificate {...base} issuer={null} />);
    expect(html).toContain("certificate");
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

- [ ] **Step 3: Implement**

`src/components/export/Core/Certificate.tsx`:

```tsx
interface CertificateProps {
  courseTitle: string;
  totalLessons: number;
  totalHours: number;
  completedAt: string; // ISO date
  issuer: string | null; // creator name, NEVER "Syllabi"
  learnerName?: string | null;
}

/**
 * Certificate — final page.
 *
 * Spec §7 hard constraint: issuer is the creator name, never "Syllabi".
 * When the creator has not set a display name, the entire issuer line is
 * omitted — the certificate carries course title + stats + date only.
 *
 * Learner name field is optional; in Phase 1 it is always unset (students
 * receiving a shared course have not entered their name). Phase 2+ may
 * add a render-time learner-name parameter when a student completes via /share.
 */
export function Certificate({
  courseTitle,
  totalLessons,
  totalHours,
  completedAt,
  issuer,
  learnerName,
}: CertificateProps) {
  return (
    <section className="certificate avoid-break" style={{
      minHeight: "calc(var(--page-height) - (2 * var(--page-margin-outer)))",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "var(--sp-16) var(--sp-8)",
      border: "2px solid var(--c-ink)",
      position: "relative",
    }}>
      <div style={{
        fontSize: "var(--fs-micro)",
        letterSpacing: "0.3em",
        color: "var(--c-ink-muted)",
        textTransform: "uppercase",
        marginBottom: "var(--sp-8)",
      }}>
        Certificate of Completion
      </div>

      {learnerName && (
        <>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>Awarded to</div>
          <h2 style={{ fontSize: "var(--fs-h1)", margin: "var(--sp-3) 0 var(--sp-8)" }}>
            {learnerName}
          </h2>
        </>
      )}

      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)" }}>For completing</div>
      <h1 style={{ fontSize: "var(--fs-display)", lineHeight: 1, margin: "var(--sp-3) 0 var(--sp-8)", maxWidth: "80%" }}>
        {courseTitle}
      </h1>

      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)", marginBottom: "var(--sp-16)" }}>
        {totalLessons} lessons · {totalHours} hours · {completedAt}
      </div>

      {issuer && (
        <div style={{ borderTop: "1px solid var(--c-ink)", paddingTop: "var(--sp-3)", fontSize: "var(--fs-sm)", color: "var(--c-ink-sec)", minWidth: "30%" }}>
          Issued by {issuer}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/Certificate.test.tsx
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/Core/Certificate.tsx src/components/export/__tests__/Certificate.test.tsx
git commit -m "feat(export): add Certificate component (issuer = creator, never Syllabi)"
```

---

## Task 15 · CourseDocument assembly

**Files:**
- Create: `src/components/export/CourseDocument.tsx`
- Create: `src/components/export/__tests__/CourseDocument.test.tsx`

**Context:** This is the top-level component — renders the full document in page order, injects the three CSS files, and wires branding tokens through.

- [ ] **Step 1: Write the failing test**

`src/components/export/__tests__/CourseDocument.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { CourseDocument } from "../CourseDocument";
import type { Curriculum } from "@/types/curriculum";

const curriculum = {
  id: "c1",
  title: "Intro to Machine Learning",
  subtitle: "From scratch",
  description: "",
  targetAudience: "beginners",
  difficulty: "beginner" as const,
  objectives: [],
  modules: [
    {
      id: "m1",
      title: "Foundations",
      description: "",
      objectives: [],
      order: 0,
      durationMinutes: 5,
      lessons: [
        {
          id: "l1",
          title: "What is a Model?",
          description: "",
          format: "reading" as const,
          durationMinutes: 5,
          order: 0,
          content: "A model is a function.",
          quiz: [{
            id: "q1",
            type: "multiple-choice" as const,
            question: "What is a model?",
            options: ["A fn", "A shape"],
            correctAnswer: 0,
          }],
        },
      ],
    },
  ],
  pacing: { style: "self-paced" as const, totalHours: 5, hoursPerWeek: 5, totalWeeks: 1 },
  createdBy: "u1",
  createdAt: "2026-04-23T00:00:00Z",
  updatedAt: "2026-04-23T00:00:00Z",
  version: "1",
} as Curriculum;

describe("<CourseDocument />", () => {
  it("renders cover, TOC, module opener, lesson, and certificate in order", () => {
    const html = renderToString(
      <CourseDocument curriculum={curriculum} branding={{ displayName: "Maria", logoUrl: null, accent: null, heroUrl: null, footer: null }} />
    );

    const coverIdx = html.indexOf("Intro to Machine Learning"); // appears in cover first
    const tocIdx = html.indexOf("Contents");
    const modIdx = html.indexOf("Foundations");
    const lessonIdx = html.indexOf("What is a Model?");
    const certIdx = html.indexOf("Certificate of Completion");

    expect(coverIdx).toBeGreaterThan(-1);
    expect(tocIdx).toBeGreaterThan(coverIdx);
    expect(modIdx).toBeGreaterThan(tocIdx);
    expect(lessonIdx).toBeGreaterThan(modIdx);
    expect(certIdx).toBeGreaterThan(lessonIdx);
  });

  it("renders quiz blocks inside their parent lesson", () => {
    const html = renderToString(
      <CourseDocument curriculum={curriculum} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} />
    );
    expect(html).toContain("What is a model?"); // quiz question
  });

  it("never includes the string 'Syllabi' regardless of branding", () => {
    for (const name of ["Maria", null, ""]) {
      const html = renderToString(
        <CourseDocument
          curriculum={curriculum}
          branding={{ displayName: name, logoUrl: null, accent: null, heroUrl: null, footer: null }}
        />
      );
      expect(html.toLowerCase()).not.toContain("syllabi");
    }
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

- [ ] **Step 3: Implement**

`src/components/export/CourseDocument.tsx`:

```tsx
import type { Curriculum } from "@/types/curriculum";
import type { BrandingTokens } from "@/lib/export/branding";
import { Cover } from "./Core/Cover";
import { TableOfContents } from "./Core/TableOfContents";
import { ModuleOpener } from "./Core/ModuleOpener";
import { LessonPage } from "./Core/LessonPage";
import { QuizBlock } from "./Core/QuizBlock";
import { Certificate } from "./Core/Certificate";

interface CourseDocumentProps {
  curriculum: Curriculum;
  branding: BrandingTokens;
  volume?: number;
}

/**
 * CourseDocument — top-level export component.
 *
 * Renders, in order: Cover → Contents → (ModuleOpener → (LessonPage → QuizBlock?)+)+ → Certificate.
 *
 * Spec §7: issuer on the certificate is the creator's displayName, never "Syllabi".
 * When displayName is null the certificate omits the "Issued by" line entirely.
 */
export function CourseDocument({ curriculum, branding, volume = 1 }: CourseDocumentProps) {
  const totalLessons = curriculum.modules.reduce(
    (n, m) => n + (m.lessons?.length ?? 0),
    0,
  );
  const totalMinutes = curriculum.modules.reduce(
    (n, m) => n + m.durationMinutes,
    0,
  );
  const totalHours = Math.round(totalMinutes / 60);
  const completedAt = new Date().toISOString().slice(0, 10);

  return (
    <div className="course-document">
      <Cover
        curriculum={{ ...curriculum, totalHours, totalLessons }}
        branding={branding}
        volume={volume}
      />

      <TableOfContents modules={curriculum.modules} />

      {curriculum.modules.map((module, moduleIndex) => (
        <div key={module.id}>
          <ModuleOpener module={module} index={moduleIndex} />

          {module.lessons.map((lesson, lessonIndex) => (
            <div key={lesson.id}>
              <LessonPage
                lesson={lesson}
                moduleIndex={moduleIndex}
                lessonIndex={lessonIndex}
              />
              {lesson.quiz?.map((q, qi) => (
                <QuizBlock key={q.id} question={q} index={qi} />
              ))}
            </div>
          ))}
        </div>
      ))}

      <Certificate
        courseTitle={curriculum.title}
        totalLessons={totalLessons}
        totalHours={totalHours}
        completedAt={completedAt}
        issuer={branding.displayName}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm it passes**

```bash
pnpm vitest run src/components/export/__tests__/CourseDocument.test.tsx
```

Expected: 3/3 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/export/CourseDocument.tsx src/components/export/__tests__/CourseDocument.test.tsx
git commit -m "feat(export): add CourseDocument assembly component"
```

---

## Task 16 · `renderHtml.ts` — React SSR to HTML string

**Files:**
- Create: `src/lib/export/renderHtml.ts`

**Note:** No dedicated unit test — this is thin glue. Integration coverage comes from Task 17's `renderPdf.integration.test.ts` which feeds the full pipeline end-to-end.

- [ ] **Step 1: Implement**

`src/lib/export/renderHtml.ts`:

```typescript
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

/**
 * Render a React element to a complete HTML document string.
 *
 * Embeds the three export CSS files inline so Playwright renders with no
 * external requests — critical because Playwright will take its screenshot
 * before any <link> stylesheet finishes loading if network is slow. Inlining
 * also means the PDF is fully reproducible from the input curriculum alone.
 */
export function renderHtml(element: ReactElement): string {
  const body = renderToStaticMarkup(element);

  const cssDir = path.join(
    process.cwd(),
    "src",
    "components",
    "export",
    "page-css",
  );
  const tokens = fs.readFileSync(path.join(cssDir, "tokens.css"), "utf8");
  const core = fs.readFileSync(path.join(cssDir, "handbook-core.css"), "utf8");
  const print = fs.readFileSync(path.join(cssDir, "print.css"), "utf8");

  // `handbook-core.css` itself has `@import "./tokens.css"` — we strip the
  // @import so the inlined tokens don't get re-requested off disk from the
  // headless browser's filesystem (which would fail).
  const coreNoImport = core.replace(/@import\s+['"][^'"]*tokens\.css['"]\s*;?/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>${tokens}${coreNoImport}${print}</style>
</head>
<body>
${body}
</body>
</html>`;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: fewer errors than before (this file resolves one of the unresolved imports from Task 5's scaffold).

- [ ] **Step 3: Commit**

```bash
git add src/lib/export/renderHtml.ts
git commit -m "feat(export): add renderHtml (React SSR + inlined export CSS)"
```

---

## Task 17 · `renderPdf.ts` — HTML → PDF via Playwright / @sparticuz/chromium

**Files:**
- Create: `src/lib/export/renderPdf.ts`
- Create: `src/lib/export/__tests__/renderPdf.integration.test.ts`

**Context:** This is the core of the pipeline. It picks the right Chromium (bundled on Cloud Run via `playwright`, serverless via `@sparticuz/chromium` on Vercel) and runs `page.pdf()` with the print CSS emulated.

- [ ] **Step 1: Write the failing integration test**

`src/lib/export/__tests__/renderPdf.integration.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { renderPdf } from "../renderPdf";
import { renderHtml } from "../renderHtml";
import { CourseDocument } from "@/components/export";
import type { Curriculum } from "@/types/curriculum";

const fixture = {
  id: "fx1",
  title: "Fixture Course",
  subtitle: "For tests",
  description: "",
  targetAudience: "all",
  difficulty: "beginner",
  objectives: [],
  modules: [
    {
      id: "m1",
      title: "M1",
      description: "",
      objectives: [],
      order: 0,
      durationMinutes: 5,
      lessons: [
        { id: "l1", title: "L1", description: "", format: "reading", durationMinutes: 5, order: 0, content: "Body." },
      ],
    },
  ],
  pacing: { style: "self-paced", totalHours: 1, hoursPerWeek: 1, totalWeeks: 1 },
  createdBy: "u1",
  createdAt: "2026-04-23T00:00:00Z",
  updatedAt: "2026-04-23T00:00:00Z",
  version: "1",
} as unknown as Curriculum;

describe("renderPdf", () => {
  // Skip in CI without PLAYWRIGHT_BROWSERS_PATH configured — this is an integration
  // test that requires Chromium. Run locally with: `pnpm vitest run renderPdf`
  const hasChromium = Boolean(
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
      process.env.CI ||
      process.env.INTEGRATION_TESTS === "true",
  );

  it.runIf(hasChromium)("produces a non-empty PDF starting with %PDF-", async () => {
    const html = renderHtml(
      <CourseDocument
        curriculum={fixture}
        branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
      />,
    );

    const pdf = await renderPdf(html);

    // PDFs always start with the magic bytes %PDF-
    const magic = pdf.slice(0, 5).toString();
    expect(magic).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(1_000);
  }, 30_000);
});
```

- [ ] **Step 2: Run, confirm it fails**

```bash
pnpm vitest run src/lib/export/__tests__/renderPdf.integration.test.ts
```

Expected: module not found.

- [ ] **Step 3: Implement**

`src/lib/export/renderPdf.ts`:

```typescript
/**
 * renderPdf — render an HTML string to a PDF Buffer using Chromium.
 *
 * Two runtimes:
 *   - Cloud Run (inngest-worker): uses full `playwright` package with the
 *     Chromium that the Dockerfile installed into /ms-playwright.
 *   - Vercel (serverless): uses `playwright-core` + `@sparticuz/chromium` —
 *     the only Chromium known to fit into a Lambda-class container.
 *
 * Picks the right path based on env. The detection is deliberately simple:
 * Vercel injects VERCEL=1; Cloud Run does not.
 */

const isVercel = process.env.VERCEL === "1";

export async function renderPdf(html: string): Promise<Buffer> {
  if (isVercel) {
    return renderWithServerlessChromium(html);
  }
  return renderWithFullPlaywright(html);
}

async function renderWithFullPlaywright(html: string): Promise<Buffer> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }, // @page rules govern margins
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

async function renderWithServerlessChromium(html: string): Promise<Buffer> {
  const { chromium } = await import("playwright-core");
  const sparticuz = await import("@sparticuz/chromium");

  const browser = await chromium.launch({
    args: sparticuz.default.args,
    executablePath: await sparticuz.default.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 4: Run the integration test with Chromium available**

```bash
INTEGRATION_TESTS=true pnpm vitest run src/lib/export/__tests__/renderPdf.integration.test.ts
```

If `playwright` was never installed locally:

```bash
pnpm exec playwright install chromium
INTEGRATION_TESTS=true pnpm vitest run src/lib/export/__tests__/renderPdf.integration.test.ts
```

Expected: 1/1 PASS. Test runtime ~5-10s locally.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/renderPdf.ts src/lib/export/__tests__/renderPdf.integration.test.ts
git commit -m "feat(export): add renderPdf (Playwright + serverless Chromium fallback)"
```

---

## Task 18 · `decideExportPath` + `uploadToBucket` + `/api/export/pdf` sync route

**Files:**
- Create: `src/lib/export/decideExportPath.ts`
- Create: `src/lib/export/__tests__/decideExportPath.test.ts`
- Create: `src/lib/export/uploadToBucket.ts`
- Create: `src/app/api/export/pdf/route.ts`

- [ ] **Step 1: Write the failing test for decideExportPath**

`src/lib/export/__tests__/decideExportPath.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { decideExportPath, estimatePageCount } from "../decideExportPath";
import type { Curriculum } from "@/types/curriculum";

function makeCurriculum(lessons: number, avgLessonMinutes = 6): Curriculum {
  const modules = [];
  let id = 0;
  for (let i = 0; i < lessons; i++) {
    modules.push({
      id: `m${i}`,
      title: `M${i}`,
      description: "",
      objectives: [],
      order: i,
      durationMinutes: avgLessonMinutes,
      lessons: [
        { id: `l${id++}`, title: `L${id}`, description: "", format: "reading" as const, durationMinutes: avgLessonMinutes, order: 0 },
      ],
    });
  }
  return {
    id: "c",
    title: "C",
    subtitle: "",
    description: "",
    targetAudience: "",
    difficulty: "beginner",
    objectives: [],
    modules,
    pacing: { style: "self-paced", totalHours: 1, hoursPerWeek: 1, totalWeeks: 1 },
    createdBy: "u",
    createdAt: "2026-04-23T00:00:00Z",
    updatedAt: "2026-04-23T00:00:00Z",
    version: "1",
  } as Curriculum;
}

describe("estimatePageCount", () => {
  it("returns ~2 + lesson count (cover + TOC + lessons)", () => {
    expect(estimatePageCount(makeCurriculum(1))).toBe(4);   // cover+toc+module+lesson+cert
    expect(estimatePageCount(makeCurriculum(10))).toBe(22);
  });
});

describe("decideExportPath", () => {
  it("returns 'sync' for short courses (≤ 30 estimated pages)", () => {
    expect(decideExportPath(makeCurriculum(5))).toBe("sync");
  });

  it("returns 'async' for masterclass-length courses (> 30 estimated pages)", () => {
    expect(decideExportPath(makeCurriculum(25))).toBe("async"); // 52 pages
  });
});
```

- [ ] **Step 2: Run, confirm it fails**

- [ ] **Step 3: Implement decideExportPath**

`src/lib/export/decideExportPath.ts`:

```typescript
import type { Curriculum } from "@/types/curriculum";

export type ExportPath = "sync" | "async";

/**
 * Rough page-count estimate for a course.
 *
 * Heuristic:
 *   - Cover = 1 page
 *   - TOC = 1 page
 *   - Each module = 1 module opener + (lesson count × 2 pages estimate)
 *   - Certificate = 1 page
 *
 * This is a bound, not an exact count. The decision threshold lives in
 * decideExportPath; tune this heuristic if the sync/async cutoff starts
 * misclassifying courses in practice.
 */
export function estimatePageCount(curriculum: Curriculum): number {
  const coverAndToc = 2;
  const moduleOpeners = curriculum.modules.length;
  const lessonPages = curriculum.modules.reduce(
    (n, m) => n + (m.lessons?.length ?? 0) * 2,
    0,
  );
  const certificate = 1;
  return coverAndToc + moduleOpeners + lessonPages + certificate;
}

/**
 * Pick sync (Vercel, short-lived) or async (Inngest → Cloud Run).
 *
 * Threshold 30 pages ≈ a "full"-length course. Masterclass courses typically
 * produce 60-120 pages and must go async to stay under the 300s Vercel cap.
 */
export function decideExportPath(curriculum: Curriculum): ExportPath {
  return estimatePageCount(curriculum) > 30 ? "async" : "sync";
}
```

- [ ] **Step 4: Run, confirm tests pass**

```bash
pnpm vitest run src/lib/export/__tests__/decideExportPath.test.ts
```

Expected: 3/3 PASS.

- [ ] **Step 5: Implement uploadToBucket**

`src/lib/export/uploadToBucket.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import crypto from "node:crypto";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role bypasses RLS
);

/**
 * Upload a buffer to the `exports` bucket and return a signed download URL
 * valid for 1 hour.
 *
 * Path convention: exports/<userId>/<courseId>/<contentHash>.<ext>
 * contentHash is sha1 of the buffer; identical exports de-dup by path.
 *
 * Signed URL lifetime is 1h because creators download immediately after
 * generation. Bucket is private — no public URL by design.
 */
export async function uploadToBucket(opts: {
  buffer: Buffer;
  userId: string;
  courseId: string;
  ext: "pdf" | "zip" | "md";
  contentType: string;
}): Promise<{ signedUrl: string; path: string }> {
  const hash = crypto
    .createHash("sha1")
    .update(opts.buffer)
    .digest("hex")
    .slice(0, 16);
  const path = `${opts.userId}/${opts.courseId}/${hash}.${opts.ext}`;

  const { error: upErr } = await supabase.storage
    .from("exports")
    .upload(path, opts.buffer, {
      contentType: opts.contentType,
      upsert: true,
    });
  if (upErr) throw new Error(`upload failed: ${upErr.message}`);

  const { data, error: signErr } = await supabase.storage
    .from("exports")
    .createSignedUrl(path, 60 * 60);
  if (signErr || !data) throw new Error(`sign failed: ${signErr?.message}`);

  return { signedUrl: data.signedUrl, path };
}
```

- [ ] **Step 6: Implement the sync route**

`src/app/api/export/pdf/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { CourseDocument } from "@/components/export";
import { renderHtml } from "@/lib/export/renderHtml";
import { renderPdf } from "@/lib/export/renderPdf";
import { uploadToBucket } from "@/lib/export/uploadToBucket";
import { decideExportPath } from "@/lib/export/decideExportPath";
import { resolveBranding } from "@/lib/export/branding";
import { isExportV2Enabled } from "@/lib/flags";
import { inngest } from "@/lib/inngest/client";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes — the Vercel hard cap

/**
 * POST /api/export/pdf  { courseId }
 *
 * Sync path for short courses: renders inline, uploads to bucket, returns
 * signed URL.
 *
 * Async path for masterclass-length: dispatches a course/export.requested
 * event to Inngest and returns { status: "pending", pollAt }. Client then
 * polls /api/export/pdf/status/[courseId].
 */
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

  const supabase = await createClient();
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

  const curriculum = course.data as import("@/types/curriculum").Curriculum;
  const path = decideExportPath(curriculum);

  if (path === "async") {
    await inngest.send({
      name: "course/export.requested",
      data: { courseId, userId: user.id, format: "pdf" },
    });
    return NextResponse.json({ status: "pending", courseId, format: "pdf" });
  }

  // Sync render
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
```

- [ ] **Step 7: Typecheck + commit**

```bash
pnpm typecheck
git add src/lib/export/decideExportPath.ts src/lib/export/uploadToBucket.ts src/lib/export/__tests__/decideExportPath.test.ts src/app/api/export/pdf/route.ts
git commit -m "feat(export): add /api/export/pdf sync route + decideExportPath + upload helper

Sync renders short courses (≤30 pages) on Vercel. Long courses dispatch to
Inngest for Cloud Run rendering (Task 19). Response shape:
  { status: 'ready', url }  (sync)
  { status: 'pending', courseId, format }  (async, client polls)"
```

---

## Task 19 · Inngest `course/export.requested` async function

**Files:**
- Modify: `src/lib/inngest/client.ts` (add event schema)
- Modify: `src/lib/inngest/functions.ts` (add courseExport function)

- [ ] **Step 1: Add the event schema**

In `src/lib/inngest/client.ts`, find the event schema map (it's a type-level `EventSchemas` or `GetEvents` declaration). Add:

```typescript
"course/export.requested": {
  data: {
    courseId: string;
    userId: string;
    format: "pdf";  // future: "scorm" | "marp" | "docx"
  };
};
```

Find the existing declarations in that file (grep for `course/generate.requested`) and add the new key alongside them.

- [ ] **Step 2: Add the function**

In `src/lib/inngest/functions.ts`, append:

```typescript
import { CourseDocument } from "@/components/export";
import { renderHtml } from "@/lib/export/renderHtml";
import { renderPdf } from "@/lib/export/renderPdf";
import { uploadToBucket } from "@/lib/export/uploadToBucket";
import { resolveBranding } from "@/lib/export/branding";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Curriculum } from "@/types/curriculum";

export const courseExport = inngest.createFunction(
  {
    id: "course-export",
    retries: 1,
    concurrency: { limit: 2 }, // Chromium is memory-heavy; see docs/cloud-run.md
  },
  { event: "course/export.requested" },
  async ({ event, step }) => {
    const { courseId, userId, format } = event.data;

    if (format !== "pdf") {
      // Phase 1 supports pdf only; other formats arrive in later phases.
      return { skipped: true, reason: "format-not-supported" };
    }

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { course, profile } = await step.run("fetch-inputs", async () => {
      const [{ data: course }, { data: profile }] = await Promise.all([
        supabase.from("courses").select("id, user_id, data").eq("id", courseId).single(),
        supabase.from("profiles").select("*").eq("id", userId).single(),
      ]);
      if (!course) throw new Error(`course ${courseId} not found`);
      if (course.user_id !== userId) throw new Error(`course ${courseId} not owned by ${userId}`);
      return { course, profile };
    });

    // Render + upload happen OUTSIDE step.run() because Inngest memoizes step
    // results; if retried, we'd skip the re-render and reuse the previous file.
    // For a failed upload retry we actually want a fresh render.
    const curriculum = course.data as Curriculum;
    const branding = resolveBranding(profile);
    const html = renderHtml(
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

    // Persist the pointer so the polling endpoint can pick it up.
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
```

- [ ] **Step 3: Add the `course_exports` tracking table migration**

```sql
-- supabase/migrations/019_course_exports.sql
create table if not exists public.course_exports (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  format text not null check (format in ('pdf', 'scorm', 'marp', 'docx', 'notion-html', 'notion-md', 'nlm-audio')),
  storage_path text not null,
  completed_at timestamptz not null default now(),
  unique (course_id, format)
);

create index course_exports_course_id_idx on public.course_exports(course_id);

alter table public.course_exports enable row level security;

-- Owners can read their own exports.
create policy "course_exports_owner_read"
  on public.course_exports for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = course_exports.course_id
        and courses.user_id = auth.uid()
    )
  );
```

```bash
supabase db push
npx supabase gen types typescript --project-id gmxseuttpurnxbluvcwx > src/types/database.types.ts
```

- [ ] **Step 4: Register the new function with Inngest**

In `src/app/api/inngest/route.ts`, add `courseExport` to the `functions` array passed to `serve()`. Grep for how existing functions (`courseGenerate`, `moduleGenerate`, `courseFinalize`) are registered — follow the same pattern.

- [ ] **Step 5: Deploy to Cloud Run so the async path is live**

```bash
./deploy/cloud-run.sh
```

Expected: new revision rolls out, Inngest picks up the new function registration on next poll.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inngest/client.ts src/lib/inngest/functions.ts src/app/api/inngest/route.ts supabase/migrations/019_course_exports.sql src/types/database.types.ts
git commit -m "feat(export): add course/export.requested Inngest function (async PDF path)

Cloud Run worker receives course/export.requested events, renders PDF via
Playwright, uploads to Supabase exports/ bucket, records pointer in new
course_exports table. Concurrency capped at 2 per cloud-run.md."
```

---

## Task 20 · Polling endpoint `GET /api/export/pdf/status/[courseId]`

**Files:**
- Create: `src/app/api/export/pdf/status/[courseId]/route.ts`

- [ ] **Step 1: Implement**

```typescript
// src/app/api/export/pdf/status/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * GET /api/export/pdf/status/:courseId
 *
 * Client polls this after receiving { status: "pending" } from POST /api/export/pdf.
 *
 * Returns:
 *   { status: "pending" }                    — not yet in course_exports
 *   { status: "ready", url: signedUrl }      — rendered and uploaded
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: exp } = await supabase
    .from("course_exports")
    .select("storage_path, completed_at")
    .eq("course_id", courseId)
    .eq("format", "pdf")
    .single();

  if (!exp) return NextResponse.json({ status: "pending" });

  // Mint a fresh signed URL (1h lifetime) — never return a stale one.
  const { data, error } = await supabase.storage
    .from("exports")
    .createSignedUrl(exp.storage_path, 60 * 60);

  if (error || !data) {
    return NextResponse.json({ error: "sign failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ready", url: data.signedUrl });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/export/pdf/status
git commit -m "feat(export): add GET /api/export/pdf/status polling endpoint"
```

---

## Task 21 · Client wiring — route ExportTile through flag

**Files:**
- Modify: `src/components/dashboard/ExportTile.tsx`

**Context:** When `EXPORT_V2_ENABLED=true` and the tile format is `pdf`, the client calls the new route instead of the old jsPDF client-side generator.

- [ ] **Step 1: Read the existing ExportTile**

```bash
wc -l src/components/dashboard/ExportTile.tsx
```

Note the current PDF click handler — it almost certainly imports `generatePDF` from `@/lib/pdf/generatePDF` and runs client-side.

- [ ] **Step 2: Replace the PDF click path**

Add an env-var check at the top of the component (`NEXT_PUBLIC_EXPORT_V2_ENABLED`; the client cannot read server-only `EXPORT_V2_ENABLED`), and branch on it:

```tsx
// inside ExportTile, where the pdf click handler lives
const isV2 = process.env.NEXT_PUBLIC_EXPORT_V2_ENABLED === "true";

async function handlePdfClick() {
  if (!isV2) {
    // legacy jsPDF path — leave untouched
    return legacyGeneratePDFClick();
  }

  // v2 server-rendered path
  const res = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  });
  const body = await res.json();

  if (body.status === "ready") {
    window.location.href = body.url;
    return;
  }
  if (body.status === "pending") {
    await pollUntilReady(courseId);
    return;
  }
  throw new Error(body.error ?? "export failed");
}

async function pollUntilReady(courseId: string) {
  const deadline = Date.now() + 120_000; // 2 min cap
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`/api/export/pdf/status/${courseId}`);
    const body = await res.json();
    if (body.status === "ready") {
      window.location.href = body.url;
      return;
    }
  }
  throw new Error("export did not complete within 2 minutes");
}
```

- [ ] **Step 3: Add the `NEXT_PUBLIC_EXPORT_V2_ENABLED` flag to Vercel + Cloud Run envs**

Document in PR description: "Before merge, set `EXPORT_V2_ENABLED=true` and `NEXT_PUBLIC_EXPORT_V2_ENABLED=true` in Vercel (Preview) for QA; keep both `false` in Production until Task 22 regression passes."

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ExportTile.tsx
git commit -m "feat(export): route ExportTile PDF clicks through v2 flag"
```

---

## Task 22 · Visual regression harness + 12-course baseline

**Files:**
- Create: `tests/visual/regression-harness.ts`
- Create: `tests/visual/fixtures/*.json` (12 files — see step 2)
- Create: `tests/visual/baselines/*.png` (generated — see step 4)
- Create: `tests/visual/regression.test.ts`

**Context:** Spec success metric: "Zero layout defects on a fixed 12-course regression suite (crash/short/full/masterclass × 4 teaching styles — one course per combination)." This task builds the suite and the harness. **Dialects are not yet implemented** (Phase 3) so in Phase 1 the 12 fixtures all render with the Core layout; we re-generate baselines when Phase 3 ships. That's OK — Core must be perfect before we layer dialects on it.

- [ ] **Step 1: Write the harness**

`tests/visual/regression-harness.ts`:

```typescript
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type { Curriculum } from "@/types/curriculum";
import { renderHtml } from "@/lib/export/renderHtml";
import { renderPdf } from "@/lib/export/renderPdf";
import { CourseDocument } from "@/components/export";

const FIXTURES_DIR = path.join(process.cwd(), "tests/visual/fixtures");
const BASELINES_DIR = path.join(process.cwd(), "tests/visual/baselines");

export async function renderFixtureToPngs(fixtureName: string): Promise<Buffer[]> {
  const curriculum: Curriculum = JSON.parse(
    fs.readFileSync(path.join(FIXTURES_DIR, `${fixtureName}.json`), "utf8"),
  );

  const html = renderHtml(
    <CourseDocument
      curriculum={curriculum}
      branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
    />,
  );

  // Use Playwright directly to capture a PNG per page. page.pdf()'s PNG mode
  // isn't exposed, so we render HTML and screenshot each page at A4 size.
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }, // 210mm x 297mm at 96dpi
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    // A crude page-split: scroll through and screenshot each page-height slice.
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const pages: Buffer[] = [];
    for (let y = 0; y < totalHeight; y += 1123) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      pages.push(await page.screenshot({ clip: { x: 0, y: 0, width: 794, height: 1123 } }));
    }
    return pages;
  } finally {
    await browser.close();
  }
}

export function diffPng(a: Buffer, b: Buffer): { diffRatio: number; pixels: number } {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 });
  return { diffRatio: pixels / (width * height), pixels };
}

export function loadBaseline(fixtureName: string, pageIndex: number): Buffer {
  return fs.readFileSync(path.join(BASELINES_DIR, `${fixtureName}-p${pageIndex}.png`));
}

export function saveBaseline(fixtureName: string, pageIndex: number, data: Buffer) {
  if (!fs.existsSync(BASELINES_DIR)) fs.mkdirSync(BASELINES_DIR, { recursive: true });
  fs.writeFileSync(path.join(BASELINES_DIR, `${fixtureName}-p${pageIndex}.png`), data);
}
```

- [ ] **Step 2: Create the 12 fixture JSONs**

12 fixture files — one per (length × style) combo. Filenames: `crash-academic.json`, `crash-handson.json`, `crash-storytelling.json`, `crash-conversational.json`, `short-academic.json` … `masterclass-conversational.json`.

For each fixture, generate a realistic `Curriculum` JSON via the live generator API (or hand-write a minimal one if generation is flaky). Topic suggestions:

| Length | Topic per style |
|---|---|
| crash | "SQL basics" |
| short | "Intro to TypeScript" |
| full | "Product management fundamentals" |
| masterclass | "Deep learning from first principles" |

For each, vary `teachingStyle` across academic / hands-on / storytelling / conversational. Save the raw curriculum JSON from the generator as the fixture file.

**Acceptance:** `ls tests/visual/fixtures/ | wc -l` → 12.

- [ ] **Step 3: Write the regression test**

`tests/visual/regression.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderFixtureToPngs, diffPng, loadBaseline, saveBaseline } from "./regression-harness";

const FIXTURES_DIR = path.join(process.cwd(), "tests/visual/fixtures");
const UPDATE = process.env.UPDATE_BASELINES === "true";

const fixtureNames = fs
  .readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

describe("visual regression — 12 fixtures × all pages", () => {
  for (const name of fixtureNames) {
    it(`${name}: every page matches baseline within 0.5%`, async () => {
      const pages = await renderFixtureToPngs(name);
      for (let i = 0; i < pages.length; i++) {
        if (UPDATE) {
          saveBaseline(name, i, pages[i]);
          continue;
        }
        const baseline = loadBaseline(name, i);
        const { diffRatio } = diffPng(baseline, pages[i]);
        expect(diffRatio, `page ${i} of ${name}`).toBeLessThan(0.005);
      }
    }, 60_000);
  }
});
```

- [ ] **Step 4: Generate baselines once — review manually before committing**

```bash
UPDATE_BASELINES=true pnpm vitest run tests/visual/regression.test.ts
```

Expected: baseline PNGs written under `tests/visual/baselines/`. **Manually inspect** each PNG:
- No overlapping text
- No orphaned single-word lines at top of page
- Page breaks land between sections, never mid-sentence
- Cover has no Syllabi mark
- Page numbers present on every page except the cover
- TOC titles match the actual modules

If any page looks broken, fix the component responsible and re-run with `UPDATE_BASELINES=true`. Only commit baselines once they all look right.

- [ ] **Step 5: Commit the harness + fixtures + approved baselines**

```bash
git add tests/visual
git commit -m "test(export): visual regression harness + 12-course baseline suite

12 fixtures cover crash/short/full/masterclass × academic/hands-on/
storytelling/conversational. Phase 1 baselines are Core-only (no dialect
features). Baselines regenerated in Phase 3 when dialects ship.

Run: pnpm vitest run tests/visual/regression.test.ts
Update baselines: UPDATE_BASELINES=true pnpm vitest run tests/visual"
```

---

## Task 23 · Deprecate legacy jsPDF client calls

**Files:**
- Modify: `src/components/dashboard/ExportTile.tsx` (remove legacy import once flag is default-on)
- Leave: `src/lib/pdf/generatePDF.ts` unchanged in this phase (kept as rollback path)

**Rule:** in Phase 1 we do NOT delete `generatePDF.ts`. Even after v2 ships, we keep the old file for 2 weeks as a rollback. Deletion moves to a Phase-2 cleanup task once v2 has burned in.

- [ ] **Step 1: Mark `generatePDF.ts` with a top-of-file deprecation comment**

Prepend to `src/lib/pdf/generatePDF.ts` (replacing the existing first-line header comment):

```typescript
/**
 * DEPRECATED — Phase 1 of export v2 introduces HTML → Playwright → PDF
 * rendering via src/lib/export/*. This file is retained as a rollback path
 * while EXPORT_V2_ENABLED is rolled out. Do not add new features here.
 *
 * Scheduled removal: Phase 2 cleanup task, after v2 has burned in for ≥ 2 weeks.
 */

```

Keep the rest of the file byte-identical.

- [ ] **Step 2: Commit**

```bash
git add src/lib/pdf/generatePDF.ts
git commit -m "chore(export): mark generatePDF.ts deprecated (removal in Phase 2 cleanup)"
```

---

## Task 24 · Docs update + Notion plan mirror + PR

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/cloud-run.md` (already done in Task 2)
- Notion: mirror this plan under the Syllabi parent page

- [ ] **Step 1: Add export v2 note to AGENTS.md**

Append at the bottom of `AGENTS.md`:

```markdown

# Export v2 (Phase 1 shipped 2026-04-XX)

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
```

- [ ] **Step 2: Mirror this plan to Notion under the Syllabi parent page**

Use the Notion MCP to create a child page under `https://www.notion.so/33015a619d1f8105b234c51afa599400` with:
- Title: `🛠 Plan — Premium Export Phase 1: Foundation (2026-04-23)`
- Icon: `🛠`
- Content: the full markdown of this plan, prefixed with:
  ```
  > **Status:** Ready for implementation
  > **Repo mirror:** `docs/superpowers/plans/2026-04-23-premium-export-phase-1-foundation.md`
  > **Parent spec:** [Premium Export Layouts (2026-04-23)](https://www.notion.so/34b15a619d1f81488148fce9acfc04eb)
  > **Git file is authoritative. This Notion page is the review surface.**
  ```

- [ ] **Step 3: Commit docs changes**

```bash
git add AGENTS.md
git commit -m "docs(export): note export v2 Phase 1 in AGENTS.md"
```

- [ ] **Step 4: Open the PR**

```bash
git push -u origin feat/export-v2-phase-1
gh pr create --title "feat(export): Phase 1 — Foundation + Shared Core PDF" --body "$(cat <<'EOF'
## Summary

Replaces the 1,746-line procedural jsPDF generator with an HTML→Playwright
PDF pipeline. Ships the Handbook "Shared Core" (6 components) with zero
dialect features — dialects land in Phase 3. Also:

- Cloud Run Dockerfile reworked to support Chromium (Debian base, Noto fonts, concurrency 2, memory 4 GiB)
- Supabase Storage bucket `exports` with per-user RLS
- Feature flag `EXPORT_V2_ENABLED` — default OFF
- Visual regression harness with 12-course baseline suite
- Legacy jsPDF file kept for rollback, marked deprecated

**Spec:** `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md`
**Plan:** `docs/superpowers/plans/2026-04-23-premium-export-phase-1-foundation.md`

## Test plan

- [ ] All Vitest suites pass: `pnpm vitest run`
- [ ] Integration test renders a valid PDF: `INTEGRATION_TESTS=true pnpm vitest run src/lib/export/__tests__/renderPdf.integration.test.ts`
- [ ] Visual regression passes on 12-course baseline suite: `pnpm vitest run tests/visual/regression.test.ts`
- [ ] Manual QA in Vercel Preview with flag ON: generate a short course, click Export → PDF, verify cover has no Syllabi, footer has no Syllabi, page breaks are clean
- [ ] Manual QA in Vercel Preview: generate a masterclass course, verify polling flow works and PDF arrives within 90s p95
- [ ] Confirm Cloud Run deploy succeeded: `gcloud run services describe inngest-worker --region=europe-west8 --format='value(status.url)'`
- [ ] Rollback test: flip flag OFF in Preview, confirm old jsPDF path still works

## Rollout

- Merge with flags OFF in Production.
- Flip `NEXT_PUBLIC_EXPORT_V2_ENABLED=true` in Preview for QA.
- Once green, flip Production flags to ON during a low-traffic window.
- Monitor `generation_events` for export-related errors for 48h.
- If any regression: revert the two env var flips — no code revert needed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review checklist (do this before claiming the phase done)

- [ ] All 24 tasks marked complete in the executing-plans checklist.
- [ ] `pnpm vitest run` green (all unit + integration tests).
- [ ] `pnpm typecheck` green.
- [ ] `pnpm build` green.
- [ ] Visual regression suite green on all 12 fixtures.
- [ ] Cloud Run deploy healthy — `gcloud run services describe inngest-worker --region=europe-west8` shows `Ready: True`.
- [ ] No Syllabi string anywhere in rendered PDF: `pnpm dlx pdftotext tests/visual/baselines/*.pdf - | grep -i syllabi` returns no matches.
- [ ] AGENTS.md + docs/cloud-run.md updated.
- [ ] Notion plan mirror created under Syllabi parent.
- [ ] PR opened with complete test plan.

---

## What Phase 2 looks like (so reviewers know where this goes)

Phase 2 will reuse the 6 Core components to rewrite `/course/[id]/course-content.tsx` and `/share/share-content.tsx` as thin wrappers around `CourseDocument`, plus replace `generateScorm.ts` with a `buildScormBundle` that zips the same HTML under a SCORM 1.2 manifest. Phase 2 is ~700 LoC and unblocks SCORM-consuming LMS customers.

*Plan authored 2026-04-23 from spec `docs/superpowers/specs/2026-04-23-premium-export-layouts-design.md` (commit `396b36e`).*
