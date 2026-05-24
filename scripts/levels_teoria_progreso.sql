-- Progreso de Exam theory por tema (tabla en Supabase producción: levels_teoria_progreso).
-- Equivalente local/script: scripts/levels_progreso.sql

CREATE TABLE IF NOT EXISTS public.levels_teoria_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unidad TEXT NOT NULL,
  topic_href TEXT NOT NULL,
  progreso_pct SMALLINT NOT NULL DEFAULT 0 CHECK (progreso_pct >= 0 AND progreso_pct <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT levels_teoria_progreso_unidad_topic_unique UNIQUE (uuid_usuario, topic_href)
);

CREATE INDEX IF NOT EXISTS idx_levels_teoria_progreso_usuario_unidad
  ON public.levels_teoria_progreso (uuid_usuario, unidad);

CREATE INDEX IF NOT EXISTS idx_levels_teoria_progreso_usuario
  ON public.levels_teoria_progreso (uuid_usuario);

ALTER TABLE public.levels_teoria_progreso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS levels_teoria_progreso_select_own ON public.levels_teoria_progreso;
CREATE POLICY levels_teoria_progreso_select_own ON public.levels_teoria_progreso
  FOR SELECT TO authenticated
  USING (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS levels_teoria_progreso_insert_own ON public.levels_teoria_progreso;
CREATE POLICY levels_teoria_progreso_insert_own ON public.levels_teoria_progreso
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS levels_teoria_progreso_update_own ON public.levels_teoria_progreso;
CREATE POLICY levels_teoria_progreso_update_own ON public.levels_teoria_progreso
  FOR UPDATE TO authenticated
  USING (auth.uid() = uuid_usuario)
  WITH CHECK (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS levels_teoria_progreso_delete_own ON public.levels_teoria_progreso;
CREATE POLICY levels_teoria_progreso_delete_own ON public.levels_teoria_progreso
  FOR DELETE TO authenticated
  USING (auth.uid() = uuid_usuario);

NOTIFY pgrst, 'reload schema';
