import LegalPageShell from '@/components/legal/LegalPageShell';

export const metadata = {
  title: 'Política de privacidad | Dralo',
  description: 'Información sobre el tratamiento de datos personales en Dralo.',
};

export default function PoliticaPrivacidadPage() {
  return <LegalPageShell slug="politica-privacidad" />;
}
