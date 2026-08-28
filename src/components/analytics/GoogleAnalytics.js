'use client';

import { useEffect } from 'react';
import { deferUntilIdle } from '@/lib/deferUntilIdle';

const GA_SCRIPT_ATTR = 'data-google-analytics-gtag';

export default function GoogleAnalytics({ enabled = false, measurementId = '' }) {
  useEffect(() => {
    if (!enabled || !measurementId) return undefined;

    return deferUntilIdle(() => {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== 'function') {
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
      }

      if (!document.head.querySelector(`script[${GA_SCRIPT_ATTR}]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.setAttribute(GA_SCRIPT_ATTR, measurementId);
        document.head.appendChild(script);
      }

      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    });
  }, [enabled, measurementId]);

  return null;
}
