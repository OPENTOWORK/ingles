import '@/styles/dralo-ai.css';
import DraloAiShell from '@/components/dralo/DraloAiShell';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  title: SEO_PAGE_META.draloAi.title,
  description: SEO_PAGE_META.draloAi.description,
  alternates: { canonical: '/dralo-ai/' },
};

export default function DraloAiLayout({ children }) {
  return <DraloAiShell>{children}</DraloAiShell>;
}
