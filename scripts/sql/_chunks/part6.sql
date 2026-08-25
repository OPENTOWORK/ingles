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
