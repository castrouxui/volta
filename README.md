# VOLTA — AI Website Builder

> Describe a website in plain language. Get production-ready HTML/CSS/JS in seconds.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS → Vercel
- **Backend**: Node.js + Express + TypeScript → Vercel Serverless
- **Auth + DB**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe (subscription)
- **AI**: Claude API (claude-sonnet-4-6) with streaming

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in your API keys
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:5173

### 3. Database

Run `supabase/schema.sql` in your Supabase SQL Editor.

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `GEMINI_API_KEY` | Google Gemini API key (for hero image generation) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (not anon!) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe price ID for Pro Monthly |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Stripe price ID for Pro Yearly |
| `PORT` | Server port (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS + Stripe redirects |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | Stream website generation (SSE) |
| `POST` | `/api/generate/refine` | Stream website refinement (SSE, Pro) |
| `GET` | `/api/auth/me` | Get user profile |
| `GET` | `/api/auth/history` | Get generation history |
| `GET` | `/api/auth/generation/:id` | Get specific generation |
| `POST` | `/api/billing/create-checkout` | Create Stripe checkout session |
| `POST` | `/api/billing/portal` | Open Stripe customer portal |
| `POST` | `/api/billing/webhook` | Stripe webhook handler |
| `GET` | `/api/health` | Health check |

## Free vs Pro

| Feature | Free | Pro ($19/mo) |
|---------|------|--------------|
| Generations | 5/day | Unlimited |
| HTML export | ✓ | ✓ |
| Chat refinement | ✗ | ✓ |
| Generation history | ✗ | ✓ |
| React export | ✗ | ✓ |

## Deploy

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel deploy --prod
```

Set env vars in Vercel dashboard. Frontend and backend both deploy automatically from the same repo via `vercel.json`.

### Stripe Webhooks

Point Stripe webhook to: `https://your-vercel-url/api/billing/webhook`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.deleted`
- `invoice.payment_failed`
