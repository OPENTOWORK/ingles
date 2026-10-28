-- Isolated Speaking B2 schema for local PostgreSQL integration tests.
-- No auth.users, no storage, no production data. Safe to recreate.

create table if not exists public.speaking_b2_exams (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null default 'SP-EX001',
  review_status text not null default 'approved'
);

create table if not exists public.speaking_b2_questions (
  id text primary key,
  exam_code text not null,
  question text not null default '',
  review_status text not null default 'approved'
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

create table if not exists public.speaking_b2_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  exam_code text not null default 'SP-EX001',
  state text not null default 'READY',
  started_at timestamptz,
  ended_at timestamptz,
  candidate_speaking_ms integer not null default 0,
  access_token_hash text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  row_version integer not null default 1,
  evaluation_charged boolean not null default false,
  evaluation_in_flight boolean not null default false,
  evaluation_lock_at timestamptz,
  pending_report jsonb,
  report jsonb
);

create table if not exists public.speaking_b2_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.speaking_b2_sessions (id) on delete cascade,
  turn_index integer not null default 0,
  role text not null check (role in ('examiner', 'candidate')),
  question_id text,
  spoken_text text not null default '',
  transcript text not null default '',
  stt_confidence real,
  transcript_source text not null default 'STT',
  audio_path text,
  validation text,
  created_at timestamptz not null default now()
);

create unique index if not exists speaking_b2_turns_session_index_uidx
  on public.speaking_b2_turns (session_id, turn_index);

create table if not exists public.speaking_b2_assessments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.speaking_b2_sessions (id) on delete cascade,
  user_id uuid,
  grammar_vocabulary real,
  discourse_management real,
  pronunciation real,
  interactive_communication real,
  global_achievement real,
  evidence jsonb not null default '{}'::jsonb,
  official_cambridge boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
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

create table if not exists public.speaking_b2_quota_charges (
  session_id uuid primary key references public.speaking_b2_sessions (id) on delete cascade,
  user_id uuid not null,
  usage_key text not null default 'speaking_correction',
  status text not null default 'claimed'
    check (status in ('claimed', 'reserved', 'consumed', 'released', 'failed')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create or replace function public.speaking_b2_claim_evaluation(p_session_id uuid)
returns public.speaking_b2_sessions
language plpgsql
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

create or replace function public.speaking_b2_consume_session_quota(
  p_session_id uuid,
  p_user_id uuid,
  p_usage_key text default 'speaking_correction',
  p_period_type text default 'month',
  p_period_key text default to_char((timezone('utc', now())), 'YYYY-MM'),
  p_limit integer default null
)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $$
declare
  sess public.speaking_b2_sessions;
  charge public.speaking_b2_quota_charges;
  used integer;
begin
  select * into sess
  from public.speaking_b2_sessions
  where id = p_session_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  end if;

  if sess.user_id is not null and p_user_id is not null and sess.user_id <> p_user_id then
    return jsonb_build_object('ok', false, 'code', 'FORBIDDEN');
  end if;

  select * into charge
  from public.speaking_b2_quota_charges
  where session_id = p_session_id
  for update;

  if sess.evaluation_charged or (found and charge.status = 'consumed') then
    if not sess.evaluation_charged then
      update public.speaking_b2_sessions
      set evaluation_charged = true,
          evaluation_in_flight = false,
          row_version = coalesce(row_version, 1) + 1,
          updated_at = now()
      where id = p_session_id
      returning row_version into sess.row_version;
    end if;
    return jsonb_build_object(
      'ok', true,
      'already', true,
      'consumed', false,
      'evaluationCharged', true,
      'rowVersion', sess.row_version
    );
  end if;

  if sess.pending_report is null and sess.report is null then
    return jsonb_build_object('ok', false, 'code', 'NO_REPORT');
  end if;

  if p_limit is not null then
    if p_limit <= 0 then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object('ok', false, 'code', 'PLAN_LIMIT_REACHED', 'used', 0, 'limit', p_limit);
    end if;

    insert into public.plan_usage_counters (
      user_id, usage_key, period_type, period_key, count, updated_at
    )
    values (p_user_id, p_usage_key, p_period_type, p_period_key, 1, now())
    on conflict (user_id, usage_key, period_type, period_key)
    do update set
      count = public.plan_usage_counters.count + 1,
      updated_at = now()
    where public.plan_usage_counters.count < p_limit
    returning public.plan_usage_counters.count into used;

    if used is null then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object('ok', false, 'code', 'PLAN_LIMIT_REACHED', 'limit', p_limit);
    end if;
  end if;

  insert into public.speaking_b2_quota_charges (
    session_id, user_id, usage_key, status, consumed_at
  )
  values (p_session_id, p_user_id, p_usage_key, 'consumed', now())
  on conflict (session_id) do update
    set status = 'consumed',
        consumed_at = now(),
        user_id = excluded.user_id,
        usage_key = excluded.usage_key;

  update public.speaking_b2_sessions
  set evaluation_charged = true,
      evaluation_in_flight = false,
      row_version = coalesce(row_version, 1) + 1,
      updated_at = now()
  where id = p_session_id
  returning row_version into sess.row_version;

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'consumed', p_limit is not null,
    'used', used,
    'evaluationCharged', true,
    'rowVersion', sess.row_version
  );
end;
$$;
