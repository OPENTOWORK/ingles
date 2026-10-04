-- Auditoría de Administración.
-- Aplicada en ENGLISH_PROD el 2026-10-02, a petición, para poder guardar la configuración.
--
-- Si hay que volver a ejecutarla en otra base, hazlo en una sola transacción:
--   1. Si algo falla, no confirmar.
--   2. Si hay claves duplicadas, el primer bloque lanza un error y no borra filas.
--      Hay que dejar una sola fila por clave y volver a ejecutar el archivo.
--
-- Efecto, cuando se confirme:
--   - config_parametros.clave pasa a ser única.
--   - anon y authenticated pierden INSERT, UPDATE, DELETE y TRUNCATE
--     en config_parametros y config_log_cambios. Conservan SELECT, filtrado por RLS.
--   - Se eliminan las políticas de escritura. Queda solo lectura para is_admin().
--   - El historial solo lo insertan las funciones SECURITY DEFINER, con el actor comprobado.
--   - Rol, estado, plan y configuración se confirman con su fila de historial
--     en la misma transacción. Un valor igual no genera fila.

-- 1. Claves duplicadas: avisar y abortar, sin DELETE.
DO $$
DECLARE
  v_count int;
  v_claves text;
BEGIN
  SELECT count(*), string_agg(clave, ', ' ORDER BY clave)
  INTO v_count, v_claves
  FROM (
    SELECT clave
    FROM public.config_parametros
    WHERE clave IS NOT NULL
    GROUP BY clave
    HAVING count(*) > 1
  ) duplicadas;

  IF COALESCE(v_count, 0) > 0 THEN
    RAISE EXCEPTION
      'Hay % clave(s) duplicada(s) en config_parametros (%). No se ha borrado ningún dato. Deja una sola fila por clave y vuelve a ejecutar la migración.',
      v_count, v_claves;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS config_parametros_clave_unique
  ON public.config_parametros (clave);

CREATE INDEX IF NOT EXISTS config_log_cambios_cambiado_en_idx
  ON public.config_log_cambios (cambiado_en DESC);

CREATE INDEX IF NOT EXISTS config_log_cambios_tipo_idx
  ON public.config_log_cambios (tabla_afectada, campo);

ALTER TABLE public.config_log_cambios
  ALTER COLUMN cambiado_por DROP DEFAULT;

ALTER TABLE public.config_log_cambios
  ALTER COLUMN cambiado_en SET DEFAULT (now() AT TIME ZONE 'utc');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.config_log_cambios WHERE cambiado_por IS NULL
  ) THEN
    RAISE EXCEPTION
      'Hay filas de historial sin actor. No se ha modificado ni borrado ninguna. Corrige el actor antes de volver a ejecutar.';
  END IF;
END $$;

ALTER TABLE public.config_log_cambios
  ALTER COLUMN cambiado_por SET NOT NULL;

-- 2. Los clientes no insertan, editan ni borran configuración ni historial.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('config_parametros', 'config_log_cambios')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

ALTER TABLE public.config_parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_log_cambios ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.config_parametros FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.config_log_cambios FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.config_parametros TO authenticated;
GRANT SELECT ON public.config_log_cambios TO authenticated;

