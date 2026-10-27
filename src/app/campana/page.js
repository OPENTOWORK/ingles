import ConversionLandingPage from '@/components/landing/ConversionLandingPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  absoluteTitle: 'Prepara tu B2 con Dralo | Plan Plus gratis para los 50 primeros',
  description:
    'Practica el B2 First de Cambridge con feedback inmediato. Regístrate gratis entre los primeros 50 y consigue el Plan Plus para siempre.',
  path: '/campana/',
  robots: { index: false, follow: true },
});

export default function CampanaPage() {
  return <ConversionLandingPage />;
}
