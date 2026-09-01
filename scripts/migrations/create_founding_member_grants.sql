-- Primeras 50 inscripciones públicas: slot 1 reservado (Belén), slots 2–50 → Plan Plus gratuito.
CREATE TABLE IF NOT EXISTS public.founding_member_grants (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  slot_number INT NOT NULL,
  email TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT founding_member_grants_slot_number_key UNIQUE (slot_number),
  CONSTRAINT founding_member_grants_slot_number_check CHECK (slot_number >= 1 AND slot_number <= 50)
);

CREATE INDEX IF NOT EXISTS founding_member_grants_slot_number_idx
  ON public.founding_member_grants (slot_number);

COMMENT ON TABLE public.founding_member_grants IS
  'Cupos de las 50 primeras inscripciones públicas en Dralo (Plan Plus gratuito).';

-- Belén: primera inscripción (ya con Plus asignado manualmente).
INSERT INTO public.founding_member_grants (user_id, slot_number, email, granted_at)
VALUES (
  '982799b2-b235-4d38-a27a-4dbd08992511',
  1,
  'beeleentxuu@gmail.com',
  '2026-09-01 12:14:53.961034+00'
)
ON CONFLICT (user_id) DO NOTHING;

-- Reclama el siguiente cupo (2–50) de forma atómica. Devuelve NULL si ya no quedan.
CREATE OR REPLACE FUNCTION public.claim_founding_member_slot(p_user_id UUID, p_email TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing INT;
  v_next INT;
BEGIN
  SELECT slot_number INTO v_existing
  FROM public.founding_member_grants
  WHERE user_id = p_user_id;

  IF FOUND THEN
    RETURN v_existing;
  END IF;

  SELECT COALESCE(MAX(slot_number), 0) + 1 INTO v_next
  FROM public.founding_member_grants;

  IF v_next > 50 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.founding_member_grants (user_id, slot_number, email)
  VALUES (p_user_id, v_next, LOWER(TRIM(p_email)));

  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) TO service_role;
