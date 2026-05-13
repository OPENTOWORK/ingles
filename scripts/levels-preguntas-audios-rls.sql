-- Permite que la app Next.js (rol anon / authenticated con la anon key) lea audios por pregunta.
-- Ejecuta esto en el SQL Editor de Supabase después de crear la tabla.
--
-- Si el error dice que no existe la tabla, ejecuta antes:
--   scripts/create-levels-preguntas-audios.sql
--
-- Ajusta los roles si tu proyecto solo usa `authenticated`.

alter table public.levels_preguntas_audios enable row level security;

drop policy if exists "levels_preguntas_audios_select_public" on public.levels_preguntas_audios;

create policy "levels_preguntas_audios_select_public"
  on public.levels_preguntas_audios
  for select
  to anon, authenticated
  using (true);

grant select on public.levels_preguntas_audios to anon, authenticated;
