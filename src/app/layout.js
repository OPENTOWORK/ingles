// src/app/layout.js
import './globals.css';
import '@/styles/mascot.css';
import RootLayoutClient from './RootLayoutClient';
import { ExamProvider } from '@/context/ExamContext';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { getSiteUrl } from '@/lib/siteSeo';

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'English Practice',
  description: 'Practice English certification exams online',
  verification: {
    google: 'LEd0Wokm5GitDKhVkVRHhyRNmLRp-xnAaCyPLMCW-8M',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="full-page-layout">
        <AccessibilityProvider>
          <ExamProvider>
            <RootLayoutClient>{children}</RootLayoutClient>
          </ExamProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
