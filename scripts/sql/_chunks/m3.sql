-- ---------------------------------------------------------------------------
-- 7. writing_feedback_payloads — el contrato de feedback validado (Fase 6)
-- ---------------------------------------------------------------------------
-- Se guarda tal cual se generó, para poder reconstruir el feedback exactamente
-- como se mostró. Una lectura histórica NUNCA regenera con el prompt actual.
-- Sin campos de color ni de estilo: eso pertenece a la UI.

create table if not exists public.writing_feedback_payloads (
  execution_id uuid primary key references public.writing_engine_executions (id) on delete cascade,
  payload jsonb not null,
  raw_total smallint check (raw_total is null or (raw_total >= 0 and raw_total <= 20)),
  annotation_count smallint not null default 0 check (annotation_count >= 0),
  opening_strength_count smallint not null default 0
    check (opening_strength_count >= 0 and opening_strength_count <= 3),
  -- El historial del alumno es una CAPA posterior a las notas: se guarda aparte del
  -- assessment_record y jamás modifica una nota ya congelada.
  learner_history_applied boolean not null default false,
  history_overlay jsonb,
  history_evidence_ids jsonb not null default '[]'::jsonb,
  feedback_prompt_version text not null,
  feedback_schema_version text not null,
  engine_version text not null,
  created_at timestamptz not null default now(),

  constraint writing_feedback_payloads_history_overlay_check check (
    learner_history_applied = false or history_overlay is not null
  )
);

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

-- ---------------------------------------------------------------------------
-- Inmutabilidad: los artefactos históricos son append-only
-- ---------------------------------------------------------------------------
-- UPDATE está prohibido a nivel de base de datos en los siete artefactos. Una
-- re-evaluación crea una EJECUCIÓN nueva; un prompt, un modelo o un documento nuevos
-- no reescriben una evaluación antigua.
--
-- DELETE no se bloquea con disparador a propósito: el borrado de una cuenta (derecho
-- de supresión) debe seguir funcionando en cascada desde auth.users. Ningún cliente
-- puede borrar, porque `authenticated` no tiene policy de DELETE ni el privilegio.

create or replace function public.writing_engine_reject_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'writing engine artefacts are append-only: UPDATE on %.% is not allowed',
    tg_table_schema, tg_table_name
    using errcode = '42501',
          hint = 'Re-evaluate by inserting a new writing_engine_executions row.';
end;
$$;

drop trigger if exists writing_submissions_append_only on public.writing_submissions;
create trigger writing_submissions_append_only
  before update on public.writing_submissions
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_task_analyses_append_only on public.writing_task_analyses;
create trigger writing_task_analyses_append_only
  before update on public.writing_task_analyses
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_observations_append_only on public.writing_observations;
create trigger writing_observations_append_only
  before update on public.writing_observations
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_assessments_append_only on public.writing_assessments;
create trigger writing_assessments_append_only
  before update on public.writing_assessments
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_assessment_criteria_append_only on public.writing_assessment_criteria;
create trigger writing_assessment_criteria_append_only
  before update on public.writing_assessment_criteria
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_feedback_payloads_append_only on public.writing_feedback_payloads;
create trigger writing_feedback_payloads_append_only
  before update on public.writing_feedback_payloads
  for each row execute function public.writing_engine_reject_update();

drop trigger if exists writing_validation_results_append_only on public.writing_validation_results;
create trigger writing_validation_results_append_only
  before update on public.writing_validation_results
  for each row execute function public.writing_engine_reject_update();

-- La ejecución es lo único con ciclo de vida: running → completed | failed.
-- Una vez finalizada es inmutable, y la procedencia (versiones, modelo, documentos)
-- no puede cambiar nunca, ni siquiera mientras corre.
create or replace function public.writing_engine_executions_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> 'running' then
    raise exception
      'execution % is already finalised as % and cannot be updated', old.id, old.status
      using errcode = '42501',
            hint = 'A re-evaluation must be a new writing_engine_executions row.';
  end if;

  if new.id <> old.id
     or new.submission_id <> old.submission_id
     or new.engine_version <> old.engine_version
     or new.schema_version <> old.schema_version
     or new.doc_versions <> old.doc_versions
     or new.prompt_versions <> old.prompt_versions
     or new.model_config <> old.model_config
     or new.started_at <> old.started_at
     or new.previous_execution_id is distinct from old.previous_execution_id then
    raise exception
      'execution provenance is immutable (execution %)', old.id
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists writing_engine_executions_guard on public.writing_engine_executions;
create trigger writing_engine_executions_guard
  before update on public.writing_engine_executions
  for each row execute function public.writing_engine_executions_guard_update();

