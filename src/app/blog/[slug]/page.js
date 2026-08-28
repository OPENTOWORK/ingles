import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogArticleContent from '@/components/blog/BlogArticleContent';
import BlogArticleJsonLd from '@/components/blog/BlogArticleJsonLd';
import BlogAdminEditLink from '@/components/blog/BlogAdminEditLink';
import BlogCommentsSection from '@/components/blog/BlogCommentsSection';
import BlogDraloBrand from '@/components/blog/BlogDraloBrand';
import { blogOgImage, blogSeoDescription, blogSeoTitle } from '@/lib/blogContent';
import { blogTypeMeta, normalizeBlogContentType } from '@/lib/blogContentTypes';
import { fetchPublishedBlogArticleBySlug, formatBlogDate } from '@/lib/blogArticles';
import { unstable_noStore as noStore } from 'next/cache';
import { SITE_URL } from '@/lib/siteSeo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  noStore();
  const { slug } = await params;
  try {
    const article = await fetchPublishedBlogArticleBySlug(slug);
    if (!article) return { title: 'Artículo no encontrado | Dralo' };

    const title = blogSeoTitle(article);
    const description = blogSeoDescription(article);
    const image = blogOgImage(article);
    const canonical = `/blog/${article.slug}/`;

    return {
      title: `${title} | Blog Dralo`,
      description,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        title,
        description,
        url: `${SITE_URL}${canonical}`,
        ...(image ? { images: [{ url: image, alt: title }] } : {}),
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: 'Blog | Dralo' };
  }
}

export default async function BlogArticlePage({ params }) {
  noStore();
  const { slug } = await params;
  let article = null;

  try {
    article = await fetchPublishedBlogArticleBySlug(slug);
  } catch {
    notFound();
  }

  if (!article) notFound();

  const cover = article.cover_image_url || blogOgImage(article);
  const typeMeta = blogTypeMeta(normalizeBlogContentType(article.content_type));

  return (
    <main className="blog-article-page">
      <BlogArticleJsonLd article={article} />

      <div className="shell blog-article-page__top">
        <nav className="blog-article-page__back">
          <Link href="/blog">← Volver al blog</Link>
        </nav>
        <BlogAdminEditLink
          articleId={article.id}
          contentType={article.content_type}
          variant="page"
        />
      </div>

      {cover ? (
        <div className="blog-article-page__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" />
        </div>
      ) : null}

      <article className="shell blog-article-page__article">
        <header className="blog-article-page__header">
          <div className="blog-article-page__meta-row">
            <span className="blog-card__type">{typeMeta.label}</span>
            <span className="blog-article-page__dralo-mark">
              <BlogDraloBrand variant="inline" />
            </span>
            <time className="blog-page__date" dateTime={article.published_at || article.created_at}>
              {formatBlogDate(article.published_at || article.created_at)}
            </time>
          </div>
          <h1>{article.title}</h1>
          {article.excerpt ? (
            <p className="blog-article-page__excerpt">{article.excerpt}</p>
          ) : null}
        </header>

        <BlogArticleContent html={article.content} />

        <BlogCommentsSection articleId={article.id} articleSlug={article.slug} />

        <BlogDraloBrand variant="article" />
      </article>
    </main>
  );
}
