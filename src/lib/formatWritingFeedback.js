/** Emojis used as section markers in Cambridge writing feedback */
const SECTION_HEADING_EMOJI =
  /^(?:📝|📋|✏️|💬|💪|🎯|📊|🎓|📈|🚀|📚|🔍|▫️|✨)\s*/u;

/**
 * Display title for a feedback section: strip markdown hashes and leading section emojis.
 */
export function cleanWritingFeedbackHeading(heading) {
  let t = String(heading || '').trim().replace(/^#{1,6}\s+/, '');
  while (SECTION_HEADING_EMOJI.test(t)) {
    t = t.replace(SECTION_HEADING_EMOJI, '');
  }
  return t.trim();
}

/**
 * Normalize feedback text for display: strip markdown heading markers (keep plain titles).
 */
export function formatWritingFeedbackDisplay(text) {
  let s = String(text || '');

  s = s.replace(/^#{1,6}\s+(.+)$/gim, (_, title) => cleanWritingFeedbackHeading(title));

  return s.trim();
}

/** Línea es título de sección (emoji al inicio, sin markdown #) */
export function isWritingFeedbackHeadingLine(line) {
  const t = String(line || '').trim();
  if (!t) return false;
  if (/^#{1,6}\s+/.test(t)) return true;
  return /^(📝|📋|✏️|💬|💪|🎯|📊|🎓|📈|🚀|📚|🔍|▫️|✨)\s/.test(t);
}
