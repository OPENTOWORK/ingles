-- Registro de resúmenes diarios del Buzón enviados por correo (un email por usuario y día).
create table if not exists public.staff_buzon_digest_envios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  digest_date date not null,
  message_count integer not null default 0,
  sent_at timestamptz not null default now(),
  unique (user_id, digest_date)
);

create index if not exists idx_staff_buzon_digest_envios_date
  on public.staff_buzon_digest_envios (digest_date desc);

alter table public.staff_buzon_digest_envios enable row level security;

-- Solo el service role (API/cron) escribe; sin políticas para authenticated.
revoke all on table public.staff_buzon_digest_envios from anon, authenticated;
grant select, insert, update, delete on table public.staff_buzon_digest_envios to service_role;
