-- Subfases del proyecto (dentro de cada fase). Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.staff_subfases (
  id uuid primary key default gen_random_uuid(),
  fase_id uuid not null references public.staff_fases (id) on delete cascade,
  nombre text not null,
  descripcion text,
  estado text not null default 'no_iniciada'
    check (estado in ('no_iniciada', 'en_progreso', 'en_revision', 'completada', 'bloqueada')),
  orden integer not null default 0,
  fecha_inicio date,
  fecha_limite date,
  visible_para_todos boolean not null default true,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_subfases_fase on public.staff_subfases (fase_id);
create index if not exists idx_staff_subfases_orden on public.staff_subfases (orden);

alter table public.staff_tareas
  add column if not exists subfase_id uuid references public.staff_subfases (id) on delete set null;

create index if not exists idx_staff_tareas_subfase on public.staff_tareas (subfase_id);

alter table public.staff_subfases enable row level security;

drop policy if exists staff_subfases_read on public.staff_subfases;
create policy staff_subfases_read on public.staff_subfases
  for select to authenticated
  using (true);

grant select on public.staff_subfases to authenticated;

notify pgrst, 'reload schema';

commit;
