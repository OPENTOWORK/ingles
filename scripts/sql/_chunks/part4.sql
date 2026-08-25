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
