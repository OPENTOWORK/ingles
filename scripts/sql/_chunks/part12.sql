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
