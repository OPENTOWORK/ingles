-- Tipo de dispositivo por sesión (móvil, tablet, ordenador).
-- Ejecutar en Supabase SQL Editor.

begin;

alter table public.usuario_sesiones_app
  add column if not exists device_type text;

alter table public.usuario_sesiones_app
  drop constraint if exists usuario_sesiones_app_device_type_check;

alter table public.usuario_sesiones_app
  add constraint usuario_sesiones_app_device_type_check
  check (device_type is null or device_type in ('mobile', 'tablet', 'desktop'));

comment on column public.usuario_sesiones_app.device_type is
  'Dispositivo al iniciar la sesión: mobile, tablet o desktop (ordenador).';

notify pgrst, 'reload schema';

commit;
