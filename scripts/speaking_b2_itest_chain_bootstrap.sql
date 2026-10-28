-- Local bootstrap for applying V1→V2.3 on an empty database.
-- NOT a production migration. No student data.

create table if not exists public."Usuarios_y_Perfil_users" (
  id uuid primary key
);

create table if not exists public.plan_usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  usage_key text not null,
  period_type text not null check (period_type in ('month', 'day')),
  period_key text not null,
  count int not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_key, period_type, period_key)
);

create table if not exists public.ai_usage_daily_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  usage_date date not null,
  count int not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, action, usage_date)
);

create schema if not exists auth;
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit integer,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null,
  owner uuid
);

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin nosuperuser;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin nosuperuser;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin nosuperuser bypassrls;
  end if;
end
$$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema storage to anon, authenticated, service_role;
