import LegalPageShell from '@/components/legal/LegalPageShell';

export const metadata = {
  title: 'Aviso legal | Dralo',
  description: 'Información legal del titular y condiciones de uso del sitio Dralo.',
};

export default function AvisoLegalPage() {
  return <LegalPageShell slug="aviso-legal" />;
}
