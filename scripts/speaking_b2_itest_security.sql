-- Isolated RLS / storage stand-ins for Speaking B2 local tests.
-- Not Supabase Cloud. No production data.

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

insert into storage.buckets (id, name, public, file_size_limit)
values ('speaking-b2-audio', 'speaking-b2-audio', false, 15728640)
on conflict (id) do update set public = false;

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

alter table public.speaking_b2_exams enable row level security;
alter table public.speaking_b2_questions enable row level security;
drop policy if exists speaking_b2_exams_read_approved on public.speaking_b2_exams;
drop policy if exists speaking_b2_questions_read_approved on public.speaking_b2_questions;
revoke all on public.speaking_b2_exams from public, anon, authenticated;
revoke all on public.speaking_b2_questions from public, anon, authenticated;

alter table public.speaking_b2_sessions enable row level security;
alter table public.speaking_b2_turns enable row level security;
alter table public.speaking_b2_assessments enable row level security;
alter table public.speaking_b2_quota_charges enable row level security;
alter table storage.objects enable row level security;

drop policy if exists speaking_b2_sessions_select_own on public.speaking_b2_sessions;
create policy speaking_b2_sessions_select_own
  on public.speaking_b2_sessions for select to public
  using (user_id = auth.uid());

drop policy if exists speaking_b2_turns_select_own on public.speaking_b2_turns;
create policy speaking_b2_turns_select_own
  on public.speaking_b2_turns for select to public
  using (
    exists (
      select 1 from public.speaking_b2_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists speaking_b2_assessments_select_own on public.speaking_b2_assessments;
create policy speaking_b2_assessments_select_own
  on public.speaking_b2_assessments for select to public
  using (user_id = auth.uid());

drop policy if exists speaking_b2_quota_charges_select_own on public.speaking_b2_quota_charges;
create policy speaking_b2_quota_charges_select_own
  on public.speaking_b2_quota_charges for select to public
  using (user_id = auth.uid());

-- No storage.objects policies: authenticated clients cannot read recordings.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'speaking_b2_rls_tester') then
    create role speaking_b2_rls_tester login password 'speaking_rls' nosuperuser nocreatedb nocreaterole;
  end if;
end
$$;

grant usage on schema public to speaking_b2_rls_tester;
grant usage on schema storage to speaking_b2_rls_tester;
revoke all on public.speaking_b2_exams from speaking_b2_rls_tester;
revoke all on public.speaking_b2_questions from speaking_b2_rls_tester;
grant usage on schema public to anon, authenticated, service_role;

revoke select on public.speaking_b2_sessions
  from public, anon, authenticated, speaking_b2_rls_tester;
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
  into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'speaking_b2_sessions'
    and column_name <> 'access_token_hash';
  execute format(
    'grant select (%s) on public.speaking_b2_sessions to speaking_b2_rls_tester',
    cols
  );
end
$$;
revoke select (access_token_hash) on public.speaking_b2_sessions
  from public, anon, authenticated, speaking_b2_rls_tester;
grant select on public.speaking_b2_turns to speaking_b2_rls_tester;
grant select on public.speaking_b2_assessments to speaking_b2_rls_tester;
grant select on public.speaking_b2_quota_charges to speaking_b2_rls_tester;
grant select on storage.objects to speaking_b2_rls_tester;
grant select on storage.buckets to speaking_b2_rls_tester;
revoke insert, update, delete on public.speaking_b2_sessions from speaking_b2_rls_tester;
revoke insert, update, delete on public.speaking_b2_turns from speaking_b2_rls_tester;
revoke insert, update, delete on storage.objects from speaking_b2_rls_tester;

do $$
begin
  execute format('grant connect on database %I to speaking_b2_rls_tester', current_database());
end
$$;
