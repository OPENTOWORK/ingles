'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LAYOUT_CLASS = 'it-preview-buzon-frame';
const TABLET_MQ = '(max-width: 1024px)';

function isEmbeddedPreviewFrame() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function shouldApplyLayoutClass(pathname) {
  if (!pathname?.startsWith('/buzon')) return false;
  if (!isEmbeddedPreviewFrame()) return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia(TABLET_MQ).matches;
}

/** Layout fix for /buzon inside IT panel device preview (mobile/tablet iframe only). */
export function useItPreviewAdminBuzonLayout() {
  const pathname = usePathname();

  useEffect(() => {
    const syncClass = () => {
      if (shouldApplyLayoutClass(pathname)) {
        document.documentElement.classList.add(LAYOUT_CLASS);
      } else {
        document.documentElement.classList.remove(LAYOUT_CLASS);
      }
    };

    syncClass();
    const media = window.matchMedia(TABLET_MQ);
    media.addEventListener('change', syncClass);
    return () => {
      document.documentElement.classList.remove(LAYOUT_CLASS);
      media.removeEventListener('change', syncClass);
    };
  }, [pathname]);
}
