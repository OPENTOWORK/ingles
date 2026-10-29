import B2GuideDownloadPage from '@/components/landing/B2GuideDownloadPage';

const TITLE = 'Guía gratuita B2 First: plan de estudio y consejos | Dralo';
const DESCRIPTION =
  'Descarga gratis la guía de Dralo para preparar el B2 First. Incluye las 17 partes del examen, un plan de 12 semanas, estrategias y frases útiles.';

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/guia-b2-first/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/guia-b2-first/',
  },
};

export default function GuiaB2FirstPage() {
  return <B2GuideDownloadPage />;
}
