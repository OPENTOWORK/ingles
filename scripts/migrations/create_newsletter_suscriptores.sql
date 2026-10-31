-- Altas de la newsletter. Confirmación en dos pasos.
-- RLS ON, sin políticas para el navegador. Lectura y escritura solo desde la API con service role.

create table if not exists public.newsletter_suscriptores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending',
  confirm_token text not null,
  unsubscribe_token text not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint newsletter_suscriptores_email_unique unique (email),
  constraint newsletter_suscriptores_confirm_token_unique unique (confirm_token),
  constraint newsletter_suscriptores_unsubscribe_token_unique unique (unsubscribe_token),
  constraint newsletter_suscriptores_status_check check (status in ('pending', 'active', 'unsubscribed')),
  constraint newsletter_suscriptores_email_shape check (
    email = lower(email)
    and char_length(email) between 3 and 254
    and position('@' in email) > 1
  )
);

create index if not exists newsletter_suscriptores_updated_idx
  on public.newsletter_suscriptores (updated_at desc);

alter table public.newsletter_suscriptores enable row level security;

revoke all on table public.newsletter_suscriptores from anon, authenticated;

comment on table public.newsletter_suscriptores is
  'Suscriptores de la newsletter. RLS ON, sin políticas client: deny-all para anon/authenticated. Escritura y lectura vía API con service role.';

notify pgrst, 'reload schema';
