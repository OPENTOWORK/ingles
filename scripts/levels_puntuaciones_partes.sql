-- Una fila por (usuario, examen, parte) en Use of English.
-- Ejecutar en Supabase SQL Editor si faltan columnas o política UPDATE.

begin;

alter table public.levels_puntuaciones
  add column if not exists examen_id uuid references public.levels_examenes (id) on delete cascade,
  add column if not exists parte_numero smallint check (parte_numero is null or (parte_numero >= 1 and parte_numero <= 20)),
  add column if not exists correctas integer check (correctas is null or correctas >= 0),
  add column if not exists total_preguntas integer check (total_preguntas is null or total_preguntas >= 1),
  add column if not exists aprobado boolean;

create unique index if not exists idx_levels_puntuaciones_usuario_examen_parte
  on public.levels_puntuaciones (uuid_usuario, examen_id, parte_numero)
  where examen_id is not null and parte_numero is not null;

drop policy if exists "levels_puntuaciones_update_own" on public.levels_puntuaciones;
create policy "levels_puntuaciones_update_own"
  on public.levels_puntuaciones
  for update
  to authenticated
  using (uuid_usuario = auth.uid())
  with check (uuid_usuario = auth.uid());

grant update on public.levels_puntuaciones to authenticated;

commit;
