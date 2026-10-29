-- Solicitudes del formulario de la guía gratuita del B2 First.
-- RLS ON, sin políticas para el navegador. Lectura y escritura solo desde la API con service role.

create table if not exists public.guia_b2_solicitudes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  accepted_marketing boolean not null default false,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  last_requested_at timestamptz not null default now(),
  constraint guia_b2_solicitudes_email_unique unique (email),
  constraint guia_b2_solicitudes_email_shape check (
    email = lower(email)
    and char_length(email) between 3 and 254
    and position('@' in email) > 1
  ),
  constraint guia_b2_solicitudes_request_count_positive check (request_count >= 1)
);

create index if not exists guia_b2_solicitudes_last_requested_idx
  on public.guia_b2_solicitudes (last_requested_at desc);

alter table public.guia_b2_solicitudes enable row level security;

revoke all on table public.guia_b2_solicitudes from anon, authenticated;

comment on table public.guia_b2_solicitudes is
  'Solicitudes del formulario de la guía gratuita B2. RLS ON, sin políticas client: deny-all para anon/authenticated. Escritura y lectura vía API con service role.';

notify pgrst, 'reload schema';
