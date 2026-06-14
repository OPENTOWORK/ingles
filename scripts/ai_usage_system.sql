-- AI usage limits, cost logs, budget settings, question explanations (Dralo).
-- Ejecutar manualmente en Supabase SQL Editor. No aplicar automáticamente.

-- ---------------------------------------------------------------------------
-- ai_usage_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  product_area TEXT,
  model TEXT,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  estimated_cost_usd NUMERIC(12, 6) DEFAULT 0,
  estimated_cost_eur NUMERIC(12, 6) DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  error_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_action ON public.ai_usage_logs (action);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_product_area ON public.ai_usage_logs (product_area);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs (created_at DESC);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_usage_logs_select_own ON public.ai_usage_logs;
CREATE POLICY ai_usage_logs_select_own ON public.ai_usage_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ai_usage_logs_insert_own ON public.ai_usage_logs;
CREATE POLICY ai_usage_logs_insert_own ON public.ai_usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE for authenticated — server uses service role.

-- ---------------------------------------------------------------------------
-- ai_usage_daily_limits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, action, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_limits_lookup
  ON public.ai_usage_daily_limits (user_id, action, usage_date);

ALTER TABLE public.ai_usage_daily_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_usage_daily_limits_select_own ON public.ai_usage_daily_limits;
CREATE POLICY ai_usage_daily_limits_select_own ON public.ai_usage_daily_limits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ai_usage_daily_limits_insert_own ON public.ai_usage_daily_limits;
CREATE POLICY ai_usage_daily_limits_insert_own ON public.ai_usage_daily_limits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS ai_usage_daily_limits_update_own ON public.ai_usage_daily_limits;
CREATE POLICY ai_usage_daily_limits_update_own ON public.ai_usage_daily_limits
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ai_budget_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_budget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  monthly_budget_eur NUMERIC(10, 2) DEFAULT 150,
  hard_stop_enabled BOOLEAN DEFAULT TRUE,
  warning_threshold_eur NUMERIC(10, 2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_budget_settings ENABLE ROW LEVEL SECURITY;
-- No policies — only service role / admin API.

-- Seed current month if missing
INSERT INTO public.ai_budget_settings (month_key)
VALUES (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM'))
ON CONFLICT (month_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- question_explanations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID,
  level TEXT,
  skill TEXT,
  part TEXT,
  question_text TEXT,
  correct_answer TEXT,
  wrong_answer TEXT,
  explanation TEXT NOT NULL,
  short_explanation TEXT,
  example TEXT,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_explanations_question_id
  ON public.question_explanations (question_id);

CREATE INDEX IF NOT EXISTS idx_question_explanations_question_wrong
  ON public.question_explanations (question_id, wrong_answer);

ALTER TABLE public.question_explanations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS question_explanations_select_authenticated ON public.question_explanations;
CREATE POLICY question_explanations_select_authenticated ON public.question_explanations
  FOR SELECT TO authenticated
  USING (true);

NOTIFY pgrst, 'reload schema';
