'use client';

import { Suspense } from 'react';
import NivelesLevelRouteGate from '@/components/niveles/NivelesLevelRouteGate';

export default function NivelesLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <NivelesLevelRouteGate>{children}</NivelesLevelRouteGate>
    </Suspense>
  );
}
