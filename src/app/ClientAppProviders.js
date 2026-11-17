'use client';

import { useEffect } from 'react';
import { ExamProvider } from '@/context/ExamContext';
import { ProfileStudyTimerProvider } from '@/context/ProfileStudyTimerContext';
import { syncNativeStoreOnLaunch } from '@/lib/store/client';
import RootLayoutClient from './RootLayoutClient';

/** En el navegador no hace nada. Dentro de la app confirma las compras de la tienda. */
function NativeStoreSync() {
  useEffect(() => {
    void syncNativeStoreOnLaunch();
  }, []);
  return null;
}

/** Árbol cliente con hooks de navegación (usePathname, etc.). */
export default function ClientAppProviders({ children }) {
  return (
    <ExamProvider>
      <ProfileStudyTimerProvider>
        <NativeStoreSync />
        <RootLayoutClient>{children}</RootLayoutClient>
      </ProfileStudyTimerProvider>
    </ExamProvider>
  );
}
