-- ============================================================================
--  Rewayati — Supabase schema for the comments system
--  Run this ONCE in the Supabase dashboard → SQL Editor → New query → Run.
--  Safe to re-run (idempotent).
-- ============================================================================

-- 1) Comments table ----------------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  novel_id    text        not null,
  username    text        not null,
  content     text        not null,
  likes       text[]      not null default '{}',
  -- SHA-256 hash of a random token the poster keeps in their browser.
  -- Lets a guest delete ONLY their own comment without needing an account.
  owner_hash  text,
  created_at  timestamptz not null default now()
);

create index if not exists comments_novel_id_created_idx
  on public.comments (novel_id, created_at desc);

-- 2) Row Level Security -------------------------------------------------------
--    Everyone may READ. All writes go through the server (service role, which
--    bypasses RLS), so we do NOT grant insert/update/delete to anon.
alter table public.comments enable row level security;

drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read"
  on public.comments for select
  using (true);

-- 3) Realtime -----------------------------------------------------------------
--    Broadcast INSERT / UPDATE / DELETE so open readers see new comments live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'comments'
  ) then
    execute 'alter publication supabase_realtime add table public.comments';
  end if;
end $$;

-- 4) Ratings table -----------------------------------------------------------
--    One row per (user, novel). Lets a reader's rating persist across devices
--    and enables a community average. Writes go through the server.
create table if not exists public.ratings (
  user_key   text        not null,
  novel_id   text        not null,
  stars      int         not null check (stars between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_key, novel_id)
);

create index if not exists ratings_novel_idx on public.ratings (novel_id);

alter table public.ratings enable row level security;

drop policy if exists "ratings_public_read" on public.ratings;
create policy "ratings_public_read"
  on public.ratings for select
  using (true);

-- Done. The site reads with the anon key and writes with the service-role key.
