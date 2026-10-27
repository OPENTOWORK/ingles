import Link from 'next/link';
import { BLOG_CATEGORIES, blogCategoryPath } from '@/lib/blogCategories';

/**
 * @param {{ currentSlug?: string }} props
 */
export default function BlogCategoryLinks({ currentSlug = '' }) {
  const items = BLOG_CATEGORIES.filter((category) => category.slug !== currentSlug);
  if (!items.length) return null;

  return (
    <nav className="blog-cat-nav" aria-label="Categorías del blog">
      <ul>
        {items.map((category) => (
          <li key={category.slug}>
            <Link href={blogCategoryPath(category.slug)}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
