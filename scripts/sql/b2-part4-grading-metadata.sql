ALTER TABLE public.levels_respuestas_abiertas
ADD COLUMN IF NOT EXISTS grading_metadata jsonb NULL;

COMMENT ON COLUMN public.levels_respuestas_abiertas.grading_metadata IS
'B2 Part 4 Key Word Transformation grading metadata. NULL means legacy exact-answer grading.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'levels_respuestas_abiertas_grading_metadata_object'
  ) THEN
    ALTER TABLE public.levels_respuestas_abiertas
    ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_object
    CHECK (
      grading_metadata IS NULL
      OR jsonb_typeof(grading_metadata) = 'object'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'levels_respuestas_abiertas_grading_metadata_type'
  ) THEN
    ALTER TABLE public.levels_respuestas_abiertas
    ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_type
    CHECK (
      grading_metadata IS NULL
      OR grading_metadata->>'type' = 'b2_key_word_transformation'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'levels_respuestas_abiertas_grading_metadata_marking_points'
  ) THEN
    ALTER TABLE public.levels_respuestas_abiertas
    ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_marking_points
    CHECK (
      grading_metadata IS NULL
      OR (
        jsonb_typeof(grading_metadata->'markingPoints') = 'array'
        AND jsonb_array_length(grading_metadata->'markingPoints') = 2
      )
    );
  END IF;
END $$;
