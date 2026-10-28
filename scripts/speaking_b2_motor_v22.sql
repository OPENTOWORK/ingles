-- Speaking Motor V2.2 (B2 First Part 1).
-- LOCAL / STAGING REVIEW ONLY. Do not apply to production without explicit authorisation.
-- Apply after V1, V2 and V2.1. Replaces the consume function with one overload
-- that also applies the existing staff daily cap (exam_speaking_feedback).
-- Does not change commercial plan limits or staff access rules.
-- Does not create a second unique index on ai_usage_daily_limits: ENGLISH_PROD
-- already has UNIQUE (user_id, action, usage_date).
-- Then apply scripts/speaking_b2_motor_v23.sql.

begin;

drop function if exists public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer);

create or replace function public.speaking_b2_consume_session_quota(
  p_session_id uuid,
  p_user_id uuid,
  p_usage_key text default 'speaking_correction',
  p_period_type text default 'month',
  p_period_key text default to_char((timezone('utc', now())), 'YYYY-MM'),
  p_limit integer default null,
  p_daily_action text default null,
  p_daily_date text default null,
  p_daily_limit integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  sess public.speaking_b2_sessions;
  charge public.speaking_b2_quota_charges;
  used integer;
  daily_count integer;
  daily_day date;
begin
  if p_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'AUTH_REQUIRED');
  end if;

  select * into sess
  from public.speaking_b2_sessions
  where id = p_session_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  end if;

  if sess.user_id is not null and sess.user_id <> p_user_id then
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

  -- Validate every limit before touching shared counters.
  if p_limit is not null and p_limit <= 0 then
    insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
    values (p_session_id, p_user_id, p_usage_key, 'failed')
    on conflict (session_id) do update
      set status = 'failed', consumed_at = null;
    return jsonb_build_object('ok', false, 'code', 'PLAN_FEATURE_LOCKED', 'used', 0, 'limit', p_limit);
  end if;

  if p_daily_limit is not null then
    daily_day := coalesce(nullif(p_daily_date, '')::date, (timezone('utc', now()))::date);
    if p_daily_action is null or p_daily_action = '' then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object('ok', false, 'code', 'LIMIT_CHECK_FAILED');
    end if;
    if p_daily_limit <= 0 then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object('ok', false, 'code', 'DAILY_LIMIT_REACHED', 'used', 0, 'limit', p_daily_limit);
    end if;
  end if;

  if p_limit is not null then
    insert into public.plan_usage_counters (
      user_id, usage_key, period_type, period_key, count, updated_at
    )
    values (p_user_id, p_usage_key, p_period_type, p_period_key, 0, now())
    on conflict (user_id, usage_key, period_type, period_key) do nothing;

    select count into used
    from public.plan_usage_counters
    where user_id = p_user_id
      and usage_key = p_usage_key
      and period_type = p_period_type
      and period_key = p_period_key
    for update;

    if used >= p_limit then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object(
        'ok', false,
        'code', 'PLAN_LIMIT_REACHED',
        'used', used,
        'limit', p_limit
      );
    end if;
  end if;

  if p_daily_limit is not null then
    insert into public.ai_usage_daily_limits (
      user_id, action, usage_date, count, updated_at
    )
    values (p_user_id, p_daily_action, daily_day, 0, now())
    on conflict (user_id, action, usage_date) do nothing;

    select count into daily_count
    from public.ai_usage_daily_limits
    where user_id = p_user_id
      and action = p_daily_action
      and usage_date = daily_day
    for update;

    if daily_count >= p_daily_limit then
      insert into public.speaking_b2_quota_charges (session_id, user_id, usage_key, status)
      values (p_session_id, p_user_id, p_usage_key, 'failed')
      on conflict (session_id) do update
        set status = 'failed', consumed_at = null;
      return jsonb_build_object(
        'ok', false,
        'code', 'DAILY_LIMIT_REACHED',
        'used', daily_count,
        'limit', p_daily_limit
      );
    end if;
  end if;

  if p_limit is not null then
    update public.plan_usage_counters
    set count = public.plan_usage_counters.count + 1,
        updated_at = now()
    where user_id = p_user_id
      and usage_key = p_usage_key
      and period_type = p_period_type
      and period_key = p_period_key
      and public.plan_usage_counters.count < p_limit
    returning public.plan_usage_counters.count into used;

    if used is null then
      raise exception 'SPEAKING_B2_CONSUME_ABORTED'
        using errcode = '40001';
    end if;
  end if;

  if p_daily_limit is not null then
    update public.ai_usage_daily_limits
    set count = public.ai_usage_daily_limits.count + 1,
        updated_at = now()
    where user_id = p_user_id
      and action = p_daily_action
      and usage_date = daily_day
      and public.ai_usage_daily_limits.count < p_daily_limit
    returning public.ai_usage_daily_limits.count into daily_count;

    if daily_count is null then
      raise exception 'SPEAKING_B2_CONSUME_ABORTED'
        using errcode = '40001';
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
      user_id = coalesce(user_id, p_user_id),
      row_version = coalesce(row_version, 1) + 1,
      updated_at = now()
  where id = p_session_id
  returning row_version into sess.row_version;

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'consumed', (p_limit is not null or p_daily_limit is not null),
    'used', coalesce(used, daily_count),
    'evaluationCharged', true,
    'rowVersion', sess.row_version
  );
end;
$$;

comment on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer, text, text, integer) is
  'Atomic speaking consume. Checks plan and daily room before incrementing either counter. service_role only.';

revoke all on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer, text, text, integer)
  to service_role;

commit;
