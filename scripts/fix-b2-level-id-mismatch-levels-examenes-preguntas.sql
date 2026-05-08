-- =============================================================================
-- Desalineación B2: public.levels (fila nombre=b2) tenía un id distinto al que
-- seguían usando public.levels_examenes.level_id y public.levels_preguntas.level_id
-- (id “viejo” del nivel). La app filtra por el id actual de levels → 0 filas en
-- levels_examenes → "No se pudo obtener el examen de B2".
--
-- Corrección: UPDATE de level_id a la fila actual de B2 en levels_examenes y
-- en levels_preguntas. No borra filas de levels_preguntas.
--
-- ANTES de ejecutar en otro entorno, obtén los UUID reales:
--   SELECT id, nombre FROM public.levels WHERE lower(nombre) = 'b2';
--   SELECT id, level_id, nombre FROM public.levels_examenes WHERE nombre ILIKE '%examen%';
--   SELECT DISTINCT level_id FROM public.levels_preguntas WHERE examen_id = '<id examen>';
--
-- Sustituye :b2_current y :b2_legacy en el bloque siguiente.
-- =============================================================================

BEGIN;

-- Ejemplo aplicado en proyecto ENGLISH (Supabase MCP, 2026): ajusta UUIDs en otros entornos.
-- b2_current = id actual en public.levels para nombre b2
-- b2_legacy  = level_id antiguo repetido en examen/preguntas (coincidía con id viejo del nivel)

UPDATE public.levels_examenes
SET level_id = '8b180126-a2fe-47fc-b9b2-8af875e25593'
WHERE id = 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431'
  AND level_id = 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431';

UPDATE public.levels_preguntas
SET level_id = '8b180126-a2fe-47fc-b9b2-8af875e25593'
WHERE level_id = 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431';

COMMIT;
