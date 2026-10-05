import B2Guide from '@/components/landing/ab/B2Guide';
import { guideMetadata } from '@/lib/abExperiment';

export const metadata = guideMetadata('a');

export default function PrepararB2VarianteA() {
  return <B2Guide variant="a" />;
}
