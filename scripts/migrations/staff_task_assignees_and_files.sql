-- Varias personas y archivos en las tareas del personal.
-- Aditivo: asignado_id sigue siendo la primera persona.

alter table public.staff_tareas
  add column if not exists asignados_ids uuid[] not null default '{}';

update public.staff_tareas
set asignados_ids = array[asignado_id]
where asignado_id is not null
  and cardinality(asignados_ids) = 0;

create index if not exists idx_staff_tareas_asignados_ids
  on public.staff_tareas using gin (asignados_ids);

create table if not exists public.staff_tarea_archivos (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references public.staff_tareas (id) on delete cascade,
  nombre text not null,
  mime text,
  kind text check (kind is null or kind in ('image', 'document', 'audio')),
  storage_path text not null,
  size_bytes integer,
  created_by uuid references public."Usuarios_y_Perfil_users" (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_tarea_archivos_tarea
  on public.staff_tarea_archivos (tarea_id, created_at);

alter table public.staff_tarea_archivos enable row level security;
revoke all on public.staff_tarea_archivos from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-task-files',
  'staff-task-files',
  false,
  15728640,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/mp4',
    'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
