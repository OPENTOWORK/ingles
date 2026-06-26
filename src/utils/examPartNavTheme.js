/** @param {string} sectionSlug */
export function getExamSectionSkillTheme(sectionSlug) {
  if (sectionSlug === 'writing') return 'writing';
  if (sectionSlug === 'listening') return 'listening';
  if (sectionSlug === 'speaking') return 'speaking';
  return 'reading';
}

/** @param {string} title @param {string} [fallbackText] */
export function parseExamPartNumber(title, fallbackText = '') {
  const s = String(title || fallbackText || '');
  const match = s.match(/Part\s*(\d+)/i);
  if (match) return Number(match[1]);
  const numMatch = String(fallbackText || '').match(/(\d+)/);
  return numMatch ? Number(numMatch[1]) : 1;
}

/** @param {{ title?: string, text?: string, description?: string }} part */
export function formatExamPartNavLabels(part, truncateDesc) {
  const partNumber = parseExamPartNumber(part.title, part.text);
  const subtitle = part.title
    ? part.title.replace(/^Part\s*\d+\s*[:\-–—]?\s*/i, '').trim()
    : '';
  const partDesc =
    subtitle ||
    (part.description && truncateDesc ? truncateDesc(part.description) : part.description) ||
    null;

  return {
    partNumber,
    partName: `Part ${partNumber}`,
    partDesc: partDesc || null,
  };
}
