/**
 * Ejecuta trabajo no crítico cuando el navegador está idle (o tras timeout).
 * @param {() => void} callback
 * @param {number} [timeoutMs=3500]
 * @returns {() => void} cleanup
 */
export function deferUntilIdle(callback, timeoutMs = 3500) {
  if (typeof window === 'undefined') return () => {};

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, Math.min(timeoutMs, 2000));
  return () => window.clearTimeout(id);
}
