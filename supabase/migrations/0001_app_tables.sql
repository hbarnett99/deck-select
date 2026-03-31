-- ============================================================
-- 0001_app_tables.sql
-- Adds all application tables, RLS policies, and views.
-- Existing tables (ping, users) are untouched.
-- ============================================================

-- -------------------------------------------------------
-- whitelisted_users
-- (must exist before is_whitelisted() is defined)
-- -------------------------------------------------------
create table if not exists public.whitelisted_users (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint whitelisted_users_user_id_unique unique (user_id)
);

alter table public.whitelisted_users enable row level security;

-- Any authenticated user may check whether they're whitelisted.
-- Inserts/deletes are managed via service role (Supabase dashboard or admin action).
create policy "Authenticated users can read whitelisted_users"
  on public.whitelisted_users for select
  to authenticated
  using (true);

-- -------------------------------------------------------
-- Helper: returns true if the calling user is whitelisted
-- Defined after whitelisted_users so the table reference resolves.
-- SECURITY DEFINER so RLS on whitelisted_users doesn't block the check.
-- -------------------------------------------------------
create or replace function public.is_whitelisted()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.whitelisted_users
    where user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------
-- commanders
-- -------------------------------------------------------
create table if not exists public.commanders (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  created_by  uuid        not null references auth.users(id),
  created_at  timestamptz not null default now(),
  constraint commanders_name_unique unique (name)
);

alter table public.commanders enable row level security;

create policy "Whitelisted users can read commanders"
  on public.commanders for select
  to authenticated
  using (is_whitelisted());

create policy "Whitelisted users can insert commanders"
  on public.commanders for insert
  to authenticated
  with check (is_whitelisted() and auth.uid() = created_by);

-- -------------------------------------------------------
-- pools
-- -------------------------------------------------------
create table if not exists public.pools (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  created_by  uuid        not null references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.pools enable row level security;

create policy "Whitelisted users can read pools"
  on public.pools for select
  to authenticated
  using (is_whitelisted());

create policy "Whitelisted users can insert pools"
  on public.pools for insert
  to authenticated
  with check (is_whitelisted() and auth.uid() = created_by);

create policy "Pool creator can update their pool"
  on public.pools for update
  to authenticated
  using (is_whitelisted() and auth.uid() = created_by);

-- -------------------------------------------------------
-- pool_commanders (junction)
-- -------------------------------------------------------
create table if not exists public.pool_commanders (
  pool_id       uuid        not null references public.pools(id) on delete cascade,
  commander_id  uuid        not null references public.commanders(id) on delete cascade,
  added_by      uuid        not null references auth.users(id),
  added_at      timestamptz not null default now(),
  primary key (pool_id, commander_id)
);

alter table public.pool_commanders enable row level security;

create policy "Whitelisted users can read pool_commanders"
  on public.pool_commanders for select
  to authenticated
  using (is_whitelisted());

create policy "Whitelisted users can add to pool_commanders"
  on public.pool_commanders for insert
  to authenticated
  with check (is_whitelisted() and auth.uid() = added_by);

create policy "Whitelisted users can remove from pool_commanders"
  on public.pool_commanders for delete
  to authenticated
  using (is_whitelisted());

-- -------------------------------------------------------
-- lobbies
-- -------------------------------------------------------
create table if not exists public.lobbies (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  pool_id        uuid        not null references public.pools(id),
  admin_id       uuid        not null references auth.users(id),
  practice_mode  boolean     not null default false,
  status         text        not null default 'waiting'
                             check (status in ('waiting', 'drawing', 'complete')),
  created_at     timestamptz not null default now()
);

alter table public.lobbies enable row level security;

create policy "Whitelisted users can read lobbies"
  on public.lobbies for select
  to authenticated
  using (is_whitelisted());

create policy "Whitelisted users can insert lobbies"
  on public.lobbies for insert
  to authenticated
  with check (is_whitelisted() and auth.uid() = admin_id);

-- Admin updates status; service role updates status during draw.
create policy "Lobby admin can update their lobby"
  on public.lobbies for update
  to authenticated
  using (is_whitelisted() and auth.uid() = admin_id);

-- -------------------------------------------------------
-- lobby_players
-- -------------------------------------------------------
create table if not exists public.lobby_players (
  id            uuid        primary key default gen_random_uuid(),
  lobby_id      uuid        not null references public.lobbies(id) on delete cascade,
  user_id       uuid        not null references auth.users(id),
  is_ready      boolean     not null default false,
  commander_id  uuid        references public.commanders(id),
  joined_at     timestamptz not null default now()
);

alter table public.lobby_players enable row level security;

create policy "Whitelisted users can read lobby_players"
  on public.lobby_players for select
  to authenticated
  using (is_whitelisted());

create policy "Whitelisted users can join a lobby"
  on public.lobby_players for insert
  to authenticated
  with check (is_whitelisted() and auth.uid() = user_id);

-- Users can toggle their own is_ready.
-- commander_id is assigned by the draw action using service role (bypasses RLS).
create policy "Users can update their own lobby_player row"
  on public.lobby_players for update
  to authenticated
  using (is_whitelisted() and auth.uid() = user_id);

-- -------------------------------------------------------
-- claims
-- -------------------------------------------------------
create table if not exists public.claims (
  id              uuid           primary key default gen_random_uuid(),
  lobby_id        uuid           not null references public.lobbies(id),
  user_id         uuid           not null references auth.users(id),
  commander_id    uuid           not null references public.commanders(id),
  moxfield_url    text,
  deck_value_usd  numeric(8, 2),
  result          text           check (result in ('win', 'loss', 'draw')),
  created_at      timestamptz    not null default now()
);

alter table public.claims enable row level security;

create policy "Whitelisted users can read claims"
  on public.claims for select
  to authenticated
  using (is_whitelisted());

-- Claims are inserted by the draw server action using the service role key,
-- which bypasses RLS entirely. No client insert policy is needed.

-- Users can fill in retrospective data on their own claims.
create policy "Users can update their own claims"
  on public.claims for update
  to authenticated
  using (is_whitelisted() and auth.uid() = user_id);

-- -------------------------------------------------------
-- commander_stats view
-- Aggregates claim outcomes per commander.
-- -------------------------------------------------------
create or replace view public.commander_stats as
select
  c.id                                                             as commander_id,
  c.name                                                           as commander_name,
  count(cl.id)                                                     as times_claimed,
  count(cl.id) filter (where cl.result = 'win')                   as wins,
  count(cl.id) filter (where cl.result = 'loss')                  as losses,
  count(cl.id) filter (where cl.result = 'draw')                  as draws,
  round(avg(cl.deck_value_usd), 2)                                 as avg_deck_value_usd
from public.commanders c
left join public.claims cl on cl.commander_id = c.id
group by c.id, c.name;

-- Grant read access to authenticated users (whitelist enforced at app layer).
grant select on public.commander_stats to authenticated;

-- -------------------------------------------------------
-- Enable Realtime for lobby tables
-- -------------------------------------------------------
alter publication supabase_realtime add table public.lobbies;
alter publication supabase_realtime add table public.lobby_players;
