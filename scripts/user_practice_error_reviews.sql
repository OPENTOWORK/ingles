-- Estado «revisado / aprendido» del Error Tracker (por usuario y error).
-- Ejecutar en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.user_practice_error_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_key TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, error_key)
);

CREATE INDEX IF NOT EXISTS idx_user_practice_error_reviews_user
  ON public.user_practice_error_reviews (user_id);

ALTER TABLE public.user_practice_error_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_practice_error_reviews_select_own ON public.user_practice_error_reviews;
CREATE POLICY user_practice_error_reviews_select_own ON public.user_practice_error_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_practice_error_reviews_insert_own ON public.user_practice_error_reviews;
CREATE POLICY user_practice_error_reviews_insert_own ON public.user_practice_error_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_practice_error_reviews_update_own ON public.user_practice_error_reviews;
CREATE POLICY user_practice_error_reviews_update_own ON public.user_practice_error_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_practice_error_reviews TO authenticated;

NOTIFY pgrst, 'reload schema';
