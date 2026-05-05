# Claim Denial Analyzer — Next.js

An AI-powered SaaS app that analyzes insurance claim denials and returns structured coverage arguments, policy citations, and a draft response message.

## Tech Stack

- **Next.js 14** (App Router, SSR + API routes)
- **Tailwind CSS**
- **Drizzle ORM** + PostgreSQL
- **OpenAI API** (GPT-4o — analysis + Vision OCR for images)
- **Stripe** (one-time $29 payment per report)

---

## Running on Replit (Primary)

The app runs automatically via the configured workflow. Just set your secrets and the live URL works immediately.

### 1. Set Environment Variables

In your Replit project, go to **Tools → Secrets** and add:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `TEST_MODE_PASSWORD` | Password for `/test-upload` (no payment) | Yes |
| `ADMIN_PASSWORD` | Password for admin dashboard | Recommended |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For payments |
| `NEXT_PUBLIC_APP_URL` | Your Replit live URL (e.g. `https://your-repl.replit.app`) | For Stripe redirects |

### 2. Set Up the Database (First Time Only)

```bash
cd nextjs && pnpm run db:push
```

This creates the `reports` and `payments` tables.

### 3. App Runs Automatically

The workflow starts the Next.js dev server on your Replit live URL. No further setup needed.

---

## Using Test Mode (No Payment Required)

Test mode lets you run the full upload + AI analysis without going through Stripe.

1. Navigate to `/test-upload` — this page is **not linked publicly**
2. Enter your `TEST_MODE_PASSWORD`
3. Upload a denial letter + insurance policy
4. The full report is shown immediately, no payment required
5. Reports are stored in the DB with `payment_status = "test"`

**Security:** Password is validated server-side only via a `httpOnly` cookie. Frontend JS cannot read it. URL params like `?test=true` have no effect.

---

## Running Locally

```bash
cd nextjs
cp .env.example .env.local
# fill in .env.local with real values
pnpm install
pnpm run db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Stripe Webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the printed signing secret → set as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → import your repo
3. **Set Root Directory to `nextjs`**
4. Set Install Command: `pnpm install`
5. Set Build Command: `pnpm build`
6. Add all environment variables from `.env.example`
7. After deploy, add a Stripe webhook in the Stripe dashboard:
   - URL: `https://your-app.vercel.app/api/webhook`
   - Event: `checkout.session.completed`
   - Copy signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

> **Vercel Hobby Plan:** Serverless functions have a 4.5MB body limit. For large PDFs, upgrade to Vercel Pro or use Vercel Blob.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/upload` | Upload form — denial letter + policy |
| `/result/[id]` | Preview (free) or full report (paid or test) |
| `/sample-report` | Static example showing what a full report looks like |
| `/test-upload` | **Internal only** — password-protected, bypasses payment |
| `/api/analyze` | POST — accepts files, extracts text, runs AI |
| `/api/checkout` | POST — creates Stripe Checkout session |
| `/api/webhook` | POST — Stripe webhook (marks report paid) |
| `/api/reports/[id]` | GET — fetch report data |
| `/api/test-auth` | POST — validates test password, sets httpOnly cookie |
| `/api/test-analyze` | POST — test analysis (stores as `payment_status = "test"`) |

---

## Project Structure

```
nextjs/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── upload/page.tsx            # Upload form
│   ├── result/[id]/               # Preview + full report
│   ├── sample-report/page.tsx     # Static example report
│   ├── test-upload/page.tsx       # Internal test mode
│   └── api/
│       ├── analyze/route.ts       # POST - AI analysis
│       ├── checkout/route.ts      # POST - Stripe checkout
│       ├── webhook/route.ts       # POST - Stripe webhook
│       ├── reports/[id]/route.ts  # GET - report data
│       ├── test-auth/route.ts     # POST - test mode auth
│       └── test-analyze/route.ts  # POST - test mode analysis
├── lib/
│   ├── db.ts                      # Drizzle DB connection
│   ├── schema.ts                  # Database schema
│   ├── openai.ts                  # OpenAI analysis logic
│   └── document-extract.ts       # PDF parsing + Vision OCR
├── components/
│   ├── Navbar.tsx
│   └── Disclaimer.tsx
├── .env.example                   # Environment variable template
└── drizzle.config.ts              # DB migration config
```

---

## Environment Variables Summary

| Variable | Replit Secrets | `.env.local` | Vercel |
|---|---|---|---|
| `DATABASE_URL` | ✓ | ✓ | ✓ |
| `OPENAI_API_KEY` | ✓ | ✓ | ✓ |
| `TEST_MODE_PASSWORD` | ✓ | ✓ | ✓ |
| `ADMIN_PASSWORD` | ✓ | ✓ | ✓ |
| `STRIPE_SECRET_KEY` | ✓ | ✓ | ✓ |
| `STRIPE_PUBLISHABLE_KEY` | ✓ | ✓ | ✓ |
| `STRIPE_WEBHOOK_SECRET` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_APP_URL` | ✓ | ✓ | ✓ |
