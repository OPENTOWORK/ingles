import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Normas de comunidad',
  description: 'Normas de conducta y uso responsable de la comunidad Dralo.',
  path: '/normas-comunidad/',
});

export default function NormasComunidadPage() {
  return <LegalPageShell slug="normas-comunidad" />;
}
