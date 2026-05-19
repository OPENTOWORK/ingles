-- Progreso del hub Theory (Grammar, Vocabulary, Pronunciation) por tema
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.teoria_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  apartado TEXT NOT NULL,
  topic_href TEXT NOT NULL,
  progreso_pct SMALLINT NOT NULL DEFAULT 0 CHECK (progreso_pct >= 0 AND progreso_pct <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT teoria_progreso_apartado_topic_unique UNIQUE (uuid_usuario, topic_href)
);

CREATE INDEX IF NOT EXISTS idx_teoria_progreso_usuario_apartado
  ON public.teoria_progreso (uuid_usuario, apartado);

CREATE INDEX IF NOT EXISTS idx_teoria_progreso_usuario
  ON public.teoria_progreso (uuid_usuario);

ALTER TABLE public.teoria_progreso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teoria_progreso_select_own ON public.teoria_progreso;
CREATE POLICY teoria_progreso_select_own ON public.teoria_progreso
  FOR SELECT TO authenticated
  USING (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS teoria_progreso_insert_own ON public.teoria_progreso;
CREATE POLICY teoria_progreso_insert_own ON public.teoria_progreso
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS teoria_progreso_update_own ON public.teoria_progreso;
CREATE POLICY teoria_progreso_update_own ON public.teoria_progreso
  FOR UPDATE TO authenticated
  USING (auth.uid() = uuid_usuario)
  WITH CHECK (auth.uid() = uuid_usuario);

DROP POLICY IF EXISTS teoria_progreso_delete_own ON public.teoria_progreso;
CREATE POLICY teoria_progreso_delete_own ON public.teoria_progreso
  FOR DELETE TO authenticated
  USING (auth.uid() = uuid_usuario);

NOTIFY pgrst, 'reload schema';
