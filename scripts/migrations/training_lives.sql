-- Vidas de Training (plan FREE: 3, se recupera 1 cada 10 horas).
-- Plus y Premium no escriben en esta tabla: el cupo es ilimitado.
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.training_lives (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lives integer not null check (lives >= 0 and lives <= 3),
  next_life_at timestamptz,
  version integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.training_lives enable row level security;

drop policy if exists training_lives_select_own on public.training_lives;
create policy training_lives_select_own on public.training_lives
  for select to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.training_lives from anon, authenticated;

comment on table public.training_lives is
  'Vidas de Training del plan FREE. lives es el saldo tras el último gasto; next_life_at es cuándo vuelve la siguiente vida (1 cada 10 h). Solo el servidor (service role) escribe.';

notify pgrst, 'reload schema';
