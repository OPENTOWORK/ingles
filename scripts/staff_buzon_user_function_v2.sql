-- Buzón: cualquier rol de staff activo (todos excepto estudiante/alumno).
create or replace function public.is_staff_buzon_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Usuarios_y_Perfil_users" u
    join "Usuarios_y_Perfil_roles" r on r.id = u.rol_id
    where u.id = coalesce(p_user_id, auth.uid())
      and coalesce(u.activo, true) = true
      and translate(
        lower(trim(r.nombre)),
        'áàäâãéèëêíìïîóòöôõúùüûñ',
        'aaaaaeeeeiiiiooooouuuun'
      ) not in ('student', 'alumno', 'estudiante')
  );
$$;
