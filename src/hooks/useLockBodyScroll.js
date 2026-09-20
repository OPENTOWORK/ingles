'use client';

import { useEffect } from 'react';

/** Evita que la rueda del ratón mueva la página detrás de un panel flotante. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return undefined;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [locked]);
}
