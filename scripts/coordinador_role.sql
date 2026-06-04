-- Rol coordinador: coordina profesores y sus alumnos asignados.
-- Ejecutar en el SQL Editor de Supabase (producción).

begin;

insert into public.roles (code, nombre, descripcion)
values (
  'coordinator',
  'coordinador',
  'Coordina al equipo de profesores: asignación de alumnos y seguimiento por docente.'
)
on conflict (code) do update
set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion;

-- Tabla usada por la app (Usuarios_y_Perfil_roles)
insert into public."Usuarios_y_Perfil_roles" (nombre, descripcion)
select
  'coordinador',
  'Coordina al equipo de profesores: asignación de alumnos y seguimiento por docente.'
where not exists (
  select 1 from public."Usuarios_y_Perfil_roles" r where lower(r.nombre) = 'coordinador'
);

-- Sincronizar public.roles → Usuarios_y_Perfil_roles si comparten id por code (opcional)
-- Asigna rol coordinador a un usuario sustituyendo el email:
-- update public."Usuarios_y_Perfil_users" u
-- set rol_id = (select id from public."Usuarios_y_Perfil_roles" where lower(nombre) = 'coordinador' limit 1)
-- where lower(u.email) = 'tu-email@ejemplo.com';

commit;
