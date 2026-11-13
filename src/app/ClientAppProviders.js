'use client';

import { ExamProvider } from '@/context/ExamContext';
import { ProfileStudyTimerProvider } from '@/context/ProfileStudyTimerContext';
import NativeAppBridge from '@/components/native/NativeAppBridge';
import RootLayoutClient from './RootLayoutClient';

/** Árbol cliente con hooks de navegación (usePathname, etc.). */
export default function ClientAppProviders({ children }) {
  return (
    <ExamProvider>
      <ProfileStudyTimerProvider>
        <NativeAppBridge />
        <RootLayoutClient>{children}</RootLayoutClient>
      </ProfileStudyTimerProvider>
    </ExamProvider>
  );
}
