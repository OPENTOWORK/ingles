import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogArticleContent from '@/components/blog/BlogArticleContent';
import BlogArticleJsonLd from '@/components/blog/BlogArticleJsonLd';
import BlogAdminEditLink from '@/components/blog/BlogAdminEditLink';
import BlogArticleFaqSection from '@/components/blog/BlogArticleFaqSection';
import BlogCommentsSection from '@/components/blog/BlogCommentsSection';
import BlogDraloBrand from '@/components/blog/BlogDraloBrand';
import { blogOgImage, blogSeoDescription, blogSeoTitle } from '@/lib/blogContent';
import { blogTypeMeta, normalizeBlogContentType } from '@/lib/blogContentTypes';
import {
  fetchPublishedBlogArticleBySlug,
  fetchPublishedBlogArticles,
  formatBlogDate,
  blogPostHref,
} from '@/lib/blogArticles';
import { categoryForArticle, relatedArticlesInCategory } from '@/lib/blogCategories';
import { unstable_noStore as noStore } from 'next/cache';
import { SITE_URL } from '@/lib/siteSeo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  noStore();
  const { slug } = await params;
  try {
    const article = await fetchPublishedBlogArticleBySlug(slug);
    if (!article) return { title: { absolute: 'Artículo no encontrado | Dralo' } };

    const title = blogSeoTitle(article);
    const description = blogSeoDescription(article);
    const image = blogOgImage(article);
    const canonical = `${blogPostHref(article.slug)}/`;

    return {
      title: { absolute: `${title} | Blog Dralo` },
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
    return { title: { absolute: 'Blog | Dralo' } };
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
  const category = categoryForArticle(article);
  let related = [];
  if (category) {
    try {
      const published = await fetchPublishedBlogArticles(100);
      related = relatedArticlesInCategory(published, article);
    } catch {
      related = [];
    }
  }

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
            {category ? (
              <Link href={`/blog/categoria/${category.slug}`} className="blog-card__type">
                {category.name}
              </Link>
            ) : null}
            {article.etiqueta ? <span className="blog-card__type">{article.etiqueta}</span> : null}
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

        <BlogArticleFaqSection items={article.faq_items} />

        {category && related.length > 0 ? (
          <section className="blog-related" aria-labelledby="blog-related-title">
            <h2 id="blog-related-title">Más sobre {category.name}</h2>
            <ul>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={blogPostHref(item.slug)}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <BlogCommentsSection articleId={article.id} articleSlug={article.slug} />

        <BlogDraloBrand variant="article" />
      </article>
    </main>
  );
}