DROP POLICY IF EXISTS config_parametros_admin_select ON public.config_parametros;
CREATE POLICY config_parametros_admin_select
  ON public.config_parametros
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS config_log_cambios_admin_select ON public.config_log_cambios;
CREATE POLICY config_log_cambios_admin_select
  ON public.config_log_cambios
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 3. El actor lo envía el servidor con el id de la sesión ya validada.
--    auth.uid() es null cuando llama service_role, así que la función
--    comprueba ese id contra el mismo criterio que src/lib/adminAccess.js:
--    rol admin o administrador, o el correo ya definido como ADMIN_EMAIL
--    (direccion@opentowork.com). No es un permiso nuevo.
--    EXECUTE queda solo en service_role: el navegador no puede invocarlas.
CREATE OR REPLACE FUNCTION public.admin_assert_actor(p_actor uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_role text;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION 'actor no administrador';
  END IF;

  SELECT lower(btrim(u.email)), lower(btrim(r.nombre))
  INTO v_email, v_role
  FROM public."Usuarios_y_Perfil_users" u
  LEFT JOIN public."Usuarios_y_Perfil_roles" r ON r.id = u.rol_id
  WHERE u.id = p_actor;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'actor no administrador';
  END IF;

  IF v_role IN ('admin', 'administrador') THEN
    RETURN;
  END IF;

  IF v_email = 'direccion@opentowork.com' THEN
    RETURN;
  END IF;

  RAISE EXCEPTION 'actor no administrador';
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_audit_ready(p_actor uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_assert_actor(p_actor);
  RETURN true;
END;
$$;

-- Revoca el Plus founding dentro de la misma transacción que el cambio de plan.
CREATE OR REPLACE FUNCTION public.admin_release_founding_lock(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_slot int;
  v_email text;
  v_survey_id uuid;
  v_revocado timestamptz;
  v_profile_email text;
BEGIN
  IF to_regclass('public.founding_member_grants') IS NULL
     OR to_regclass('public.founding_member_encuestas') IS NULL THEN
    RETURN;
  END IF;

  SELECT slot_number, email
  INTO v_slot, v_email
  FROM public.founding_member_grants
  WHERE user_id = p_user_id;

  IF v_slot IS NULL OR v_slot < 2 OR v_slot > 50 THEN
    RETURN;
  END IF;

  SELECT id, plan_revocado_en
  INTO v_survey_id, v_revocado
  FROM public.founding_member_encuestas
  WHERE user_id = p_user_id;

  IF v_revocado IS NOT NULL THEN
    RETURN;
  END IF;

  IF v_survey_id IS NOT NULL THEN
    UPDATE public.founding_member_encuestas
    SET plan_revocado_en = now(),
        revocacion_omitida_motivo = 'admin'
    WHERE id = v_survey_id;
    RETURN;
  END IF;

  SELECT email INTO v_profile_email
  FROM public."Usuarios_y_Perfil_users"
  WHERE id = p_user_id;

  INSERT INTO public.founding_member_encuestas (
    user_id, slot_number, email, token, plan_revocado_en, revocacion_omitida_motivo
  ) VALUES (
    p_user_id,
    v_slot,
    COALESCE(NULLIF(btrim(v_email), ''), NULLIF(btrim(v_profile_email), ''), 'sin-email'),
    extensions.gen_random_uuid()::text,
    now(),
    'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_apply_profile_field(
  p_user_id uuid,
  p_column text,
  p_value text,
  p_actor uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev text;
  prev_label text;
  next_label text;
  campo text;
BEGIN
  PERFORM public.admin_assert_actor(p_actor);

  IF p_column = 'rol_id' THEN
    campo := 'rol';
    IF p_value IS NULL OR p_value !~* '^[0-9a-f-]{36}$' THEN
      RAISE EXCEPTION 'rol no válido';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public."Usuarios_y_Perfil_roles" WHERE id = p_value::uuid
    ) THEN
      RAISE EXCEPTION 'rol no encontrado';
    END IF;

    SELECT rol_id::text INTO prev
    FROM public."Usuarios_y_Perfil_users"
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'usuario no encontrado';
    END IF;

    IF prev IS NOT DISTINCT FROM p_value THEN
      RETURN false;
    END IF;

    SELECT nombre INTO prev_label
    FROM public."Usuarios_y_Perfil_roles"
    WHERE id = prev::uuid;

    SELECT nombre INTO next_label
    FROM public."Usuarios_y_Perfil_roles"
    WHERE id = p_value::uuid;

    UPDATE public."Usuarios_y_Perfil_users"
    SET rol_id = p_value::uuid
    WHERE id = p_user_id;
  ELSIF p_column = 'activo' THEN
    campo := 'activo';
    IF lower(btrim(COALESCE(p_value, ''))) NOT IN ('true', 'false') THEN
      RAISE EXCEPTION 'estado no válido';
    END IF;

    SELECT CASE WHEN activo IS NULL THEN NULL ELSE activo::text END INTO prev
    FROM public."Usuarios_y_Perfil_users"
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'usuario no encontrado';
    END IF;

    IF COALESCE(prev, 'true') IS NOT DISTINCT FROM lower(btrim(p_value)) THEN
      RETURN false;
    END IF;

    prev_label := CASE WHEN COALESCE(prev, 'true') = 'true' THEN 'activa' ELSE 'pausada' END;
    next_label := CASE WHEN lower(btrim(p_value)) = 'true' THEN 'activa' ELSE 'pausada' END;

    UPDATE public."Usuarios_y_Perfil_users"
    SET activo = lower(btrim(p_value))::boolean
    WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'columna no permitida';
  END IF;

  INSERT INTO public.config_log_cambios (
    tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
  ) VALUES (
    'Usuarios_y_Perfil_users',
    campo,
    p_user_id::text,
    prev_label,
    next_label,
    p_actor,
    now() AT TIME ZONE 'utc'
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_apply_plan_change(
  p_user_id uuid,
  p_plan text,
  p_actor uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev text;
  stored text;
BEGIN
  PERFORM public.admin_assert_actor(p_actor);

  IF p_plan NOT IN ('free', 'friendly_plus', 'friendly_premium') THEN
    RAISE EXCEPTION 'plan no permitido';
  END IF;

  SELECT plan_id INTO prev
  FROM public."Usuarios_y_Perfil_users"
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'usuario no encontrado';
  END IF;

  IF prev IS NOT DISTINCT FROM p_plan THEN
    RETURN false;
  END IF;

  IF p_plan = 'free' THEN
    PERFORM public.admin_release_founding_lock(p_user_id);
  END IF;

  UPDATE public."Usuarios_y_Perfil_users"
  SET plan_id = p_plan
  WHERE id = p_user_id;

  SELECT plan_id INTO stored
  FROM public."Usuarios_y_Perfil_users"
  WHERE id = p_user_id;

  IF stored IS DISTINCT FROM p_plan THEN
    RAISE EXCEPTION 'plan no persistido';
  END IF;

  INSERT INTO public.config_log_cambios (
    tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
  ) VALUES (
    'Usuarios_y_Perfil_users',
    'plan_id',
    p_user_id::text,
    prev,
    stored,
    p_actor,
    now() AT TIME ZONE 'utc'
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_apply_org_settings(
  p_actor uuid,
  p_values jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_value text;
  v_count int;
  v_previous text;
  v_row_id uuid;
  v_tipo text;
  v_descripcion text;
  v_saved text[] := ARRAY[]::text[];
BEGIN
  PERFORM public.admin_assert_actor(p_actor);

  IF p_values IS NULL OR jsonb_typeof(p_values) <> 'object' THEN
    RAISE EXCEPTION 'configuración no válida';
  END IF;

  FOR v_key, v_value IN
    SELECT key, value
    FROM jsonb_each_text(p_values)
  LOOP
    v_value := btrim(v_value);

    IF v_key = 'org.nombre_publico' THEN
      v_tipo := 'text';
      v_descripcion := 'Cuadro de identificación de los términos y cabecera de los correos.';
      IF v_value = '' OR char_length(v_value) > 80 THEN
        RAISE EXCEPTION 'Nombre comercial no válido';
      END IF;
    ELSIF v_key = 'org.razon_social' THEN
      v_tipo := 'text';
      v_descripcion := 'Línea legal del pie de los correos automáticos.';
      IF v_value = '' OR char_length(v_value) > 120 THEN
        RAISE EXCEPTION 'Razón social no válida';
      END IF;
    ELSIF v_key = 'legal.titular' THEN
      v_tipo := 'text';
      v_descripcion := 'Titular del cuadro de identificación de los términos.';
      IF v_value = '' OR char_length(v_value) > 120 THEN
        RAISE EXCEPTION 'Titular no válido';
      END IF;
    ELSIF v_key = 'legal.cif' THEN
      v_tipo := 'text';
      v_descripcion := 'CIF del cuadro de identificación de los términos.';
      v_value := upper(v_value);
      IF v_value !~ '^[A-Z0-9][A-Z0-9-]{4,19}$' THEN
        RAISE EXCEPTION 'CIF no válido';
      END IF;
    ELSIF v_key = 'legal.email_contacto' THEN
      v_tipo := 'email';
      v_descripcion := 'Email de contacto del cuadro de identificación de los términos.';
      v_value := lower(v_value);
      IF v_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
         OR char_length(v_value) > 120 THEN
        RAISE EXCEPTION 'Email de contacto no válido';
      END IF;
    ELSIF v_key = 'legal.web' THEN
      v_tipo := 'text';
      v_descripcion := 'Web del cuadro de identificación de los términos.';
      IF v_value = '' OR char_length(v_value) > 120 THEN
        RAISE EXCEPTION 'Web no válida';
      END IF;
    ELSIF v_key = 'contacto.soporte_email' THEN
      v_tipo := 'email';
      v_descripcion := 'Correo de soporte visible en el pie de los correos automáticos.';
      v_value := lower(v_value);
      IF v_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
         OR char_length(v_value) > 120 THEN
        RAISE EXCEPTION 'Correo de soporte no válido';
      END IF;
    ELSE
      RAISE EXCEPTION 'clave no permitida';
    END IF;

    SELECT count(*) INTO v_count
    FROM public.config_parametros
    WHERE clave = v_key;

    IF v_count > 1 THEN
      RAISE EXCEPTION 'clave duplicada';
    END IF;

    IF v_count = 1 THEN
      SELECT id, valor INTO v_row_id, v_previous
      FROM public.config_parametros
      WHERE clave = v_key
      FOR UPDATE;

      IF v_previous IS NOT DISTINCT FROM v_value THEN
        CONTINUE;
      END IF;

      UPDATE public.config_parametros
      SET valor = v_value,
          tipo = v_tipo,
          descripcion = v_descripcion
      WHERE id = v_row_id;
    ELSE
      v_previous := NULL;
      INSERT INTO public.config_parametros (clave, valor, tipo, descripcion, creado_en)
      VALUES (v_key, v_value, v_tipo, v_descripcion, now() AT TIME ZONE 'utc')
      RETURNING id INTO v_row_id;
    END IF;

    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'config_parametros',
      v_key,
      v_key,
      v_previous,
      v_value,
      p_actor,
      now() AT TIME ZONE 'utc'
    );

    v_saved := array_append(v_saved, v_key);
  END LOOP;

  RETURN jsonb_build_object('saved', to_jsonb(v_saved));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assert_actor(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_audit_ready(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_release_founding_lock(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_apply_profile_field(uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_apply_plan_change(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_apply_org_settings(uuid, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_audit_ready(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_apply_profile_field(uuid, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_apply_plan_change(uuid, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_apply_org_settings(uuid, jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';
