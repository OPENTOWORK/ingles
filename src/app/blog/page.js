import BlogAdminCta from '@/components/blog/BlogAdminCta';
import BlogCategorySection from '@/components/blog/BlogCategorySection';
import BlogDiscoverBanner from '@/components/blog/BlogDiscoverBanner';
import BlogFeaturedHero from '@/components/blog/BlogFeaturedHero';
import BlogMasthead from '@/components/blog/BlogMasthead';
import BlogTopicNav from '@/components/blog/BlogTopicNav';
import { fetchPublishedBlogArticles } from '@/lib/blogArticles';
import { unstable_noStore as noStore } from 'next/cache';
import {
  BLOG_CONTENT_TYPE_META,
  BLOG_TYPE_ARTICLE,
  BLOG_TYPE_NEWS,
  normalizeBlogContentType,
} from '@/lib/blogContentTypes';

export const metadata = {
  title: 'Blog | Dralo',
  description:
    'Reflexiones, consejos y recursos de Dralo para aprender y practicar inglés con confianza.',
  alternates: { canonical: '/blog/' },
};

export const dynamic = 'force-dynamic';

function pickFeaturedPost(items) {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => {
    const da = new Date(a.published_at || a.created_at).getTime();
    const db = new Date(b.published_at || b.created_at).getTime();
    return db - da;
  });
  const withCover = sorted.find((item) => item.cover_image_url);
  return withCover || sorted[0];
}

export default async function BlogPage() {
  noStore();
  let items = [];
  let loadError = '';

  try {
    items = await fetchPublishedBlogArticles();
  } catch (err) {
    loadError = err?.message || 'No se pudo cargar el contenido del blog.';
  }

  const news = items.filter((item) => normalizeBlogContentType(item.content_type) === BLOG_TYPE_NEWS);
  const articles = items.filter(
    (item) => normalizeBlogContentType(item.content_type) === BLOG_TYPE_ARTICLE,
  );
  const newsMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_NEWS];
  const articleMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_ARTICLE];

  return (
    <main className="blog-mag">
      <BlogMasthead />

      <div className="blog-mag__shell blog-mag__body">
        <BlogAdminCta />

        {loadError ? (
          <p className="blog-page__empty" role="alert">
            {loadError}
          </p>
        ) : (
          <BlogTopicNav
            newsPanel={
              <>
                {news.length > 0 ? <BlogFeaturedHero post={pickFeaturedPost(news)} /> : null}
                <BlogCategorySection
                  id="blog-noticias"
                  title={newsMeta.labelPlural}
                  subtitle="Anuncios breves, lanzamientos y novedades de Dralo."
                  items={news}
                  emptyTitle={newsMeta.emptyTitle}
                  emptyText={newsMeta.emptyText}
                  previewLimit={3}
                  hideHead
                />
                <BlogDiscoverBanner variant="practice" />
              </>
            }
            articlesPanel={
              <>
                {articles.length > 0 ? <BlogFeaturedHero post={pickFeaturedPost(articles)} /> : null}
                <BlogCategorySection
                  id="blog-articulos"
                  title={articleMeta.labelPlural}
                  subtitle="Guías, estrategias y recursos para practicar reading, listening, writing y speaking."
                  items={articles}
                  emptyTitle={articleMeta.emptyTitle}
                  emptyText={articleMeta.emptyText}
                  previewLimit={6}
                  hideHead
                />
                <BlogDiscoverBanner variant="community" />
              </>
            }
          />
        )}
      </div>
    </main>
  );
}
