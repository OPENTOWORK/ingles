import ConversionLandingPage from '@/components/landing/ConversionLandingPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  absoluteTitle: 'DRALO | Prepara el Cambridge B2 First desde 3,99 €/mes',
  description:
    'Practica el B2 First, recibe feedback sobre tus respuestas y entiende tus errores. Plan Plus a 3,99 €/mes hasta el 31/12/2026.',
  path: '/campana/',
  robots: { index: false, follow: true },
});

export default function CampanaPage() {
  return <ConversionLandingPage />;
}
