#!/usr/bin/env bash
set -euo pipefail

# Cloud Run deploy helper for the Inngest worker.
# Prereqs: gcloud authenticated, APIs enabled, Artifact Registry repo + service account + secrets present.

PROJECT_ID="${PROJECT_ID:-arboreal-inn-493219-t7}"
REGION="${REGION:-europe-west8}"
REPO="${REPO:-syllabi}"
SERVICE="${SERVICE:-inngest-worker}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo latest)}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:${IMAGE_TAG}"
SERVICE_ACCOUNT="syllabi-inngest-runner@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Building image: ${IMAGE}"
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}"

echo "Deploying to Cloud Run service: ${SERVICE}"
gcloud run deploy "${SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --image "${IMAGE}" \
  --service-account "${SERVICE_ACCOUNT}" \
  --timeout 3600 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 10 \
  --allow-unauthenticated \
  --set-secrets "ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,INNGEST_EVENT_KEY=INNGEST_EVENT_KEY:latest,INNGEST_SIGNING_KEY=INNGEST_SIGNING_KEY:latest,UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,RESEND_API_KEY=RESEND_API_KEY:latest"

echo
echo "Service URL:"
gcloud run services describe "${SERVICE}" --project "${PROJECT_ID}" --region "${REGION}" --format='value(status.url)'
