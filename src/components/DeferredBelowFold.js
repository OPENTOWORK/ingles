'use client';

import { useDeferredMount } from '@/hooks/useDeferredMount';

/**
 * Monta contenido pesado tras el primer paint (dashboards, gráficos, etc.).
 */
export default function DeferredBelowFold({ children, delayMs = 500, fallback = null }) {
  const ready = useDeferredMount(delayMs);
  if (!ready) return fallback;
  return children;
}
