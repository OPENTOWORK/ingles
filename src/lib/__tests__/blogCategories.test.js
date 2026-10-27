import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BLOG_ARTICLE_CATEGORY_ASSIGNMENTS,
  BLOG_CATEGORIES,
  articlesInCategory,
  blogCategoryBySlug,
  blogCategoryPath,
  categoryForArticle,
  indexableBlogCategoryPaths,
  normalizeBlogCategorySlug,
  relatedArticlesInCategory,
} from '@/lib/blogCategories';
import { SITEMAP_PATHS } from '@/lib/sitemapPaths';

test('blog categories keep the requested names, slugs and unique metadata', () => {
  assert.deepEqual(
    BLOG_CATEGORIES.map((category) => [category.slug, category.name]),
    [
      ['preparar-b2-first', 'Preparar el B2 First'],
      ['reading-b2-first', 'Reading B2 First'],
      ['use-of-english-b2-first', 'Use of English B2 First'],
      ['listening-b2-first', 'Listening B2 First'],
      ['writing-b2-first', 'Writing B2 First'],
      ['speaking-b2-first', 'Speaking B2 First'],
    ],
  );

  const titles = new Set(BLOG_CATEGORIES.map((category) => category.seoTitle));
  const descriptions = new Set(BLOG_CATEGORIES.map((category) => category.seoDescription));
  assert.equal(titles.size, BLOG_CATEGORIES.length);
  assert.equal(descriptions.size, BLOG_CATEGORIES.length);
  assert.equal(
    blogCategoryBySlug('preparar-b2-first').seoTitle,
    'Preparar el B2 First de Cambridge: guías y consejos',
  );
  assert.equal(
    blogCategoryBySlug('reading-b2-first').seoTitle,
    'Reading B2 First: estrategias y consejos para mejorar',
  );
});

test('known articles stay on their category without inventing extra routes', () => {
  assert.equal(
    categoryForArticle({ slug: 'como-preparar-b2-first' }).slug,
    'preparar-b2-first',
  );
  assert.equal(
    categoryForArticle({ slug: 'como-saber-si-estoy-preparado-b2-first' }).slug,
    'preparar-b2-first',
  );
  assert.equal(categoryForArticle({ slug: 'reading-b2-first' }).slug, 'reading-b2-first');
  assert.equal(
    categoryForArticle({ slug: 'use-of-english-b2-first' }).slug,
    'use-of-english-b2-first',
  );
  assert.equal(
    categoryForArticle({ slug: 'writing-b2-first-como-mejorar-tus-redacciones' }).slug,
    'writing-b2-first',
  );
  assert.equal(categoryForArticle({ slug: 'listening-b2-first' }).slug, 'listening-b2-first');
  assert.equal(
    categoryForArticle({ slug: 'speaking-b2-first-como-hablar-con-mas-seguridad' }).slug,
    'speaking-b2-first',
  );

  const stored = categoryForArticle({
    slug: 'reading-b2-first',
    category_slug: 'listening-b2-first',
  });
  assert.equal(stored.slug, 'listening-b2-first');
  assert.equal(normalizeBlogCategorySlug('no-existe'), '');
  assert.equal(blogCategoryPath('reading-b2-first'), '/blog/categoria/reading-b2-first');
});

test('category pages and sitemap only include categories with a published article', () => {
  const paths = indexableBlogCategoryPaths();
  assert.equal(paths.length, 6);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) {
    assert.equal(SITEMAP_PATHS.includes(path), true, path);
    assert.equal(path.startsWith('/blog/'), true);
  }

  const published = [
    { slug: 'reading-b2-first', title: 'Reading' },
    { slug: 'como-preparar-b2-first', title: 'Preparar' },
  ];
  assert.equal(articlesInCategory(published, 'reading-b2-first').length, 1);
  assert.equal(articlesInCategory(published, 'writing-b2-first').length, 0);
  assert.deepEqual(
    relatedArticlesInCategory(
      [
        { slug: 'como-preparar-b2-first' },
        { slug: 'cambios-cambridge-english-2026' },
        { slug: 'reading-b2-first' },
      ],
      { slug: 'como-preparar-b2-first' },
    ).map((item) => item.slug),
    ['cambios-cambridge-english-2026'],
  );

  const unpublishedOnly = BLOG_ARTICLE_CATEGORY_ASSIGNMENTS.filter(
    (item) => item.slug === 'como-saber-si-estoy-preparado-b2-first',
  );
  assert.equal(unpublishedOnly[0].published, false);
});
