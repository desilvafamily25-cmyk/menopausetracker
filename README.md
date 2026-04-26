# Pause Sleep — Menopause Symptom Tracker

A full-stack web app for tracking menopause symptoms, identifying triggers, and generating doctor-ready reports.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Stripe · Recharts · Vercel

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Stripe](https://stripe.com) account (test mode)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values (see table below).

### 4. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy **Project URL** and **anon key** from `Settings → API`
3. Copy **service_role key** (server-only, never expose to browser)
4. Go to **SQL Editor** → paste `supabase/migrations/001_initial_schema.sql` → Run
5. Go to **Authentication → Settings**:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

### 5. Set Up Stripe (Test Mode)

1. Go to [stripe.com](https://stripe.com) → Dashboard
2. Copy **Publishable key** and **Secret key** from Developers → API Keys
3. Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 6. Run

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
gh repo create pause-sleep-tracker --public
git push origin main
```

### 2. Deploy

1. [vercel.com](https://vercel.com) → New Project → Import repo
2. Add all environment variables
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Deploy

### 3. Stripe Webhook (Production)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://tracker.pausesleep.com.au/api/stripe/webhook`
3. Event: `checkout.session.completed`
4. Copy webhook secret → update in Vercel env vars

### 4. Custom Domain

Vercel → Project → Settings → Domains → Add `tracker.pausesleep.com.au`

Update DNS as Vercel instructs.

### 5. Update Supabase URLs for Production

Authentication → URL Configuration:
- Site URL: `https://tracker.pausesleep.com.au`
- Redirect URL: `https://tracker.pausesleep.com.au/auth/callback`

---

## Project Structure

```
menopause-tracker/
├── app/
│   ├── (auth)/           # Login, signup, forgot-password
│   ├── (app)/            # Protected app (sidebar layout)
│   │   ├── dashboard/    # Charts + stats overview
│   │   ├── log/          # Daily symptom entry
│   │   ├── insights/     # Trends and trigger analysis
│   │   ├── doctor-report/# PDF/printable doctor summary
│   │   ├── treatments/   # HRT + treatment tracker
│   │   ├── supplements/  # Supplement log
│   │   └── settings/     # Profile, password, data export, delete
│   ├── api/
│   │   ├── auth/callback/# Supabase auth redirect handler
│   │   └── stripe/       # Checkout session + webhook
│   ├── checkout/         # Payment page
│   └── page.tsx          # Public landing page
├── components/
│   ├── ui/               # Button, Input, Card, Badge, Skeleton, EmptyState
│   ├── layout/           # Navbar/sidebar, Footer
│   └── charts/           # HotFlushChart, SleepQualityChart, TriggerChart
├── hooks/                # useUser, useLogs
├── lib/
│   ├── supabase/         # Browser + server Supabase clients
│   ├── stripe.ts         # Stripe client, checkout session factory
│   └── utils.ts          # Helpers: cn(), dates, streak, triggers, averages
├── types/database.ts     # TypeScript interfaces matching DB schema
├── middleware.ts          # Route protection (auth + payment gate)
└── supabase/migrations/  # 001_initial_schema.sql
```

---

## Auth + Payment Flow

```
User signs up → Email verification → /auth/callback
  → has_paid? → Yes → /dashboard
             → No  → /checkout → Stripe
                                 → webhook fires → sets has_paid=true
                                 → /dashboard
```

---

## Environment Variables

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys (secret) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI output or webhook settings |
| `NEXT_PUBLIC_APP_URL` | Your domain e.g. `https://tracker.pausesleep.com.au` |

---

## Go-Live Checklist

- [ ] Run SQL migration in Supabase
- [ ] Update Supabase auth redirect URLs to production domain
- [ ] Add Stripe production webhook endpoint
- [ ] Switch Stripe keys from test to live in Vercel
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Add custom domain in Vercel + update DNS
- [ ] Test full signup → payment → dashboard flow

---

*Pause Sleep | pausesleep.com.au | © Dr. Premila Hewage*
