'use client';

import { ExamProvider } from '@/context/ExamContext';
import RootLayoutClient from './RootLayoutClient';

/** Árbol cliente con hooks de navegación (usePathname, etc.). */
export default function ClientAppProviders({ children }) {
  return (
    <ExamProvider>
      <RootLayoutClient>{children}</RootLayoutClient>
    </ExamProvider>
  );
}
