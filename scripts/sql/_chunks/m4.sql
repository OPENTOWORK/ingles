-- ---------------------------------------------------------------------------
-- RLS — el texto del alumno es dato personal
-- ---------------------------------------------------------------------------
-- Modelo de acceso: escribe SOLO el servidor con service role key (salta RLS).
-- `authenticated` recibe únicamente SELECT de lo suyo, por lo que no puede:
--   * falsear el user_id de otra persona (no tiene INSERT),
--   * reescribir notas Cambridge (no tiene UPDATE, y además hay disparador),
--   * borrar historial de corrección (no tiene DELETE).
-- Las tablas hijas no duplican user_id: la propiedad se resuelve por la cadena
-- hijo → ejecución → entrega → usuario autenticado, igual que Levels_stars lo hace
-- a través de levels_puntuaciones.

alter table public.writing_submissions enable row level security;
alter table public.writing_task_analyses enable row level security;
alter table public.writing_engine_executions enable row level security;
alter table public.writing_observations enable row level security;
alter table public.writing_assessments enable row level security;
alter table public.writing_assessment_criteria enable row level security;
alter table public.writing_feedback_payloads enable row level security;
alter table public.writing_validation_results enable row level security;

revoke all on public.writing_submissions from anon, authenticated;
revoke all on public.writing_task_analyses from anon, authenticated;
revoke all on public.writing_engine_executions from anon, authenticated;
revoke all on public.writing_observations from anon, authenticated;
revoke all on public.writing_assessments from anon, authenticated;
revoke all on public.writing_assessment_criteria from anon, authenticated;
revoke all on public.writing_feedback_payloads from anon, authenticated;
revoke all on public.writing_validation_results from anon, authenticated;

grant select on public.writing_submissions to authenticated;
grant select on public.writing_engine_executions to authenticated;
grant select on public.writing_observations to authenticated;
grant select on public.writing_assessments to authenticated;
grant select on public.writing_assessment_criteria to authenticated;
grant select on public.writing_feedback_payloads to authenticated;
grant select on public.writing_validation_results to authenticated;

-- writing_task_analyses no recibe NINGÚN grant ni policy: es caché de servidor,
-- no contiene escritura del alumno y ningún cliente debe poder envenenarla.

drop policy if exists writing_submissions_select_own on public.writing_submissions;
create policy writing_submissions_select_own
  on public.writing_submissions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists writing_engine_executions_select_own on public.writing_engine_executions;
create policy writing_engine_executions_select_own
  on public.writing_engine_executions
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_submissions s
       where s.id = submission_id
         and s.user_id = (select auth.uid())
    )
  );

drop policy if exists writing_observations_select_own on public.writing_observations;
create policy writing_observations_select_own
  on public.writing_observations
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_engine_executions e
        join public.writing_submissions s on s.id = e.submission_id
       where e.id = execution_id
         and s.user_id = (select auth.uid())
    )
  );

drop policy if exists writing_assessments_select_own on public.writing_assessments;
create policy writing_assessments_select_own
  on public.writing_assessments
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_engine_executions e
        join public.writing_submissions s on s.id = e.submission_id
       where e.id = execution_id
         and s.user_id = (select auth.uid())
    )
  );

drop policy if exists writing_assessment_criteria_select_own on public.writing_assessment_criteria;
create policy writing_assessment_criteria_select_own
  on public.writing_assessment_criteria
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_engine_executions e
        join public.writing_submissions s on s.id = e.submission_id
       where e.id = execution_id
         and s.user_id = (select auth.uid())
    )
  );

drop policy if exists writing_feedback_payloads_select_own on public.writing_feedback_payloads;
create policy writing_feedback_payloads_select_own
  on public.writing_feedback_payloads
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_engine_executions e
        join public.writing_submissions s on s.id = e.submission_id
       where e.id = execution_id
         and s.user_id = (select auth.uid())
    )
  );

drop policy if exists writing_validation_results_select_own on public.writing_validation_results;
create policy writing_validation_results_select_own
  on public.writing_validation_results
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.writing_engine_executions e
        join public.writing_submissions s on s.id = e.submission_id
       where e.id = execution_id
         and s.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Documentación en la propia base de datos
-- ---------------------------------------------------------------------------

comment on table public.writing_submissions is
  'Writing v3: un intento entregado, con snapshot inmutable de la tarea y de la respuesta.';
comment on column public.writing_submissions.task_prompt_snapshot is
  'Enunciado exacto contra el que se evaluó. Editar levels_preguntas no altera el histórico.';
comment on table public.writing_task_analyses is
  'Writing v3: caché de análisis de tarea por huella versionada. Sin datos del alumno.';
comment on column public.writing_task_analyses.task_fingerprint is
  'Huella sensible a tarea, tipo, Doc 01, prompt, esquema y configuración de modelo.';
comment on table public.writing_engine_executions is
  'Writing v3: una ejecución de una configuración del motor. Una re-evaluación es una fila nueva.';
comment on column public.writing_engine_executions.token_source is
  'Solo provider_reported: la procedencia v3 nunca usa estimaciones por longitud de texto.';
comment on table public.writing_observations is
  'Writing v3: observaciones pedagógicas con evidencia. Sin color y sin nota Cambridge.';
comment on table public.writing_assessments is
  'Writing v3: cabecera de evaluación Cambridge. No emite nivel, ni veredicto, ni juicio de preparación.';
comment on column public.writing_assessments.raw_total is
  'Suma de los cuatro criterios. NULL cuando la evaluación es incompleta: 0/20 sería un juicio real.';
comment on table public.writing_assessment_criteria is
  'Writing v3: los cuatro registros de decisión por criterio, uno por criterio y ejecución.';
comment on table public.writing_feedback_payloads is
  'Writing v3: feedback validado tal como se mostró. Nunca se regenera con un prompt posterior.';
comment on table public.writing_validation_results is
  'Writing v3: resultado del validador por etapa e intento. validation_status describe el motor, no al alumno.';

