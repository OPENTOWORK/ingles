-- Writing Engine v3 (DRALO) — persistencia y procedencia. Fase 7 del Documento 07.
--
-- APPLIED TO ENGLISH_PROD (qnazrzvwvkwhkfbqsbmr) for global Writing v3 rollout
-- (12 August 2026). Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS patterns.
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

begin;

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

-- ---------------------------------------------------------------------------
-- 4. writing_observations — observaciones pedagógicas aceptadas (Fase 3)
-- ---------------------------------------------------------------------------
-- Sin color, sin nota Cambridge y sin category_key con autoridad de evaluación:
-- la categoría del mapa interactivo es una proyección de UI, no un hecho evaluador.

create table if not exists public.writing_observations (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.writing_engine_executions (id) on delete cascade,
  observation_id text not null,
  domain text not null check (
    domain in (
      'grammar', 'punctuation', 'vocabulary_collocation', 'spelling',
      'organisation_cohesion', 'content_development', 'communicative_appropriacy',
      'naturalness', 'strength'
    )
  ),
  observation_type text not null check (
    observation_type in (
      'accuracy_error', 'clarity_issue', 'naturalness_issue', 'appropriacy_issue',
      'organisation_issue', 'development_opportunity', 'strength'
    )
  ),
  polarity text not null check (polarity in ('positive', 'negative', 'neutral')),
  scope text not null check (scope in ('local', 'global')),
  span_start integer check (span_start is null or span_start >= 0),
  span_end integer check (span_end is null or span_end >= 0),
  binding_status text not null check (
    binding_status in ('bound', 'global_no_local_span', 'unbindable')
  ),
  renderable_locally boolean not null,
  communicative_impact text not null check (
    communicative_impact in ('blocked', 'unreliable', 'impaired', 'minor', 'none')
  ),
  meaning_blocking boolean not null,
  pedagogical_priority text not null check (pedagogical_priority in ('high', 'medium', 'low')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  pattern_key text,
  pattern_group_id text,
  observation jsonb not null,
  created_at timestamptz not null default now(),

  constraint writing_observations_unique_per_execution unique (execution_id, observation_id),
  constraint writing_observations_span_order_check check (
    span_start is null or span_end is null or span_end > span_start
  ),
  constraint writing_observations_bound_span_check check (
    binding_status <> 'bound' or (span_start is not null and span_end is not null)
  ),
  constraint writing_observations_renderable_check check (
    renderable_locally = false or binding_status = 'bound'
  ),
  constraint writing_observations_meaning_blocking_check check (
    meaning_blocking = (communicative_impact = 'blocked')
  ),
  constraint writing_observations_positive_is_strength_check check (
    polarity <> 'positive' or observation_type = 'strength'
  )
);

create index if not exists writing_observations_execution_idx
  on public.writing_observations (execution_id);

create index if not exists writing_observations_pattern_group_idx
  on public.writing_observations (execution_id, pattern_group_id)
  where pattern_group_id is not null;

-- ---------------------------------------------------------------------------
-- 5. writing_assessments — cabecera de evaluación Cambridge (Fase 4)
-- ---------------------------------------------------------------------------
-- Sin CEFR, sin aprobado/suspenso, sin umbral 12/20 y sin readiness.
-- Una evaluación incompleta NO guarda 0/20: raw_total queda a NULL.

create table if not exists public.writing_assessments (
  execution_id uuid primary key references public.writing_engine_executions (id) on delete cascade,
  status text not null check (status in ('complete', 'incomplete')),
  incomplete_reason text,
  raw_total smallint check (raw_total is null or (raw_total >= 0 and raw_total <= 20)),
  max_total smallint not null default 20 check (max_total = 20),
  overall_confidence text check (overall_confidence is null or overall_confidence in ('high', 'medium', 'low')),
  -- SC-09: 20 puntos de una sola tarea no son una escala Cambridge publicable.
  single_task_scale_claim_allowed boolean not null default false
    check (not single_task_scale_claim_allowed),
  word_count integer check (word_count is null or word_count >= 0),
  word_count_penalty_applied boolean not null default false
    check (not word_count_penalty_applied),
  calibration_status text not null default 'not_calibrated'
    check (calibration_status = 'not_calibrated'),
  assessment_record jsonb not null,
  provenance jsonb not null,
  engine_version text not null,
  schema_version text not null,
  cambridge_assessment_version text not null,
  assessment_prompt_version text not null,
  created_at timestamptz not null default now(),

  constraint writing_assessments_incomplete_reason_check check (
    status <> 'incomplete' or (incomplete_reason is not null and length(btrim(incomplete_reason)) > 0)
  ),
  constraint writing_assessments_incomplete_has_no_total_check check (
    status <> 'incomplete' or raw_total is null
  ),
  constraint writing_assessments_complete_has_total_check check (
    status <> 'complete' or raw_total is not null
  )
);

-- ---------------------------------------------------------------------------
-- 6. writing_assessment_criteria — los cuatro registros de decisión
-- ---------------------------------------------------------------------------

create table if not exists public.writing_assessment_criteria (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null
    references public.writing_assessments (execution_id) on delete cascade,
  criterion text not null check (
    criterion in ('content', 'communicative_achievement', 'organisation', 'language')
  ),
  mark smallint not null check (mark >= 0 and mark <= 5),
  band_anchor text not null check (length(btrim(band_anchor)) > 0),
  why_not_higher text not null check (length(btrim(why_not_higher)) > 0),
  why_not_lower text,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  confidence_reason text,
  band_ceiling_reached boolean not null,
  band_floor_reached boolean not null,
  decision_record jsonb not null,
  created_at timestamptz not null default now(),

  constraint writing_assessment_criteria_unique unique (execution_id, criterion),
  constraint writing_assessment_criteria_ceiling_check check (band_ceiling_reached = (mark = 5)),
  constraint writing_assessment_criteria_floor_check check (band_floor_reached = (mark = 0)),
  -- La banda 0 no tiene banda inferior con la que compararse; 1–5 sí.
  constraint writing_assessment_criteria_why_not_lower_check check (
    (mark = 0 and why_not_lower is null)
    or (mark > 0 and why_not_lower is not null and length(btrim(why_not_lower)) > 0)
  ),
  constraint writing_assessment_criteria_confidence_reason_check check (
    confidence = 'high' or (confidence_reason is not null and length(btrim(confidence_reason)) > 0)
  )
);

create index if not exists writing_assessment_criteria_execution_idx
  on public.writing_assessment_criteria (execution_id);

-- Integridad de la evaluación completa, segura en transacción.
--
-- El disparador es un CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED: se evalúa
-- una sola vez al COMMIT, no fila a fila. Insertar los criterios 1, 2 y 3 dentro de
-- la transacción NO falla; lo que falla es cerrar la transacción con una evaluación
-- `complete` que no tenga exactamente los cuatro criterios canónicos, o cuyo
-- raw_total no sea su suma. No reescribe nunca una nota: solo acepta o rechaza.
create or replace function public.writing_assessment_assert_integrity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_execution uuid;
  v_status text;
  v_raw_total smallint;
  v_criteria integer;
  v_sum integer;
begin
  v_execution := coalesce(new.execution_id, old.execution_id);

  select status, raw_total
    into v_status, v_raw_total
    from public.writing_assessments
   where execution_id = v_execution;

  -- La cabecera desapareció en la misma transacción (p. ej. rollback parcial):
  -- no queda nada que validar.
  if v_status is null then
    return null;
  end if;

  select count(distinct criterion), coalesce(sum(mark), 0)
    into v_criteria, v_sum
    from public.writing_assessment_criteria
   where execution_id = v_execution;

  if v_status = 'complete' then
    if v_criteria <> 4 then
      raise exception
        'a complete assessment requires exactly the four Cambridge criteria (execution % has %)',
        v_execution, v_criteria
        using errcode = '23514';
    end if;
    if v_sum <> v_raw_total then
      raise exception
        'raw_total (%) must equal the sum of the four criterion marks (%) for execution %',
        v_raw_total, v_sum, v_execution
        using errcode = '23514';
    end if;
  elsif v_criteria > 0 then
    raise exception
      'an incomplete assessment must not carry criterion marks (execution %)',
      v_execution
      using errcode = '23514';
  end if;

  return null;
end;
$$;

drop trigger if exists writing_assessment_criteria_integrity on public.writing_assessment_criteria;
create constraint trigger writing_assessment_criteria_integrity
  after insert or update or delete on public.writing_assessment_criteria
  deferrable initially deferred
  for each row
  execute function public.writing_assessment_assert_integrity();

drop trigger if exists writing_assessments_integrity on public.writing_assessments;
create constraint trigger writing_assessments_integrity
  after insert or update on public.writing_assessments
  deferrable initially deferred
  for each row
  execute function public.writing_assessment_assert_integrity();

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

-- ---------------------------------------------------------------------------
-- Transactional assessment + criteria insert (complete assessments)
-- Required because deferred four-criteria integrity cannot span PostgREST
-- single-row commits. SECURITY DEFINER; execute for service_role only.
-- ---------------------------------------------------------------------------

create or replace function public.writing_engine_persist_assessment_bundle(
  p_assessment jsonb,
  p_criteria jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.writing_assessments (
    execution_id, status, incomplete_reason, raw_total, max_total, overall_confidence,
    single_task_scale_claim_allowed, word_count, word_count_penalty_applied, calibration_status,
    assessment_record, provenance, engine_version, schema_version,
    cambridge_assessment_version, assessment_prompt_version
  ) values (
    (p_assessment->>'execution_id')::uuid,
    p_assessment->>'status',
    p_assessment->>'incomplete_reason',
    nullif(p_assessment->>'raw_total','')::smallint,
    coalesce((p_assessment->>'max_total')::smallint, 20),
    p_assessment->>'overall_confidence',
    coalesce((p_assessment->>'single_task_scale_claim_allowed')::boolean, false),
    nullif(p_assessment->>'word_count','')::integer,
    coalesce((p_assessment->>'word_count_penalty_applied')::boolean, false),
    coalesce(p_assessment->>'calibration_status', 'not_calibrated'),
    p_assessment->'assessment_record',
    p_assessment->'provenance',
    p_assessment->>'engine_version',
    p_assessment->>'schema_version',
    p_assessment->>'cambridge_assessment_version',
    p_assessment->>'assessment_prompt_version'
  );

  if p_criteria is not null and jsonb_typeof(p_criteria) = 'array' and jsonb_array_length(p_criteria) > 0 then
    insert into public.writing_assessment_criteria (
      execution_id, criterion, mark, band_anchor, why_not_higher, why_not_lower,
      confidence, confidence_reason, band_ceiling_reached, band_floor_reached, decision_record
    )
    select
      (c->>'execution_id')::uuid,
      c->>'criterion',
      (c->>'mark')::smallint,
      c->>'band_anchor',
      c->>'why_not_higher',
      c->>'why_not_lower',
      c->>'confidence',
      c->>'confidence_reason',
      (c->>'band_ceiling_reached')::boolean,
      (c->>'band_floor_reached')::boolean,
      c->'decision_record'
    from jsonb_array_elements(p_criteria) as c;
  end if;
end;
$$;

revoke all on function public.writing_engine_persist_assessment_bundle(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.writing_engine_persist_assessment_bundle(jsonb, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
