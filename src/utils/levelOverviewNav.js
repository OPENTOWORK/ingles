/**
 * Enlaces y etiquetas "volver al resumen" por nivel CEFR.
 * @param {string} slug — a2, b1, b2, c1, c2
 * @param {'en'|'es'} [lang]
 */
export function getLevelOverviewNav(slug, lang = 'en') {
  const key = String(slug || 'b2').toLowerCase();
  const label = key.toUpperCase();
  const isEn = lang === 'en';
  return {
    href: `/niveles/${key}`,
    label: isEn ? `Back to ${label} Overview` : `Volver al resumen ${label}`,
  };
}
