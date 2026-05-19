'use client';

import { useEffect, useState } from 'react';

/**
 * Monta hijos tras idle (o timeout) para no competir con el primer render.
 */
export function useDeferredMount(delayMs = 2500) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: delayMs });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(run, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [delayMs]);

  return ready;
}
