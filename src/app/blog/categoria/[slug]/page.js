import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogMasthead from '@/components/blog/BlogMasthead';
import BlogPostGrid from '@/components/blog/BlogPostGrid';
import {
  BLOG_PILLAR_PATH,
  articlesInCategory,
  blogCategoryBySlug,
  blogCategoryPath,
} from '@/lib/blogCategories';
import { fetchPublishedBlogArticles } from '@/lib/blogArticles';
import { SITE_URL } from '@/lib/siteSeo';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  noStore();
  const { slug } = await params;
  const category = blogCategoryBySlug(slug);
  if (!category) return { title: { absolute: 'Categoría no encontrada | Dralo' } };

  const path = `${blogCategoryPath(category.slug)}/`;
  const title = `${category.seoTitle} | Dralo`;
  const url = `${SITE_URL}${path}`;
  return {
    title: { absolute: title },
    description: category.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: category.seoDescription,
      url,
    },
    twitter: {
      title,
      description: category.seoDescription,
    },
  };
}

export default async function BlogCategoryPage({ params }) {
  noStore();
  const { slug } = await params;
  const category = blogCategoryBySlug(slug);
  if (!category) notFound();

  let items = [];
  try {
    items = await fetchPublishedBlogArticles(100);
  } catch {
    items = [];
  }

  const articles = articlesInCategory(items, category.slug);
  if (!articles.length) notFound();

  return (
    <main className="blog-mag">
      <BlogMasthead title={category.name} lead={category.intro} />
      <div className="blog-mag__shell blog-mag__body">
        <nav className="blog-article-page__back" aria-label="Miga de pan">
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true"> / </span>
          <span>{category.name}</span>
        </nav>
        <p className="blog-cat-page__intro">
          La guía general del examen sigue siendo{' '}
          <Link href={BLOG_PILLAR_PATH}>cómo preparar el B2 Cambridge</Link>.
        </p>

        <BlogPostGrid items={articles} />
      </div>
    </main>
  );
}
