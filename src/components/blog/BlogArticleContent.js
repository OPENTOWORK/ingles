import { normalizeBlogContent } from '@/lib/blogContent';

export default function BlogArticleContent({ html = '' }) {
  const safeHtml = normalizeBlogContent(html);
  if (!safeHtml) {
    return <p className="blog-page__empty">Este contenido aún no tiene texto.</p>;
  }

  return (
    <div
      className="blog-article-page__body blog-article-page__body--rich"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
