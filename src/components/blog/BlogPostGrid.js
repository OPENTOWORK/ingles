import Link from 'next/link';
import { formatBlogDate } from '@/lib/blogArticles';
import { blogTypeMeta, normalizeBlogContentType } from '@/lib/blogContentTypes';

/**
 * @param {{ items: Array<Record<string, unknown>> }} props
 */
export default function BlogPostGrid({ items }) {
  if (!items.length) return null;

  return (
    <ul className="blog-page__grid">
      {items.map((item) => {
        const meta = blogTypeMeta(normalizeBlogContentType(item.content_type));
        return (
          <li key={item.id}>
            <article className="blog-card">
              <Link href={`/blog/${item.slug}`} className="blog-card__media">
                {item.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_image_url} alt="" loading="lazy" />
                ) : (
                  <span className="blog-card__media-placeholder" aria-hidden="true" />
                )}
              </Link>
              <div className="blog-card__body">
                <div className="blog-card__meta-row">
                  <span className="blog-card__type">{meta.label}</span>
                  <time className="blog-page__date" dateTime={item.published_at || item.created_at}>
                    {formatBlogDate(item.published_at || item.created_at)}
                  </time>
                </div>
                <h2 className="blog-card__title">
                  <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                </h2>
                {item.excerpt ? <p className="blog-card__excerpt">{item.excerpt}</p> : null}
                <Link href={`/blog/${item.slug}`} className="blog-card__cta">
                  {meta.readCta}
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
