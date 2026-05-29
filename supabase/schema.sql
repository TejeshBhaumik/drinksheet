-- Drinksheet: run this in Supabase Dashboard → SQL Editor → New query → Run

-- 1. Create the table
create table master (
  event_name text not null,
  player_name text not null,
  beer numeric not null default 0 check (beer >= 0),
  wine numeric not null default 0 check (wine >= 0),
  liquor numeric not null default 0 check (liquor >= 0),
  edit_token text not null,
  created_at timestamptz not null default now(),
  primary key (event_name, player_name)
);

-- 2. Optional sample data (remove if you don't want test rows)
insert into master (event_name, player_name, beer, wine, liquor, edit_token)
values
  ('VEGAS2026', 'Alex', 2, 1, 0, 'sample-token-alex'),
  ('VEGAS2026', 'Sam', 1, 0, 3, 'sample-token-sam');

-- 3. Enable row level security
alter table master enable row level security;

-- 4. Policies (MVP: open access; app enforces edit_token on updates)
create policy "Allow read" on master for select using (true);
create policy "Allow insert" on master for insert with check (true);
create policy "Allow update" on master for update using (true);

-- 5. Enable realtime (live leaderboard updates)
alter publication supabase_realtime add table master;

-- Recent events query (first player row per event = event creation time):
-- select event_name, min(created_at) as created_at
-- from master
-- group by event_name
-- order by created_at desc
-- limit 5;
