-- Proposed DDL: B2 Part 4 grading_metadata on levels_respuestas_abiertas
-- Phase 2D — NOT EXECUTED until explicitly approved via apply script.

ALTER TABLE public.levels_respuestas_abiertas
ADD COLUMN IF NOT EXISTS grading_metadata jsonb NULL;

COMMENT ON COLUMN public.levels_respuestas_abiertas.grading_metadata IS
'B2 Part 4 Key Word Transformation grading metadata. NULL = legacy exact full-answer grading.';

ALTER TABLE public.levels_respuestas_abiertas
ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_object
CHECK (
  grading_metadata IS NULL
  OR jsonb_typeof(grading_metadata) = 'object'
);

ALTER TABLE public.levels_respuestas_abiertas
ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_type
CHECK (
  grading_metadata IS NULL
  OR grading_metadata->>'type' IS NULL
  OR grading_metadata->>'type' = 'b2_key_word_transformation'
);

ALTER TABLE public.levels_respuestas_abiertas
ADD CONSTRAINT levels_respuestas_abiertas_grading_metadata_marking_points
CHECK (
  grading_metadata IS NULL
  OR grading_metadata->'markingPoints' IS NULL
  OR (
    jsonb_typeof(grading_metadata->'markingPoints') = 'array'
    AND jsonb_array_length(grading_metadata->'markingPoints') = 2
  )
);
