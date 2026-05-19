-- Panel de profesor: alumnos asignados, tareas y calificaciones manuales.
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.profesor_alumnos (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  alumno_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (profesor_id, alumno_id)
);

create index if not exists idx_profesor_alumnos_profesor on public.profesor_alumnos (profesor_id);
create index if not exists idx_profesor_alumnos_alumno on public.profesor_alumnos (alumno_id);

create table if not exists public.profesor_tareas (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  alumno_id uuid references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  titulo text not null,
  descripcion text,
  enlace text,
  fecha_limite timestamptz,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'completada', 'cancelada')),
  creado_en timestamptz not null default now()
);

create index if not exists idx_profesor_tareas_profesor on public.profesor_tareas (profesor_id, creado_en desc);

create table if not exists public.profesor_calificaciones (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  alumno_id uuid not null references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  titulo text not null,
  nota double precision not null check (nota >= 0 and nota <= 100),
  comentario text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_profesor_calificaciones_alumno
  on public.profesor_calificaciones (profesor_id, alumno_id, creado_en desc);

alter table public.profesor_alumnos enable row level security;
alter table public.profesor_tareas enable row level security;
alter table public.profesor_calificaciones enable row level security;

-- Profesor ve y gestiona sus filas; admin vía service role en API.
drop policy if exists profesor_alumnos_teacher_all on public.profesor_alumnos;
create policy profesor_alumnos_teacher_all on public.profesor_alumnos
  for all to authenticated
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

drop policy if exists profesor_tareas_teacher_all on public.profesor_tareas;
create policy profesor_tareas_teacher_all on public.profesor_tareas
  for all to authenticated
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

drop policy if exists profesor_calificaciones_teacher_all on public.profesor_calificaciones;
create policy profesor_calificaciones_teacher_all on public.profesor_calificaciones
  for all to authenticated
  using (profesor_id = auth.uid())
  with check (profesor_id = auth.uid());

grant select, insert, update, delete on public.profesor_alumnos to authenticated;
grant select, insert, update, delete on public.profesor_tareas to authenticated;
grant select, insert, update, delete on public.profesor_calificaciones to authenticated;

-- Recarga la API de Supabase para que PostgREST vea las tablas nuevas de inmediato.
notify pgrst, 'reload schema';

commit;
