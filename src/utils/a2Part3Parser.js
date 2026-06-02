/**
 * Parsers for A2 Key Reading Part 3 (long text + MCQ 14–18).
 */

export function parseA2Part3Directions(rawEnunciado = '') {
  const normalized = String(rawEnunciado || '').replace(/\r\n/g, '\n').trim();
  const textIdx = normalized.search(/\nText\s*\n/i);
  let block = textIdx >= 0 ? normalized.slice(0, textIdx).trim() : normalized;
  if (!block && normalized) block = normalized.split('\n')[0] || '';
  return block;
}

/** Título + párrafos desde el panel Text o passageText. */
export function parseA2Part3Passage(texto = '') {
  const normalized = String(texto || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return { title: '', paragraphs: [] };

  const blocks = normalized
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!blocks.length) return { title: '', paragraphs: [] };

  const title = blocks[0];
  const paragraphs = blocks.slice(1);

  if (!paragraphs.length && blocks[0].includes('\n')) {
    const lines = blocks[0].split('\n').map((l) => l.trim()).filter(Boolean);
    return {
      title: lines[0] || '',
      paragraphs: lines.slice(1),
    };
  }

  return { title, paragraphs };
}
