-- Enlace del Google Calendar de cada profesor.
-- Ejecutar en Supabase SQL Editor si la tabla aún no existe.

begin;

create table if not exists public.profesor_google_calendar (
  profesor_id uuid primary key references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  ical_url text not null,
  nombre text,
  actualizado_en timestamptz not null default now()
);

alter table public.profesor_google_calendar enable row level security;

drop policy if exists profesor_google_calendar_owner on public.profesor_google_calendar;
create policy profesor_google_calendar_owner on public.profesor_google_calendar
  for all to authenticated
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

grant select, insert, update, delete on public.profesor_google_calendar to authenticated;

notify pgrst, 'reload schema';

commit;
