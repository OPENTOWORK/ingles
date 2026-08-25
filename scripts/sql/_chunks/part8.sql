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
