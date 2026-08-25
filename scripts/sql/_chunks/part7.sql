-- ---------------------------------------------------------------------------
-- 6. writing_assessment_criteria — los cuatro registros de decisión
-- ---------------------------------------------------------------------------

create table if not exists public.writing_assessment_criteria (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null
    references public.writing_assessments (execution_id) on delete cascade,
  criterion text not null check (
    criterion in ('content', 'communicative_achievement', 'organisation', 'language')
  ),
  mark smallint not null check (mark >= 0 and mark <= 5),
  band_anchor text not null check (length(btrim(band_anchor)) > 0),
  why_not_higher text not null check (length(btrim(why_not_higher)) > 0),
  why_not_lower text,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  confidence_reason text,
  band_ceiling_reached boolean not null,
  band_floor_reached boolean not null,
  decision_record jsonb not null,
  created_at timestamptz not null default now(),

  constraint writing_assessment_criteria_unique unique (execution_id, criterion),
  constraint writing_assessment_criteria_ceiling_check check (band_ceiling_reached = (mark = 5)),
  constraint writing_assessment_criteria_floor_check check (band_floor_reached = (mark = 0)),
  -- La banda 0 no tiene banda inferior con la que compararse; 1–5 sí.
  constraint writing_assessment_criteria_why_not_lower_check check (
    (mark = 0 and why_not_lower is null)
    or (mark > 0 and why_not_lower is not null and length(btrim(why_not_lower)) > 0)
  ),
  constraint writing_assessment_criteria_confidence_reason_check check (
    confidence = 'high' or (confidence_reason is not null and length(btrim(confidence_reason)) > 0)
  )
);

create index if not exists writing_assessment_criteria_execution_idx
  on public.writing_assessment_criteria (execution_id);

-- Integridad de la evaluación completa, segura en transacción.
--
-- El disparador es un CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED: se evalúa
-- una sola vez al COMMIT, no fila a fila. Insertar los criterios 1, 2 y 3 dentro de
-- la transacción NO falla; lo que falla es cerrar la transacción con una evaluación
-- `complete` que no tenga exactamente los cuatro criterios canónicos, o cuyo
-- raw_total no sea su suma. No reescribe nunca una nota: solo acepta o rechaza.
create or replace function public.writing_assessment_assert_integrity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_execution uuid;
  v_status text;
  v_raw_total smallint;
  v_criteria integer;
  v_sum integer;
begin
  v_execution := coalesce(new.execution_id, old.execution_id);

  select status, raw_total
    into v_status, v_raw_total
    from public.writing_assessments
   where execution_id = v_execution;

  -- La cabecera desapareció en la misma transacción (p. ej. rollback parcial):
  -- no queda nada que validar.
  if v_status is null then
    return null;
  end if;

  select count(distinct criterion), coalesce(sum(mark), 0)
    into v_criteria, v_sum
    from public.writing_assessment_criteria
   where execution_id = v_execution;

  if v_status = 'complete' then
    if v_criteria <> 4 then
      raise exception
        'a complete assessment requires exactly the four Cambridge criteria (execution % has %)',
        v_execution, v_criteria
        using errcode = '23514';
    end if;
    if v_sum <> v_raw_total then
      raise exception
        'raw_total (%) must equal the sum of the four criterion marks (%) for execution %',
        v_raw_total, v_sum, v_execution
        using errcode = '23514';
    end if;
  elsif v_criteria > 0 then
    raise exception
      'an incomplete assessment must not carry criterion marks (execution %)',
      v_execution
      using errcode = '23514';
  end if;

  return null;
end;
$$;

drop trigger if exists writing_assessment_criteria_integrity on public.writing_assessment_criteria;
create constraint trigger writing_assessment_criteria_integrity
  after insert or update or delete on public.writing_assessment_criteria
  deferrable initially deferred
  for each row
  execute function public.writing_assessment_assert_integrity();

drop trigger if exists writing_assessments_integrity on public.writing_assessments;
create constraint trigger writing_assessments_integrity
  after insert or update on public.writing_assessments
  deferrable initially deferred
  for each row
  execute function public.writing_assessment_assert_integrity();
