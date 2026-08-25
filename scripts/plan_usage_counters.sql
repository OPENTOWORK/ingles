-- Contadores de uso por plan (writing, speaking, exámenes, Dralo Assistant).
-- El plan del usuario vive en public.suscripciones.plan_id (Stripe webhook).
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.plan_usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_key text not null,
  period_type text not null check (period_type in ('month', 'day')),
  period_key text not null,
  count int not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_key, period_type, period_key)
);

create index if not exists plan_usage_counters_lookup_idx
  on public.plan_usage_counters (user_id, usage_key, period_type, period_key);

alter table public.plan_usage_counters enable row level security;

drop policy if exists plan_usage_counters_select_own on public.plan_usage_counters;
create policy plan_usage_counters_select_own on public.plan_usage_counters
  for select to authenticated
  using (auth.uid() = user_id);

-- INSERT/UPDATE: propio usuario (authenticated) + service role en servidor.

drop policy if exists plan_usage_counters_insert_own on public.plan_usage_counters;
create policy plan_usage_counters_insert_own on public.plan_usage_counters
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists plan_usage_counters_update_own on public.plan_usage_counters;
create policy plan_usage_counters_update_own on public.plan_usage_counters
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.plan_usage_counters_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plan_usage_counters_set_updated_at on public.plan_usage_counters;
create trigger plan_usage_counters_set_updated_at
  before update on public.plan_usage_counters
  for each row
  execute function public.plan_usage_counters_set_updated_at();

comment on table public.plan_usage_counters is
  'Cuotas mensuales/diarias por usuario según plan (solo estudiantes). usage_key: writing_correction | speaking_correction | exam_session | dralo_assistant';
comment on column public.plan_usage_counters.usage_key is
  'writing_correction, speaking_correction, exam_session, dralo_assistant';
comment on column public.plan_usage_counters.period_key is
  'YYYY-MM para month, YYYY-MM-DD para day (UTC).';

notify pgrst, 'reload schema';
