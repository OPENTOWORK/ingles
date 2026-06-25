DROP TRIGGER IF EXISTS trg_levels_estadisticas_actualizado_en ON public.levels_estadisticas;
CREATE TRIGGER trg_levels_estadisticas_actualizado_en BEFORE UPDATE ON public.levels_estadisticas FOR EACH ROW EXECUTE FUNCTION levels_estadisticas_set_actualizado_en();

DROP TRIGGER IF EXISTS trg_levels_notas_actualizado_en ON public.levels_notas;
CREATE TRIGGER trg_levels_notas_actualizado_en BEFORE UPDATE ON public.levels_notas FOR EACH ROW EXECUTE FUNCTION levels_notas_set_actualizado_en();
