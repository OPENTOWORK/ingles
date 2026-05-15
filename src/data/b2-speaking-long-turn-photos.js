import { sitePublicPath } from '@/utils/sitePublicPath';

/**
 * Pares fijos para Parte 15 (long turn), uno por examen 1–5.
 * No hay selección aleatoria: el examen elegido en el selector determina el par.
 *
 * Examen 1 — estudiar: biblioteca (A) vs en casa (B)
 * Examen 2 — comer: cafetería al aire libre (A) vs cocinar en casa (B)
 * Examen 3 — deporte: ciclismo al aire libre (A) vs piscina cubierta (B)
 * Examen 4 — compras: centro comercial (A) vs mercado callejero (B)
 * Examen 5 — música: tocar guitarra en vivo (A) vs escuchar en casa (B)
 */
const PHOTO_PATHS_BY_EXAM = {
  1: ['/b2-speaking/exam-1/photo-a.png', '/b2-speaking/exam-1/photo-b.png'],
  2: ['/b2-speaking/exam-2/photo-a.png', '/b2-speaking/exam-2/photo-b.png'],
  3: ['/b2-speaking/exam-3/photo-a.png', '/b2-speaking/exam-3/photo-b.png'],
  4: ['/b2-speaking/exam-4/photo-a.png', '/b2-speaking/exam-4/photo-b.png'],
  5: ['/b2-speaking/exam-5/photo-a.png', '/b2-speaking/exam-5/photo-b.png'],
};

/**
 * @param {number} examSlot 1–5
 * @returns {[string, string]}
 */
export function getB2LongTurnPhotoUrls(examSlot = 1) {
  const slot = Math.min(5, Math.max(1, Number(examSlot) || 1));
  const paths = PHOTO_PATHS_BY_EXAM[slot] ?? PHOTO_PATHS_BY_EXAM[1];
  return paths.map((p) => sitePublicPath(p));
}
