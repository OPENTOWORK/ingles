-- B2 Scoring V2: score_source column + composite unique key
-- Allows skill_practice and exam_mode rows for the same user/exam/part.

ALTER TABLE public.levels_puntuaciones
ADD COLUMN IF NOT EXISTS score_source text NOT NULL DEFAULT 'skill_practice';

COMMENT ON COLUMN public.levels_puntuaciones.score_source IS
'Practice context: skill_practice (part hub) or exam_mode (full exam session).';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_puntuaciones_score_source_valid'
  ) THEN
    ALTER TABLE public.levels_puntuaciones
    ADD CONSTRAINT levels_puntuaciones_score_source_valid
    CHECK (score_source IN ('skill_practice', 'exam_mode'));
  END IF;
END $$;

-- Backfill from descripcion meta when present (legacy rows default to skill_practice).
UPDATE public.levels_puntuaciones lp
SET score_source = CASE
  WHEN lp.descripcion LIKE '%"score_source":"exam_mode"%' THEN 'exam_mode'
  ELSE 'skill_practice'
END
WHERE lp.descripcion LIKE 'uoe_meta:%';

ALTER TABLE public.levels_puntuaciones
DROP CONSTRAINT IF EXISTS levels_puntuaciones_usuario_examen_parte_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_puntuaciones_usuario_examen_parte_source_key'
  ) THEN
    ALTER TABLE public.levels_puntuaciones
    ADD CONSTRAINT levels_puntuaciones_usuario_examen_parte_source_key
    UNIQUE (uuid_usuario, examen_id, parte_numero, score_source);
  END IF;
END $$;
