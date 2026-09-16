-- Encuesta de los 30 días para las 50 primeras inscripciones (cupos 2–50).
-- Responder consolida el Plan Plus de por vida; no responder en 7 días lo revoca.

CREATE TABLE IF NOT EXISTS public.founding_member_encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  slot_number INT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  enviada_en TIMESTAMPTZ,
  vence_en TIMESTAMPTZ,
  recordatorio_enviado_en TIMESTAMPTZ,
  respondida_en TIMESTAMPTZ,
  respuestas JSONB,
  plan_confirmado_en TIMESTAMPTZ,
  plan_revocado_en TIMESTAMPTZ,
  revocacion_omitida_motivo TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT founding_member_encuestas_slot_check CHECK (slot_number >= 2 AND slot_number <= 50)
);

CREATE INDEX IF NOT EXISTS founding_member_encuestas_pendientes_idx
  ON public.founding_member_encuestas (vence_en)
  WHERE respondida_en IS NULL AND plan_revocado_en IS NULL;

COMMENT ON TABLE public.founding_member_encuestas IS
  'Encuesta de los 30 días de la campaña founding: consolida o revoca el Plan Plus gratuito.';
COMMENT ON COLUMN public.founding_member_encuestas.token IS
  'Token secreto del enlace del correo. Único acceso al formulario (sin login).';
COMMENT ON COLUMN public.founding_member_encuestas.vence_en IS
  'Fecha límite para responder: enviada_en + 7 días.';
COMMENT ON COLUMN public.founding_member_encuestas.revocacion_omitida_motivo IS
  'Por qué no se retiró el plan al vencer: el usuario tenía un plan ajeno a la campaña (Friendly, Stripe...).';

-- Solo service_role: el formulario público se sirve desde el servidor con el token.
ALTER TABLE public.founding_member_encuestas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.touch_founding_member_encuestas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_founding_member_encuestas
  ON public.founding_member_encuestas;

CREATE TRIGGER trg_touch_founding_member_encuestas
BEFORE UPDATE ON public.founding_member_encuestas
FOR EACH ROW
EXECUTE FUNCTION public.touch_founding_member_encuestas();

-- El trigger original blindaba el Plan Plus founding contra cualquier bajada a
-- FREE. Ahora debe ceder cuando la encuesta se ha dado por no respondida, que es
-- justo el caso en el que sí queremos retirarlo.
CREATE OR REPLACE FUNCTION public.preserve_founding_member_plus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot INT;
  v_revocado TIMESTAMPTZ;
BEGIN
  IF NEW.plan_id IS NOT DISTINCT FROM OLD.plan_id THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.plan_id, 'free') <> 'free' THEN
    RETURN NEW;
  END IF;

  SELECT slot_number INTO v_slot
  FROM public.founding_member_grants
  WHERE user_id = NEW.id;

  IF v_slot IS NULL OR v_slot < 2 OR v_slot > 50 THEN
    RETURN NEW;
  END IF;

  SELECT plan_revocado_en INTO v_revocado
  FROM public.founding_member_encuestas
  WHERE user_id = NEW.id;

  IF v_revocado IS NULL THEN
    NEW.plan_id := 'premium';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.preserve_founding_member_plus() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.preserve_founding_member_plus() TO postgres;

NOTIFY pgrst, 'reload schema';
