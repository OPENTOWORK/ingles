-- Motivo y correo de los intentos de acceso que no se completan.
alter table public.auth_sesiones
  add column if not exists email text,
  add column if not exists motivo text;

-- Sin este default, un intento fallido sin cuenta creaba un id de usuario inventado.
alter table public.auth_sesiones alter column user_id drop default;

comment on column public.auth_sesiones.email is
  'Correo usado en el intento de acceso.';
comment on column public.auth_sesiones.motivo is
  'Motivo legible cuando el acceso no se completó.';

-- Cuenta inicios correctos del registro de Auth. Solo el service role puede llamarla.
create or replace function public.admin_login_audit_success_count()
returns bigint
language sql
stable
security definer
set search_path = auth, public
as $$
  select count(*)::bigint
  from auth.audit_log_entries
  where payload->>'action' = 'login';
$$;

revoke all on function public.admin_login_audit_success_count() from public, anon, authenticated;
grant execute on function public.admin_login_audit_success_count() to service_role;
