'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { deferUntilIdle } from '@/lib/deferUntilIdle';

const META_PIXEL_SCRIPT_ATTR = 'data-meta-pixel';

function trackMetaPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export default function MetaPixel({ enabled = false, pixelId = '' }) {
  const pathname = usePathname();
  const skipNextPathViewRef = useRef(true);

  useEffect(() => {
    if (!enabled || !pixelId) return undefined;

    return deferUntilIdle(() => {
      if (!document.head.querySelector(`script[${META_PIXEL_SCRIPT_ATTR}]`)) {
        !(function bootstrapMetaPixel(f, b, e, v) {
          if (f.fbq) return;
          const n = function fbq() {
            if (n.callMethod) {
              n.callMethod.apply(n, arguments);
            } else {
              n.queue.push(arguments);
            }
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [];
          const t = b.createElement(e);
          t.async = true;
          t.src = v;
          t.setAttribute(META_PIXEL_SCRIPT_ATTR, pixelId);
          const s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
          f.fbq = n;
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', pixelId);
      }

      trackMetaPageView();
      skipNextPathViewRef.current = true;
    });
  }, [enabled, pixelId]);

  useEffect(() => {
    if (!enabled || !pixelId) return undefined;
    if (skipNextPathViewRef.current) {
      skipNextPathViewRef.current = false;
      return undefined;
    }
    trackMetaPageView();
    return undefined;
  }, [enabled, pixelId, pathname]);

  return null;
}
