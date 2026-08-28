// src/app/layout.js
import '@/styles/accessibility.css';
import '@/styles/site-night-mode.css';
import '@/styles/staff-panels-night-mode.css';
import './globals.css';
import '@/styles/mascot.css';
import Script from 'next/script';
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

const GTM_ID = 'GTM-N7KM9KNK';

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
      <head>
        <link rel="preconnect" href="https://qnazrzvwvkwhkfbqsbmr.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://qnazrzvwvkwhkfbqsbmr.supabase.co" />
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="full-page-layout">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <AccessibilityProvider>
          <ExamProvider>
            <RootLayoutClient>{children}</RootLayoutClient>
          </ExamProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
