-- Accesos de webs y programas de Administración.
-- La tabla no tiene lectura ni escritura para anon ni authenticated.
-- Solo el servidor, con service_role y el actor ya validado, lee y escribe.
-- La contraseña no se copia a config_log_cambios: el historial dice «Actualizada».

CREATE TABLE IF NOT EXISTS public.admin_accesos_web (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  nombre text NOT NULL,
  url text,
  para_que text,
  conectado_con text,
  usuario text,
  correo text,
  contrasena text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  creado_por uuid NOT NULL
);

ALTER TABLE public.admin_accesos_web ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_accesos_web FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_save_acceso_web(
  p_actor uuid,
  p_id uuid,
  p_nombre text,
  p_url text,
  p_para_que text,
  p_conectado_con text,
  p_usuario text,
  p_correo text,
  p_contrasena text,
  p_keep_password boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_nombre text;
  v_url text;
  v_para_que text;
  v_conectado text;
  v_usuario text;
  v_correo text;
  v_password text;
  v_old public.admin_accesos_web%ROWTYPE;
  v_had_password boolean;
  v_has_password boolean;
BEGIN
  PERFORM public.admin_assert_actor(p_actor);

  v_nombre := btrim(p_nombre);
  v_url := nullif(btrim(p_url), '');
  v_para_que := nullif(btrim(p_para_que), '');
  v_conectado := nullif(btrim(p_conectado_con), '');
  v_usuario := nullif(btrim(p_usuario), '');
  v_correo := nullif(lower(btrim(p_correo)), '');
  v_password := nullif(btrim(p_contrasena), '');

  IF v_nombre IS NULL OR v_nombre = '' THEN
    RAISE EXCEPTION 'El nombre es obligatorio.';
  END IF;
  IF char_length(v_nombre) > 120 THEN
    RAISE EXCEPTION 'El nombre es demasiado largo.';
  END IF;
  IF char_length(v_url) > 500 THEN
    RAISE EXCEPTION 'La URL es demasiado larga.';
  END IF;
  IF char_length(v_para_que) > 500 THEN
    RAISE EXCEPTION 'El texto de para qué sirve es demasiado largo.';
  END IF;
  IF char_length(v_conectado) > 500 THEN
    RAISE EXCEPTION 'El texto de con qué está conectado es demasiado largo.';
  END IF;
  IF char_length(v_usuario) > 160 THEN
    RAISE EXCEPTION 'El usuario es demasiado largo.';
  END IF;
  IF char_length(v_correo) > 160 THEN
    RAISE EXCEPTION 'El correo es demasiado largo.';
  END IF;
  IF v_correo IS NOT NULL AND v_correo !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'El correo no es válido.';
  END IF;
  IF char_length(v_password) > 500 THEN
    RAISE EXCEPTION 'La contraseña es demasiado larga.';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.admin_accesos_web (
      nombre, url, para_que, conectado_con, usuario, correo, contrasena, creado_por
    ) VALUES (
      v_nombre, v_url, v_para_que, v_conectado, v_usuario, v_correo, v_password, p_actor
    )
    RETURNING id INTO v_id;

    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'nombre', v_id::text, NULL, v_nombre, p_actor, now() AT TIME ZONE 'utc'
    );

    IF v_url IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'url', v_id::text, NULL, v_url, p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    IF v_para_que IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'para_que', v_id::text, NULL, v_para_que, p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    IF v_conectado IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'conectado_con', v_id::text, NULL, v_conectado, p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    IF v_usuario IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'usuario', v_id::text, NULL, v_usuario, p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    IF v_correo IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'correo', v_id::text, NULL, v_correo, p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    IF v_password IS NOT NULL THEN
      INSERT INTO public.config_log_cambios (
        tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
      ) VALUES (
        'admin_accesos_web', 'contrasena', v_id::text, NULL, 'Actualizada', p_actor, now() AT TIME ZONE 'utc'
      );
    END IF;

    RETURN v_id;
  END IF;

  SELECT *
  INTO v_old
  FROM public.admin_accesos_web
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ese acceso no existe.';
  END IF;

  UPDATE public.admin_accesos_web
  SET
    nombre = v_nombre,
    url = v_url,
    para_que = v_para_que,
    conectado_con = v_conectado,
    usuario = v_usuario,
    correo = v_correo,
    contrasena = CASE WHEN COALESCE(p_keep_password, false) THEN contrasena ELSE v_password END,
    actualizado_en = now()
  WHERE id = p_id;

  IF v_old.nombre IS DISTINCT FROM v_nombre THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'nombre', p_id::text, v_old.nombre, v_nombre, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  IF v_old.url IS DISTINCT FROM v_url THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'url', p_id::text, v_old.url, v_url, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  IF v_old.para_que IS DISTINCT FROM v_para_que THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'para_que', p_id::text, v_old.para_que, v_para_que, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  IF v_old.conectado_con IS DISTINCT FROM v_conectado THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'conectado_con', p_id::text, v_old.conectado_con, v_conectado, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  IF v_old.usuario IS DISTINCT FROM v_usuario THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'usuario', p_id::text, v_old.usuario, v_usuario, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  IF v_old.correo IS DISTINCT FROM v_correo THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web', 'correo', p_id::text, v_old.correo, v_correo, p_actor, now() AT TIME ZONE 'utc'
    );
  END IF;

  v_had_password := v_old.contrasena IS NOT NULL;
  v_has_password := v_password IS NOT NULL;
  IF NOT COALESCE(p_keep_password, false) AND v_old.contrasena IS DISTINCT FROM v_password THEN
    INSERT INTO public.config_log_cambios (
      tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
    ) VALUES (
      'admin_accesos_web',
      'contrasena',
      p_id::text,
      CASE WHEN v_had_password THEN 'Actualizada' ELSE NULL END,
      CASE WHEN v_has_password THEN 'Actualizada' ELSE NULL END,
      p_actor,
      now() AT TIME ZONE 'utc'
    );
  END IF;

  RETURN p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_acceso_web(
  p_actor uuid,
  p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
BEGIN
  PERFORM public.admin_assert_actor(p_actor);

  SELECT nombre
  INTO v_nombre
  FROM public.admin_accesos_web
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ese acceso no existe.';
  END IF;

  DELETE FROM public.admin_accesos_web WHERE id = p_id;

  INSERT INTO public.config_log_cambios (
    tabla_afectada, campo, clave, valor_anterior, valor_nuevo, cambiado_por, cambiado_en
  ) VALUES (
    'admin_accesos_web', 'registro', p_id::text, v_nombre, NULL, p_actor, now() AT TIME ZONE 'utc'
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_acceso_web(uuid, uuid, text, text, text, text, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_delete_acceso_web(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_acceso_web(uuid, uuid, text, text, text, text, text, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_acceso_web(uuid, uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
