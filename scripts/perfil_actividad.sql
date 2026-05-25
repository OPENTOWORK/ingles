-- Actividad diaria de estudio por usuario (heatmap del perfil).
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.perfil_actividad (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  study_minutes integer not null default 0 check (study_minutes >= 0),
  sessions_count integer not null default 0 check (sessions_count >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index if not exists idx_perfil_actividad_user_date
  on public.perfil_actividad (user_id, activity_date desc);

alter table public.perfil_actividad enable row level security;

drop policy if exists perfil_actividad_own_select on public.perfil_actividad;
create policy perfil_actividad_own_select on public.perfil_actividad
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists perfil_actividad_own_insert on public.perfil_actividad;
create policy perfil_actividad_own_insert on public.perfil_actividad
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists perfil_actividad_own_update on public.perfil_actividad;
create policy perfil_actividad_own_update on public.perfil_actividad
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.perfil_actividad to authenticated;

notify pgrst, 'reload schema';

commit;
