-- Origen y landing de la primera visita, en la misma fila que el visitante.
alter table public.marketing_visitors
  add column if not exists first_source text,
  add column if not exists first_landing_page text,
  add column if not exists first_referrer text;

comment on column public.marketing_visitors.first_source is
  'Clave de origen de la primera visita (google, instagram, ai, direct…).';
comment on column public.marketing_visitors.first_landing_page is
  'Ruta de Dralo en la que aterrizó la primera visita.';
comment on column public.marketing_visitors.first_referrer is
  'Host del referrer de la primera visita.';
