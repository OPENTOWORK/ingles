-- Páginas visitadas por cada visitante (con o sin cuenta).
-- Escritura solo con service role; lectura desde el panel de admin.

begin;

create table if not exists public.marketing_visitor_pages (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null references public.marketing_visitors (visitor_id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  path text not null,
  page_title text,
  visited_at timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds >= 0)
);

create index if not exists marketing_visitor_pages_visitor_visited_idx
  on public.marketing_visitor_pages (visitor_id, visited_at desc);

alter table public.marketing_visitor_pages enable row level security;

revoke all on table public.marketing_visitor_pages from anon, authenticated;

comment on table public.marketing_visitor_pages is
  'Páginas visitadas por cada visitante, con o sin cuenta. Escritura solo con service role; lectura solo desde el panel de admin.';

notify pgrst, 'reload schema';

commit;
