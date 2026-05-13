-- RLS + enlace explícito: audio 630645a4-… → pregunta 2e44ac3c-…
-- Ejecuta en Supabase → SQL (mismo proyecto que NEXT_PUBLIC_SUPABASE_URL).

alter table public.levels_preguntas_audios enable row level security;

drop policy if exists "levels_preguntas_audios_select_public" on public.levels_preguntas_audios;

create policy "levels_preguntas_audios_select_public"
  on public.levels_preguntas_audios
  for select
  to anon, authenticated
  using (true);

grant select on public.levels_preguntas_audios to anon, authenticated;

-- Asocia el audio a la pregunta indicada (ajusta orden si hace falta)
update public.levels_preguntas_audios
set
  pregunta_id = '2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid,
  orden = coalesce(orden, 1)
where id = '630645a4-074b-4ff2-9a41-e7b1daa75f39'::uuid;
