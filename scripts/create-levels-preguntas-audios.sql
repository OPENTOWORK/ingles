-- Solo creación de tabla (sin RLS). id uuid como en el panel de Supabase.
-- Después ejecuta scripts/levels-preguntas-audios-rls.sql
-- O todo junto: scripts/setup-levels-preguntas-audios.sql

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
  'Una o varias URLs de audio por levels_preguntas.id; la app usa la de menor orden.';
