import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';
import { planPlusProductJsonLdScript } from '@/lib/planPlusProductJsonLd';
import HomePageClient from './HomePageClient';

export const metadata = pageMetadata({
  absoluteTitle: SEO_PAGE_META.home.title,
  description: SEO_PAGE_META.home.description,
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: planPlusProductJsonLdScript() }}
      />
      <HomePageClient />
    </>
  );
}
