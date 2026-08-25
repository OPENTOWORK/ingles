-- Writing Engine v3 (DRALO) — persistencia y procedencia. Fase 7 del Documento 07.
--
-- NO EJECUTAR TODAVÍA EN PRODUCCIÓN. Esta migración se revisa antes de aplicarse.
-- Cuando se apruebe: ejecutar en el SQL Editor de Supabase (entorno de staging primero).
--
-- Reglas de oro de esta migración:
--
--  1. No toca ninguna tabla existente. No hay ALTER TABLE ni DROP TABLE sobre
--     levels_puntuaciones, Levels_stars, levels_estadisticas, user_error_tracker,
--     levels_preguntas ni ai_usage_logs. El rollback es DROP de las 8 tablas nuevas.
--  2. Las 8 tablas writing_* son append-only: un reintento o una re-evaluación crea
--     una EJECUCIÓN nueva; nunca se reescribe la anterior.
--  3. Las escribe exclusivamente el servidor con service role key (que salta RLS).
--     `authenticated` solo tiene SELECT de sus propias filas. Ningún cliente puede
--     insertar notas Cambridge, falsear un user_id ni borrar historial de corrección.
--  4. No hay columna de CEFR, ni de aprobado/pass, ni de readiness, ni de umbral 12/20.
--     `validation_status` describe la SALIDA DEL MOTOR, nunca al alumno.
--
-- Referencias deliberadamente ausentes: las columnas pregunta_id / examen_id /
-- parte_numero son uuid/smallint SIN foreign key a levels_preguntas. Una FK cambiaría
-- el comportamiento de borrado de una tabla existente, y sobre todo el histórico debe
-- sobrevivir a la edición o al borrado de la pregunta: por eso se guarda el SNAPSHOT
-- del enunciado, no un puntero a él.

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

-- ---------------------------------------------------------------------------
-- 2. writing_task_analyses — caché de análisis de tarea, sensible a versión
-- ---------------------------------------------------------------------------
-- Sin datos del alumno. La huella (task_fingerprint) ya es sensible a: contenido de
-- la tarea, tipo, versión del Documento 01, versión del prompt, versión de esquema y
-- configuración del modelo. Cambiar cualquiera de esos crea una ENTRADA NUEVA.

create table if not exists public.writing_task_analyses (
  id uuid primary key default gen_random_uuid(),
  task_fingerprint text not null unique,
  task_type text not null check (
    task_type in ('essay', 'informal_email', 'formal_email', 'article', 'report', 'review')
  ),
  source_task_hash text not null,
  task_analysis jsonb not null,
  task_requirements_version text not null,
  task_analysis_schema_version text not null,
  task_analysis_prompt_version text not null,
  engine_version text not null,
  model_config jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists writing_task_analyses_source_task_hash_idx
  on public.writing_task_analyses (source_task_hash);

-- ---------------------------------------------------------------------------
-- 3. writing_engine_executions — una ejecución de una configuración concreta
-- ---------------------------------------------------------------------------

create table if not exists public.writing_engine_executions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.writing_submissions (id) on delete cascade,
  -- Re-evaluación: apunta a la ejecución anterior sin sobrescribirla.
  previous_execution_id uuid references public.writing_engine_executions (id) on delete set null,
  execution_label text,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),

  engine_version text not null,
  schema_version text not null,
  doc_versions jsonb not null,
  prompt_versions jsonb not null,
  model_config jsonb not null,
  engine_config_snapshot jsonb not null default '{}'::jsonb,

  task_fingerprint text,
  task_analysis_id uuid references public.writing_task_analyses (id) on delete restrict,
  task_analysis_cache_hit boolean not null default false,

  validation_status text check (validation_status in ('passed', 'failed', 'retry_required')),
  retry_count smallint not null default 0 check (retry_count >= 0),
  failure_stage text check (
    failure_stage in ('task_analysis', 'observations', 'assessment', 'feedback', 'engine_output')
  ),
  incomplete_reason text,

  started_at timestamptz not null default now(),
  completed_at timestamptz,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  latency_by_stage jsonb not null default '{}'::jsonb,

  -- Uso real reportado por el proveedor. Nunca estimaciones por longitud de texto.
  token_source text check (token_source is null or token_source = 'provider_reported'),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  total_tokens integer check (total_tokens is null or total_tokens >= 0),
  usage_by_stage jsonb not null default '{}'::jsonb,
  actual_models jsonb not null default '{}'::jsonb,
  cost_usd numeric(12, 6) check (cost_usd is null or cost_usd >= 0),
  cost_eur numeric(12, 6) check (cost_eur is null or cost_eur >= 0),
  cost_basis jsonb,

  created_at timestamptz not null default now(),

  constraint writing_engine_executions_lifecycle_check check (
    (status = 'running' and completed_at is null)
    or (status <> 'running' and completed_at is not null)
  ),
  constraint writing_engine_executions_not_self_parent check (
    previous_execution_id is null or previous_execution_id <> id
  ),
  constraint writing_engine_executions_token_total_check check (
    total_tokens is null
    or input_tokens is null
    or output_tokens is null
    or total_tokens = input_tokens + output_tokens
  ),
  constraint writing_engine_executions_failure_stage_check check (
    status = 'failed' or failure_stage is null
  )
);

create index if not exists writing_engine_executions_submission_idx
  on public.writing_engine_executions (submission_id, started_at desc);

create index if not exists writing_engine_executions_previous_idx
  on public.writing_engine_executions (previous_execution_id)
  where previous_execution_id is not null;

create index if not exists writing_engine_executions_version_idx
  on public.writing_engine_executions (engine_version, status);

create index if not exists writing_engine_executions_task_analysis_idx
  on public.writing_engine_executions (task_analysis_id)
  where task_analysis_id is not null;

