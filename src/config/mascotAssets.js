/** Variantes PNG en /public/mascot/ (sin fondo). */
export const MASCOT_VARIANTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11];

/** 11 = logo Dralo con texto */
export const MASCOT_LOGO_VARIANT = 11;

/** Ancho máx. del logo en el recuadro junto al título (px; el CSS lo escala al slot). */
export const MASCOT_LOGO_WIDTH = 104;

/** Variante estable a partir de una clave (ruta, id, etc.). */
export function mascotVariantForKey(key, fallback = 6) {
  const s = String(key ?? '');
  if (!s) return fallback;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  const pool = MASCOT_VARIANTS.filter((v) => v !== MASCOT_LOGO_VARIANT);
  return pool[Math.abs(hash) % pool.length] ?? fallback;
}
