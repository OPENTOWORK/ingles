-- Lectura compartida en el panel de tareas: todo el staff autenticado (no alumnos).
-- Ejecutar en Supabase SQL Editor si las políticas RLS limitan la visibilidad.

begin;

drop policy if exists staff_fases_read on public.staff_fases;
create policy staff_fases_read on public.staff_fases
  for select to authenticated
  using (true);

do $$
begin
  if to_regclass('public.staff_subfases') is not null then
    execute 'drop policy if exists staff_subfases_read on public.staff_subfases';
    execute $sql$
      create policy staff_subfases_read on public.staff_subfases
        for select to authenticated
        using (true)
    $sql$;
  end if;
end $$;

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

update public.staff_fases set visible_para_todos = true where visible_para_todos is distinct from true;

notify pgrst, 'reload schema';

commit;
