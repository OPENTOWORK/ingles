-- Varios responsables por fase (o "todo el equipo").
-- Ejecutar en Supabase SQL Editor tras staff_tasks_system.sql.

begin;

alter table public.staff_fases
  add column if not exists responsables_ids uuid[] not null default '{}',
  add column if not exists responsables_todos boolean not null default false;

-- Migrar responsable único existente al array
update public.staff_fases
set responsables_ids = array[responsable_id]
where responsable_id is not null
  and (responsables_ids is null or responsables_ids = '{}');

notify pgrst, 'reload schema';

commit;
