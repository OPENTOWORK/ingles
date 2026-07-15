import { SITE_URL } from '@/lib/siteSeo';
import { blogOgImage, blogSeoDescription, blogSeoTitle } from '@/lib/blogContent';

export default function BlogArticleJsonLd({ article }) {
  if (!article) return null;

  const image = blogOgImage(article);
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blogSeoTitle(article),
    description: blogSeoDescription(article),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dralo Academy',
      url: SITE_URL,
    },
  };

  if (image) payload.image = [image];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
