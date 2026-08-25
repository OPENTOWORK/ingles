-- ---------------------------------------------------------------------------
-- 1. writing_submissions — un intento de escritura entregado, inmutable
-- ---------------------------------------------------------------------------

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pregunta_id uuid,
  examen_id uuid,
  parte_numero smallint check (parte_numero is null or parte_numero > 0),
  submission_source text not null check (
    submission_source in ('skill_practice', 'exam_mode', 'full_exam', 'free_practice', 'dralo_ai')
  ),
  cefr_level text not null default 'b2' check (cefr_level = 'b2'),
  task_type text not null check (
    task_type in ('essay', 'informal_email', 'formal_email', 'article', 'report', 'review')
  ),
  -- Snapshots: el motor corrigió CONTRA ESTE texto. Editar la pregunta más tarde no
  -- puede cambiar la tarea contra la que se evaluó un writing histórico.
  task_prompt_snapshot text not null check (length(btrim(task_prompt_snapshot)) > 0),
  task_context_snapshot jsonb not null default '{}'::jsonb,
  candidate_response text not null check (length(btrim(candidate_response)) > 0),
  candidate_response_hash text not null,
  word_count integer not null check (word_count >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists writing_submissions_user_created_idx
  on public.writing_submissions (user_id, created_at desc);

create index if not exists writing_submissions_user_examen_parte_idx
  on public.writing_submissions (user_id, examen_id, parte_numero)
  where examen_id is not null;

create index if not exists writing_submissions_pregunta_idx
  on public.writing_submissions (pregunta_id)
  where pregunta_id is not null;
