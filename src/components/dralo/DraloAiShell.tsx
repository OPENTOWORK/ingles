'use client';

import type { ReactNode } from 'react';
import DraloAiFeatureGuard from '@/components/dralo-ai/DraloAiFeatureGuard';

export default function DraloAiShell({ children }: { children: ReactNode }) {
  return <DraloAiFeatureGuard>{children}</DraloAiFeatureGuard>;
}
