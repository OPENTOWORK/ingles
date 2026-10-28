-- Speaking Motor V2.1 (B2 First Part 1).
-- LOCAL / STAGING REVIEW ONLY. Do not apply to production without explicit authorisation.
-- Apply after scripts/speaking_b2_motor.sql and scripts/speaking_b2_motor_v2.sql.
-- Then apply scripts/speaking_b2_motor_v22.sql and scripts/speaking_b2_motor_v23.sql.
-- Idempotent: safe to run a second time.

begin;

alter table public.speaking_b2_quota_charges
  drop constraint if exists speaking_b2_quota_charges_status_check;

alter table public.speaking_b2_quota_charges
  add constraint speaking_b2_quota_charges_status_check
  check (status in ('claimed', 'reserved', 'consumed', 'released', 'failed'));

comment on column public.speaking_b2_quota_charges.status is
  'consumed = counters moved in the same transaction. claimed/reserved = pending, not consumed. failed/released = retry allowed.';

-- Atomic consume: increment the existing plan counter and mark the session
-- in one transaction. service_role only. Does not change commercial limits.
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
security definer
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

comment on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer) is
  'Atomic speaking_correction consume for one session. Execute: service_role only.';

revoke all on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer)
  to service_role;

commit;
