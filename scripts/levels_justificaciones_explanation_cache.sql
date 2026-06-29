-- Cache for AI-generated correct-answer explanations (UOE / Listening)
ALTER TABLE public.levels_justificaciones
  ALTER COLUMN id_respuesta DROP DEFAULT,
  ALTER COLUMN id_respuesta_abierta DROP DEFAULT;

ALTER TABLE public.levels_justificaciones
  ADD COLUMN IF NOT EXISTS pregunta_id uuid REFERENCES public.levels_preguntas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS item_num integer;

CREATE UNIQUE INDEX IF NOT EXISTS levels_justificaciones_id_respuesta_uidx
  ON public.levels_justificaciones (id_respuesta)
  WHERE id_respuesta IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS levels_justificaciones_id_respuesta_abierta_uidx
  ON public.levels_justificaciones (id_respuesta_abierta)
  WHERE id_respuesta_abierta IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS levels_justificaciones_pregunta_item_uidx
  ON public.levels_justificaciones (pregunta_id, item_num)
  WHERE pregunta_id IS NOT NULL AND item_num IS NOT NULL;

CREATE INDEX IF NOT EXISTS levels_justificaciones_pregunta_id_idx
  ON public.levels_justificaciones (pregunta_id)
  WHERE pregunta_id IS NOT NULL;
