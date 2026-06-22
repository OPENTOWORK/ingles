-- levels_favoritos: ejercicios favoritos del alumno (skill practice).
-- Ejecutar en Supabase SQL Editor o vía migración.

begin;

create table if not exists public.levels_favoritos (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid references public.levels_preguntas(id) on delete cascade,
  descripcion text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.levels_favoritos
  add column if not exists usuario_id uuid references auth.users(id) on delete cascade;

create unique index if not exists idx_levels_favoritos_usuario_pregunta
  on public.levels_favoritos (usuario_id, pregunta_id)
  where usuario_id is not null and pregunta_id is not null;

create index if not exists idx_levels_favoritos_usuario_id
  on public.levels_favoritos (usuario_id);

create index if not exists idx_levels_favoritos_created_at
  on public.levels_favoritos (created_at desc);

comment on table public.levels_favoritos is
  'Ejercicios marcados como favoritos por el alumno durante skill practice.';

alter table public.levels_favoritos enable row level security;

drop policy if exists "levels_favoritos_select_own" on public.levels_favoritos;
drop policy if exists "levels_favoritos_insert_own" on public.levels_favoritos;
drop policy if exists "levels_favoritos_delete_own" on public.levels_favoritos;

create policy "levels_favoritos_select_own"
  on public.levels_favoritos
  for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "levels_favoritos_insert_own"
  on public.levels_favoritos
  for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "levels_favoritos_delete_own"
  on public.levels_favoritos
  for delete
  to authenticated
  using (usuario_id = auth.uid());

grant select, insert, delete on public.levels_favoritos to authenticated;

notify pgrst, 'reload schema';

commit;
