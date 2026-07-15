'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessBlogAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import { BLOG_CONTENT_TYPE_META, BLOG_TYPE_ARTICLE, BLOG_TYPE_NEWS } from '@/lib/blogContentTypes';

export default function BlogAdminCta() {
  const [canManageBlog, setCanManageBlog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) return;
      const role = await getRoleNameByUserId(user.id, user.email);
      if (!cancelled) setCanManageBlog(canAccessBlogAdminPanel(role));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!canManageBlog) return null;

  const newsMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_NEWS];
  const articleMeta = BLOG_CONTENT_TYPE_META[BLOG_TYPE_ARTICLE];

  return (
    <div className="blog-page__admin-cta">
      <p>¿Eres administrador o coordinador? Crea noticias y artículos desde el panel del blog.</p>
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
      </div>
    </div>
  );
}
