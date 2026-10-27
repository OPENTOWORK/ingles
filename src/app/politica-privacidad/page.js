import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Política de privacidad',
  description: 'Información sobre el tratamiento de datos personales en Dralo.',
  path: '/politica-privacidad/',
});

export default function PoliticaPrivacidadPage() {
  return <LegalPageShell slug="politica-privacidad" />;
}
