CREATE OR REPLACE FUNCTION public.enforce_levels_preguntas_parte_examen_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parte_id IS NOT NULL THEN
    IF NEW.examen_id IS NULL THEN
      RAISE EXCEPTION 'examen_id no puede ser NULL cuando parte_id está definido';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.levels_partes p
      WHERE p.id = NEW.parte_id
        AND p.examen_id = NEW.examen_id
    ) THEN
      RAISE EXCEPTION 'Inconsistencia: parte_id % pertenece a examen_id % pero niveles_preguntas tiene examen_id %',
        NEW.parte_id,
        (SELECT p.examen_id FROM public.levels_partes p WHERE p.id = NEW.parte_id),
        NEW.examen_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
  select exists (
    select 1
    from public."Usuarios_y_Perfil_users" u
    join public."Usuarios_y_Perfil_roles" r on r.id = u.rol_id
    where u.id = auth.uid()
      and lower(r.nombre) in ('admin', 'administrador')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_owner(row_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT row_user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_support_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM "Usuarios_y_Perfil_users" u
    JOIN "Usuarios_y_Perfil_roles" r ON r.id = u.rol_id
    WHERE u.id = auth.uid()
      AND lower(trim(r.nombre)) IN ('soporte', 'admin', 'administrador', 'support')
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
