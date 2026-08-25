-- ---------------------------------------------------------------------------
-- 8. writing_validation_results — resultado del validador por etapa e intento
-- ---------------------------------------------------------------------------
-- Deliberadamente NO existe una columna `passed`: se llama validation_status para
-- que no pueda confundirse con la progresión del alumno.

create table if not exists public.writing_validation_results (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.writing_engine_executions (id) on delete cascade,
  stage text not null check (
    stage in ('task_analysis', 'observations', 'assessment', 'feedback', 'engine_output')
  ),
  attempt smallint not null check (attempt >= 1),
  validation_status text not null check (
    validation_status in ('passed', 'failed', 'retry_required')
  ),
  validation_mode text not null default 'current_generation' check (
    validation_mode in ('current_generation', 'calibration', 'historical_read')
  ),
  failed_rules jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  retry_target text check (
    retry_target is null
    or retry_target in ('task_analysis', 'observations', 'assessment', 'feedback', 'engine_output')
  ),
  retry_reason text,
  validator_version text not null,
  engine_version text not null,
  schema_version text not null,
  validated_at timestamptz not null,
  created_at timestamptz not null default now(),

  constraint writing_validation_results_unique unique (execution_id, stage, attempt),
  constraint writing_validation_results_retry_check check (
    (validation_status = 'retry_required' and retry_target is not null and retry_reason is not null)
    or (validation_status <> 'retry_required' and retry_target is null and retry_reason is null)
  )
);

create index if not exists writing_validation_results_execution_idx
  on public.writing_validation_results (execution_id, stage, attempt);
