# Claim Denial Analyzer — Next.js

A production-ready AI-powered SaaS app that analyzes insurance claim denials and returns structured coverage arguments, policy citations, and a draft response.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Drizzle ORM** + PostgreSQL
- **OpenAI API** (GPT-4o for analysis + Vision for image OCR)
- **Stripe** (one-time payment at $29/report)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/akeshmeshian/claim-denial-analyzer
cd claim-denial-analyzer/nextjs
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon, Supabase, Railway) |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Set Up the Database

```bash
npm run db:push
```

This creates the `reports` and `payments` tables in your database.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set Up Stripe Webhooks (Local)

Install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Deploy to Vercel

### 1. Push to GitHub

The code lives in the `nextjs/` subdirectory of the monorepo.

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Set Root Directory to `nextjs`**
4. Add all environment variables from `.env.example`

### 3. Stripe Webhook on Vercel

After deploying, add a webhook endpoint in the Stripe dashboard:

- URL: `https://your-app.vercel.app/api/webhook`
- Events: `checkout.session.completed`
- Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Accept file uploads, extract text, run AI analysis |
| `/api/checkout` | POST | Create a Stripe checkout session |
| `/api/webhook` | POST | Stripe webhook handler |
| `/api/reports/[id]` | GET | Get report data |

## File Upload Notes

Files are uploaded as multipart form data directly to the `/api/analyze` route. Max size: 25MB per file. Supported formats: PDF, JPEG, PNG, WebP, GIF, TIFF.

> **Vercel Hobby Plan:** Serverless functions have a 4.5MB body limit by default. For files over 4.5MB, upgrade to Vercel Pro or use Vercel Blob.

## Project Structure

```
nextjs/
├── app/
│   ├── page.tsx              # Landing page
│   ├── upload/page.tsx       # Upload form
│   ├── result/[id]/          # Preview + full report
│   └── api/
│       ├── analyze/          # POST - run analysis
│       ├── checkout/         # POST - Stripe checkout
│       ├── webhook/          # POST - Stripe webhook
│       └── reports/[id]/     # GET - report data
├── lib/
│   ├── db.ts                 # Drizzle DB connection
│   ├── schema.ts             # Database schema
│   ├── openai.ts             # OpenAI analysis
│   └── document-extract.ts  # PDF + image OCR
└── components/
    ├── Navbar.tsx
    └── Disclaimer.tsx
```
