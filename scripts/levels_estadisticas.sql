-- levels_estadisticas: métricas agregadas por usuario (UUID) y por ejercicio levels (pregunta_id).
-- Ejecutar en el SQL Editor de Supabase (o vía migración) cuando existan las tablas referenciadas.
--
-- Métricas globales por ejercicio (todos los usuarios), ejemplo para panel admin:
--   SELECT pregunta_id, parte_id,
--          COUNT(DISTINCT usuario_id) AS usuarios,
--          SUM(accesos) AS accesos_totales,
--          SUM(respuestas_correctas) AS correctas_totales,
--          SUM(respuestas_evaluadas) AS evaluadas_totales
--   FROM public.levels_estadisticas
--   GROUP BY pregunta_id, parte_id;

begin;

create table if not exists public.levels_estadisticas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public."Usuarios_y_Perfil_users"(id) on delete cascade,
  pregunta_id uuid not null references public.levels_preguntas(id) on delete cascade,
  parte_id uuid references public.levels_partes(id) on delete set null,
  accesos integer not null default 0 check (accesos >= 0),
  intentos_completados integer not null default 0 check (intentos_completados >= 0),
  respuestas_evaluadas integer not null default 0 check (respuestas_evaluadas >= 0),
  respuestas_correctas integer not null default 0 check (respuestas_correctas >= 0),
  respuestas_incorrectas integer not null default 0 check (respuestas_incorrectas >= 0),
  mejor_porcentaje numeric(5, 2) check (mejor_porcentaje is null or (mejor_porcentaje >= 0 and mejor_porcentaje <= 100)),
  ultimo_porcentaje numeric(5, 2) check (ultimo_porcentaje is null or (ultimo_porcentaje >= 0 and ultimo_porcentaje <= 100)),
  tiempo_segundos_total integer not null default 0 check (tiempo_segundos_total >= 0),
  primera_interaccion timestamptz,
  ultima_interaccion timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default timezone('utc'::text, now()),
  actualizado_en timestamptz not null default timezone('utc'::text, now()),
  constraint levels_estadisticas_usuario_pregunta_key unique (usuario_id, pregunta_id),
  constraint levels_estadisticas_correctas_le_eval check (respuestas_correctas <= respuestas_evaluadas),
  constraint levels_estadisticas_incorrectas_le_eval check (respuestas_incorrectas <= respuestas_evaluadas)
);

create index if not exists idx_levels_estadisticas_usuario_id
  on public.levels_estadisticas (usuario_id);

create index if not exists idx_levels_estadisticas_pregunta_id
  on public.levels_estadisticas (pregunta_id);

create index if not exists idx_levels_estadisticas_parte_id
  on public.levels_estadisticas (parte_id);

create index if not exists idx_levels_estadisticas_ultima_interaccion
  on public.levels_estadisticas (ultima_interaccion desc nulls last);

comment on table public.levels_estadisticas is
  'Agregados por usuario y bloque levels (levels_preguntas): accesos, intentos, aciertos y tiempos.';

comment on column public.levels_estadisticas.accesos is
  'Veces que el usuario abrió o cargó el ejercicio (vista/página).';

comment on column public.levels_estadisticas.intentos_completados is
  'Veces que cerró una sesión de práctica o envío completo del bloque.';

comment on column public.levels_estadisticas.respuestas_evaluadas is
  'Total de ítems comprobados (p. ej. huecos o preguntas evaluadas).';

-- Mantener actualizado_en en cada update
create or replace function public.levels_estadisticas_set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_levels_estadisticas_actualizado_en on public.levels_estadisticas;

create trigger trg_levels_estadisticas_actualizado_en
  before update on public.levels_estadisticas
  for each row
  execute procedure public.levels_estadisticas_set_actualizado_en();

alter table public.levels_estadisticas enable row level security;

drop policy if exists "levels_estadisticas_select_own" on public.levels_estadisticas;
drop policy if exists "levels_estadisticas_insert_own" on public.levels_estadisticas;
drop policy if exists "levels_estadisticas_update_own" on public.levels_estadisticas;
drop policy if exists "levels_estadisticas_delete_own" on public.levels_estadisticas;

create policy "levels_estadisticas_select_own"
  on public.levels_estadisticas
  for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "levels_estadisticas_insert_own"
  on public.levels_estadisticas
  for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "levels_estadisticas_update_own"
  on public.levels_estadisticas
  for update
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "levels_estadisticas_delete_own"
  on public.levels_estadisticas
  for delete
  to authenticated
  using (usuario_id = auth.uid());

grant select, insert, update, delete on public.levels_estadisticas to authenticated;

commit;
