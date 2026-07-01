-- Estructura Cambridge para B1, C1 y C2 (partes + Examen 1).
-- A2 ya tenía partes; B2 no se modifica.

begin;

insert into public.levels_partes (nombre_parte)
select 'Parte ' || n || ' B1'
from generate_series(1, 16) as n
where not exists (
  select 1 from public.levels_partes p where p.nombre_parte = 'Parte ' || n || ' B1'
);

insert into public.levels_partes (nombre_parte)
select 'Parte ' || n || ' C1'
from generate_series(1, 18) as n
where not exists (
  select 1 from public.levels_partes p where p.nombre_parte = 'Parte ' || n || ' C1'
);

insert into public.levels_partes (nombre_parte)
select 'Parte ' || n || ' C2'
from generate_series(1, 16) as n
where not exists (
  select 1 from public.levels_partes p where p.nombre_parte = 'Parte ' || n || ' C2'
);

insert into public.levels_examenes (level_id, nombre)
select l.id, 'Examen 1 B1'
from public.levels l
where lower(l.nombre) = 'b1'
  and not exists (
    select 1 from public.levels_examenes e
    where e.level_id = l.id and e.nombre ilike 'Examen 1%B1%'
  );

insert into public.levels_examenes (level_id, nombre)
select l.id, 'Examen 1 C1'
from public.levels l
where lower(l.nombre) = 'c1'
  and not exists (
    select 1 from public.levels_examenes e
    where e.level_id = l.id and e.nombre ilike 'Examen 1%C1%'
  );

insert into public.levels_examenes (level_id, nombre)
select l.id, 'Examen 1 C2'
from public.levels l
where lower(l.nombre) = 'c2'
  and not exists (
    select 1 from public.levels_examenes e
    where e.level_id = l.id and e.nombre ilike 'Examen 1%C2%'
  );

commit;
