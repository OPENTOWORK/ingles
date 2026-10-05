import B2Guide from '@/components/landing/ab/B2Guide';
import { guideMetadata } from '@/lib/abExperiment';

export const metadata = guideMetadata('b');

export default function PrepararB2VarianteB() {
  return <B2Guide variant="b" />;
}
