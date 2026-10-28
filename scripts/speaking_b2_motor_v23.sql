-- Speaking Motor V2.3 (B2 First Part 1).
-- LOCAL / STAGING REVIEW ONLY. Do not apply to production without explicit authorisation.
-- Apply after V1, V2, V2.1 and V2.2.
-- Post-audit hardening: no public catalog; hash column hidden from clients;
-- RPC execute remains service_role only. Does not change commercial limits.
-- Does not alter shared quota indexes.

begin;

drop policy if exists "speaking_b2_exams_read_approved" on public.speaking_b2_exams;
drop policy if exists "speaking_b2_questions_read_approved" on public.speaking_b2_questions;

revoke all on public.speaking_b2_exams from public, anon, authenticated;
revoke all on public.speaking_b2_questions from public, anon, authenticated;

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
grant select on public.speaking_b2_sessions to service_role;
grant select (access_token_hash) on public.speaking_b2_sessions to service_role;

revoke all on function public.speaking_b2_claim_evaluation(uuid)
  from public, anon, authenticated;
grant execute on function public.speaking_b2_claim_evaluation(uuid)
  to service_role;

revoke all on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.speaking_b2_consume_session_quota(uuid, uuid, text, text, text, integer, text, text, integer)
  to service_role;

commit;
