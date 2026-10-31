-- Reseñas escritas en el pie de la web.
-- RLS ON, sin políticas para el navegador. Lectura y escritura solo desde la API con service role.

create table if not exists public.resenas_web (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  body text not null,
  stars smallint not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  user_id uuid,
  ip_hash text,
  constraint resenas_web_name_len check (char_length(display_name) between 2 and 40),
  constraint resenas_web_body_len check (char_length(body) between 12 and 400),
  constraint resenas_web_stars check (stars between 1 and 5)
);

create index if not exists resenas_web_published_created_idx
  on public.resenas_web (created_at desc)
  where published = true;

create unique index if not exists resenas_web_user_id_unique
  on public.resenas_web (user_id);

alter table public.resenas_web enable row level security;

revoke all on table public.resenas_web from anon, authenticated;

comment on table public.resenas_web is
  'Reseñas del pie de la web. RLS ON, sin políticas client: deny-all para anon/authenticated. Escritura y lectura vía API con service role.';

notify pgrst, 'reload schema';
