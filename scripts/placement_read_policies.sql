-- Permite a usuarios autenticados leer el banco del placement test.
-- Ejecutar en Supabase SQL Editor si no usas la migración automática.

DROP POLICY IF EXISTS authenticated_read_placement_tests ON public.placement_tests;
CREATE POLICY authenticated_read_placement_tests
  ON public.placement_tests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_placement_preguntas ON public.placement_preguntas;
CREATE POLICY authenticated_read_placement_preguntas
  ON public.placement_preguntas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS authenticated_read_placement_respuestas ON public.placement_respuestas;
CREATE POLICY authenticated_read_placement_respuestas
  ON public.placement_respuestas FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
