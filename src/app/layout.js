// src/app/layout.js
import './globals.css';
import '@/styles/mascot.css';
import RootLayoutClient from './RootLayoutClient';
import { ExamProvider } from '@/context/ExamContext';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { SEO_PAGE_META } from '@/lib/siteSeo';
import {
  DRALO_APP_ICON_SRC,
  DRALO_APPLE_TOUCH_ICON_PATH,
  DRALO_BRAND_NAME,
  DRALO_FAVICON_PATH,
  DRALO_MANIFEST_ICONS,
  DRALO_THEME_COLOR,
} from '@/config/brandAssets';

export const metadata = {
  metadataBase: new URL('https://www.dralo.es'),
  title: {
    default: SEO_PAGE_META.home.title,
    template: `%s | ${DRALO_BRAND_NAME}`,
  },
  description: SEO_PAGE_META.home.description,
  applicationName: DRALO_BRAND_NAME,
  icons: {
    icon: [
      { url: DRALO_FAVICON_PATH, sizes: 'any' },
      { url: DRALO_APP_ICON_SRC, type: 'image/png', sizes: '512x512' },
      ...DRALO_MANIFEST_ICONS.map(({ src, sizes, type }) => ({ url: src, sizes, type })),
    ],
    apple: [{ url: DRALO_APPLE_TOUCH_ICON_PATH, sizes: '180x180', type: 'image/png' }],
    shortcut: [DRALO_FAVICON_PATH],
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: 'LEd0Wokm5GitDKhVkVRHhyRNmLRp-xnAaCyPLMCW-8M',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: DRALO_THEME_COLOR,
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
