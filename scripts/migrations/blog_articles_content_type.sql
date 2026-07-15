-- Tipo de contenido del blog: noticia (corta) o artículo (largo + SEO).
ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'article';

ALTER TABLE public.blog_articles
  DROP CONSTRAINT IF EXISTS blog_articles_content_type_check;

ALTER TABLE public.blog_articles
  ADD CONSTRAINT blog_articles_content_type_check
  CHECK (content_type IN ('news', 'article'));

CREATE INDEX IF NOT EXISTS idx_blog_articles_type_published_created
  ON public.blog_articles (content_type, published, created_at DESC);
