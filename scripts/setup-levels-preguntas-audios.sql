-- Instalación: tabla + permisos + RLS (nuevos proyectos).
-- id uuid (alineado con tablas típicas en Supabase). Si ya tienes la tabla con otro esquema, no la borres:
-- ejecuta solo scripts/levels-preguntas-audios-rls.sql o scripts/levels-preguntas-audios-rls-and-link-2e44.sql
--
-- En Supabase: SQL → New query → Run (mismo proyecto que .env).

create table if not exists public.levels_preguntas_audios (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid not null references public.levels_preguntas (id) on delete cascade,
  audio_url text not null,
  orden bigint null,
  titulo text null,
  created_at timestamptz not null default now()
);

create index if not exists levels_preguntas_audios_pregunta_id_idx
  on public.levels_preguntas_audios (pregunta_id);

comment on table public.levels_preguntas_audios is
  'URLs de audio por levels_preguntas.id; la app usa la fila de menor orden.';

alter table public.levels_preguntas_audios enable row level security;

drop policy if exists "levels_preguntas_audios_select_public" on public.levels_preguntas_audios;

create policy "levels_preguntas_audios_select_public"
  on public.levels_preguntas_audios
  for select
  to anon, authenticated
  using (true);

grant select on public.levels_preguntas_audios to anon, authenticated;

-- Si la API aún dice "schema cache" para esta tabla, ejecuta una vez:
-- NOTIFY pgrst, 'reload schema';
