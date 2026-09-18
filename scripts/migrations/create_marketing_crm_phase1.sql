-- FASE 1 — Arquitectura Marketing CRM (visitor → lead → customer)
-- No conecta APIs externas. Escritura vía service role / API interna.

-- ---------------------------------------------------------------------------
-- Visitantes (antes de ser leads)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  contact_id uuid references auth.users (id) on delete set null,
  lead_id uuid,
  customer_id uuid references auth.users (id) on delete set null,
  referral_invitation_id uuid references public.referral_invitations (id) on delete set null,
  identified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_visitors_visitor_id_format check (visitor_id ~ '^vis_[a-f0-9]{24,32}$')
);

create index if not exists marketing_visitors_user_id_idx
  on public.marketing_visitors (user_id)
  where user_id is not null;

create index if not exists marketing_visitors_contact_id_idx
  on public.marketing_visitors (contact_id)
  where contact_id is not null;

create index if not exists marketing_visitors_lead_id_idx
  on public.marketing_visitors (lead_id)
  where lead_id is not null;

create index if not exists marketing_visitors_customer_id_idx
  on public.marketing_visitors (customer_id)
  where customer_id is not null;

-- ---------------------------------------------------------------------------
-- Perfil de adquisición (first touch + last touch)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_acquisition_profiles (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null unique references public.marketing_visitors (visitor_id) on delete cascade,
  user_id uuid unique references auth.users (id) on delete set null,
  first_source text,
  first_medium text,
  first_campaign text,
  first_content text,
  first_term text,
  first_landing_page text,
  first_timestamp timestamptz,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  first_gclid text,
  first_gbraid text,
  first_wbraid text,
  last_source text,
  last_medium text,
  last_campaign text,
  last_content text,
  last_term text,
  last_landing_page text,
  last_timestamp timestamptz,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_content text,
  last_utm_term text,
  last_gclid text,
  last_gbraid text,
  last_wbraid text,
  lead_created_at timestamptz,
  lead_qualified_at timestamptz,
  converted_at timestamptz,
  customer_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_acquisition_profiles_user_id_idx
  on public.marketing_acquisition_profiles (user_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Fuentes y medios normalizados (extensibles sin cambiar esquema)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_mediums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.marketing_sources (slug, label) values
  ('google', 'Google'),
  ('facebook', 'Facebook'),
  ('instagram', 'Instagram'),
  ('linkedin', 'LinkedIn'),
  ('newsletter', 'Newsletter'),
  ('organic', 'Organic'),
  ('referral', 'Referral'),
  ('direct', 'Direct')
on conflict (slug) do nothing;

insert into public.marketing_mediums (slug, label) values
  ('cpc', 'CPC'),
  ('organic', 'Organic'),
  ('social', 'Social'),
  ('email', 'Email'),
  ('referral', 'Referral'),
  ('direct', 'Direct')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Campañas
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text,
  source text,
  medium text,
  campaign_identifier text,
  external_campaign_id text,
  status text not null default 'active',
  start_date date,
  end_date date,
  budget numeric(12, 2),
  spend numeric(12, 2) default 0,
  currency text default 'EUR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_campaigns_platform_idx
  on public.marketing_campaigns (platform);

create index if not exists marketing_campaigns_status_idx
  on public.marketing_campaigns (status);

create unique index if not exists marketing_campaigns_external_key
  on public.marketing_campaigns (platform, external_campaign_id)
  where external_campaign_id is not null;

-- ---------------------------------------------------------------------------
-- Touchpoints
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_touchpoints (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null references public.marketing_visitors (visitor_id) on delete cascade,
  contact_id uuid references auth.users (id) on delete set null,
  lead_id uuid,
  customer_id uuid references auth.users (id) on delete set null,
  session_id text,
  timestamp timestamptz not null default now(),
  event_name text not null,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  page_url text,
  landing_page text,
  referrer text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_touchpoints_visitor_id_idx
  on public.marketing_touchpoints (visitor_id, timestamp desc);

create index if not exists marketing_touchpoints_contact_id_idx
  on public.marketing_touchpoints (contact_id)
  where contact_id is not null;

create index if not exists marketing_touchpoints_lead_id_idx
  on public.marketing_touchpoints (lead_id)
  where lead_id is not null;

create index if not exists marketing_touchpoints_customer_id_idx
  on public.marketing_touchpoints (customer_id)
  where customer_id is not null;

create index if not exists marketing_touchpoints_session_id_idx
  on public.marketing_touchpoints (session_id)
  where session_id is not null;

create index if not exists marketing_touchpoints_event_name_idx
  on public.marketing_touchpoints (event_name);

create index if not exists marketing_touchpoints_source_medium_idx
  on public.marketing_touchpoints (source, medium);

create index if not exists marketing_touchpoints_campaign_idx
  on public.marketing_touchpoints (campaign)
  where campaign is not null;

create index if not exists marketing_touchpoints_gclid_idx
  on public.marketing_touchpoints (gclid)
  where gclid is not null;

-- ---------------------------------------------------------------------------
-- Eventos de marketing
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_events (
  id uuid primary key default gen_random_uuid(),
  event_public_id text not null unique,
  visitor_id text not null references public.marketing_visitors (visitor_id) on delete cascade,
  contact_id uuid references auth.users (id) on delete set null,
  lead_id uuid,
  customer_id uuid references auth.users (id) on delete set null,
  session_id text,
  event_name text not null,
  event_timestamp timestamptz not null default now(),
  page_url text,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_events_event_public_id_format check (event_public_id ~ '^evt_[a-f0-9]{24,32}$')
);

create index if not exists marketing_events_visitor_id_idx
  on public.marketing_events (visitor_id, event_timestamp desc);

create index if not exists marketing_events_contact_id_idx
  on public.marketing_events (contact_id)
  where contact_id is not null;

create index if not exists marketing_events_lead_id_idx
  on public.marketing_events (lead_id)
  where lead_id is not null;

create index if not exists marketing_events_customer_id_idx
  on public.marketing_events (customer_id)
  where customer_id is not null;

create index if not exists marketing_events_session_id_idx
  on public.marketing_events (session_id)
  where session_id is not null;

create index if not exists marketing_events_event_name_idx
  on public.marketing_events (event_name);

create index if not exists marketing_events_event_timestamp_idx
  on public.marketing_events (event_timestamp desc);

create index if not exists marketing_events_source_medium_idx
  on public.marketing_events (source, medium);

create index if not exists marketing_events_gclid_idx
  on public.marketing_events (gclid)
  where gclid is not null;

create unique index if not exists marketing_events_idempotency_key_idx
  on public.marketing_events (idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------------
-- Costes de campaña
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_campaign_costs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns (id) on delete cascade,
  date date not null,
  spend numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  platform text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists marketing_campaign_costs_unique_day
  on public.marketing_campaign_costs (campaign_id, date, coalesce(platform, ''));

create index if not exists marketing_campaign_costs_date_idx
  on public.marketing_campaign_costs (date desc);

-- ---------------------------------------------------------------------------
-- Oportunidades (preparado para fases posteriores)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  contact_id uuid references auth.users (id) on delete set null,
  customer_id uuid references auth.users (id) on delete set null,
  visitor_id text references public.marketing_visitors (visitor_id) on delete set null,
  stage text not null default 'new',
  estimated_value numeric(12, 2),
  probability numeric(5, 2),
  expected_close_date date,
  actual_close_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_opportunities_contact_id_idx
  on public.marketing_opportunities (contact_id)
  where contact_id is not null;

-- ---------------------------------------------------------------------------
-- Revenue (complementa monetizacion_pagos / suscripciones)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_revenue (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users (id) on delete set null,
  contact_id uuid references auth.users (id) on delete set null,
  opportunity_id uuid references public.marketing_opportunities (id) on delete set null,
  visitor_id text references public.marketing_visitors (visitor_id) on delete set null,
  monetizacion_pago_id bigint,
  amount numeric(12, 2) not null,
  currency text not null default 'EUR',
  product text,
  service text,
  transaction_date timestamptz not null default now(),
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_revenue_customer_id_idx
  on public.marketing_revenue (customer_id)
  where customer_id is not null;

create index if not exists marketing_revenue_visitor_id_idx
  on public.marketing_revenue (visitor_id)
  where visitor_id is not null;

create index if not exists marketing_revenue_transaction_date_idx
  on public.marketing_revenue (transaction_date desc);

-- ---------------------------------------------------------------------------
-- Consentimiento de tracking (analytics / ads / marketing)
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_consent (
  id uuid primary key default gen_random_uuid(),
  visitor_id text unique references public.marketing_visitors (visitor_id) on delete cascade,
  user_id uuid unique references auth.users (id) on delete cascade,
  analytics_consent boolean,
  ads_consent boolean,
  marketing_consent boolean,
  consent_timestamp timestamptz,
  consent_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
create or replace function public.marketing_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketing_visitors_set_updated_at on public.marketing_visitors;
create trigger marketing_visitors_set_updated_at
  before update on public.marketing_visitors
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_acquisition_profiles_set_updated_at on public.marketing_acquisition_profiles;
create trigger marketing_acquisition_profiles_set_updated_at
  before update on public.marketing_acquisition_profiles
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_campaigns_set_updated_at on public.marketing_campaigns;
create trigger marketing_campaigns_set_updated_at
  before update on public.marketing_campaigns
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_touchpoints_set_updated_at on public.marketing_touchpoints;
create trigger marketing_touchpoints_set_updated_at
  before update on public.marketing_touchpoints
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_events_set_updated_at on public.marketing_events;
create trigger marketing_events_set_updated_at
  before update on public.marketing_events
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_opportunities_set_updated_at on public.marketing_opportunities;
create trigger marketing_opportunities_set_updated_at
  before update on public.marketing_opportunities
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_revenue_set_updated_at on public.marketing_revenue;
create trigger marketing_revenue_set_updated_at
  before update on public.marketing_revenue
  for each row execute function public.marketing_set_updated_at();

drop trigger if exists marketing_consent_set_updated_at on public.marketing_consent;
create trigger marketing_consent_set_updated_at
  before update on public.marketing_consent
  for each row execute function public.marketing_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: solo lectura staff vía políticas futuras; escritura vía service role
-- ---------------------------------------------------------------------------
alter table public.marketing_visitors enable row level security;
alter table public.marketing_acquisition_profiles enable row level security;
alter table public.marketing_sources enable row level security;
alter table public.marketing_mediums enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_touchpoints enable row level security;
alter table public.marketing_events enable row level security;
alter table public.marketing_campaign_costs enable row level security;
alter table public.marketing_opportunities enable row level security;
alter table public.marketing_revenue enable row level security;
alter table public.marketing_consent enable row level security;

comment on table public.marketing_visitors is
  'Visitantes anónimos o identificados (visitor_id). Fase 1 Marketing CRM.';
comment on table public.marketing_acquisition_profiles is
  'First touch (inmutable) y last touch (actualizable) por visitante.';
comment on table public.marketing_touchpoints is
  'Interacciones de marketing para atribución futura.';
comment on table public.marketing_events is
  'Eventos de marketing (page_view, generate_lead, purchase, etc.).';
comment on table public.marketing_revenue is
  'Ingresos atribuibles a canales; complementa monetizacion_pagos.';

notify pgrst, 'reload schema';
