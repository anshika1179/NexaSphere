create extension if not exists pgcrypto;

create table if not exists admin_sessions (
  token_hash text primary key,
  username text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists idx_admin_sessions_expires_at on admin_sessions (expires_at);
create index if not exists idx_admin_sessions_revoked_at on admin_sessions (revoked_at);

create table if not exists events (
  id text primary key,
  name text not null,
  short_name text,
  date_text text not null,
  description text not null,
  status text not null default 'upcoming',
  icon text default '📌',
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_events (
  id text primary key,
  activity_key text not null,
  name text not null,
  date_text text not null,
  tagline text,
  description text not null,
  status text not null default 'completed',
  created_by_name text,
  created_by_email text,
  created_by_phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_key_created on activity_events (activity_key, created_at desc);

create table if not exists core_team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  year text not null,
  branch text not null,
  section text not null,
  email text not null,
  whatsapp text not null,
  linkedin text,
  instagram text,
  photo_url text,
  github_username text,
  leetcode_username text,
  cached_github_stats jsonb default '{}'::jsonb,
  cached_leetcode_stats jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  sync_status text default 'pending',
  sync_error_message text,
  created_at timestamptz not null default now()
);

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  full_name text,
  college_email text,
  whatsapp text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
