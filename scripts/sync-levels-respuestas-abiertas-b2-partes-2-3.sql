-- Sincroniza levels_respuestas_abiertas con levels_respuestas para B2 Use of English
-- partes 2 y 3 (huecos 9–16 y 17–24). Idempotente: solo actualiza si el texto difiere.
-- No toca levels_partes ni levels_preguntas.
-- La parte 4 (25–30) suele existir solo en levels_respuestas_abiertas; no hay filas
-- equivalentes en levels_respuestas en muchos despliegues.

begin;

update levels_respuestas_abiertas ra
set respuesta_texto = trim(r.respuesta)
from levels_respuestas r
join levels_preguntas pq on pq.id = r.pregunta_id
join levels l on l.id = pq.level_id
where ra.pregunta_id_abierta = r.pregunta_id
  and lower(l.nombre) = 'b2'
  and pq.parte_id in (
    'c7d425b7-63cf-4420-abdc-f38a28111259', -- Parte 2
    '1c4186d0-fdbe-41e7-8266-efdf712c3006'  -- Parte 3
  )
  and (regexp_match(trim(ra.respuesta_texto), '^([0-9]+)'))[1]
    = (regexp_match(trim(r.respuesta), '^([0-9]+)'))[1]
  and trim(ra.respuesta_texto) is distinct from trim(r.respuesta);

commit;
