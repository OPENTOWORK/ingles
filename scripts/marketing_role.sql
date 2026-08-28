-- Rol Resp.marketing: gestión de blog, buzón y reuniones.
-- Ejecutar en el SQL Editor de Supabase (producción).

begin;

insert into public.roles (code, nombre, descripcion)
values (
  'marketing',
  'Resp.marketing',
  'Responsable de marketing: creación de artículos y noticias, buzón interno y reuniones.'
)
on conflict (code) do update
set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion;

insert into public."Usuarios_y_Perfil_roles" (nombre, descripcion)
select
  'Resp.marketing',
  'Responsable de marketing: creación de artículos y noticias, buzón interno y reuniones.'
where not exists (
  select 1 from public."Usuarios_y_Perfil_roles" r where lower(r.nombre) = lower('Resp.marketing')
);

-- Asigna el rol a un usuario sustituyendo el email:
-- update public."Usuarios_y_Perfil_users" u
-- set rol_id = (
--   select id from public."Usuarios_y_Perfil_roles" where lower(nombre) = lower('Resp.marketing') limit 1
-- )
-- where lower(u.email) = 'tu-email@ejemplo.com';

commit;
