/**
 * Umbral orientativo (~60 %) usado en muchos exámenes internacionales de inglés
 * para considerar un bloque "aprobado" en práctica (no vinculado a ninguna marca).
 */
export function passingCorrectCountForTotal(total) {
  const n = Number(total);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.max(1, Math.ceil(n * 0.6));
}
