import B2CambridgePillarPage from '@/components/landing/B2CambridgePillarPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = {
  ...pageMetadata({
    absoluteTitle: 'Cómo preparar el B2 Cambridge (First Certificate) | Guía completa Dralo',
    description:
      'Guía completa para preparar el B2 First de Cambridge: estructura del examen, plan de estudio, errores comunes y cómo practicar cada parte con feedback inmediato.',
    path: '/preparar-b2-cambridge/',
  }),
  openGraph: {
    title: 'Cómo preparar el B2 Cambridge (First Certificate)',
    description:
      'Estructura del examen, plan de estudio semanal, errores que bajan la nota y práctica con feedback inmediato.',
    type: 'article',
    locale: 'es_ES',
    url: 'https://www.dralo.es/preparar-b2-cambridge/',
  },
};

export default function PrepararB2CambridgePage() {
  return <B2CambridgePillarPage />;
}
