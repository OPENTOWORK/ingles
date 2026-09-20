-- Trazabilidad de tesorería: quién modificó por última vez cada cuenta y cada movimiento.
-- Complementa create_finance_core.sql, que ya cubre created_at/created_by y updated_at.

alter table public.fin_treasury_accounts
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.fin_treasury_movements
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

comment on column public.fin_treasury_accounts.updated_by is
  'Último usuario que modificó la cuenta. Se rellena desde la API de tesorería.';
comment on column public.fin_treasury_movements.updated_by is
  'Último usuario que modificó el movimiento (por ejemplo, al conciliarlo).';
