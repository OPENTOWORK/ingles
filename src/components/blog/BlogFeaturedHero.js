import Link from 'next/link';
import { formatBlogDate } from '@/lib/blogArticles';
import { blogTypeMeta, normalizeBlogContentType } from '@/lib/blogContentTypes';

/**
 * @param {{ post: Record<string, unknown> | null }} props
 */
export default function BlogFeaturedHero({ post }) {
  if (!post) {
    return (
      <section className="blog-mag__featured blog-mag__featured--empty" aria-label="Destacado">
        <div className="blog-mag__featured-visual blog-mag__featured-visual--placeholder" aria-hidden="true" />
        <div className="blog-mag__featured-copy">
          <p className="blog-mag__kicker">Blog Dralo</p>
          <h2 className="blog-mag__featured-title">Próximamente nuevas publicaciones</h2>
          <p className="blog-mag__featured-excerpt">
            Aquí encontrarás novedades de la plataforma, consejos para practicar inglés y recursos
            para sacar el máximo partido a Dralo.
          </p>
        </div>
      </section>
    );
  }

  const meta = blogTypeMeta(normalizeBlogContentType(post.content_type));

  return (
    <section className="blog-mag__featured" aria-label="Artículo destacado">
      <Link href={`/blog/${post.slug}`} className="blog-mag__featured-visual">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image_url} alt="" loading="eager" />
        ) : (
          <span className="blog-mag__featured-visual--placeholder" aria-hidden="true" />
        )}
      </Link>
      <div className="blog-mag__featured-copy">
        <div className="blog-mag__featured-meta">
          <span className="blog-card__type">{meta.label}</span>
          <time className="blog-page__date" dateTime={post.published_at || post.created_at}>
            {formatBlogDate(post.published_at || post.created_at)}
          </time>
        </div>
        <h2 className="blog-mag__featured-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt ? <p className="blog-mag__featured-excerpt">{post.excerpt}</p> : null}
        <Link href={`/blog/${post.slug}`} className="blog-mag__featured-cta">
          {meta.readCta}
        </Link>
      </div>
    </section>
  );
}
