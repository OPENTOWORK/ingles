-- Suscripciones de Stripe.
-- Ejecutar en el SQL Editor de Supabase.
--
-- Regla de oro: esta tabla la escribe EXCLUSIVAMENTE el webhook de Stripe
-- (/api/stripe/webhook/) usando la service role key, que salta RLS.
-- El cliente solo tiene policy de SELECT sobre su propia fila.

create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_id text not null,
  "interval" text not null check ("interval" in ('month', 'year')),
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suscripciones_stripe_customer_id_idx
  on public.suscripciones (stripe_customer_id);

create index if not exists suscripciones_status_idx
  on public.suscripciones (status);

alter table public.suscripciones enable row level security;

-- Única policy: cada usuario lee su propia fila. No hay insert/update/delete
-- para `authenticated`, así que ningún cliente puede falsear su plan.
drop policy if exists "Users can read their own subscription" on public.suscripciones;
create policy "Users can read their own subscription"
  on public.suscripciones
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.suscripciones_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists suscripciones_set_updated_at on public.suscripciones;
create trigger suscripciones_set_updated_at
  before update on public.suscripciones
  for each row
  execute function public.suscripciones_set_updated_at();

comment on table public.suscripciones is
  'Estado de suscripción de Stripe por usuario. Solo la escribe el webhook con service role.';
comment on column public.suscripciones.plan_id is
  'Slug del plan en financialPlanConfig.js (free | premium | pro).';
comment on column public.suscripciones."interval" is
  'Periodo de facturación de Stripe: month o year.';
comment on column public.suscripciones.status is
  'Estado crudo de Stripe: trialing, active, past_due, canceled, unpaid, incomplete, incomplete_expired, paused.';

notify pgrst, 'reload schema';
