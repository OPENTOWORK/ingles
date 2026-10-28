// src/app/layout.js
import '@/styles/accessibility.css';
import '@/styles/site-night-mode.css';
import '@/styles/training-theme.css';
import '@/styles/staff-panels-night-mode.css';
import '@/styles/admin-theme.css';
import '@/styles/admin-night-mode.css';
import './globals.css';
import '@/styles/mascot.css';
import '@/styles/halloween.css';
import '@/styles/navidad.css';
import '@/styles/site-theme-picker.css';
import Script from 'next/script';
import ClientAppProviders from './ClientAppProviders';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { SITE_URL, SOCIAL_SHARE } from '@/lib/siteSeo';
import { SESSION_HINT_BOOT_SCRIPT } from '@/lib/sessionHint';
import { SITE_THEME_BOOT_SCRIPT } from '@/lib/siteTheme';
import {
  DRALO_APP_ICON_SRC,
  DRALO_APPLE_TOUCH_ICON_PATH,
  DRALO_BRAND_NAME,
  DRALO_FAVICON_PATH,
  DRALO_MANIFEST_ICONS,
  DRALO_THEME_COLOR,
} from '@/config/brandAssets';

const GTM_ID = 'GTM-N7KM9KNK';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ELSL12SBGQ';
const ENABLE_MARKETING_TAGS = process.env.NODE_ENV === 'production';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DRALO_BRAND_NAME,
    template: '%s | Dralo',
  },
  applicationName: DRALO_BRAND_NAME,
  openGraph: {
    type: 'website',
    locale: SOCIAL_SHARE.locale,
    siteName: DRALO_BRAND_NAME,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: SOCIAL_SHARE.imageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="session-hint-boot" dangerouslySetInnerHTML={{ __html: SESSION_HINT_BOOT_SCRIPT }} />
        <script id="site-theme-boot" dangerouslySetInnerHTML={{ __html: SITE_THEME_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://qnazrzvwvkwhkfbqsbmr.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://qnazrzvwvkwhkfbqsbmr.supabase.co" />
        <link rel="ard" href="/.well-known/ard.json" type="application/json" />
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" type="application/json" />
        {ENABLE_MARKETING_TAGS ? (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
        {ENABLE_MARKETING_TAGS && GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-gtag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="full-page-layout">
        <Script id="night-mode-boot" strategy="beforeInteractive">
          {`(function(){try{var r=localStorage.getItem('dralo_reading_practice_settings');var t=r?JSON.parse(r).theme:'normal';var on=t==='night';document.documentElement.classList.toggle('reading-night-mode',on);if(document.body)document.body.classList.toggle('reading-night-mode',on);}catch(e){}})();`}
        </Script>
        {ENABLE_MARKETING_TAGS ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <AccessibilityProvider>
          <ClientAppProviders>{children}</ClientAppProviders>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
