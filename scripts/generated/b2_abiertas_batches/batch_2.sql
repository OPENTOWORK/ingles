INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '15 of');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 3
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '16 of');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '9 from');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '10 to');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '11 on');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '12 with');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '13 to');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '14 out');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '15 on');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 4
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '16 to');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '17 development');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '18 communication');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '19 contribution');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '20 rewarding');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '1c4186d0-fdbe-41e7-8266-efdf712c3006'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 0
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '21 employability');
