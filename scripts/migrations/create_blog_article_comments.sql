-- Comentarios de usuarios en noticias y artículos del blog.
CREATE TABLE IF NOT EXISTS public.blog_article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_article_comments_body_length CHECK (char_length(trim(body)) BETWEEN 2 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_blog_article_comments_article_created
  ON public.blog_article_comments (article_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_blog_article_comments_user
  ON public.blog_article_comments (user_id);

CREATE OR REPLACE FUNCTION public.blog_article_comments_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_article_comments_updated_at ON public.blog_article_comments;
CREATE TRIGGER blog_article_comments_updated_at
  BEFORE UPDATE ON public.blog_article_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.blog_article_comments_set_updated_at();

ALTER TABLE public.blog_article_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blog article comments" ON public.blog_article_comments;
CREATE POLICY "Public read blog article comments"
  ON public.blog_article_comments
  FOR SELECT
  USING (true);
