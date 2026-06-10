/** Emojis por sección de la corrección Cambridge Writing */
const SECTION_EMOJI = {
  'task fulfilment': '📋',
  'language corrections': '✏️',
  'general feedback': '💬',
  strengths: '💪',
  'areas for improvement': '🎯',
  scores: '📊',
  'scores (cambridge subscales)': '📊',
};

const MAIN_TITLE_EMOJI = '📝';

/**
 * Quita cabeceras markdown (#, ##, ###) y las sustituye por emojis.
 */
export function formatWritingFeedbackDisplay(text) {
  let s = String(text || '');

  s = s.replace(/^###\s+(.+)$/gim, (_, title) => {
    const key = title.trim().toLowerCase();
    const emoji = SECTION_EMOJI[key] || '▫️';
    return `${emoji} ${title.trim()}`;
  });

  s = s.replace(/^##\s+(.+)$/gim, (_, title) => `${MAIN_TITLE_EMOJI} ${title.trim()}`);

  s = s.replace(/^#\s+(.+)$/gim, (_, title) => `${MAIN_TITLE_EMOJI} ${title.trim()}`);

  return s.trim();
}

/** Línea es título de sección (emoji al inicio, sin markdown #) */
export function isWritingFeedbackHeadingLine(line) {
  const t = String(line || '').trim();
  if (!t) return false;
  if (/^#{1,6}\s+/.test(t)) return true;
  return /^(📝|📋|✏️|💬|💪|🎯|📊|🎓|📈|🚀|📚|▫️)\s/.test(t);
}
