-- Prompts de generación por parte (admin). Se inicializan desde el código y se editan en Supabase.
CREATE TABLE IF NOT EXISTS public.levels_exam_part_prompt_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_slug text NOT NULL,
  part_number integer NOT NULL,
  system_prompt text NOT NULL DEFAULT '',
  user_prompt text NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT levels_exam_part_prompt_overrides_unique UNIQUE (level_slug, part_number)
);

CREATE INDEX IF NOT EXISTS idx_levels_exam_part_prompt_overrides_level_part
  ON public.levels_exam_part_prompt_overrides (level_slug, part_number);

ALTER TABLE public.levels_exam_part_prompt_overrides ENABLE ROW LEVEL SECURITY;

-- Recarga caché de PostgREST para que la API REST vea la tabla de inmediato.
NOTIFY pgrst, 'reload schema';
