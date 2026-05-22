-- Historial de páginas visitadas por usuario (panel admin / ficha alumno).
-- Ejecutar en Supabase SQL Editor si la tabla aún no existe.

begin;

create table if not exists public.usuario_navegacion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path text not null,
  page_title text,
  visited_at timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds >= 0)
);

create index if not exists idx_usuario_navegacion_user_visited
  on public.usuario_navegacion (user_id, visited_at desc);

create index if not exists idx_usuario_navegacion_path
  on public.usuario_navegacion (path);

alter table public.usuario_navegacion enable row level security;

drop policy if exists usuario_navegacion_own_insert on public.usuario_navegacion;
create policy usuario_navegacion_own_insert on public.usuario_navegacion
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists usuario_navegacion_own_select on public.usuario_navegacion;
create policy usuario_navegacion_own_select on public.usuario_navegacion
  for select to authenticated
  using (user_id = auth.uid());

grant insert, select on public.usuario_navegacion to authenticated;

notify pgrst, 'reload schema';

commit;
