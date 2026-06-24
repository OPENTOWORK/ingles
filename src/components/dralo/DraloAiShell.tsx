'use client';

import type { ReactNode } from 'react';
import { DraloXpProvider } from '@/context/DraloXpContext';
import DraloAiFeatureGuard from '@/components/dralo-ai/DraloAiFeatureGuard';

export default function DraloAiShell({ children }: { children: ReactNode }) {
  return (
    <DraloXpProvider>
      <DraloAiFeatureGuard>{children}</DraloAiFeatureGuard>
    </DraloXpProvider>
  );
}
