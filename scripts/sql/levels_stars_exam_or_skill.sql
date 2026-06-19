-- Applied via Supabase migration: levels_stars_exam_or_skill
-- Renames "Exam or skill" → exam_or_skill and adds RLS + unique upsert key.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Levels_stars'
      AND column_name = 'Exam or skill'
  ) THEN
    ALTER TABLE public."Levels_stars"
      RENAME COLUMN "Exam or skill" TO exam_or_skill;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_stars_exam_or_skill_valid'
  ) THEN
    ALTER TABLE public."Levels_stars"
      ADD CONSTRAINT levels_stars_exam_or_skill_valid
      CHECK (exam_or_skill IS NULL OR exam_or_skill IN (1, 2));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_levels_stars_puntuacion_mode
  ON public."Levels_stars" (puntuaciones_id, exam_or_skill)
  WHERE puntuaciones_id IS NOT NULL;

COMMENT ON COLUMN public."Levels_stars".exam_or_skill IS
  '1 = exam_mode, 2 = skill_practice';

ALTER TABLE public."Levels_stars" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "levels_stars_select_own" ON public."Levels_stars";
DROP POLICY IF EXISTS "levels_stars_insert_own" ON public."Levels_stars";
DROP POLICY IF EXISTS "levels_stars_update_own" ON public."Levels_stars";

CREATE POLICY "levels_stars_select_own"
  ON public."Levels_stars"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.levels_puntuaciones lp
      WHERE lp.id = puntuaciones_id AND lp.uuid_usuario = auth.uid()
    )
  );

CREATE POLICY "levels_stars_insert_own"
  ON public."Levels_stars"
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.levels_puntuaciones lp
      WHERE lp.id = puntuaciones_id AND lp.uuid_usuario = auth.uid()
    )
  );

CREATE POLICY "levels_stars_update_own"
  ON public."Levels_stars"
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.levels_puntuaciones lp
      WHERE lp.id = puntuaciones_id AND lp.uuid_usuario = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.levels_puntuaciones lp
      WHERE lp.id = puntuaciones_id AND lp.uuid_usuario = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public."Levels_stars" TO authenticated;
