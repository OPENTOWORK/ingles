import BlogPostGrid from '@/components/blog/BlogPostGrid';

/**
 * @param {{
 *   id: string,
 *   title: string,
 *   subtitle: string,
 *   items: Array<Record<string, unknown>>,
 *   emptyTitle: string,
 *   emptyText: string,
 *   previewLimit?: number,
 * }} props
 */
export default function BlogCategorySection({
  id,
  title,
  subtitle,
  items,
  emptyTitle,
  emptyText,
  previewLimit = 6,
}) {
  const preview = items.slice(0, previewLimit);
  const hasMore = items.length > previewLimit;

  return (
    <section className="blog-mag__category" id={id} aria-labelledby={`${id}-heading`}>
      <div className="blog-mag__category-head">
        <div>
          <h2 id={`${id}-heading`} className="blog-mag__category-title">
            {title}
          </h2>
          <p className="blog-mag__category-subtitle">{subtitle}</p>
        </div>
        {hasMore ? (
          <a href={`#${id}-all`} className="blog-mag__category-link">
            Ver todo
          </a>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="blog-page__empty-state blog-page__empty-state--compact">
          <p className="blog-page__empty-title">{emptyTitle}</p>
          <p className="blog-page__empty">{emptyText}</p>
        </div>
      ) : (
        <>
          <BlogPostGrid items={preview} />
          {hasMore ? (
            <div id={`${id}-all`} className="blog-mag__category-more">
              <p className="blog-mag__category-more-label">Más en {title.toLowerCase()}</p>
              <BlogPostGrid items={items.slice(previewLimit)} />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
