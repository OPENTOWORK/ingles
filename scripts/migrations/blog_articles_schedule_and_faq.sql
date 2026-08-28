-- Programación de publicación y preguntas frecuentes en noticias y artículos.
ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS faq_items jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_blog_articles_scheduled_publish
  ON public.blog_articles (scheduled_publish_at)
  WHERE scheduled_publish_at IS NOT NULL AND published = false;
