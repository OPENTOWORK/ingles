import NewsletterSignup from '@/components/newsletter/NewsletterSignup';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.newsletter.title,
  description: SEO_PAGE_META.newsletter.description,
  path: '/newsletter/',
});

export default function NewsletterPage() {
  return <NewsletterSignup />;
}
