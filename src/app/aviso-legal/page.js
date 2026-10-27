import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Aviso legal',
  description: 'Información legal del titular y condiciones de uso del sitio Dralo.',
  path: '/aviso-legal/',
});

export default function AvisoLegalPage() {
  return <LegalPageShell slug="aviso-legal" />;
}
