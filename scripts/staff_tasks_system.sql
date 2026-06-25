-- Sistema de gestión de tareas del personal: fases, tareas y plantillas ampliadas.
-- Ejecutar en Supabase SQL Editor. No modifica profesor_tareas (panel de profesor).

begin;

-- ─── Fases del proyecto ───────────────────────────────────────────────────────
create table if not exists public.staff_fases (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  estado text not null default 'no_iniciada'
    check (estado in ('no_iniciada', 'en_progreso', 'en_revision', 'completada', 'bloqueada')),
  orden integer not null default 0,
  fecha_inicio date,
  fecha_limite date,
  responsable_id uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  responsable_rol text,
  responsables_ids uuid[] not null default '{}',
  responsables_todos boolean not null default false,
  visible_para_todos boolean not null default true,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_fases_orden on public.staff_fases (orden);
create index if not exists idx_staff_fases_estado on public.staff_fases (estado);

-- ─── Tareas del personal ──────────────────────────────────────────────────────
create table if not exists public.staff_tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  estado text not null default 'pendiente'
    check (estado in (
      'pendiente', 'en_progreso', 'en_revision', 'completada',
      'cancelada', 'bloqueada'
    )),
  prioridad text not null default 'media'
    check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  fase_id uuid references public.staff_fases (id) on delete set null,
  asignado_id uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  asignado_rol text,
  alumno_id uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  fecha_limite timestamptz,
  completada_at timestamptz,
  cancelada_at timestamptz,
  bloqueada_motivo text,
  enlace text,
  notas text,
  checklist jsonb default '[]'::jsonb,
  plantilla_id uuid,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_tareas_estado on public.staff_tareas (estado);
create index if not exists idx_staff_tareas_prioridad on public.staff_tareas (prioridad);
create index if not exists idx_staff_tareas_fase on public.staff_tareas (fase_id);
create index if not exists idx_staff_tareas_asignado on public.staff_tareas (asignado_id);
create index if not exists idx_staff_tareas_fecha_limite on public.staff_tareas (fecha_limite);
create index if not exists idx_staff_tareas_created on public.staff_tareas (created_at desc);

-- ─── Ampliar plantillas existentes ────────────────────────────────────────────
alter table public.staff_tarea_plantillas
  add column if not exists prioridad_default text default 'media',
  add column if not exists asignado_rol_default text,
  add column if not exists fase_id uuid references public.staff_fases (id) on delete set null,
  add column if not exists checklist_default jsonb default '[]'::jsonb,
  add column if not exists activa boolean not null default true,
  add column if not exists notas_default text;

alter table public.staff_tarea_plantillas
  drop constraint if exists staff_tarea_plantillas_prioridad_default_check;
alter table public.staff_tarea_plantillas
  add constraint staff_tarea_plantillas_prioridad_default_check
  check (prioridad_default is null or prioridad_default in ('baja', 'media', 'alta', 'urgente'));

-- FK plantilla_id en tareas (después de que exista staff_tarea_plantillas)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'staff_tareas_plantilla_id_fkey'
  ) then
    alter table public.staff_tareas
      add constraint staff_tareas_plantilla_id_fkey
      foreign key (plantilla_id) references public.staff_tarea_plantillas (id) on delete set null;
  end if;
end $$;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.staff_fases enable row level security;
alter table public.staff_tareas enable row level security;

drop policy if exists staff_fases_read on public.staff_fases;
create policy staff_fases_read on public.staff_fases
  for select to authenticated
  using (true);

drop policy if exists staff_tareas_read_own on public.staff_tareas;
drop policy if exists staff_tareas_read_staff on public.staff_tareas;
create policy staff_tareas_read_staff on public.staff_tareas
  for select to authenticated
  using (
    exists (
      select 1
      from public."Usuarios_y_Perfil_users" u
      join public."Usuarios_y_Perfil_roles" r on r.id = u.rol_id
      where u.id = auth.uid()
        and lower(trim(r.nombre)) not in ('student', 'alumno')
    )
  );

grant select on public.staff_fases to authenticated;
grant select on public.staff_tareas to authenticated;

notify pgrst, 'reload schema';

commit;
