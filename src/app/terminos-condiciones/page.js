import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Términos y condiciones',
  description: 'Condiciones de uso de la plataforma Dralo.',
  path: '/terminos-condiciones/',
});

export default function TerminosCondicionesPage() {
  return <LegalPageShell slug="terminos-condiciones" />;
}
