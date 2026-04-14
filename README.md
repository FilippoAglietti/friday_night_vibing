# Syllabi.ai

AI course generator. Next.js 16 frontend on Vercel; Inngest background worker
on Google Cloud Run.

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

Requires a `.env.local` with the variables from `.env.example` (Anthropic,
Supabase, Stripe, Inngest, Upstash, Resend).

## Architecture

- **Frontend + user-facing API routes**: Next.js 16 on Vercel
- **Inngest background worker** (`/api/inngest`): Google Cloud Run
  (`europe-west8`, 60-min timeout ceiling for long Claude generations)
- **Database**: Supabase Postgres (EU West 1)
- **Background jobs**: Inngest Cloud
- **Rate limiting**: Upstash Redis
- **Payments**: Stripe
- **Email**: Resend

## Deploying the Inngest worker

See [`docs/cloud-run.md`](docs/cloud-run.md) for the Cloud Run runbook:
project IDs, deploy script, secrets rotation, logs, rollback.

## Deploying the frontend

Vercel handles this automatically on push to `main`. No local command needed.

## Learning Next.js

- [Next.js documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
