import B2GuideDownloadPage from '@/components/landing/B2GuideDownloadPage';
import { pageMetadata } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  absoluteTitle: 'Guía gratuita B2 First: plan de estudio y consejos | Dralo',
  description:
    'Descarga gratis la guía de Dralo para preparar el B2 First. Incluye las 17 partes del examen, un plan de 12 semanas, estrategias y frases útiles.',
  path: '/guia-b2-first/',
});

export default function GuiaB2FirstPage() {
  return <B2GuideDownloadPage />;
}
