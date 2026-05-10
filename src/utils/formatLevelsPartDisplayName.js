/**
 * Nombre de parte tal como se muestra en la UI (levels_partes.nombre_parte suele incluir " B2").
 * No modifica datos en Supabase.
 * @param {string | null | undefined} raw — p. ej. "Parte 1 B2"
 * @returns {string}
 */
export function formatLevelsPartDisplayName(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const trimmed = s.replace(/\s+b2\s*$/i, '').trim();
  return trimmed.length ? trimmed : s;
}
