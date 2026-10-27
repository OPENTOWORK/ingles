import LegalHubPage from '@/components/legal/LegalHubPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Legal y privacidad',
  description: 'Términos, privacidad, cookies y avisos legales de Dralo.',
  path: '/legal/',
});

export default function LegalPage() {
  return <LegalHubPage />;
}
