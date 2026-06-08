begin;
-- B2 Examen 1 — Part 4 only (Key Word Transformations)
delete from public.levels_respuestas_abiertas
where pregunta_id_abierta in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_respuestas
where pregunta_id in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_preguntas_audios
where pregunta_id in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_preguntas lp
using public.levels_partes p
where lp.parte_id = p.id
  and lp.examen_id = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65'::uuid
  and p.nombre_parte = 'Parte 4 B2';

with parte as (
  select id from public.levels_partes where nombre_parte = 'Parte 4 B2' limit 1
),
ins as (
  insert into public.levels_preguntas (level_id, examen_id, parte_id, enunciado, creado_en)
  select 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431'::uuid, '5bd3e0d7-29a7-4e07-ac15-a4d195528c65'::uuid, parte.id, 'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given.
Questions
25
Not many people find it easy to adjust to life in a big city.
HARDLY
____________________ it easy to adjust to life in a big city.

26
The city has introduced new laws to reduce pollution.
BY
Pollution is being reduced ____________________ new laws.

27
She regrets not moving to the city when she had the chance.
WISHES
She ____________________ to the city when she had the chance.

28
There aren''t as many public parks in this city as in my hometown.
FEWER
This city has ____________________ my hometown.

29
It isn''t necessary to use a smartphone for this task.
NEED
You ____________________ a smartphone for this task.

30
Even though the subway is crowded, it is still the fastest way to travel.
SPITE
In ____________________ crowded, it is still the fastest way to travel.', now()
  from parte
  returning id
)
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '25 Hardly anyone finds' from ins;
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '26 by the introduction of' from ins;
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '27 wishes she had moved' from ins;
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '28 fewer public parks than' from ins;
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '29 do not need to use' from ins;
insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '30 spite of the subway being' from ins;
commit;