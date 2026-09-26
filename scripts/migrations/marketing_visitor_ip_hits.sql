-- Registro de la IP de cada visita. Escritura solo con service role.

create table if not exists public.marketing_visitor_hits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null references public.marketing_visitors (visitor_id) on delete cascade,
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_visitor_hits_created_at_idx
  on public.marketing_visitor_hits (created_at desc);

alter table public.marketing_visitor_hits enable row level security;

comment on table public.marketing_visitor_hits is
  'Registro de la IP de cada visita. Escritura solo con service role; lectura solo desde el panel de admin.';

alter table public.marketing_visitors
  add column if not exists last_ip text;

alter table public.marketing_visitors
  add column if not exists last_seen_at timestamptz;
