'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { ExamProvider } from '@/context/ExamContext';

export default function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <ExamProvider>
          {children}
        </ExamProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
















