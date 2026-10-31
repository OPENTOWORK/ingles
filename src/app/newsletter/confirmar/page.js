import NewsletterTokenAction from '@/components/newsletter/NewsletterTokenAction';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Confirmar newsletter',
  description: 'Confirma tu correo para recibir la newsletter de Dralo.',
  path: '/newsletter/confirmar/',
  robots: { index: false, follow: false },
});

export default function NewsletterConfirmPage({ searchParams }) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';
  return <NewsletterTokenAction mode="confirm" token={token} />;
}
