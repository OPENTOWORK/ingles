-- Estrellas 0–3 por ejercicio (usuario × examen × parte × origen de puntuación).
-- Ejecutar en Supabase SQL Editor si la tabla aún no existe.

begin;

create table if not exists public.levels_stars (
  id uuid primary key default gen_random_uuid(),
  uuid_usuario uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  examen_id uuid not null references public.levels_examenes (id) on delete cascade,
  parte_numero integer not null check (parte_numero >= 1 and parte_numero <= 17),
  score_source text not null default 'skill_practice',
  stars smallint not null check (stars >= 0 and stars <= 3),
  updated_at timestamptz not null default now(),
  constraint levels_stars_score_source_valid check (
    score_source in ('skill_practice', 'exam_mode')
  ),
  constraint levels_stars_usuario_examen_parte_source_key
    unique (uuid_usuario, examen_id, parte_numero, score_source)
);

create index if not exists idx_levels_stars_usuario
  on public.levels_stars (uuid_usuario);

create index if not exists idx_levels_stars_examen
  on public.levels_stars (examen_id);

comment on table public.levels_stars is
  'Estrellas 0–3 por ejercicio de skill practice / exam mode (proporcionales a la puntuación 0–100).';

alter table public.levels_stars enable row level security;

drop policy if exists "levels_stars_select_own" on public.levels_stars;
drop policy if exists "levels_stars_insert_own" on public.levels_stars;
drop policy if exists "levels_stars_update_own" on public.levels_stars;

create policy "levels_stars_select_own"
  on public.levels_stars
  for select
  to authenticated
  using (uuid_usuario = auth.uid());

create policy "levels_stars_insert_own"
  on public.levels_stars
  for insert
  to authenticated
  with check (uuid_usuario = auth.uid());

create policy "levels_stars_update_own"
  on public.levels_stars
  for update
  to authenticated
  using (uuid_usuario = auth.uid())
  with check (uuid_usuario = auth.uid());

grant select, insert, update on public.levels_stars to authenticated;

commit;
