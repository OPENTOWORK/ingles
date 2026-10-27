import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.contactEmailSetup.title,
  description: SEO_PAGE_META.contactEmailSetup.description,
  path: '/contacto/configurar-correo/',
  robots: { index: false, follow: true },
});

export default function ContactEmailSetupLayout({ children }) {
  return children;
}
