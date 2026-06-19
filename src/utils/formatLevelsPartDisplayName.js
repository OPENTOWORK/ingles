/**
 * Nombre de parte tal como se muestra en la UI (levels_partes.nombre_parte suele incluir " B2").
 * No modifica datos en Supabase.
 * @param {string | null | undefined} raw — p. ej. "Parte 1 B2"
 * @returns {string}
 */
export function formatLevelsPartDisplayName(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const trimmed = s.replace(/\s+(a1|a2|b1|b2|c1|c2)\s*$/i, '').trim();
  const withoutLevel = trimmed.length ? trimmed : s;
  return withoutLevel.replace(/^Parte\s+/i, 'Part ');
}

/** Índice local 1-based dentro de un skill (p. ej. exam part 14 → 1 en Speaking). */
export function getSkillLocalPartNumber(partNumber, partMin) {
  const n = Number(partNumber);
  const min = Number(partMin);
  if (!Number.isFinite(n) || !Number.isFinite(min) || n < min) return null;
  return n - min + 1;
}

/**
 * Etiqueta de pestaña para skill practice (Part 1, Part 2… en lugar del número global del examen).
 * @param {{ partNumber?: number, nombre?: string, nombre_parte?: string } | null | undefined} part
 */
export function getSkillPartTabLabel(part, partMin, lang = 'en') {
  const n = Number(
    part?.partNumber ||
      String(part?.nombre || part?.nombre_parte || '').match(/\d+/)?.[0] ||
      0,
  );
  const local = getSkillLocalPartNumber(n, partMin);
  if (!local) return null;
  return lang === 'en' ? `Part ${local}` : `Parte ${local}`;
}

/** Título de parte en exam mode (Listening 10→1, Writing 8→1, etc.). */
export function getExamSectionPartTitle(partNumber, partMin, lang = 'en') {
  const local = getSkillLocalPartNumber(partNumber, partMin);
  if (!local) return null;
  return lang === 'en' ? `Part ${local}` : `Parte ${local}`;
}

/** Etiqueta "Part N" para botones Back/Continue del nav (misma numeración que las pestañas). */
export function getModuleNavPartLabel(partNumber, partMin, lang = 'en') {
  const n = Number(partNumber);
  if (!Number.isFinite(n) || n <= 0) return '';
  const localTitle = partMin != null ? getExamSectionPartTitle(n, partMin, lang) : null;
  if (localTitle) return localTitle;
  return lang === 'en' ? `Part ${n}` : `Parte ${n}`;
}
