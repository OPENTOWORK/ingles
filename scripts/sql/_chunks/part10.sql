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
