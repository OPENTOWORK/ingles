// src/app/layout.js
import './globals.css';
import '@/styles/mascot.css';
import RootLayoutClient from './RootLayoutClient';
import { ExamProvider } from '@/context/ExamContext';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  metadataBase: new URL('https://www.dralo.es'),
  title: {
    default: SEO_PAGE_META.home.title,
    template: '%s | Dralo Academy',
  },
  description: SEO_PAGE_META.home.description,
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
