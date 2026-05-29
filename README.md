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

## Stack

- SolidJS + Vite
- `@solidjs/router`
- Supabase (Postgres + Realtime)
- Single `createStore` in `src/lib/store.ts` for all app state
