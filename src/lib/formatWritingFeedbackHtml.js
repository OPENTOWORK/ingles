import { formatWritingFeedbackDisplay, isWritingFeedbackHeadingLine } from '@/lib/formatWritingFeedback';

/** Líneas de corrección → HTML (emojis en títulos, saltos de línea). */
export function formatWritingFeedbackHtml(text) {
  const normalized = formatWritingFeedbackDisplay(text);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<br />';
      if (isWritingFeedbackHeadingLine(trimmed)) {
        const title = trimmed.replace(/^#{1,6}\s+/, '');
        return `<h4 class="levels-b2-writing-panel__feedback-heading">${title}</h4>`;
      }
      if (/^[-*]\s+/.test(trimmed)) {
        const item = trimmed.replace(/^[-*]\s+/, '');
        return `<p class="levels-b2-writing-panel__feedback-li">• ${item}</p>`;
      }
      if (/^→/.test(trimmed) || /→/.test(trimmed)) {
        return `<p class="levels-b2-writing-panel__feedback-correction">${trimmed}</p>`;
      }
      return `<p class="levels-b2-writing-panel__feedback-p">${trimmed}</p>`;
    })
    .join('');
}
