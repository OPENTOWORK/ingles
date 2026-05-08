-- =============================================================================
-- Objetivo: dar a "Examen 1" B2 un id distinto del id del nivel B2 en
-- public.levels_examenes, sin borrar filas de public.levels_preguntas.
--
-- Situación actual (ejemplo):
--   levels.id (b2)              = ae0e85e8-3d63-11f1-b2e3-0b27f7b23431
--   levels_examenes.id        = ae0e85e8-3d63-11f1-b2e3-0b27f7b23431  (mismo)
--   levels_examenes.level_id  = ae0e85e8-3d63-11f1-b2e3-0b27f7b23431  (FK al nivel)
--   levels_preguntas.examen_id apunta al id del examen
--
-- La web (Next) no fija ese UUID: lee levels_examenes por level_id y luego
-- levels_preguntas por examen_id. Tras esta migración sigue funcionando.
--
-- ANTES de ejecutar (opcional, en SQL Editor):
--   SELECT conrelid::regclass AS referencing_table, conname
--   FROM pg_constraint
--   WHERE confrelid = 'public.levels_examenes'::regclass;
-- Si aparece más de levels_preguntas, amplía el bloque DO con UPDATEs
-- análogos a examen_id antes del DELETE.
--
-- Si INSERT falla por UNIQUE(level_id) u otra restricción: no ejecutes el
-- DELETE; revisa restricciones o pide ayuda. En muchos proyectos solo existe
-- UNIQUE/PK en id.
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_old_exam uuid := 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431'::uuid;
  v_b2_level uuid := 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431'::uuid;
  v_new_exam uuid;
  n_exam     int;
  n_before   int;
  n_after    int;
BEGIN
  SELECT COUNT(*) INTO n_exam
  FROM public.levels_examenes
  WHERE id = v_old_exam AND level_id = v_b2_level;

  IF n_exam <> 1 THEN
    RAISE EXCEPTION
      'Se esperaba 1 fila en levels_examenes con id = % y level_id = %; filas: %',
      v_old_exam, v_b2_level, n_exam;
  END IF;

  SELECT COUNT(*)::int INTO n_before
  FROM public.levels_preguntas
  WHERE examen_id = v_old_exam;

  -- Clonar todas las columnas que usa la app (exam-useofenglish, etc.).
  -- Si alguna columna no existe en tu BD, quítala del INSERT y del SELECT,
  -- o usa el bloque alternativo al final de este archivo (solo id, level_id, nombre).
  INSERT INTO public.levels_examenes (id, level_id, nombre, tipo, modelo, "Nivel")
  SELECT gen_random_uuid(), level_id, nombre, tipo, modelo, "Nivel"
  FROM public.levels_examenes
  WHERE id = v_old_exam
  RETURNING id INTO v_new_exam;

  UPDATE public.levels_preguntas
  SET examen_id = v_new_exam
  WHERE examen_id = v_old_exam;

  GET DIAGNOSTICS n_after = ROW_COUNT;

  DELETE FROM public.levels_examenes
  WHERE id = v_old_exam;

  RAISE NOTICE
    'Migración OK. Nuevo levels_examenes.id = %. Preguntas con examen_id antiguo antes: %. Filas actualizadas: %.',
    v_new_exam, n_before, n_after;
END $$;

COMMIT;

-- =============================================================================
-- Alternativa (solo si el INSERT anterior falla: columna desconocida, etc.):
-- Sustituye el INSERT en el DO por:
--
--   INSERT INTO public.levels_examenes (id, level_id, nombre)
--   SELECT gen_random_uuid(), level_id, nombre
--   FROM public.levels_examenes
--   WHERE id = v_old_exam
--   RETURNING id INTO v_new_exam;
--
-- Añade otras columnas NOT NULL según el resultado de: \d public.levels_examenes
-- =============================================================================
