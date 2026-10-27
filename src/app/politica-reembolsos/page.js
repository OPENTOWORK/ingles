import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Política de reembolsos',
  description: 'Condiciones de reembolsos y devoluciones en Dralo.',
  path: '/politica-reembolsos/',
});

export default function PoliticaReembolsosPage() {
  return <LegalPageShell slug="politica-reembolsos" />;
}
