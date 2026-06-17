-- Separate skill-practice vs exam-mode part scores for the same exam slot.
-- Run in Supabase SQL Editor once.

begin;

alter table public.levels_puntuaciones
  add column if not exists score_source text not null default 'skill_practice';

drop index if exists public.idx_levels_puntuaciones_usuario_examen_parte;

create unique index if not exists idx_levels_puntuaciones_usuario_examen_parte_source
  on public.levels_puntuaciones (uuid_usuario, examen_id, parte_numero, score_source)
  where examen_id is not null and parte_numero is not null;

comment on column public.levels_puntuaciones.score_source is
  'skill_practice | exam_mode — independent scores for the same exam slot/part.';

commit;
