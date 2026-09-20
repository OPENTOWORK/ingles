-- ÁREA FINANCIERA — Facturación, Contabilidad y Tesorería
-- Migración idempotente. No elimina ni modifica tablas existentes.
-- Escritura vía service role desde la API (RLS activado sin políticas client).

-- ===========================================================================
-- ENUMS
-- ===========================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'fin_party_kind') then
    create type public.fin_party_kind as enum ('customer', 'supplier', 'both');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_invoice_direction') then
    create type public.fin_invoice_direction as enum ('sale', 'purchase');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_invoice_status') then
    create type public.fin_invoice_status as enum ('draft', 'issued', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_payment_status') then
    create type public.fin_payment_status as enum ('pending', 'partial', 'paid');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_journal_status') then
    create type public.fin_journal_status as enum ('draft', 'posted', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_movement_kind') then
    create type public.fin_movement_kind as enum ('collection', 'payment', 'transfer', 'adjustment');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_reconciliation_status') then
    create type public.fin_reconciliation_status as enum ('pending', 'reconciled', 'unidentified');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_treasury_account_kind') then
    create type public.fin_treasury_account_kind as enum ('bank', 'cash', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'fin_fiscal_year_status') then
    create type public.fin_fiscal_year_status as enum ('open', 'closed');
  end if;
end
$$;

-- ===========================================================================
-- TERCEROS (clientes y proveedores) — enlaza con Usuarios_y_Perfil_users
-- ===========================================================================
create table if not exists public.fin_parties (
  id uuid primary key default gen_random_uuid(),
  kind public.fin_party_kind not null default 'customer',
  legal_name text not null,
  trade_name text,
  tax_id text,
  email text,
  phone text,
  address_line text,
  postal_code text,
  city text,
  province text,
  country text not null default 'ES',
  payment_terms_days integer not null default 30 check (payment_terms_days >= 0),
  payment_method text,
  accounting_account_code text,
  user_id uuid references auth.users (id) on delete set null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create unique index if not exists fin_parties_tax_id_key
  on public.fin_parties (lower(tax_id))
  where tax_id is not null and tax_id <> '';

create index if not exists fin_parties_user_id_idx
  on public.fin_parties (user_id) where user_id is not null;

create index if not exists fin_parties_kind_idx on public.fin_parties (kind);
create index if not exists fin_parties_legal_name_idx on public.fin_parties (lower(legal_name));

-- ===========================================================================
-- EJERCICIOS CONTABLES
-- ===========================================================================
create table if not exists public.fin_fiscal_years (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique check (year between 2000 and 2100),
  starts_on date not null,
  ends_on date not null,
  status public.fin_fiscal_year_status not null default 'open',
  closed_at timestamptz,
  closed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fin_fiscal_years_range_chk check (ends_on > starts_on)
);

create index if not exists fin_fiscal_years_status_idx on public.fin_fiscal_years (status);

insert into public.fin_fiscal_years (year, starts_on, ends_on, status)
values
  (2025, '2025-01-01', '2025-12-31', 'open'),
  (2026, '2026-01-01', '2026-12-31', 'open'),
  (2027, '2027-01-01', '2027-12-31', 'open')
on conflict (year) do nothing;

-- ===========================================================================
-- PLAN CONTABLE (PGC España)
-- ===========================================================================
create table if not exists public.fin_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  account_type text not null check (
    account_type in ('asset', 'liability', 'equity', 'income', 'expense')
  ),
  level integer not null default 1 check (level between 1 and 8),
  parent_code text,
  is_active boolean not null default true,
  is_seed boolean not null default false,
  party_id uuid references public.fin_parties (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fin_accounts_type_idx on public.fin_accounts (account_type);
create index if not exists fin_accounts_parent_idx on public.fin_accounts (parent_code);
create index if not exists fin_accounts_name_idx on public.fin_accounts (lower(name));

insert into public.fin_accounts (code, name, account_type, level, parent_code, is_seed) values
  ('100', 'Capital social', 'equity', 1, null, true),
  ('129', 'Resultado del ejercicio', 'equity', 1, null, true),
  ('400', 'Proveedores', 'liability', 1, null, true),
  ('400000', 'Proveedores (genérico)', 'liability', 3, '400', true),
  ('410', 'Acreedores por prestaciones de servicios', 'liability', 1, null, true),
  ('410000', 'Acreedores (genérico)', 'liability', 3, '410', true),
  ('430', 'Clientes', 'asset', 1, null, true),
  ('430000', 'Clientes (genérico)', 'asset', 3, '430', true),
  ('472', 'Hacienda Pública, IVA soportado', 'asset', 1, null, true),
  ('472000', 'IVA soportado', 'asset', 3, '472', true),
  ('477', 'Hacienda Pública, IVA repercutido', 'liability', 1, null, true),
  ('477000', 'IVA repercutido', 'liability', 3, '477', true),
  ('570', 'Caja, euros', 'asset', 1, null, true),
  ('570000', 'Caja', 'asset', 3, '570', true),
  ('572', 'Bancos e instituciones de crédito c/c vista, euros', 'asset', 1, null, true),
  ('572000', 'Banco (genérico)', 'asset', 3, '572', true),
  ('600', 'Compras de mercaderías', 'expense', 1, null, true),
  ('600000', 'Compras', 'expense', 3, '600', true),
  ('621', 'Arrendamientos y cánones', 'expense', 1, null, true),
  ('621000', 'Arrendamientos', 'expense', 3, '621', true),
  ('623', 'Servicios de profesionales independientes', 'expense', 1, null, true),
  ('623000', 'Servicios profesionales', 'expense', 3, '623', true),
  ('626', 'Servicios bancarios y similares', 'expense', 1, null, true),
  ('626000', 'Servicios bancarios', 'expense', 3, '626', true),
  ('628', 'Suministros', 'expense', 1, null, true),
  ('628000', 'Suministros', 'expense', 3, '628', true),
  ('629', 'Otros servicios', 'expense', 1, null, true),
  ('629000', 'Otros servicios', 'expense', 3, '629', true),
  ('640', 'Sueldos y salarios', 'expense', 1, null, true),
  ('640000', 'Sueldos y salarios', 'expense', 3, '640', true),
  ('700', 'Ventas de mercaderías', 'income', 1, null, true),
  ('700000', 'Ventas', 'income', 3, '700', true),
  ('705', 'Prestaciones de servicios', 'income', 1, null, true),
  ('705000', 'Prestación de servicios', 'income', 3, '705', true)
on conflict (code) do nothing;

-- ===========================================================================
-- SERIES DE FACTURACIÓN
-- ===========================================================================
create table if not exists public.fin_invoice_series (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  direction public.fin_invoice_direction not null default 'sale',
  prefix text not null default '',
  next_number integer not null default 1 check (next_number >= 1),
  padding integer not null default 4 check (padding between 1 and 10),
  include_year boolean not null default true,
  is_rectificative boolean not null default false,
  is_active boolean not null default true,
  default_income_account_code text,
  default_tax_rate numeric(5, 2) not null default 21.00 check (default_tax_rate >= 0 and default_tax_rate <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.fin_invoice_series (code, name, direction, prefix, is_rectificative, default_income_account_code) values
  ('OTW', 'Facturas emitidas', 'sale', 'OTW', false, '705000'),
  ('REC', 'Facturas rectificativas', 'sale', 'REC', true, '705000'),
  ('COM', 'Facturas recibidas', 'purchase', 'COM', false, '629000')
on conflict (code) do nothing;

-- ===========================================================================
-- CUENTAS DE TESORERÍA
-- ===========================================================================
create table if not exists public.fin_treasury_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.fin_treasury_account_kind not null default 'bank',
  bank_name text,
  iban text,
  currency text not null default 'EUR',
  accounting_account_code text references public.fin_accounts (code) on delete set null,
  opening_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create unique index if not exists fin_treasury_accounts_name_key
  on public.fin_treasury_accounts (lower(name));

create index if not exists fin_treasury_accounts_active_idx
  on public.fin_treasury_accounts (is_active);

-- ===========================================================================
-- ASIENTOS CONTABLES
-- ===========================================================================
create table if not exists public.fin_journal_entries (
  id uuid primary key default gen_random_uuid(),
  fiscal_year_id uuid not null references public.fin_fiscal_years (id) on delete restrict,
  entry_number integer,
  entry_date date not null,
  concept text not null,
  origin text not null default 'manual',
  document_type text,
  document_id uuid,
  document_ref text,
  status public.fin_journal_status not null default 'posted',
  total_debit numeric(14, 2) not null default 0 check (total_debit >= 0),
  total_credit numeric(14, 2) not null default 0 check (total_credit >= 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create unique index if not exists fin_journal_entries_number_key
  on public.fin_journal_entries (fiscal_year_id, entry_number)
  where entry_number is not null;

create index if not exists fin_journal_entries_date_idx
  on public.fin_journal_entries (entry_date desc);
create index if not exists fin_journal_entries_fiscal_year_idx
  on public.fin_journal_entries (fiscal_year_id);
create index if not exists fin_journal_entries_document_idx
  on public.fin_journal_entries (document_type, document_id)
  where document_id is not null;
create index if not exists fin_journal_entries_status_idx
  on public.fin_journal_entries (status);

create table if not exists public.fin_journal_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.fin_journal_entries (id) on delete cascade,
  line_number integer not null default 1,
  account_code text not null references public.fin_accounts (code) on delete restrict,
  concept text,
  debit numeric(14, 2) not null default 0 check (debit >= 0),
  credit numeric(14, 2) not null default 0 check (credit >= 0),
  party_id uuid references public.fin_parties (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint fin_journal_lines_one_side_chk check (
    (debit > 0 and credit = 0) or (credit > 0 and debit = 0) or (debit = 0 and credit = 0)
  )
);

create index if not exists fin_journal_lines_entry_idx on public.fin_journal_lines (entry_id);
create index if not exists fin_journal_lines_account_idx on public.fin_journal_lines (account_code);

-- ===========================================================================
-- FACTURAS
-- ===========================================================================
create table if not exists public.fin_invoices (
  id uuid primary key default gen_random_uuid(),
  direction public.fin_invoice_direction not null default 'sale',
  series_id uuid references public.fin_invoice_series (id) on delete restrict,
  fiscal_year_id uuid references public.fin_fiscal_years (id) on delete restrict,
  invoice_number text,
  sequence_number integer,
  party_id uuid not null references public.fin_parties (id) on delete restrict,
  issue_date date not null default current_date,
  due_date date,
  status public.fin_invoice_status not null default 'draft',
  payment_status public.fin_payment_status not null default 'pending',
  currency text not null default 'EUR',
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  discount_total numeric(14, 2) not null default 0 check (discount_total >= 0),
  tax_total numeric(14, 2) not null default 0 check (tax_total >= 0),
  total numeric(14, 2) not null default 0 check (total >= 0),
  paid_amount numeric(14, 2) not null default 0 check (paid_amount >= 0),
  payment_method text,
  notes text,
  internal_notes text,
  party_snapshot jsonb not null default '{}'::jsonb,
  rectifies_invoice_id uuid references public.fin_invoices (id) on delete set null,
  rectified_by_invoice_id uuid references public.fin_invoices (id) on delete set null,
  cancelled_at timestamptz,
  cancelled_reason text,
  issued_at timestamptz,
  issued_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint fin_invoices_paid_not_over_total_chk check (paid_amount <= total + 0.01),
  constraint fin_invoices_issued_needs_number_chk check (
    status <> 'issued' or (invoice_number is not null and issued_at is not null)
  )
);

create unique index if not exists fin_invoices_number_key
  on public.fin_invoices (invoice_number)
  where invoice_number is not null;

create index if not exists fin_invoices_party_idx on public.fin_invoices (party_id);
create index if not exists fin_invoices_status_idx on public.fin_invoices (status);
create index if not exists fin_invoices_payment_status_idx on public.fin_invoices (payment_status);
create index if not exists fin_invoices_issue_date_idx on public.fin_invoices (issue_date desc);
create index if not exists fin_invoices_due_date_idx on public.fin_invoices (due_date);
create index if not exists fin_invoices_direction_idx on public.fin_invoices (direction);
create index if not exists fin_invoices_series_idx on public.fin_invoices (series_id);
create index if not exists fin_invoices_fiscal_year_idx on public.fin_invoices (fiscal_year_id);

create table if not exists public.fin_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.fin_invoices (id) on delete cascade,
  line_number integer not null default 1,
  description text not null,
  quantity numeric(14, 4) not null default 1 check (quantity <> 0),
  unit_price numeric(14, 4) not null default 0,
  discount_percent numeric(5, 2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  tax_rate numeric(5, 2) not null default 21 check (tax_rate >= 0 and tax_rate <= 100),
  income_account_code text references public.fin_accounts (code) on delete set null,
  subtotal numeric(14, 2) not null default 0,
  tax_amount numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists fin_invoice_lines_invoice_idx on public.fin_invoice_lines (invoice_id);

-- ===========================================================================
-- MOVIMIENTOS DE TESORERÍA
-- ===========================================================================
create table if not exists public.fin_treasury_movements (
  id uuid primary key default gen_random_uuid(),
  treasury_account_id uuid not null references public.fin_treasury_accounts (id) on delete restrict,
  movement_date date not null default current_date,
  kind public.fin_movement_kind not null,
  concept text not null,
  amount_in numeric(14, 2) not null default 0 check (amount_in >= 0),
  amount_out numeric(14, 2) not null default 0 check (amount_out >= 0),
  currency text not null default 'EUR',
  reference text,
  document_type text,
  document_id uuid,
  payment_id uuid,
  journal_entry_id uuid references public.fin_journal_entries (id) on delete set null,
  reconciliation_status public.fin_reconciliation_status not null default 'pending',
  reconciled_at timestamptz,
  reconciled_by uuid references auth.users (id) on delete set null,
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint fin_treasury_movements_direction_chk check (
    (amount_in > 0 and amount_out = 0) or (amount_out > 0 and amount_in = 0)
  )
);

create index if not exists fin_treasury_movements_account_idx
  on public.fin_treasury_movements (treasury_account_id, movement_date desc);
create index if not exists fin_treasury_movements_date_idx
  on public.fin_treasury_movements (movement_date desc);
create index if not exists fin_treasury_movements_kind_idx
  on public.fin_treasury_movements (kind);
create index if not exists fin_treasury_movements_reconciliation_idx
  on public.fin_treasury_movements (reconciliation_status);
create index if not exists fin_treasury_movements_document_idx
  on public.fin_treasury_movements (document_type, document_id)
  where document_id is not null;
create unique index if not exists fin_treasury_movements_external_key
  on public.fin_treasury_movements (treasury_account_id, external_id)
  where external_id is not null;

-- ===========================================================================
-- COBROS Y PAGOS
-- ===========================================================================
create table if not exists public.fin_payments (
  id uuid primary key default gen_random_uuid(),
  direction public.fin_invoice_direction not null,
  invoice_id uuid references public.fin_invoices (id) on delete restrict,
  party_id uuid references public.fin_parties (id) on delete set null,
  treasury_account_id uuid not null references public.fin_treasury_accounts (id) on delete restrict,
  movement_id uuid references public.fin_treasury_movements (id) on delete set null,
  journal_entry_id uuid references public.fin_journal_entries (id) on delete set null,
  payment_date date not null default current_date,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'EUR',
  reference text,
  notes text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists fin_payments_invoice_idx on public.fin_payments (invoice_id);
create index if not exists fin_payments_account_idx on public.fin_payments (treasury_account_id);
create index if not exists fin_payments_date_idx on public.fin_payments (payment_date desc);
create unique index if not exists fin_payments_idempotency_key
  on public.fin_payments (idempotency_key) where idempotency_key is not null;

alter table public.fin_treasury_movements
  drop constraint if exists fin_treasury_movements_payment_fk;
alter table public.fin_treasury_movements
  add constraint fin_treasury_movements_payment_fk
  foreign key (payment_id) references public.fin_payments (id) on delete set null;

-- ===========================================================================
-- AUDITORÍA FINANCIERA
-- ===========================================================================
create table if not exists public.fin_audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists fin_audit_log_entity_idx
  on public.fin_audit_log (entity_type, entity_id);
create index if not exists fin_audit_log_created_idx
  on public.fin_audit_log (created_at desc);

-- ===========================================================================
-- TRIGGERS: updated_at
-- ===========================================================================
create or replace function public.fin_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'fin_parties', 'fin_fiscal_years', 'fin_accounts', 'fin_invoice_series',
    'fin_treasury_accounts', 'fin_journal_entries', 'fin_invoices', 'fin_treasury_movements'
  ]
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.fin_set_updated_at()',
      t, t
    );
  end loop;
end
$$;

-- ===========================================================================
-- TRIGGER: ejercicio cerrado bloquea asientos
-- ===========================================================================
create or replace function public.fin_guard_closed_fiscal_year()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status public.fin_fiscal_year_status;
begin
  select status into v_status
  from public.fin_fiscal_years
  where id = coalesce(new.fiscal_year_id, old.fiscal_year_id);

  if v_status = 'closed' then
    raise exception 'El ejercicio contable está cerrado: no admite asientos.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists fin_journal_entries_guard_closed on public.fin_journal_entries;
create trigger fin_journal_entries_guard_closed
  before insert or update on public.fin_journal_entries
  for each row execute function public.fin_guard_closed_fiscal_year();

-- ===========================================================================
-- TRIGGER: asiento cuadrado (DEBE = HABER) — diferido al commit
-- ===========================================================================
create or replace function public.fin_check_entry_balanced()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_entry_id uuid;
  v_status public.fin_journal_status;
  v_debit numeric(14, 2);
  v_credit numeric(14, 2);
  v_lines integer;
begin
  v_entry_id := coalesce(new.entry_id, old.entry_id);

  select status into v_status from public.fin_journal_entries where id = v_entry_id;
  if v_status is null then
    return null; -- asiento eliminado
  end if;
  if v_status <> 'posted' then
    return null;
  end if;

  select
    coalesce(sum(debit), 0),
    coalesce(sum(credit), 0),
    count(*)
  into v_debit, v_credit, v_lines
  from public.fin_journal_lines
  where entry_id = v_entry_id;

  if v_lines < 2 then
    raise exception 'Un asiento contabilizado necesita al menos dos líneas.'
      using errcode = 'check_violation';
  end if;

  if v_debit <> v_credit then
    raise exception 'Asiento descuadrado: debe % <> haber %.', v_debit, v_credit
      using errcode = 'check_violation';
  end if;

  if v_debit = 0 then
    raise exception 'Un asiento contabilizado no puede tener importe cero.'
      using errcode = 'check_violation';
  end if;

  update public.fin_journal_entries
  set total_debit = v_debit, total_credit = v_credit
  where id = v_entry_id
    and (total_debit <> v_debit or total_credit <> v_credit);

  return null;
end;
$$;

drop trigger if exists fin_journal_lines_balanced on public.fin_journal_lines;
create constraint trigger fin_journal_lines_balanced
  after insert or update or delete on public.fin_journal_lines
  deferrable initially deferred
  for each row execute function public.fin_check_entry_balanced();

create or replace function public.fin_check_entry_balanced_on_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_debit numeric(14, 2);
  v_credit numeric(14, 2);
  v_lines integer;
begin
  if new.status <> 'posted' then
    return null;
  end if;

  select coalesce(sum(debit), 0), coalesce(sum(credit), 0), count(*)
  into v_debit, v_credit, v_lines
  from public.fin_journal_lines
  where entry_id = new.id;

  if v_lines < 2 or v_debit <> v_credit or v_debit = 0 then
    raise exception 'Asiento % descuadrado o incompleto (debe %, haber %, líneas %).',
      new.id, v_debit, v_credit, v_lines
      using errcode = 'check_violation';
  end if;

  return null;
end;
$$;

drop trigger if exists fin_journal_entries_balanced on public.fin_journal_entries;
create constraint trigger fin_journal_entries_balanced
  after insert or update on public.fin_journal_entries
  deferrable initially deferred
  for each row execute function public.fin_check_entry_balanced_on_entry();

-- ===========================================================================
-- TRIGGER: saldo de cuenta de tesorería
-- ===========================================================================
create or replace function public.fin_recalc_treasury_balance()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_account uuid;
begin
  v_account := coalesce(new.treasury_account_id, old.treasury_account_id);

  update public.fin_treasury_accounts a
  set current_balance = a.opening_balance + coalesce((
    select sum(m.amount_in - m.amount_out)
    from public.fin_treasury_movements m
    where m.treasury_account_id = a.id
  ), 0)
  where a.id = v_account;

  if tg_op = 'UPDATE' and old.treasury_account_id is distinct from new.treasury_account_id then
    update public.fin_treasury_accounts a
    set current_balance = a.opening_balance + coalesce((
      select sum(m.amount_in - m.amount_out)
      from public.fin_treasury_movements m
      where m.treasury_account_id = a.id
    ), 0)
    where a.id = old.treasury_account_id;
  end if;

  return null;
end;
$$;

drop trigger if exists fin_treasury_movements_balance on public.fin_treasury_movements;
create trigger fin_treasury_movements_balance
  after insert or update or delete on public.fin_treasury_movements
  for each row execute function public.fin_recalc_treasury_balance();

-- ===========================================================================
-- TRIGGER: factura emitida es inmutable en campos fiscales
-- ===========================================================================
create or replace function public.fin_guard_issued_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'issued' then
    if new.invoice_number is distinct from old.invoice_number
      or new.issue_date is distinct from old.issue_date
      or new.party_id is distinct from old.party_id
      or new.subtotal is distinct from old.subtotal
      or new.tax_total is distinct from old.tax_total
      or new.total is distinct from old.total
      or new.series_id is distinct from old.series_id
    then
      raise exception 'Una factura emitida no admite cambios fiscales. Emite una rectificativa.'
        using errcode = 'check_violation';
    end if;
  end if;

  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Una factura anulada no puede reactivarse.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists fin_invoices_guard_issued on public.fin_invoices;
create trigger fin_invoices_guard_issued
  before update on public.fin_invoices
  for each row execute function public.fin_guard_issued_invoice();

create or replace function public.fin_guard_invoice_lines()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status public.fin_invoice_status;
  v_invoice uuid;
begin
  v_invoice := coalesce(new.invoice_id, old.invoice_id);
  select status into v_status from public.fin_invoices where id = v_invoice;

  if v_status is null then
    return coalesce(new, old);
  end if;

  if v_status <> 'draft' then
    raise exception 'Solo se pueden modificar líneas de facturas en borrador.'
      using errcode = 'check_violation';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists fin_invoice_lines_guard on public.fin_invoice_lines;
create trigger fin_invoice_lines_guard
  before insert or update or delete on public.fin_invoice_lines
  for each row execute function public.fin_guard_invoice_lines();

-- ===========================================================================
-- RPC: emitir factura (numeración atómica + asiento contable)
-- ===========================================================================
create or replace function public.fin_issue_invoice(
  p_invoice_id uuid,
  p_actor uuid default null
)
returns public.fin_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.fin_invoices;
  v_series public.fin_invoice_series;
  v_fiscal_year public.fin_fiscal_years;
  v_number text;
  v_seq integer;
  v_entry_id uuid;
  v_entry_number integer;
  v_receivable_code text;
  v_tax_code text;
  v_line record;
  v_line_no integer := 0;
  v_year_part text;
begin
  select * into v_invoice from public.fin_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Factura no encontrada.' using errcode = 'no_data_found';
  end if;
  if v_invoice.status <> 'draft' then
    raise exception 'Solo se pueden emitir facturas en borrador (estado actual: %).', v_invoice.status
      using errcode = 'check_violation';
  end if;

  if not exists (select 1 from public.fin_invoice_lines where invoice_id = p_invoice_id) then
    raise exception 'La factura no tiene líneas.' using errcode = 'check_violation';
  end if;
  if v_invoice.total <= 0 then
    raise exception 'El total de la factura debe ser mayor que cero.' using errcode = 'check_violation';
  end if;

  -- Serie: bloqueo pesimista para numeración segura ante concurrencia
  select * into v_series from public.fin_invoice_series
  where id = v_invoice.series_id for update;
  if not found then
    raise exception 'La factura no tiene serie asignada.' using errcode = 'check_violation';
  end if;
  if not v_series.is_active then
    raise exception 'La serie % está inactiva.', v_series.code using errcode = 'check_violation';
  end if;

  select * into v_fiscal_year from public.fin_fiscal_years
  where v_invoice.issue_date between starts_on and ends_on
  limit 1;
  if not found then
    raise exception 'No existe ejercicio contable para la fecha %.', v_invoice.issue_date
      using errcode = 'check_violation';
  end if;
  if v_fiscal_year.status = 'closed' then
    raise exception 'El ejercicio % está cerrado.', v_fiscal_year.year using errcode = 'check_violation';
  end if;

  v_seq := v_series.next_number;
  v_year_part := case when v_series.include_year then to_char(v_invoice.issue_date, 'YYYY') || '-' else '' end;
  v_number := v_series.prefix
    || case when v_series.prefix <> '' then '-' else '' end
    || v_year_part
    || lpad(v_seq::text, v_series.padding, '0');

  update public.fin_invoice_series set next_number = v_seq + 1 where id = v_series.id;

  -- Asiento contable
  select coalesce(max(entry_number), 0) + 1 into v_entry_number
  from public.fin_journal_entries where fiscal_year_id = v_fiscal_year.id;

  v_receivable_code := case when v_invoice.direction = 'sale' then '430000' else '400000' end;
  v_tax_code := case when v_invoice.direction = 'sale' then '477000' else '472000' end;

  insert into public.fin_journal_entries (
    fiscal_year_id, entry_number, entry_date, concept, origin,
    document_type, document_id, document_ref, status, created_by
  ) values (
    v_fiscal_year.id, v_entry_number, v_invoice.issue_date,
    case when v_invoice.direction = 'sale' then 'Factura emitida ' else 'Factura recibida ' end || v_number,
    'invoice', 'invoice', v_invoice.id, v_number, 'posted', p_actor
  ) returning id into v_entry_id;

  if v_invoice.direction = 'sale' then
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit, party_id)
    values (v_entry_id, 1, v_receivable_code, 'Cliente ' || coalesce(v_invoice.party_snapshot->>'legal_name', ''), v_invoice.total, 0, v_invoice.party_id);
    v_line_no := 1;

    for v_line in
      select coalesce(income_account_code, '705000') as acc, sum(subtotal) as base
      from public.fin_invoice_lines where invoice_id = v_invoice.id
      group by coalesce(income_account_code, '705000')
    loop
      v_line_no := v_line_no + 1;
      insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
      values (v_entry_id, v_line_no, v_line.acc, 'Ingresos ' || v_number, 0, v_line.base);
    end loop;

    if v_invoice.tax_total > 0 then
      v_line_no := v_line_no + 1;
      insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
      values (v_entry_id, v_line_no, v_tax_code, 'IVA repercutido ' || v_number, 0, v_invoice.tax_total);
    end if;
  else
    v_line_no := 0;
    for v_line in
      select coalesce(income_account_code, '629000') as acc, sum(subtotal) as base
      from public.fin_invoice_lines where invoice_id = v_invoice.id
      group by coalesce(income_account_code, '629000')
    loop
      v_line_no := v_line_no + 1;
      insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
      values (v_entry_id, v_line_no, v_line.acc, 'Gasto ' || v_number, v_line.base, 0);
    end loop;

    if v_invoice.tax_total > 0 then
      v_line_no := v_line_no + 1;
      insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
      values (v_entry_id, v_line_no, v_tax_code, 'IVA soportado ' || v_number, v_invoice.tax_total, 0);
    end if;

    v_line_no := v_line_no + 1;
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit, party_id)
    values (v_entry_id, v_line_no, v_receivable_code, 'Proveedor ' || coalesce(v_invoice.party_snapshot->>'legal_name', ''), 0, v_invoice.total, v_invoice.party_id);
  end if;

  update public.fin_invoices set
    invoice_number = v_number,
    sequence_number = v_seq,
    fiscal_year_id = v_fiscal_year.id,
    status = 'issued',
    issued_at = now(),
    issued_by = p_actor,
    updated_by = p_actor,
    due_date = coalesce(due_date, issue_date + 30)
  where id = p_invoice_id
  returning * into v_invoice;

  insert into public.fin_audit_log (entity_type, entity_id, action, detail, actor_id)
  values ('invoice', v_invoice.id, 'issued',
    jsonb_build_object('invoice_number', v_number, 'total', v_invoice.total, 'journal_entry_id', v_entry_id),
    p_actor);

  return v_invoice;
end;
$$;

-- ===========================================================================
-- RPC: registrar cobro/pago (atómico: pago + movimiento + asiento + estado)
-- ===========================================================================
create or replace function public.fin_register_payment(
  p_invoice_id uuid,
  p_treasury_account_id uuid,
  p_amount numeric,
  p_payment_date date default current_date,
  p_reference text default null,
  p_notes text default null,
  p_actor uuid default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.fin_invoices;
  v_account public.fin_treasury_accounts;
  v_pending numeric(14, 2);
  v_payment_id uuid;
  v_movement_id uuid;
  v_entry_id uuid;
  v_entry_number integer;
  v_fiscal_year public.fin_fiscal_years;
  v_new_paid numeric(14, 2);
  v_new_status public.fin_payment_status;
  v_existing public.fin_payments;
  v_treasury_code text;
  v_counter_code text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'El importe debe ser mayor que cero.' using errcode = 'check_violation';
  end if;

  if p_idempotency_key is not null then
    select * into v_existing from public.fin_payments where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('duplicate', true, 'payment_id', v_existing.id);
    end if;
  end if;

  select * into v_invoice from public.fin_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Factura no encontrada.' using errcode = 'no_data_found';
  end if;
  if v_invoice.status <> 'issued' then
    raise exception 'Solo se registran cobros/pagos sobre facturas emitidas.' using errcode = 'check_violation';
  end if;

  v_pending := round(v_invoice.total - v_invoice.paid_amount, 2);
  if p_amount > v_pending + 0.001 then
    raise exception 'El importe (%) supera el pendiente (%).', p_amount, v_pending
      using errcode = 'check_violation';
  end if;

  select * into v_account from public.fin_treasury_accounts where id = p_treasury_account_id for update;
  if not found then
    raise exception 'Cuenta de tesorería no encontrada.' using errcode = 'no_data_found';
  end if;
  if not v_account.is_active then
    raise exception 'La cuenta de tesorería está inactiva.' using errcode = 'check_violation';
  end if;

  select * into v_fiscal_year from public.fin_fiscal_years
  where p_payment_date between starts_on and ends_on limit 1;
  if not found then
    raise exception 'No existe ejercicio contable para la fecha %.', p_payment_date
      using errcode = 'check_violation';
  end if;
  if v_fiscal_year.status = 'closed' then
    raise exception 'El ejercicio % está cerrado.', v_fiscal_year.year using errcode = 'check_violation';
  end if;

  insert into public.fin_payments (
    direction, invoice_id, party_id, treasury_account_id, payment_date,
    amount, currency, reference, notes, idempotency_key, created_by
  ) values (
    v_invoice.direction, v_invoice.id, v_invoice.party_id, p_treasury_account_id, p_payment_date,
    round(p_amount, 2), v_invoice.currency, p_reference, p_notes, p_idempotency_key, p_actor
  ) returning id into v_payment_id;

  insert into public.fin_treasury_movements (
    treasury_account_id, movement_date, kind, concept,
    amount_in, amount_out, currency, reference,
    document_type, document_id, payment_id, created_by
  ) values (
    p_treasury_account_id, p_payment_date,
    case when v_invoice.direction = 'sale' then 'collection'::public.fin_movement_kind
         else 'payment'::public.fin_movement_kind end,
    case when v_invoice.direction = 'sale' then 'Cobro factura ' else 'Pago factura ' end || coalesce(v_invoice.invoice_number, ''),
    case when v_invoice.direction = 'sale' then round(p_amount, 2) else 0 end,
    case when v_invoice.direction = 'sale' then 0 else round(p_amount, 2) end,
    v_invoice.currency, p_reference, 'invoice', v_invoice.id, v_payment_id, p_actor
  ) returning id into v_movement_id;

  -- Asiento de tesorería
  v_treasury_code := coalesce(v_account.accounting_account_code,
    case when v_account.kind = 'cash' then '570000' else '572000' end);
  v_counter_code := case when v_invoice.direction = 'sale' then '430000' else '400000' end;

  select coalesce(max(entry_number), 0) + 1 into v_entry_number
  from public.fin_journal_entries where fiscal_year_id = v_fiscal_year.id;

  insert into public.fin_journal_entries (
    fiscal_year_id, entry_number, entry_date, concept, origin,
    document_type, document_id, document_ref, status, created_by
  ) values (
    v_fiscal_year.id, v_entry_number, p_payment_date,
    case when v_invoice.direction = 'sale' then 'Cobro factura ' else 'Pago factura ' end || coalesce(v_invoice.invoice_number, ''),
    'payment', 'payment', v_payment_id, v_invoice.invoice_number, 'posted', p_actor
  ) returning id into v_entry_id;

  if v_invoice.direction = 'sale' then
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
    values (v_entry_id, 1, v_treasury_code, v_account.name, round(p_amount, 2), 0);
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit, party_id)
    values (v_entry_id, 2, v_counter_code, 'Cliente', 0, round(p_amount, 2), v_invoice.party_id);
  else
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit, party_id)
    values (v_entry_id, 1, v_counter_code, 'Proveedor', round(p_amount, 2), 0, v_invoice.party_id);
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
    values (v_entry_id, 2, v_treasury_code, v_account.name, 0, round(p_amount, 2));
  end if;

  update public.fin_payments set movement_id = v_movement_id, journal_entry_id = v_entry_id
  where id = v_payment_id;
  update public.fin_treasury_movements set journal_entry_id = v_entry_id where id = v_movement_id;

  v_new_paid := round(v_invoice.paid_amount + p_amount, 2);
  v_new_status := case
    when v_new_paid >= round(v_invoice.total, 2) - 0.001 then 'paid'::public.fin_payment_status
    when v_new_paid > 0 then 'partial'::public.fin_payment_status
    else 'pending'::public.fin_payment_status
  end;

  update public.fin_invoices
  set paid_amount = v_new_paid, payment_status = v_new_status, updated_by = p_actor
  where id = v_invoice.id;

  insert into public.fin_audit_log (entity_type, entity_id, action, detail, actor_id)
  values ('payment', v_payment_id,
    case when v_invoice.direction = 'sale' then 'collection_registered' else 'payment_registered' end,
    jsonb_build_object(
      'invoice_id', v_invoice.id, 'invoice_number', v_invoice.invoice_number,
      'amount', round(p_amount, 2), 'movement_id', v_movement_id,
      'journal_entry_id', v_entry_id, 'payment_status', v_new_status
    ), p_actor);

  return jsonb_build_object(
    'duplicate', false,
    'payment_id', v_payment_id,
    'movement_id', v_movement_id,
    'journal_entry_id', v_entry_id,
    'paid_amount', v_new_paid,
    'pending_amount', round(v_invoice.total - v_new_paid, 2),
    'payment_status', v_new_status
  );
end;
$$;

-- ===========================================================================
-- RPC: crear asiento manual cuadrado
-- ===========================================================================
create or replace function public.fin_create_journal_entry(
  p_entry_date date,
  p_concept text,
  p_lines jsonb,
  p_actor uuid default null,
  p_origin text default 'manual'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fiscal_year public.fin_fiscal_years;
  v_entry_id uuid;
  v_entry_number integer;
  v_line jsonb;
  v_idx integer := 0;
  v_debit numeric(14, 2) := 0;
  v_credit numeric(14, 2) := 0;
begin
  if jsonb_array_length(p_lines) < 2 then
    raise exception 'El asiento necesita al menos dos líneas.' using errcode = 'check_violation';
  end if;

  select * into v_fiscal_year from public.fin_fiscal_years
  where p_entry_date between starts_on and ends_on limit 1;
  if not found then
    raise exception 'No existe ejercicio contable para la fecha %.', p_entry_date
      using errcode = 'check_violation';
  end if;
  if v_fiscal_year.status = 'closed' then
    raise exception 'El ejercicio % está cerrado.', v_fiscal_year.year using errcode = 'check_violation';
  end if;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    v_debit := v_debit + coalesce((v_line->>'debit')::numeric, 0);
    v_credit := v_credit + coalesce((v_line->>'credit')::numeric, 0);
  end loop;

  if round(v_debit, 2) <> round(v_credit, 2) then
    raise exception 'Asiento descuadrado: debe % <> haber %.', v_debit, v_credit
      using errcode = 'check_violation';
  end if;

  select coalesce(max(entry_number), 0) + 1 into v_entry_number
  from public.fin_journal_entries where fiscal_year_id = v_fiscal_year.id;

  insert into public.fin_journal_entries (
    fiscal_year_id, entry_number, entry_date, concept, origin, status, created_by
  ) values (
    v_fiscal_year.id, v_entry_number, p_entry_date, p_concept, p_origin, 'posted', p_actor
  ) returning id into v_entry_id;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    v_idx := v_idx + 1;
    insert into public.fin_journal_lines (entry_id, line_number, account_code, concept, debit, credit)
    values (
      v_entry_id, v_idx, v_line->>'account_code', v_line->>'concept',
      round(coalesce((v_line->>'debit')::numeric, 0), 2),
      round(coalesce((v_line->>'credit')::numeric, 0), 2)
    );
  end loop;

  insert into public.fin_audit_log (entity_type, entity_id, action, detail, actor_id)
  values ('journal_entry', v_entry_id, 'created',
    jsonb_build_object('entry_number', v_entry_number, 'total', round(v_debit, 2)), p_actor);

  return v_entry_id;
end;
$$;

-- ===========================================================================
-- RPC: movimiento de tesorería manual (ajuste / transferencia)
-- ===========================================================================
create or replace function public.fin_create_movement(
  p_treasury_account_id uuid,
  p_movement_date date,
  p_kind text,
  p_concept text,
  p_amount_in numeric default 0,
  p_amount_out numeric default 0,
  p_reference text default null,
  p_notes text default null,
  p_actor uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(p_amount_in, 0) <= 0 and coalesce(p_amount_out, 0) <= 0 then
    raise exception 'Indica un importe de entrada o de salida.' using errcode = 'check_violation';
  end if;
  if coalesce(p_amount_in, 0) > 0 and coalesce(p_amount_out, 0) > 0 then
    raise exception 'Un movimiento no puede ser entrada y salida a la vez.' using errcode = 'check_violation';
  end if;

  insert into public.fin_treasury_movements (
    treasury_account_id, movement_date, kind, concept,
    amount_in, amount_out, reference, notes, created_by
  ) values (
    p_treasury_account_id, p_movement_date, p_kind::public.fin_movement_kind, p_concept,
    round(coalesce(p_amount_in, 0), 2), round(coalesce(p_amount_out, 0), 2),
    p_reference, p_notes, p_actor
  ) returning id into v_id;

  insert into public.fin_audit_log (entity_type, entity_id, action, detail, actor_id)
  values ('treasury_movement', v_id, 'created',
    jsonb_build_object('concept', p_concept, 'in', p_amount_in, 'out', p_amount_out), p_actor);

  return v_id;
end;
$$;

-- ===========================================================================
-- RPC: cerrar / abrir ejercicio
-- ===========================================================================
create or replace function public.fin_set_fiscal_year_status(
  p_year integer,
  p_status text,
  p_actor uuid default null
)
returns public.fin_fiscal_years
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.fin_fiscal_years;
begin
  update public.fin_fiscal_years
  set status = p_status::public.fin_fiscal_year_status,
      closed_at = case when p_status = 'closed' then now() else null end,
      closed_by = case when p_status = 'closed' then p_actor else null end
  where year = p_year
  returning * into v_row;

  if not found then
    raise exception 'Ejercicio % no encontrado.', p_year using errcode = 'no_data_found';
  end if;

  insert into public.fin_audit_log (entity_type, entity_id, action, detail, actor_id)
  values ('fiscal_year', v_row.id, p_status, jsonb_build_object('year', p_year), p_actor);

  return v_row;
end;
$$;

-- ===========================================================================
-- VISTAS DE APOYO
-- ===========================================================================
create or replace view public.fin_invoice_overview as
select
  i.id,
  i.direction,
  i.invoice_number,
  i.issue_date,
  i.due_date,
  i.status,
  i.payment_status,
  i.subtotal,
  i.tax_total,
  i.total,
  i.paid_amount,
  round(i.total - i.paid_amount, 2) as pending_amount,
  (i.status = 'issued' and i.payment_status <> 'paid' and i.due_date is not null and i.due_date < current_date) as is_overdue,
  i.currency,
  i.series_id,
  i.fiscal_year_id,
  i.party_id,
  p.legal_name as party_name,
  p.tax_id as party_tax_id,
  s.code as series_code,
  i.created_at
from public.fin_invoices i
left join public.fin_parties p on p.id = i.party_id
left join public.fin_invoice_series s on s.id = i.series_id;

create or replace view public.fin_ledger_view as
select
  l.id as line_id,
  l.entry_id,
  e.entry_number,
  e.entry_date,
  e.concept as entry_concept,
  e.origin,
  e.document_type,
  e.document_id,
  e.document_ref,
  e.status,
  e.fiscal_year_id,
  l.account_code,
  a.name as account_name,
  a.account_type,
  l.concept as line_concept,
  l.debit,
  l.credit,
  l.party_id
from public.fin_journal_lines l
join public.fin_journal_entries e on e.id = l.entry_id
left join public.fin_accounts a on a.code = l.account_code;

-- ===========================================================================
-- RLS: deny-all para navegador; acceso exclusivamente vía service role
-- ===========================================================================
alter table public.fin_parties enable row level security;
alter table public.fin_fiscal_years enable row level security;
alter table public.fin_accounts enable row level security;
alter table public.fin_invoice_series enable row level security;
alter table public.fin_treasury_accounts enable row level security;
alter table public.fin_journal_entries enable row level security;
alter table public.fin_journal_lines enable row level security;
alter table public.fin_invoices enable row level security;
alter table public.fin_invoice_lines enable row level security;
alter table public.fin_treasury_movements enable row level security;
alter table public.fin_payments enable row level security;
alter table public.fin_audit_log enable row level security;

revoke all on function public.fin_issue_invoice(uuid, uuid) from public, anon, authenticated;
revoke all on function public.fin_register_payment(uuid, uuid, numeric, date, text, text, uuid, text) from public, anon, authenticated;
revoke all on function public.fin_create_journal_entry(date, text, jsonb, uuid, text) from public, anon, authenticated;
revoke all on function public.fin_create_movement(uuid, date, text, text, numeric, numeric, text, text, uuid) from public, anon, authenticated;
revoke all on function public.fin_set_fiscal_year_status(integer, text, uuid) from public, anon, authenticated;

comment on table public.fin_invoices is
  'Facturas emitidas y recibidas. RLS ON sin políticas client; acceso solo servidor (service role).';
comment on table public.fin_journal_entries is
  'Asientos contables. DEBE = HABER garantizado por trigger diferido.';
comment on table public.fin_treasury_movements is
  'Movimientos reales de tesorería. El saldo de cuenta se recalcula por trigger.';
comment on table public.fin_payments is
  'Cobros y pagos. Creados de forma atómica vía fin_register_payment().';

notify pgrst, 'reload schema';
