'use client';

import StarsWayToB2Page from '@/components/niveles/StarsWayToB2Page';
import { NIVELES_LEVEL_HUB } from '@/data/nivelesLevelHub';

export default function B2StarsWayPage() {
  return <StarsWayToB2Page config={NIVELES_LEVEL_HUB.b2} />;
}
