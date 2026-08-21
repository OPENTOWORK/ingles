'use client';

import Link from 'next/link';
import useCanManageBlog from '@/hooks/useCanManageBlog';
import { blogTypeMeta, normalizeBlogContentType } from '@/lib/blogContentTypes';

/**
 * @param {{
 *   articleId?: string,
 *   contentType?: string,
 *   variant?: 'card' | 'hero' | 'page' | 'cta',
 * }} props
 */
export default function BlogAdminEditLink({ articleId, contentType, variant = 'card' }) {
  const canManageBlog = useCanManageBlog();
  if (!canManageBlog || !articleId) return null;

  const meta = blogTypeMeta(normalizeBlogContentType(contentType));

  return (
    <Link
      href={`/admin/blog?id=${encodeURIComponent(articleId)}`}
      className={`blog-admin-edit blog-admin-edit--${variant}`}
    >
      {meta.editLabel}
    </Link>
  );
}
