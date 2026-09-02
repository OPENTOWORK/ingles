-- Plan Plus de las 50 primeras inscripciones: el cupo se reclama en Postgres
-- (no solo en JS) y no se puede pisar con un upsert a FREE.
-- También rellena a los alumnos de la campaña que se quedaron sin cupo.

ALTER TABLE public.founding_member_grants
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

ALTER TABLE public.founding_member_grants ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_founding_member_slot(UUID, TEXT) TO postgres;

CREATE OR REPLACE FUNCTION public.apply_founding_member_plus_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_slot INT;
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.rol_id IS NOT NULL THEN
    SELECT lower(nombre) INTO v_role
    FROM public."Usuarios_y_Perfil_roles"
    WHERE id = NEW.rol_id;

    IF v_role IS NOT NULL AND v_role NOT IN ('student', 'alumno', 'alumno/a') THEN
      RETURN NEW;
    END IF;
  END IF;

  v_slot := public.claim_founding_member_slot(NEW.id, NEW.email);

  IF v_slot IS NOT NULL AND v_slot >= 2 AND v_slot <= 50 THEN
    NEW.plan_id := 'premium';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_founding_member_plus_before_insert
  ON public."Usuarios_y_Perfil_users";

CREATE TRIGGER trg_apply_founding_member_plus_before_insert
BEFORE INSERT ON public."Usuarios_y_Perfil_users"
FOR EACH ROW
EXECUTE FUNCTION public.apply_founding_member_plus_on_signup();

CREATE OR REPLACE FUNCTION public.preserve_founding_member_plus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot INT;
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

  IF v_slot IS NOT NULL AND v_slot >= 2 AND v_slot <= 50 THEN
    NEW.plan_id := 'premium';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_preserve_founding_member_plus_before_update
  ON public."Usuarios_y_Perfil_users";

CREATE TRIGGER trg_preserve_founding_member_plus_before_update
BEFORE UPDATE OF plan_id ON public."Usuarios_y_Perfil_users"
FOR EACH ROW
EXECUTE FUNCTION public.preserve_founding_member_plus();

REVOKE ALL ON FUNCTION public.apply_founding_member_plus_on_signup() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.preserve_founding_member_plus() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_founding_member_plus_on_signup() TO postgres;
GRANT EXECUTE ON FUNCTION public.preserve_founding_member_plus() TO postgres;

-- Alumnos de la campaña pública que no llegaron a reclamar cupo (p. ej. JAVI).
DO $$
DECLARE
  rec RECORD;
  v_slot INT;
BEGIN
  FOR rec IN
    SELECT u.id, lower(btrim(u.email)) AS email
    FROM public."Usuarios_y_Perfil_users" u
    JOIN auth.users au ON au.id = u.id
    LEFT JOIN public."Usuarios_y_Perfil_roles" r ON r.id = u.rol_id
    WHERE au.created_at >= '2026-09-01 12:14:53.961034+00'
      AND u.email IS NOT NULL
      AND (r.nombre IS NULL OR lower(r.nombre) IN ('student', 'alumno', 'alumno/a'))
      AND NOT EXISTS (
        SELECT 1 FROM public.founding_member_grants g WHERE g.user_id = u.id
      )
    ORDER BY au.created_at ASC
  LOOP
    v_slot := public.claim_founding_member_slot(rec.id, rec.email);
    IF v_slot IS NOT NULL AND v_slot >= 2 AND v_slot <= 50 THEN
      UPDATE public."Usuarios_y_Perfil_users"
      SET plan_id = 'premium'
      WHERE id = rec.id;

      UPDATE auth.users
      SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('subscription_plan', 'premium')
      WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
