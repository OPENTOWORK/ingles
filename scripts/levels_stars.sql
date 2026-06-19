-- Estrellas 0–3 vinculadas a levels_puntuaciones (exam_mode / skill_practice).
-- Tabla en Supabase: public."Levels_stars"
-- exam_or_skill: 1 = exam_mode, 2 = skill_practice

begin;

create table if not exists public."Levels_stars" (
  id uuid primary key default gen_random_uuid(),
  puntuaciones_id uuid references public.levels_puntuaciones (id) on delete cascade,
  stars bigint check (stars >= 0 and stars <= 3),
  exam_or_skill smallint check (exam_or_skill is null or exam_or_skill in (1, 2)),
  descripcion text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_levels_stars_puntuacion_mode
  on public."Levels_stars" (puntuaciones_id, exam_or_skill)
  where puntuaciones_id is not null;

comment on table public."Levels_stars" is
  'Estrellas 0–3 por intento de parte, enlazadas a levels_puntuaciones.';
comment on column public."Levels_stars".exam_or_skill is
  '1 = exam_mode, 2 = skill_practice';

alter table public."Levels_stars" enable row level security;

drop policy if exists "levels_stars_select_own" on public."Levels_stars";
drop policy if exists "levels_stars_insert_own" on public."Levels_stars";
drop policy if exists "levels_stars_update_own" on public."Levels_stars";

create policy "levels_stars_select_own"
  on public."Levels_stars"
  for select
  to authenticated
  using (
    exists (
      select 1 from public.levels_puntuaciones lp
      where lp.id = puntuaciones_id and lp.uuid_usuario = auth.uid()
    )
  );

create policy "levels_stars_insert_own"
  on public."Levels_stars"
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.levels_puntuaciones lp
      where lp.id = puntuaciones_id and lp.uuid_usuario = auth.uid()
    )
  );

create policy "levels_stars_update_own"
  on public."Levels_stars"
  for update
  to authenticated
  using (
    exists (
      select 1 from public.levels_puntuaciones lp
      where lp.id = puntuaciones_id and lp.uuid_usuario = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.levels_puntuaciones lp
      where lp.id = puntuaciones_id and lp.uuid_usuario = auth.uid()
    )
  );

grant select, insert, update on public."Levels_stars" to authenticated;

commit;
