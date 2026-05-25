-- Agrega dinámicamente todas las tablas public.*estadisticas* para el perfil.
-- Nuevas tablas con user_id/usuario_id y columnas numéricas estándar se incluyen solas.

create or replace function public.perfil_estadisticas_generales(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tbl text;
  uid_col text;
  q text;
  rec record;
  v_rows bigint;
  v_completed bigint;
  v_correct bigint;
  v_time_sec bigint;
  v_pct numeric;
  sum_completed bigint := 0;
  sum_correct bigint := 0;
  sum_sessions bigint := 0;
  sum_time_sec bigint := 0;
  pct_sum numeric := 0;
  pct_count int := 0;
  by_table jsonb := '[]'::jsonb;
  completed_cols text[] := array[
    'intentos_completados', 'ejercicios_completados', 'total_hechos', 'accesos'
  ];
  correct_cols text[] := array['respuestas_correctas', 'total_correctos'];
  time_cols text[] := array['tiempo_segundos_total', 'tiempo_promedio_segundos'];
  time_minute_cols text[] := array['tiempo_total'];
  pct_cols text[] := array['mejor_porcentaje', 'ultimo_porcentaje', 'puntuacion_promedio'];
  col text;
  completed_parts text[] := '{}';
  correct_parts text[] := '{}';
  time_parts text[] := '{}';
  pct_parts text[] := '{}';
  level_estimate text := 'A2';
  avg_pct numeric;
begin
  if p_user_id is null then
    return jsonb_build_object('error', 'user_id required');
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  for tbl in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
      and table_name ilike '%estadisticas%'
    order by table_name
  loop
    uid_col := null;
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'user_id'
    ) then
      uid_col := 'user_id';
    elsif exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'usuario_id'
    ) then
      uid_col := 'usuario_id';
    else
      continue;
    end if;

    completed_parts := '{}';
    correct_parts := '{}';
    time_parts := '{}';
    pct_parts := '{}';

    foreach col in array completed_cols loop
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = tbl and column_name = col
      ) then
        completed_parts := array_append(completed_parts, format('coalesce(%I::bigint, 0)', col));
      end if;
    end loop;

    foreach col in array correct_cols loop
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = tbl and column_name = col
      ) then
        correct_parts := array_append(correct_parts, format('coalesce(%I::bigint, 0)', col));
      end if;
    end loop;

    foreach col in array time_cols loop
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = tbl and column_name = col
      ) then
        time_parts := array_append(time_parts, format('coalesce(%I::bigint, 0)', col));
      end if;
    end loop;

    foreach col in array time_minute_cols loop
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = tbl and column_name = col
      ) then
        time_parts := array_append(time_parts, format('coalesce(%I::bigint, 0) * 60', col));
      end if;
    end loop;

    foreach col in array pct_cols loop
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = tbl and column_name = col
      ) then
        pct_parts := array_append(pct_parts, format('coalesce(%I::numeric, 0)', col));
      end if;
    end loop;

    q := format(
      'select count(*)::bigint as rows,
              %s as completed,
              %s as correct,
              %s as time_sec,
              %s as avg_pct
       from %I where %I = $1',
      case when coalesce(array_length(completed_parts, 1), 0) > 0
        then format('coalesce(sum(%s), 0)::bigint', array_to_string(completed_parts, ' + '))
        else '0::bigint' end,
      case when coalesce(array_length(correct_parts, 1), 0) > 0
        then format('coalesce(sum(%s), 0)::bigint', array_to_string(correct_parts, ' + '))
        else '0::bigint' end,
      case when coalesce(array_length(time_parts, 1), 0) > 0
        then format('coalesce(sum(%s), 0)::bigint', array_to_string(time_parts, ' + '))
        else '0::bigint' end,
      case when coalesce(array_length(pct_parts, 1), 0) > 0
        then format(
          'coalesce(avg(( %s ) / greatest(%s, 1)), 0)::numeric',
          array_to_string(pct_parts, ' + '),
          array_length(pct_parts, 1)
        )
        else '0::numeric' end,
      tbl,
      uid_col
    );

    execute q into rec using p_user_id;

    v_rows := coalesce(rec.rows, 0);
    v_completed := coalesce(rec.completed, 0);
    v_correct := coalesce(rec.correct, 0);
    v_time_sec := coalesce(rec.time_sec, 0);
    v_pct := coalesce(rec.avg_pct, 0);

    sum_completed := sum_completed + v_completed;
    sum_correct := sum_correct + v_correct;
    sum_time_sec := sum_time_sec + v_time_sec;

    if tbl ilike '%training%' then
      sum_sessions := sum_sessions + v_rows;
    else
      sum_sessions := sum_sessions + v_completed;
    end if;

    if v_pct > 0 then
      pct_sum := pct_sum + v_pct;
      pct_count := pct_count + 1;
    end if;

    by_table := by_table || jsonb_build_array(
      jsonb_build_object(
        'table', tbl,
        'rows', v_rows,
        'completed', v_completed,
        'correct', v_correct,
        'timeSeconds', v_time_sec,
        'avgPercent', round(v_pct, 1)
      )
    );
  end loop;

  if pct_count > 0 then
    avg_pct := pct_sum / pct_count;
    if avg_pct >= 85 then level_estimate := 'C1';
    elsif avg_pct >= 70 then level_estimate := 'B2';
    elsif avg_pct >= 55 then level_estimate := 'B1';
    elsif avg_pct >= 40 then level_estimate := 'A2';
    else level_estimate := 'A1';
    end if;
  elsif sum_completed > 50 then
    level_estimate := 'B2';
  elsif sum_completed > 10 then
    level_estimate := 'A2';
  end if;

  return jsonb_build_object(
    'summary', jsonb_build_object(
      'completedExams', sum_completed,
      'totalCorrect', sum_correct,
      'trainingCount', sum_sessions,
      'levelEstimate', level_estimate,
      'totalStudyTimeSeconds', sum_time_sec,
      'tablesCount', jsonb_array_length(by_table)
    ),
    'byTable', by_table
  );
end;
$$;

revoke all on function public.perfil_estadisticas_generales(uuid) from public;
grant execute on function public.perfil_estadisticas_generales(uuid) to authenticated;
grant execute on function public.perfil_estadisticas_generales(uuid) to service_role;

notify pgrst, 'reload schema';
