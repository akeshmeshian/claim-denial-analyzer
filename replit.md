# Claim Denial Analyzer

## Overview

A production-ready web app that lets users upload insurance denial letters and policy PDFs, receive an AI-powered coverage analysis, and unlock a full structured report for $29 via Stripe Checkout.

## Architecture

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

### Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **AI**: OpenAI via Replit AI Integration proxy (`gpt-5.1`)
- **Payments**: Stripe Checkout
- **File Storage**: Replit Object Storage (presigned PUT URLs)
- **PDF Parsing**: `pdf-parse` (PDFParse named export)

## Packages

| Package | Path | Description |
|---|---|---|
| `@workspace/api-server` | `artifacts/api-server` | Express backend — all API routes |
| `@workspace/claim-denial-analyzer` | `artifacts/claim-denial-analyzer` | React+Vite frontend |
| `@workspace/db` | `lib/db` | Drizzle ORM schema + client |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod schemas from OpenAPI spec |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec + Orval codegen config |

## User Flow

1. **Landing page** (`/`) — hero + how-it-works + disclaimer
2. **Upload page** (`/upload`) — fill form, upload 2 PDFs to Object Storage, triggers AI analysis
3. **Preview page** (`/preview/:id`) — denial summary + first argument (locked) + Stripe unlock CTA ($29)
4. **Report page** (`/report/:id`) — full structured report (only after payment confirmed)
5. **Admin page** (`/admin`) — password-protected reports dashboard

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| POST | `/api/reports` | Create report record |
| GET | `/api/reports/:id` | Get report (preview data) |
| POST | `/api/reports/:id/analyze` | Run OpenAI analysis |
| GET | `/api/reports/:id/full` | Get full report (requires paid status) |
| POST | `/api/reports/:id/checkout` | Create Stripe Checkout session |
| POST | `/api/stripe/webhook` | Handle Stripe webhook (mark paid) |
| POST | `/api/storage/uploads/request-url` | Get presigned PUT URL for PDF upload |
| GET | `/api/admin/reports` | Admin dashboard (password-protected via ?password=) |

## Database Schema

- **`reports`** — id, email, claimType, claimDescription, denialFileUrl, policyFileUrl, denialText, policyText, aiPreview (JSONB), aiFullReport (JSONB), paymentStatus, stripeSessionId, createdAt
- **`payments`** — id, reportId, stripeSessionId, amount, currency, status, createdAt

## Environment Secrets Required

- `ADMIN_PASSWORD` — admin dashboard password
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (frontend)
- `SESSION_SECRET` — session secret
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` — Replit Object Storage bucket
- `PRIVATE_OBJECT_DIR` — private object storage path
- `PUBLIC_OBJECT_SEARCH_PATHS` — public object search paths
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — set by Replit OpenAI integration
- `AI_INTEGRATIONS_OPENAI_API_KEY` — set by Replit OpenAI integration

## Key Implementation Notes

- OpenAI client is inlined in `artifacts/api-server/src/lib/openaiClient.ts` (not imported from workspace lib, because esbuild can't process `.ts` files from workspace packages directly)
- pdf-parse must use named import `{ PDFParse }` — the ESM export has no default
- Stripe is initialized without an `apiVersion` option (uses SDK default)
- The Stripe webhook route requires `express.raw({ type: "application/json" })` middleware BEFORE `express.json()` in `app.ts`
- Object Storage upload returns a presigned GCS PUT URL; the `objectPath` is stored (normalized to `/objects/...`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run build` — build API server
