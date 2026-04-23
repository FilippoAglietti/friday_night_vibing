# Cloud Run — Inngest Worker

The Inngest background worker runs on Google Cloud Run (not Vercel). The Next.js
frontend and user-facing routes stay on Vercel; only the Inngest endpoint moved
to break through Vercel's 300s function ceiling.

## Quick reference

| Field | Value |
|---|---|
| GCP project ID | `arboreal-inn-493219-t7` |
| GCP project name | Syllabi Prod |
| Region | `europe-west8` (Milan) |
| Artifact Registry repo | `syllabi` |
| Cloud Run service | `inngest-worker` |
| Service URL | `https://inngest-worker-984073449634.europe-west8.run.app` |
| Inngest endpoint | `<service-url>/api/inngest` |
| Service account | `syllabi-inngest-runner@arboreal-inn-493219-t7.iam.gserviceaccount.com` |
| Cloud Run timeout | 3600s (vs Vercel's 300s) |
| Memory / CPU | 2 GiB / 2 vCPU |
| Autoscaling | min 0 · max 10 · concurrency 10 |

## Deploy

```bash
# From repo root, with gcloud authenticated
./deploy/cloud-run.sh
```

This builds a new image via Cloud Build and rolls out a new Cloud Run revision.
Traffic shifts to the new revision only after it passes healthcheck, so failed
deploys don't take down the worker.

Override the image tag with `IMAGE_TAG=v42 ./deploy/cloud-run.sh` if you want
deterministic rollbacks.

## Secrets

All runtime secrets live in Google Secret Manager, mounted as env vars via
`--set-secrets` in the deploy script. The full list is pinned in
`deploy/cloud-run.sh` — one secret per env var, `:latest` version.

Rotate a secret:

1. Edit it in [Secret Manager console](https://console.cloud.google.com/security/secret-manager?project=arboreal-inn-493219-t7)
   → "+ New Version" (use the console, not PowerShell pipe — Windows encoding
   corrupts the value).
2. Force a new Cloud Run revision so containers re-read `:latest`:
   ```bash
   gcloud run services update inngest-worker \
     --region=europe-west8 \
     --project=arboreal-inn-493219-t7 \
     --update-secrets="<SECRET_NAME>=<SECRET_NAME>:latest"
   ```

## Logs

```bash
gcloud run services logs tail inngest-worker \
  --region=europe-west8 \
  --project=arboreal-inn-493219-t7
```

Or in the console: Cloud Run → `inngest-worker` → Logs tab.

## Rollback

If a deploy breaks production, point Inngest back at Vercel while diagnosing:

1. Inngest Cloud dashboard → Apps → `syllabi-ai` → Resync
2. URL: `https://www.syllabi.online/api/inngest`

Cloud Run keeps running idle (scale-to-zero = no cost). Diagnose without
production pressure, then repoint Inngest back to Cloud Run when fixed.

## Gotchas

- **`NEXT_PUBLIC_*` env vars are inlined at build time**, not read at runtime —
  even in server code. Real values live in the Dockerfile `builder` stage.
- **Secrets mounted via `--set-secrets` are read at container startup.**
  Changing the secret version requires a new Cloud Run revision to take effect.
- **Inngest signature verification** uses `INNGEST_SIGNING_KEY`. If you see
  "Signature verification failed" after a deploy, check this secret is not
  corrupted (BOM, trailing newline) — set it via the console, not PowerShell.

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
