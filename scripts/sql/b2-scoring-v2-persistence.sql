ALTER TABLE public.levels_puntuaciones
ADD COLUMN IF NOT EXISTS puntos_obtenidos integer NULL,
ADD COLUMN IF NOT EXISTS puntos_maximos integer NULL,
ADD COLUMN IF NOT EXISTS scoring_version smallint NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_puntuaciones_scoring_version_valid'
  ) THEN
    ALTER TABLE public.levels_puntuaciones
    ADD CONSTRAINT levels_puntuaciones_scoring_version_valid
    CHECK (scoring_version IN (1, 2));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_puntuaciones_v2_points_required'
  ) THEN
    ALTER TABLE public.levels_puntuaciones
    ADD CONSTRAINT levels_puntuaciones_v2_points_required
    CHECK (
      scoring_version = 1
      OR (
        puntos_obtenidos IS NOT NULL
        AND puntos_maximos IS NOT NULL
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'levels_puntuaciones_v2_points_bounds'
  ) THEN
    ALTER TABLE public.levels_puntuaciones
    ADD CONSTRAINT levels_puntuaciones_v2_points_bounds
    CHECK (
      scoring_version = 1
      OR (
        puntos_obtenidos >= 0
        AND puntos_maximos > 0
        AND puntos_obtenidos <= puntos_maximos
      )
    );
  END IF;
END $$;
