-- Roles base para English Practice (Supabase)
-- Ejecutar en SQL Editor de Supabase.

begin;

create table if not exists public.roles (
  id bigserial primary key,
  code text not null unique,
  nombre text not null,
  descripcion text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (code, nombre, descripcion)
values
  ('student', 'alumno', 'Persona que utiliza la plataforma para aprender o interactuar con el contenido.'),
  ('admin', 'administrador', 'Usuario con control total sobre la plataforma y sus configuraciones.'),
  ('organization', 'centro/empresa', 'Organizacion que agrupa usuarios bajo una misma entidad.'),
  ('group', 'clases/grupos', 'Subdivisiones de usuarios para organizar ensenanza o seguimiento.'),
  ('teacher', 'profesor', 'Usuario encargado de guiar, evaluar y gestionar alumnos.'),
  ('it', 'informatico', 'Perfil tecnico encargado del mantenimiento del sistema.'),
  ('support', 'soporte', 'Equipo encargado de resolver incidencias y ayudar a los usuarios.'),
  ('coordinator', 'coordinador', 'Coordina al equipo de profesores: asignación de alumnos y seguimiento por docente.'),
  ('marketing', 'Resp.marketing', 'Responsable de marketing: artículos, noticias, buzón y reuniones.')
on conflict (code) do update
set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion;

-- Si existe una tabla de usuarios de negocio, enlazamos rol por FK.
alter table if exists public."Usuarios_y_Perfil_users"
  add column if not exists rol_id bigint;

do $$
declare
  teacher_role_id bigint;
begin
  select id into teacher_role_id from public.roles where code = 'teacher';

  if teacher_role_id is not null then
    update public."Usuarios_y_Perfil_users"
    set rol_id = teacher_role_id
    where lower(email) = 'carlos@opentowork.com';
  end if;
end $$;

commit;
