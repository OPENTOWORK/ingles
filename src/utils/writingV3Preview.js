/**
 * Superficie interna de previsualización de Writing v3 (Fase 8).
 *
 * Vive en un solo módulo porque la regla la aplican dos sitios: el middleware de
 * servidor y el shell de cliente. Fuera de desarrollo devuelve `false` siempre, así
 * que en producción la ruta no está exenta de nada: no es pública, no aparece en
 * ninguna navegación y la propia página se niega a renderizarse.
 */
export const WRITING_V3_PREVIEW_PATH = '/dralo-dev/writing-v3';

export function isWritingV3PreviewPath(pathname = '') {
  if (process.env.NODE_ENV === 'production') return false;
  if (!pathname) return false;
  return (
    pathname === WRITING_V3_PREVIEW_PATH || pathname.startsWith(`${WRITING_V3_PREVIEW_PATH}/`)
  );
}
