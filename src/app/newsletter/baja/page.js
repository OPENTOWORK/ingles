import NewsletterTokenAction from '@/components/newsletter/NewsletterTokenAction';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Baja de la newsletter',
  description: 'Date de baja de la newsletter de Dralo.',
  path: '/newsletter/baja/',
  robots: { index: false, follow: false },
});

export default function NewsletterUnsubscribePage({ searchParams }) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';
  return <NewsletterTokenAction mode="unsubscribe" token={token} />;
}
