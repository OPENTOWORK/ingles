-- ---------------------------------------------------------------------------
-- 4. writing_observations — observaciones pedagógicas aceptadas (Fase 3)
-- ---------------------------------------------------------------------------
-- Sin color, sin nota Cambridge y sin category_key con autoridad de evaluación:
-- la categoría del mapa interactivo es una proyección de UI, no un hecho evaluador.

create table if not exists public.writing_observations (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.writing_engine_executions (id) on delete cascade,
  observation_id text not null,
  domain text not null check (
    domain in (
      'grammar', 'punctuation', 'vocabulary_collocation', 'spelling',
      'organisation_cohesion', 'content_development', 'communicative_appropriacy',
      'naturalness', 'strength'
    )
  ),
  observation_type text not null check (
    observation_type in (
      'accuracy_error', 'clarity_issue', 'naturalness_issue', 'appropriacy_issue',
      'organisation_issue', 'development_opportunity', 'strength'
    )
  ),
  polarity text not null check (polarity in ('positive', 'negative', 'neutral')),
  scope text not null check (scope in ('local', 'global')),
  span_start integer check (span_start is null or span_start >= 0),
  span_end integer check (span_end is null or span_end >= 0),
  binding_status text not null check (
    binding_status in ('bound', 'global_no_local_span', 'unbindable')
  ),
  renderable_locally boolean not null,
  communicative_impact text not null check (
    communicative_impact in ('blocked', 'unreliable', 'impaired', 'minor', 'none')
  ),
  meaning_blocking boolean not null,
  pedagogical_priority text not null check (pedagogical_priority in ('high', 'medium', 'low')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  pattern_key text,
  pattern_group_id text,
  observation jsonb not null,
  created_at timestamptz not null default now(),

  constraint writing_observations_unique_per_execution unique (execution_id, observation_id),
  constraint writing_observations_span_order_check check (
    span_start is null or span_end is null or span_end > span_start
  ),
  constraint writing_observations_bound_span_check check (
    binding_status <> 'bound' or (span_start is not null and span_end is not null)
  ),
  constraint writing_observations_renderable_check check (
    renderable_locally = false or binding_status = 'bound'
  ),
  constraint writing_observations_meaning_blocking_check check (
    meaning_blocking = (communicative_impact = 'blocked')
  ),
  constraint writing_observations_positive_is_strength_check check (
    polarity <> 'positive' or observation_type = 'strength'
  )
);

create index if not exists writing_observations_execution_idx
  on public.writing_observations (execution_id);

create index if not exists writing_observations_pattern_group_idx
  on public.writing_observations (execution_id, pattern_group_id)
  where pattern_group_id is not null;
