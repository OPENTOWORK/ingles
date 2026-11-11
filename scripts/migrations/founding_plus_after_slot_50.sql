-- Las altas nuevas siguen recibiendo Plan Plus y la encuesta de los 30 días.
-- El contador público de las 50 plazas no cuenta estos cupos.

ALTER TABLE public.founding_member_grants
  DROP CONSTRAINT IF EXISTS founding_member_grants_slot_number_check;

ALTER TABLE public.founding_member_grants
  ADD CONSTRAINT founding_member_grants_slot_number_check
  CHECK (slot_number >= 1);

ALTER TABLE public.founding_member_encuestas
  DROP CONSTRAINT IF EXISTS founding_member_encuestas_slot_check;

ALTER TABLE public.founding_member_encuestas
  ADD CONSTRAINT founding_member_encuestas_slot_check
  CHECK (slot_number >= 2);

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

  INSERT INTO public.founding_member_grants (user_id, slot_number, email)
  VALUES (p_user_id, v_next, LOWER(TRIM(p_email)));

  RETURN v_next;
END;
$$;

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

  IF v_slot IS NOT NULL AND v_slot >= 2 THEN
    NEW.plan_id := 'premium';
  END IF;

  RETURN NEW;
END;
$$;

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

  IF v_slot IS NULL OR v_slot < 2 THEN
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

CREATE OR REPLACE FUNCTION public.get_public_founding_slot_availability()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total', 50,
    'claimed', (SELECT count(*)::int FROM public.founding_member_grants WHERE slot_number <= 50),
    'remaining', GREATEST(0, 50 - (SELECT count(*)::int FROM public.founding_member_grants WHERE slot_number <= 50)),
    'soldOut', (SELECT count(*)::int FROM public.founding_member_grants WHERE slot_number <= 50) >= 50
  );
$$;

-- Alumnos de la campaña que se registraron cuando el cupo 50 ya estaba cogido.
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
      AND COALESCE(u.activo, true) = true
      AND (r.nombre IS NULL OR lower(r.nombre) IN ('student', 'alumno', 'alumno/a'))
      AND NOT EXISTS (
        SELECT 1 FROM public.founding_member_grants g WHERE g.user_id = u.id
      )
    ORDER BY au.created_at ASC
  LOOP
    v_slot := public.claim_founding_member_slot(rec.id, rec.email);
    IF v_slot IS NOT NULL AND v_slot >= 2 THEN
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
