-- Ejemplo opcional de fases iniciales (NO ejecutar en producción por defecto).
-- Las fases las crea el equipo desde el panel: Coordinador → Tareas → + Nueva fase.
--
-- Si quieres datos de prueba en local, descomenta y ejecuta manualmente:

/*
begin;

insert into public.staff_fases (nombre, descripcion, estado, orden, visible_para_todos)
values
  ('Organización interna', 'Estructura, procesos y coordinación del equipo.', 'no_iniciada', 1, true),
  ('Calidad educativa', 'Contenidos, evaluaciones y estándares Cambridge.', 'no_iniciada', 2, true);

notify pgrst, 'reload schema';
commit;
*/
