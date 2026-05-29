# Drinksheet — Implementation Plan

# Goal

Build a lightweight, real-time drink tracking web app called **Drinksheet**.

Users can:

* create events
* join events via a shared event code
* track drinks collaboratively
* edit only their own entries
* view a live leaderboard

Primary goal:

* ultra-fast MVP
* no login friction
* real-time collaborative feel
* simple deployable architecture

---

# Core Stack

## Frontend

* Next.js (App Router)
* React
* TypeScript
* TailwindCSS

## Backend / Database

* Supabase Postgres (or any SQL-compatible DB)

## Hosting

* Vercel

## Realtime Layer

* Supabase Realtime subscriptions (or polling fallback)

---

# Styling System (IMPORTANT)

All UI styling must use:

```text id="style1"
.agents/skills/minimal
```

## Rules:

* All components must conform to Neon styling system
* Do not introduce ad-hoc styling systems outside Neon
* Tailwind is allowed only as a base utility layer
* Neon system defines:

  * spacing rhythm
  * color tokens
  * component styling patterns
  * hover/active states
  * card + table styling

## Design Direction:

* modern neon minimalism
* soft glow accents
* dark-first UI
* high contrast readability
* clean data-table aesthetic

---

# Architecture

```text id="a1"
Client (Next.js)
    ↓
Supabase Client SDK
    ↓
Postgres Database
```

No custom backend server required.

All reads/writes are performed via parameterized SDK calls.

---

# Core Concept

Drinksheet uses a **shared event code + local edit token identity system**.

This avoids login while still enforcing per-user editing control.

---

# Data Model

## Table Name

```text id="a2"
master
```

Each row represents:

* one player within one event

---

# Logical Identity

Each row is uniquely identified by:

```text id="a3"
(event_name, player_name)
```

This ensures:

* no duplicate users per event

---

# Schema

```typescript id="a4"
type MasterRow = {
  event_name: string
  player_name: string

  beer: number
  wine: number
  liquor: number

  edit_token: string

  created_at: timestamp
}
```

---

# Constraints

## Uniqueness

```text id="a5"
(event_name, player_name)
```

## Numeric Rules

* beer, wine, liquor:

  * default 0
  * allow decimals
  * never negative

---

# Identity System

## Event Code (Shared)

Used to access event:

```text id="a6"
/event/VEGAS2026
```

All users share the same event link.

---

## Edit Token (Private)

Each player gets:

```text id="a7"
edit_token
```

Stored in:

* browser localStorage

Used to determine:

* who can edit which row

---

# Pages

# 1. Landing Page

Route:

```text id="a8"
/
```

UI:

```text id="a9"
[ Create Event ]   [ Join Event ]
```

Minimal card-based layout.

Styled entirely using `.agents/skills/neon`.

---

# 2. Create Event Flow

## Inputs

```text id="a10"
Event Code
Player Name
```

## Behavior

1. create row in `master`
2. set all drink values to 0
3. generate `edit_token`
4. store token in browser localStorage
5. redirect to event page

---

# 3. Join Event Flow

## Inputs

```text id="a11"
Event Code
Player Name
```

## Behavior

1. verify event exists
2. insert new row
3. generate `edit_token`
4. store token in localStorage
5. redirect to event page

---

# 4. Event Page

Route:

```text id="a12"
/event/[eventName]
```

## Features

* full leaderboard view
* real-time updates
* inline editing (own row only)

Styled using `.agents/skills/neon`.

---

# Table Layout

| Player | Beer | Liquor | Wine | Total |
| ------ | ---- | ------ | ---- | ----- |

---

# Computed Fields

## Total (Frontend only)

```typescript id="a13"
total = beer + wine + liquor
```

Never stored in DB.

---

# Editing Rules

## Immutable Fields

* event_name
* player_name

## Editable Fields

* beer
* wine
* liquor

---

# Permission Model

A row is editable only if:

```text id="a14"
request.edit_token === row.edit_token
```

AND:

```text id="a15"
event_name + player_name match row
```

---

# Update Behavior

All updates must:

* be parameterized (no raw SQL strings)
* use SDK methods
* avoid injection risk

---

# Browser State

On join/create:

```text id="a17"
localStorage.setItem("drinksheet_edit_token", token)
```

On load:

* retrieve token
* attach to update requests

---

# Realtime Behavior

* updates propagate instantly
* all users see live leaderboard changes
* optimistic UI updates for responsiveness

---

# Frontend Structure

```text id="a18"
/app
  /event/[eventName]
    page.tsx

/components
  Header.tsx
  LandingActions.tsx
  EventForm.tsx
  LeaderboardTable.tsx
  EditableCell.tsx

/lib
  db.ts
  identity.ts
```

---

# UI Principles

Drinksheet should feel:

* fast
* social
* lightweight
* mobile-first
* zero-friction

All UI must conform to `.agents/skills/neon`.

---

# Validation Rules

## Event Code

* URL-safe
* uppercase recommended
* unique per event

## Player Name

* required
* trimmed
* unique within event

## Numbers

* numeric only
* no negatives
* allow decimals

---

# Security Model

This is a **trust-based MVP system**, not full authentication.

## Guarantees

* users can only edit their own row
* no login required
* no server-side session complexity

## Limitations

* edit token is stored client-side
* not secure against intentional abuse

---

# Deployment

## Vercel

* auto deploy from GitHub
* environment variables required

## Database

```text id="a19"
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

# MVP Milestones

## Phase 1

* project setup
* landing page
* routing

## Phase 2

* create event flow
* join event flow
* DB integration

## Phase 3

* event leaderboard
* inline editing

## Phase 4

* realtime updates
* optimistic UI

## Phase 5

* polish + mobile optimization

---

# Success Criteria

Drinksheet is successful if:

* events are joinable in <10 seconds
* multiple users can edit simultaneously
* updates feel instant
* no login is required
* sharing a link is enough to use it

---

# Future Enhancements

* QR code event join
* authentication upgrade (optional)
* teams/groups
* charts + analytics
* export to CSV
* emoji reactions
* drink presets
* admin mode
