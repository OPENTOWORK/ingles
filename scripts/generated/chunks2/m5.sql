INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '29 wish I hadn’t told', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '29 wish I hadn’t told');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '30 don’t need to buy', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '30 don’t need to buy');

-- PARTE 5 EJERCICIO 1 → examen offset 0
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 B', true);

-- PARTE 5 EJERCICIO 2 → examen offset 1
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 C', true);

-- PARTE 5 EJERCICIO 3 → examen offset 2
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 C', true);

-- PARTE 5 EJERCICIO 4 → examen offset 3
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 D', true);

-- PARTE 5 EJERCICIO 5 → examen offset 4
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '6f873582-07bf-436a-9a25-492b748678c7'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 C', true);

-- PARTE 6 EJERCICIO 1 → examen offset 0
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 E', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 G', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 D', true);

-- PARTE 6 EJERCICIO 2 → examen offset 1
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 C', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 D', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 E', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '36 F', true);

-- PARTE 6 EJERCICIO 3 → examen offset 2
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '31 F', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '32 B', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '33 G', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '34 A', true);
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'b170ab5a-f54f-4cae-ac2e-bd194181cafe'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '35 D', true);