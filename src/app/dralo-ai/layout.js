import '@/styles/app-routes.css';
import '@/styles/dralo-ai.css';
import DraloAiShell from '@/components/dralo/DraloAiShell';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.draloAi.title,
  description: SEO_PAGE_META.draloAi.description,
  path: '/dralo-ai/',
  robots: { index: false, follow: true },
});

export default function DraloAiLayout({ children }) {
  return <DraloAiShell>{children}</DraloAiShell>;
}
