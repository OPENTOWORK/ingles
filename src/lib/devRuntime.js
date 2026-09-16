/** Entorno de desarrollo local (Next `next dev`). */
export const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Modo ligero en local: sin tracking de actividad, sin backfill en background, etc.
 * Para probar tracking en local: `NEXT_PUBLIC_DEV_FULL_TRACKING=1 npm run dev`
 */
export function isDevLightweightMode() {
  return IS_DEV && process.env.NEXT_PUBLIC_DEV_FULL_TRACKING !== '1';
}
