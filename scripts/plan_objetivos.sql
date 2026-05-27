-- Plan de objetivos / estudio tras placement test.
-- Ejecutar en Supabase SQL Editor.

begin;

create table if not exists public.plan_objetivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  placement_level text,
  exam_goal_date date,
  hours_per_week numeric(4, 1) check (hours_per_week > 0 and hours_per_week <= 80),
  study_goals jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  other_notes text,
  survey_data jsonb,
  plan_document jsonb,
  plan_summary text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists idx_plan_objetivos_user on public.plan_objetivos (user_id);
create index if not exists idx_plan_objetivos_exam_date on public.plan_objetivos (exam_goal_date);

alter table public.plan_objetivos enable row level security;

drop policy if exists plan_objetivos_own_select on public.plan_objetivos;
create policy plan_objetivos_own_select on public.plan_objetivos
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists plan_objetivos_own_insert on public.plan_objetivos;
create policy plan_objetivos_own_insert on public.plan_objetivos
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists plan_objetivos_own_update on public.plan_objetivos;
create policy plan_objetivos_own_update on public.plan_objetivos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.plan_objetivos to authenticated;

notify pgrst, 'reload schema';

commit;
