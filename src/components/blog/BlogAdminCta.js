'use client';

import Link from 'next/link';
import useCanManageBlog from '@/hooks/useCanManageBlog';
import { BLOG_CONTENT_TYPE_META, BLOG_TYPE_ARTICLE, BLOG_TYPE_NEWS } from '@/lib/blogContentTypes';

export default function BlogAdminCta() {
  const canManageBlog = useCanManageBlog();

  if (!canManageBlog) return null;

  const newsMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_NEWS];
  const articleMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_ARTICLE];

  return (
    <div className="blog-page__admin-cta">
      <p>Panel de administrador: crea o edita noticias y artículos del blog.</p>
      <div className="blog-page__admin-cta-actions">
        <Link href={`/admin/blog?tipo=${newsMeta.queryParam}`} className="blog-page__admin-cta-btn">
          {newsMeta.createLabel}
        </Link>
        <Link
          href={`/admin/blog?tipo=${articleMeta.queryParam}`}
          className="blog-page__admin-cta-btn blog-page__admin-cta-btn--secondary"
        >
          {articleMeta.createLabel}
        </Link>
        <Link
          href={`/admin/blog?tipo=${newsMeta.queryParam}&accion=editar`}
          className="blog-page__admin-cta-btn blog-page__admin-cta-btn--secondary"
        >
          {newsMeta.editPluralLabel}
        </Link>
        <Link
          href={`/admin/blog?tipo=${articleMeta.queryParam}&accion=editar`}
          className="blog-page__admin-cta-btn blog-page__admin-cta-btn--secondary"
        >
          {articleMeta.editPluralLabel}
        </Link>
      </div>
    </div>
  );
}
