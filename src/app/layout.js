// src/app/layout.js
import './globals.css';
import '@/styles/mascot.css';
import RootLayoutClient from './RootLayoutClient';
import { ExamProvider } from '@/context/ExamContext';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';

export const metadata = {
  title: 'English Practice',
  description: 'Practice English certification exams online',
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
