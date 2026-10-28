-- Speaking Motor V2.0 (B2 First Part 1).
-- LOCAL / STAGING REVIEW ONLY. Do not apply to production without explicit authorisation.
-- Compatible with scripts/speaking_b2_motor.sql (V1). Adds concurrency, turn integrity
-- and session-level quota idempotency. Does not change commercial plan limits.
-- Then apply scripts/speaking_b2_motor_v21.sql (atomic consume). A claimed row is not a completed consume.
-- Then apply scripts/speaking_b2_motor_v22.sql (staff daily cap in the same transaction).
-- Then apply scripts/speaking_b2_motor_v23.sql (catalog lockdown + no extra daily index).

begin;

-- ---------------------------------------------------------------------------
-- Sessions: versioned writes + evaluation lock
-- ---------------------------------------------------------------------------
alter table public.speaking_b2_sessions
  add column if not exists row_version integer not null default 1;

alter table public.speaking_b2_sessions
  add column if not exists evaluation_charged boolean not null default false;

alter table public.speaking_b2_sessions
  add column if not exists evaluation_in_flight boolean not null default false;

alter table public.speaking_b2_sessions
  add column if not exists evaluation_lock_at timestamptz;

alter table public.speaking_b2_sessions
  add column if not exists pending_report jsonb;

alter table public.speaking_b2_sessions
  add column if not exists report jsonb;

comment on column public.speaking_b2_sessions.row_version is
  'Optimistic concurrency. Updates must match the current version.';
comment on column public.speaking_b2_sessions.evaluation_charged is
  'True after speaking_correction has been claimed for this session.';
comment on column public.speaking_b2_sessions.pending_report is
  'Completed rubric kept until the quota charge is confirmed.';

revoke select on public.speaking_b2_sessions from public, anon, authenticated;
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
    'grant select (%s) on public.speaking_b2_sessions to authenticated',
    cols
  );
end
$$;
revoke select (access_token_hash) on public.speaking_b2_sessions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Turns: ordered upsert key. No DELETE+INSERT.
-- ---------------------------------------------------------------------------
alter table public.speaking_b2_turns
  add column if not exists turn_index integer;

with numbered as (
  select
    id,
    row_number() over (partition by session_id order by created_at asc, id asc) - 1 as idx
  from public.speaking_b2_turns
  where turn_index is null
)
update public.speaking_b2_turns t
set turn_index = numbered.idx
from numbered
where t.id = numbered.id;

alter table public.speaking_b2_turns
  alter column turn_index set default 0;

update public.speaking_b2_turns set turn_index = 0 where turn_index is null;

alter table public.speaking_b2_turns
  alter column turn_index set not null;

create unique index if not exists speaking_b2_turns_session_index_uidx
  on public.speaking_b2_turns (session_id, turn_index);

-- ---------------------------------------------------------------------------
-- Recommendations: idempotent upsert
-- ---------------------------------------------------------------------------
create unique index if not exists speaking_b2_recommendations_session_order_uidx
  on public.speaking_b2_recommendations (session_id, sort_order);

-- ---------------------------------------------------------------------------
-- Session-level quota ledger (not a parallel commercial quota).
-- consumePlanUsage / plan_usage_counters remain the source of plan limits.
-- This table only guarantees one speaking_correction consume per session.
-- ---------------------------------------------------------------------------
create table if not exists public.speaking_b2_quota_charges (
  session_id uuid primary key references public.speaking_b2_sessions (id) on delete cascade,
  user_id uuid not null,
  usage_key text not null default 'speaking_correction',
  status text not null default 'claimed',
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

-- Re-apply the named CHECK even if the table already existed without `failed`.
-- Motor statuses: claimed/reserved = pending; consumed = counters moved;
-- failed/released = retry allowed. Do not wait for V2.1 to make `failed` legal.
do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid
     and att.attnum = any (con.conkey)
    where con.conrelid = 'public.speaking_b2_quota_charges'::regclass
      and con.contype = 'c'
      and att.attname = 'status'
  loop
    execute format(
      'alter table public.speaking_b2_quota_charges drop constraint if exists %I',
      r.conname
    );
  end loop;
end
$$;

alter table public.speaking_b2_quota_charges
  add constraint speaking_b2_quota_charges_status_check
  check (status in ('claimed', 'reserved', 'consumed', 'released', 'failed'));

comment on column public.speaking_b2_quota_charges.status is
  'consumed = counters moved in the same transaction. claimed/reserved = pending, not consumed. failed/released = retry allowed.';

create index if not exists speaking_b2_quota_charges_user_idx
  on public.speaking_b2_quota_charges (user_id, created_at desc);

alter table public.speaking_b2_quota_charges enable row level security;

drop policy if exists "speaking_b2_quota_charges_select_own" on public.speaking_b2_quota_charges;
create policy "speaking_b2_quota_charges_select_own"
  on public.speaking_b2_quota_charges for select to authenticated
  using (user_id = auth.uid());

grant select on public.speaking_b2_quota_charges to authenticated;
revoke insert, update, delete on public.speaking_b2_quota_charges from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Privileged claim. Service role only. Not exposed to the browser.
-- Model: SECURITY DEFINER, search_path pinned, no auth.uid() trust from
-- user_metadata. The API still authorizes the session token before calling.
-- ---------------------------------------------------------------------------
create or replace function public.speaking_b2_claim_evaluation(p_session_id uuid)
returns public.speaking_b2_sessions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  claimed public.speaking_b2_sessions;
begin
  update public.speaking_b2_sessions
  set
    evaluation_in_flight = true,
    evaluation_lock_at = now(),
    row_version = coalesce(row_version, 1) + 1,
    updated_at = now()
  where id = p_session_id
    and evaluation_charged = false
    and state in ('FINISHING', 'PROCESSING')
    and (
      evaluation_in_flight = false
      or evaluation_lock_at is null
      or evaluation_lock_at < now() - interval '2 minutes'
    )
  returning * into claimed;

  return claimed;
end;
$$;

comment on function public.speaking_b2_claim_evaluation(uuid) is
  'Atomic evaluation lock for Speaking B2. Execute: service_role only.';

revoke all on function public.speaking_b2_claim_evaluation(uuid) from public, anon, authenticated;
grant execute on function public.speaking_b2_claim_evaluation(uuid) to service_role;

commit;
