-- Oferta nueva: 25 plazas, 3 meses de Plan PREMIUM (plan_id = pro).
-- No modifica founding_member_grants ni preserve_founding_member_plus.
-- Las altas nuevas dejan de recibir Plan Plus. Quien ya tiene cupo founding lo conserva.
-- Mantener 25 y 3 alineados con src/lib/proLaunchOffer.rules.js.

CREATE TABLE IF NOT EXISTS public.pro_launch_grants (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  slot_number INT NOT NULL,
  email TEXT NOT NULL,
  offer_cohort TEXT NOT NULL DEFAULT 'pro_launch_25',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pro_trial_ends_at TIMESTAMPTZ NOT NULL,
  email_sent_at TIMESTAMPTZ,
  CONSTRAINT pro_launch_grants_slot_key UNIQUE (offer_cohort, slot_number),
  CONSTRAINT pro_launch_grants_slot_check CHECK (slot_number >= 1 AND slot_number <= 25),
  CONSTRAINT pro_launch_grants_cohort_check CHECK (offer_cohort = 'pro_launch_25')
);

COMMENT ON TABLE public.pro_launch_grants IS
  'Cupos de la oferta pro_launch_25: 3 meses de Plan PREMIUM. No incluye a los founding.';

COMMENT ON COLUMN public.pro_launch_grants.pro_trial_ends_at IS
  'Fin de los 3 meses. TODO: no hay regla de qué plan queda después; no caducar en automático.';

CREATE OR REPLACE FUNCTION public.claim_pro_launch_slot(p_user_id UUID, p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot INT;
  v_ends TIMESTAMPTZ;
  v_next INT;
BEGIN
  PERFORM pg_advisory_xact_lock(842025);

  SELECT slot_number, pro_trial_ends_at
  INTO v_slot, v_ends
  FROM public.pro_launch_grants
  WHERE user_id = p_user_id;

  IF FOUND THEN
    RETURN json_build_object(
      'slot_number', v_slot,
      'pro_trial_ends_at', v_ends,
      'already', true
    );
  END IF;

  SELECT COALESCE(MAX(slot_number), 0) + 1
  INTO v_next
  FROM public.pro_launch_grants
  WHERE offer_cohort = 'pro_launch_25';

  IF v_next > 25 THEN
    RETURN NULL;
  END IF;

  v_ends := now() + make_interval(months => 3);

  INSERT INTO public.pro_launch_grants (user_id, slot_number, email, offer_cohort, pro_trial_ends_at)
  VALUES (p_user_id, v_next, LOWER(TRIM(p_email)), 'pro_launch_25', v_ends);

  RETURN json_build_object(
    'slot_number', v_next,
    'pro_trial_ends_at', v_ends,
    'already', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_pro_launch_slot(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_pro_launch_slot(UUID, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.get_public_pro_launch_availability()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'cohort', 'pro_launch_25',
    'total', 25,
    'months', 3,
    'claimed', (SELECT count(*)::int FROM public.pro_launch_grants WHERE offer_cohort = 'pro_launch_25'),
    'remaining', GREATEST(
      0,
      25 - (SELECT count(*)::int FROM public.pro_launch_grants WHERE offer_cohort = 'pro_launch_25')
    ),
    'soldOut', (SELECT count(*)::int FROM public.pro_launch_grants WHERE offer_cohort = 'pro_launch_25') >= 25
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_pro_launch_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_pro_launch_availability() TO anon, authenticated, service_role;

-- Cierra la concesión automática de Plan Plus en altas nuevas.
-- preserve_founding_member_plus no se toca: los cupos ya dados siguen protegidos.
CREATE OR REPLACE FUNCTION public.apply_founding_member_plus_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
