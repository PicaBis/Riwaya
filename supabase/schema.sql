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

-- 5) Activation codes table ---------------------------------------------------
--    Subscription/redeem codes. RLS enabled with NO policies at all: the
--    anon key (public, ships in the client bundle) must never be able to
--    list unredeemed codes or redeem one directly against Supabase — only
--    the server (service-role key, via /api/activate and /api/admin/codes)
--    may read or write this table.
create table if not exists public.activation_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  label      text,
  used       boolean     not null default false,
  used_by    text,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists activation_codes_used_by_idx on public.activation_codes (used_by);

alter table public.activation_codes enable row level security;

-- 6) Reading progress table ---------------------------------------------------
--    One row per (user, novel); lets a bookmark persist across devices once
--    signed in. Same no-anon-access reasoning as activation_codes above —
--    only the server (service-role key) reads/writes this table.
create table if not exists public.reading_progress (
  user_key   text        not null,
  novel_id   text        not null,
  last_page  int         not null,
  updated_at timestamptz not null default now(),
  primary key (user_key, novel_id)
);

alter table public.reading_progress enable row level security;

-- 7) Guest names table -------------------------------------------------------
--    Reserves each guest display name so no two visitors can use the same one
--    (the site expects 100+ concurrent guests). `name_key` is the normalised
--    (trimmed + lowercased) name and is the primary key, so a duplicate insert
--    fails on the unique constraint. Only the server (service-role) touches it.
create table if not exists public.guest_names (
  name_key   text        primary key,
  name       text        not null,
  device_id  text,
  created_at timestamptz not null default now()
);

alter table public.guest_names enable row level security;

-- Done. The site reads public data (comments, ratings) with the anon key;
-- everything else (activation codes, reading progress, guest names, and all
-- writes) goes through the server's service-role key, which bypasses RLS.
