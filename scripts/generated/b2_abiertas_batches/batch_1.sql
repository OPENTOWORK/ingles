INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 1
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '16 in');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
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
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '10 out');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '11 by');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '12 than');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '13 as');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '14 with');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '15 from');
INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES ((SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = 'c7d425b7-63cf-4420-abdc-f38a28111259'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET 2
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1), '16 on');
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
  LIMIT 1), '9 for');
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
  LIMIT 1), '10 on');
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
  LIMIT 1), '11 with');
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
  LIMIT 1), '12 in');
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
  LIMIT 1), '13 on');
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
  LIMIT 1), '14 of');
