import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.contactFaq.title,
  description: SEO_PAGE_META.contactFaq.description,
  path: '/contacto/faq/',
});

export default function ContactFaqLayout({ children }) {
  return children;
}
