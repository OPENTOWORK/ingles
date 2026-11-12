import ConversionLandingPage from '@/components/landing/ConversionLandingPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  absoluteTitle: 'Prepara tu B2 First con 3 meses de Plan PREMIUM gratis | Dralo',
  description:
    'Practica el B2 First y recibe feedback sobre tus respuestas. Los primeros 25 registros tienen 3 meses de Plan PREMIUM gratis.',
  path: '/campana/',
  robots: { index: false, follow: true },
});

export default function CampanaPage() {
  return <ConversionLandingPage />;
}
