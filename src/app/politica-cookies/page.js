import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Política de cookies',
  description: 'Uso de cookies y tecnologías similares en Dralo.',
  path: '/politica-cookies/',
});

export default function PoliticaCookiesPage() {
  return <LegalPageShell slug="politica-cookies" />;
}
