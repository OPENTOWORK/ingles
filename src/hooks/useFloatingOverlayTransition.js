'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

const UNMOUNT_MS = 260;

/**
 * Monta la capa flotante, anima entrada/salida y desmonta tras el cierre.
 */
export function useFloatingOverlayTransition(isOpen) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (isOpen) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && mounted) {
      const t = window.setTimeout(() => setMounted(false), UNMOUNT_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen, mounted]);

  return {
    mounted,
    layerClassName: visible ? 'is-open' : '',
  };
}
