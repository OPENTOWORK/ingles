INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 variety', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 variety');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 disadvantages', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 disadvantages');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 distraction', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 distraction');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 interaction', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 interaction');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 decision-making', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 decision-making');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 carefully', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 carefully');

-- PARTE 3 EJERCICIO 4 → examen offset 3
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '17 enjoyment', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '17 enjoyment');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '18 memory', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '18 memory');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 community', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 community');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 professional', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 professional');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 harmful', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 harmful');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 careful', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 careful');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 variety', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 variety');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 valuable', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 valuable');

-- PARTE 3 EJERCICIO 5 → examen offset 4
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '17 productivity', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '17 productivity');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '18 anxiety', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '18 anxiety');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 carefully', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 carefully');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 responsibility', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 responsibility');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 discipline', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 discipline');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 helpful', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '22 helpful');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 adjustments', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '23 adjustments');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 valuable', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '24 valuable');

-- PARTE 4 EJERCICIO 1 → examen offset 0
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '25 didn’t have to', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '25 didn’t have to');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '26 reminded me to send', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '26 reminded me to send');
INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '27 have never been to', true);
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'd02d4a2a-734c-4a46-8c7e-7b95734ee84d'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '27 have never been to');