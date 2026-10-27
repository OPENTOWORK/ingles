import LegalPageShell from '@/components/legal/LegalPageShell';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: 'Protección de datos',
  description: 'Derechos, seguridad y tratamiento de datos personales en Dralo.',
  path: '/proteccion-datos/',
});

export default function ProteccionDatosPage() {
  return <LegalPageShell slug="proteccion-datos" />;
}
