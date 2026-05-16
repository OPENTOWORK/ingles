-- Historial de puntuaciones por usuario y pregunta levels (levels_preguntas.id).
-- Ejecutar en Supabase SQL Editor si la tabla aún no tiene RLS.

begin;

create table if not exists public.levels_puntuaciones (
  id uuid primary key default gen_random_uuid(),
  id_pregunta uuid not null references public.levels_preguntas (id) on delete cascade,
  uuid_usuario uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  puntuacion double precision not null check (puntuacion >= 0 and puntuacion <= 100),
  descripcion text,
  created_at timestamptz not null default now()
);

create index if not exists idx_levels_puntuaciones_usuario
  on public.levels_puntuaciones (uuid_usuario);

create index if not exists idx_levels_puntuaciones_pregunta
  on public.levels_puntuaciones (id_pregunta);

create index if not exists idx_levels_puntuaciones_usuario_pregunta_created
  on public.levels_puntuaciones (uuid_usuario, id_pregunta, created_at desc);

comment on table public.levels_puntuaciones is
  'Un registro por cada evaluación de ítem (0–100) en práctica levels.';

alter table public.levels_puntuaciones enable row level security;

drop policy if exists "levels_puntuaciones_select_own" on public.levels_puntuaciones;
drop policy if exists "levels_puntuaciones_insert_own" on public.levels_puntuaciones;

create policy "levels_puntuaciones_select_own"
  on public.levels_puntuaciones
  for select
  to authenticated
  using (uuid_usuario = auth.uid());

create policy "levels_puntuaciones_insert_own"
  on public.levels_puntuaciones
  for insert
  to authenticated
  with check (uuid_usuario = auth.uid());

grant select, insert on public.levels_puntuaciones to authenticated;

commit;
