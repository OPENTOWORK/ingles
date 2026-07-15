-- SEO, imágenes y bucket para el blog.
ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS cover_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS og_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
CREATE POLICY "blog_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');
