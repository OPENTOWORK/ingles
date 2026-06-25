-- Plantillas reutilizables para tareas del personal (no estudiantes).
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.staff_tarea_plantillas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  titulo text not null,
  descripcion text,
  enlace text,
  creado_por uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_staff_tarea_plantillas_nombre
  on public.staff_tarea_plantillas (nombre);

alter table public.staff_tarea_plantillas enable row level security;

-- Lectura para staff autenticado; escritura vía service role en API.
drop policy if exists staff_tarea_plantillas_read on public.staff_tarea_plantillas;
create policy staff_tarea_plantillas_read on public.staff_tarea_plantillas
  for select to authenticated
  using (true);

grant select on public.staff_tarea_plantillas to authenticated;

notify pgrst, 'reload schema';

commit;
