-- B2 Scoring V2: score_source column + composite unique key
-- Allows skill_practice and exam_mode rows for the same user/exam/part.
-- Idempotent: safe to re-run; skips steps already applied.

-- 1. Add column (nullable initially for safe backfill)
ALTER TABLE public.levels_puntuaciones
ADD COLUMN IF NOT EXISTS score_source text NULL;

COMMENT ON COLUMN public.levels_puntuaciones.score_source IS
'Practice context: skill_practice (part hub) or exam_mode (full exam session).';

-- 2. Backfill from descripcion meta JSON (app format: uoe_meta:{...}|label)
UPDATE public.levels_puntuaciones lp
SET score_source = CASE
  WHEN lp.descripcion ~ '"score_source"\s*:\s*"exam_mode"' THEN 'exam_mode'
  WHEN lp.descripcion ~ '"score_source"\s*:\s*"skill_practice"' THEN 'skill_practice'
  WHEN lp.descripcion LIKE 'uoe_meta:%' THEN 'skill_practice'
  ELSE 'skill_practice'
END
WHERE lp.score_source IS NULL;

-- 3. Verify no null or invalid values remain
DO $$
DECLARE
  null_count integer;
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.levels_puntuaciones
  WHERE score_source IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'score_source backfill incomplete: % rows still NULL', null_count;
  END IF;

  SELECT COUNT(*) INTO invalid_count
  FROM public.levels_puntuaciones
  WHERE score_source NOT IN ('skill_practice', 'exam_mode');

  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'score_source backfill invalid: % rows with unknown values', invalid_count;
  END IF;
END $$;

-- 4. CHECK constraint
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

-- 5. NOT NULL + default
ALTER TABLE public.levels_puntuaciones
ALTER COLUMN score_source SET DEFAULT 'skill_practice';

ALTER TABLE public.levels_puntuaciones
ALTER COLUMN score_source SET NOT NULL;

-- 6. Drop legacy unique (user, exam, part only)
ALTER TABLE public.levels_puntuaciones
DROP CONSTRAINT IF EXISTS levels_puntuaciones_usuario_examen_parte_key;

-- 7. Composite unique including score_source
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

-- 8. Supporting index for filtered reads (covered by UNIQUE, but explicit for user+source queries)
CREATE INDEX IF NOT EXISTS idx_levels_puntuaciones_usuario_score_source
ON public.levels_puntuaciones (uuid_usuario, score_source)
WHERE examen_id IS NOT NULL AND parte_numero IS NOT NULL;
