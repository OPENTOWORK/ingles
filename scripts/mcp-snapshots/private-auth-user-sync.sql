CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_student_role_id uuid;
begin
  select id into v_student_role_id
  from public."Usuarios_y_Perfil_roles"
  where lower(nombre) = 'student'
  order by id
  limit 1;

  insert into public."Usuarios_y_Perfil_users" (id, nombre, email, rol_id, activo, creado_en)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    v_student_role_id,
    true,
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        nombre = coalesce(public."Usuarios_y_Perfil_users".nombre, excluded.nombre);

  insert into public."Usuarios_y_Perfil_profiles" (user_id, rol_id)
  values (new.id, v_student_role_id)
  on conflict (user_id) do update
    set rol_id = coalesce(public."Usuarios_y_Perfil_profiles".rol_id, excluded.rol_id);

  insert into public.perfil_preferencias_estudio (user_id, estilo_aprendizaje, notificaciones, recordatorios, creado_en)
  values (new.id, 'A1', true, true, now())
  on conflict do nothing;

  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_sync_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_auth_user();
