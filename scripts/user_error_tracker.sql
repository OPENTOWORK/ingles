-- AI Error Tracker — errores de aprendizaje del alumno (tabla en Supabase: user_error_tracker).
-- No aplicar automáticamente: ejecutar manualmente en el SQL editor de Supabase.

CREATE TABLE IF NOT EXISTS public.user_error_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  level TEXT,
  skill TEXT,
  error_type TEXT,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  explanation TEXT,
  suggestion TEXT,
  frequency INT DEFAULT 1,
  mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_error_tracker_user
  ON public.user_error_tracker (user_id);

CREATE INDEX IF NOT EXISTS idx_user_error_tracker_user_mastered
  ON public.user_error_tracker (user_id, mastered);

ALTER TABLE public.user_error_tracker ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_error_tracker_select_own ON public.user_error_tracker;
CREATE POLICY user_error_tracker_select_own ON public.user_error_tracker
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_error_tracker_insert_own ON public.user_error_tracker;
CREATE POLICY user_error_tracker_insert_own ON public.user_error_tracker
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_error_tracker_update_own ON public.user_error_tracker;
CREATE POLICY user_error_tracker_update_own ON public.user_error_tracker
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_error_tracker_delete_own ON public.user_error_tracker;
CREATE POLICY user_error_tracker_delete_own ON public.user_error_tracker
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
