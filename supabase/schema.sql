-- Drinksheet Competition Engine MVP schema.
-- Run in Supabase Dashboard -> SQL Editor -> New query -> Run.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_code text not null unique,
  created_by uuid not null references users(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);  

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  display_name text not null,
  metrics jsonb not null default '{"beer":0,"seltzer":0,"wine":0,"liquor":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists event_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  display_name text not null,
  metrics jsonb not null,
  score numeric not null,
  rank integer not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists user_stats (
  user_id uuid primary key references users(id) on delete cascade,
  events_played integer not null default 0,
  wins integer not null default 0,
  total_score numeric not null default 0,
  average_score numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  url text not null,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists participants_set_updated_at on participants;
create trigger participants_set_updated_at
before update on participants
for each row execute function set_updated_at();

create or replace function metric_score(metrics jsonb)
returns numeric
language sql
immutable
as $$
  select
    coalesce((metrics->>'beer')::numeric, 0) +
    coalesce((metrics->>'seltzer')::numeric, 0) +
    coalesce((metrics->>'wine')::numeric, 0) +
    (coalesce((metrics->>'liquor')::numeric, 0) * 1.25);
$$;

create or replace function recompute_user_stats(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_stats (user_id, events_played, wins, total_score, average_score, updated_at)
  select
    target_user_id,
    count(*)::integer,
    count(*) filter (where rank = 1)::integer,
    coalesce(sum(score), 0),
    coalesce(avg(score), 0),
    now()
  from event_results
  where user_id = target_user_id
  on conflict (user_id) do update set
    events_played = excluded.events_played,
    wins = excluded.wins,
    total_score = excluded.total_score,
    average_score = excluded.average_score,
    updated_at = now();
end;
$$;

create or replace function complete_event(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_user_id uuid;
begin
  if not exists (
    select 1 from events
    where id = target_event_id
      and created_by = auth.uid()
      and completed_at is null
  ) then
    raise exception 'Only the event creator can complete an open event.';
  end if;

  insert into event_results (event_id, user_id, display_name, metrics, score, rank)
  select
    event_id,
    user_id,
    display_name,
    metrics,
    metric_score(metrics),
    dense_rank() over (order by metric_score(metrics) desc)::integer
  from participants
  where event_id = target_event_id
  on conflict (event_id, user_id) do nothing;

  update events
  set completed_at = now()
  where id = target_event_id;

  for participant_user_id in
    select user_id from participants where event_id = target_event_id
  loop
    perform recompute_user_stats(participant_user_id);
  end loop;
end;
$$;

alter table users enable row level security;
alter table events enable row level security;
alter table participants enable row level security;
alter table event_results enable row level security;
alter table user_stats enable row level security;
alter table links enable row level security;

drop policy if exists "Users can read users" on users;
create policy "Users can read users" on users for select using (auth.uid() is not null);

drop policy if exists "Users can insert self" on users;
create policy "Users can insert self" on users for insert with check (id = auth.uid());

drop policy if exists "Users can update self" on users;
create policy "Users can update self" on users for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Authenticated users can read events" on events;
create policy "Authenticated users can read events" on events for select using (auth.uid() is not null);

drop policy if exists "Authenticated users can create events" on events;
create policy "Authenticated users can create events" on events for insert with check (created_by = auth.uid());

drop policy if exists "Creators can update events" on events;
create policy "Creators can update events" on events for update using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "Authenticated users can read participants" on participants;
create policy "Authenticated users can read participants" on participants for select using (auth.uid() is not null);

drop policy if exists "Users can join as self" on participants;
create policy "Users can join as self" on participants for insert with check (user_id = auth.uid());

drop policy if exists "Users can edit own participant" on participants;
create policy "Users can edit own participant" on participants
for update using (
  user_id = auth.uid()
  and exists (
    select 1 from events
    where events.id = participants.event_id
      and events.completed_at is null
  )
) with check (
  user_id = auth.uid()
  and exists (
    select 1 from events
    where events.id = participants.event_id
      and events.completed_at is null
  )
);

drop policy if exists "Authenticated users can read results" on event_results;
create policy "Authenticated users can read results" on event_results for select using (auth.uid() is not null);

drop policy if exists "Users can read own stats" on user_stats;
create policy "Users can read own stats" on user_stats for select using (user_id = auth.uid());

drop policy if exists "Authenticated users can read links" on links;
create policy "Authenticated users can read links" on links for select using (auth.uid() is not null);

drop policy if exists "Users can add own links" on links;
create policy "Users can add own links" on links for insert with check (created_by = auth.uid());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table participants;
  end if;
end;
$$;
