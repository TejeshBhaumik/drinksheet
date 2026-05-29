# Drinksheet

Lightweight real-time drink tracking. SolidJS frontend + Supabase.

## Setup

1. Copy `.env.example` to `.env.local` and add your Supabase URL + publishable key.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Install and start:

```bash
npm install
npm run dev
```

## Routes

- `/` — landing (Create / Join)
- `/create` — create event
- `/join` — join event
- `/event/:eventName` — live leaderboard

## Vercel deploy

1. Push to GitHub (Vercel auto-deploys from `main`).
2. In **Vercel → Project → Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://rhncvsohhzywoqtopsaq.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your `sb_publishable_...` key |

3. **Redeploy** after adding env vars (Deployments → ⋯ → Redeploy).

`vercel.json` handles SPA routing so `/event/VEGAS2026` works on refresh.
