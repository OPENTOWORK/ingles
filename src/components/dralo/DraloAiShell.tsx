'use client';

import type { ReactNode } from 'react';
import { DraloXpProvider } from '@/context/DraloXpContext';

export default function DraloAiShell({ children }: { children: ReactNode }) {
  return <DraloXpProvider>{children}</DraloXpProvider>;
}
