-- Una reseña por cuenta. Las filas antiguas sin usuario se quedan fuera del índice único.

alter table public.resenas_web
  add column if not exists user_id uuid;

create unique index if not exists resenas_web_user_id_unique
  on public.resenas_web (user_id);

notify pgrst, 'reload schema';
