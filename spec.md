Here is your **fully consolidated, migration-safe, MVP-appropriate spec.md v6** with:

* full architecture locked
* leaderboard engine optimized
* stepper UX system
* migration-first API SDK layer (important addition)
* Supabase abstraction enforced
* no overengineering creep
* still MVP-fast

---

# 📄 Drinksheet — Competition Engine MVP Spec v6

---

## 🧭 STATUS

This specification replaces all previous versions.

The system is rebuilt around:

* authentication
* events
* participants
* event results (immutable)
* user stats (cached)
* messaging (SMS optional)

---

# 🧠 PRODUCT VISION

Drinksheet is a **real-time social competition engine** where users:

* create events
* join events via link/code
* update metrics in real time
* compete on live leaderboards
* view statistics
* receive event summaries

---

# ⚙️ CORE DESIGN PRINCIPLE

> Supabase is infrastructure. Not architecture.

The frontend must remain fully backend-agnostic.

---

# 🧱 TECH STACK

## Frontend

* SolidJS
* TypeScript
* Signals
* createMemo
* createResource

## Backend (MVP)

* Supabase Auth
* Supabase Postgres
* Supabase Realtime
* Edge Functions

## Hosting

* Vercel

## Styling

* `.agents/skills/modern`

---

# 🧭 MVP BUILD PLAN

## Phase 1 — Foundation

* Google Auth
* users table
* events table
* participants table
* API layer scaffolding

---

## Phase 2 — Event Flow

* create event
* join event via event_code
* auto participant creation
* redirect to event page

---

## Phase 3 — Metrics Engine

* JSON metrics per participant
* calculateScore()
* leaderboard memo pipeline

---

## Phase 4 — Realtime

* Supabase Realtime subscription
* useLeaderboardStream wrapper

---

## Phase 5 — Completion Flow

* snapshot event_results
* update user_stats
* optional SMS blast

---

## Phase 6 — UX Polish

* steppers
* animations
* leaderboard transitions

---

# 🧱 ARCHITECTURE

---

## UI LAYER (STRICT RULE)

Must NOT contain:

* Supabase calls
* SQL
* scoring logic
* stats logic

Only:

* rendering
* interaction
* routing

---

## LOGIC LAYER (PURE FUNCTIONS)

* calculateScore()
* computeLeaderboard()
* computeEventStats()
* computeUserStats()

Must be:

* deterministic
* backend-agnostic
* reusable

---

## DATA LAYER

All data access must go through:

```
src/lib/api/
```

---

# 🔌 MIGRATION-FIRST API SDK (CRITICAL)

This is the MOST IMPORTANT ADDITION.

---

# 🧠 API LAYER = MINI SDK

The frontend ONLY uses this interface:

---

## auth.ts

```ts
getSession(): Promise<Session | null>

getCurrentUser(): Promise<User | null>

signInWithGoogle(): Promise<void>

signOut(): Promise<void>
```

---

## users.ts

```ts
getUser(userId: string): Promise<User>

updateDisplayName(userId: string, name: string): Promise<void>

updatePhoneNumber(userId: string, number: string): Promise<void>
```

---

## events.ts

```ts
createEvent(input: {
  eventName: string
  createdBy: string
}): Promise<Event>

getEvent(eventCode: string): Promise<Event>

joinEvent(input: {
  eventCode: string
  userId: string
  displayName: string
}): Promise<void>

completeEvent(eventId: string): Promise<void>
```

---

## participants.ts

```ts
getParticipants(eventId: string): Promise<Participant[]>

updateParticipantMetrics(input: {
  eventId: string
  userId: string
  metrics: Record<string, number>
}): Promise<void>

createParticipant(input: {
  eventId: string
  userId: string
  displayName: string
}): Promise<void>
```

---

## leaderboard.ts

```ts
getLeaderboard(eventId: string): Promise<LeaderboardRow[]>
```

> NOTE: frontend still computes live leaderboard via createMemo

This is only for snapshots / fallback.

---

## stats.ts

```ts
getUserStats(userId: string): Promise<UserStats>

recomputeUserStats(userId: string): Promise<void>
```

---

## links.ts

```ts
getEventLinks(eventId: string): Promise<Link[]>

addLink(input: {
  eventId: string
  title: string
  url: string
  createdBy: string
}): Promise<void>
```

---

## sms.ts

```ts
sendEventSummary(input: {
  eventId: string
}): Promise<void>
```

---

# 🧠 WHY THIS SDK MATTERS

This guarantees:

* frontend never depends on Supabase
* backend can be replaced entirely
* APIs become stable contract layer

---

# 🧮 SCORING ENGINE

```ts
score =
  beer +
  seltzer +
  wine +
  (liquor * 1.25)
```

---

# ⚡ LEADERBOARD ENGINE (OPTIMIZED)

## RULE

Never compute score inside `.sort()`

---

## Step 1

```ts
const enriched = createMemo(() => {
  return participants().map(p => ({
    ...p,
    score: calculateScore(p.metrics)
  }));
});
```

---

## Step 2

```ts
const leaderboard = createMemo(() =>
  enriched().sort((a, b) => b.score - a.score)
);
```

---

# 🎮 METRIC ENTRY UI

## Stepper system (MVP UX)

Each metric:

```
Beer        1.5
[-]   [+]
```

---

## Interaction rules

* tap = ±0.5
* long press = ±1.0

---

## Design principle

> No text inputs required for primary flow

---

# 🔁 REALTIME MODEL

* participants = live state
* leaderboard = derived view
* event_results = immutable snapshot

---

# 🧾 EVENT FLOW

## Create

* event created
* event_code generated
* creator auto-added

---

## Join

* validate event_code
* create participant
* initialize metrics

---

## Update

* user updates only own metrics
* realtime updates propagate

---

## Complete

* freeze leaderboard
* write event_results
* update user_stats
* optional SMS

---

# 🧍 USER MODEL

* users.display_name = global identity
* participants.display_name = event identity

---

# 🧠 AUTH SYSTEM

* Google OAuth only
* auth.uid() canonical
* survives refresh

---

# 🔐 SECURITY RULES

* user can only edit own participant row
* only event creator can complete event
* RLS enforced everywhere

---

# 📊 USER STATS

Derived ONLY from:

* event_results

Never from live participants.

---

# 🧠 MIGRATION GUARANTEE (CRITICAL)

If rules are followed:

> Supabase can be replaced without changing UI

---

## HARD RULES

* no Supabase in UI
* no SQL in frontend
* no schema coupling in components
* all logic in pure functions
* all data via API SDK

---

# 🎨 UI SYSTEM

---

## Style

* dark
* neon accents
* competitive energy

---

## Motion

* leaderboard transitions
* score pulses
* podium animation

---

## UX GOAL

> feels like a live game, not a form

---

# 🚀 MVP SUCCESS CRITERIA

User can:

1. sign in with Google
2. create event
3. join event
4. update metrics in real time
5. see live leaderboard
6. view stats
7. complete event
8. receive results

---

# 🧠 FINAL SYSTEM DEFINITION

Drinksheet is:

> a real-time competition engine with pluggable metrics, reactive leaderboards, and immutable event history

---
