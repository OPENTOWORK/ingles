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

