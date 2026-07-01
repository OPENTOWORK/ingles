const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

/**
 * @param {string} url
 */
function trimUrlTrailingPunctuation(url) {
  let trimmed = url;
  let suffix = '';
  while (trimmed.length > 0 && /[.,;:!?)}\]'"]$/.test(trimmed)) {
    suffix = trimmed.slice(-1) + suffix;
    trimmed = trimmed.slice(0, -1);
  }
  return { url: trimmed, suffix };
}

/**
 * Divide un texto en trozos de texto plano y URLs detectadas.
 * @param {string} text
 * @returns {Array<{ type: 'text' | 'link', value: string }>}
 */
export function splitMessageWithLinks(text) {
  const input = String(text || '');
  if (!input) return [];

  /** @type {Array<{ type: 'text' | 'link', value: string }>} */
  const parts = [];
  let lastIndex = 0;
  const re = new RegExp(URL_PATTERN.source, 'gi');
  let match = re.exec(input);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: input.slice(lastIndex, match.index) });
    }

    const { url, suffix } = trimUrlTrailingPunctuation(match[0]);
    if (url) {
      parts.push({ type: 'link', value: url });
    }
    if (suffix) {
      parts.push({ type: 'text', value: suffix });
    }

    lastIndex = match.index + match[0].length;
    match = re.exec(input);
  }

  if (lastIndex < input.length) {
    parts.push({ type: 'text', value: input.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: input }];
}
