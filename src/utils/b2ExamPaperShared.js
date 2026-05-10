/** @param {string} rawText */
export function splitEnunciadoAndTextFallback(rawText = '') {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return { enunciado: '', texto: '' };
  const lines = normalized.split('\n');
  const textIndex = lines.findIndex((line) => line.trim().toLowerCase() === 'text');
  if (textIndex === -1) return { enunciado: normalized, texto: '' };
  if (textIndex === 0) return { enunciado: normalized, texto: '' };
  return {
    enunciado: lines.slice(0, textIndex).join('\n').trim(),
    texto: lines.slice(textIndex + 1).join('\n').trim(),
  };
}

/** @param {string} rawText */
export function getFormattedEnunciado(rawText = '') {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith('example:')) return { type: 'label', text: line };
      if (lower === 'text') return { type: 'label', text: line };
      if (/^(answer:)/i.test(line)) return { type: 'answer', text: line };
      if (/^\d+\s*$/.test(line)) return { type: 'number', text: line };
      if (/^[a-g]\)\s+/i.test(line)) return { type: 'option', text: line };
      return { type: 'paragraph', text: line };
    });
}

/** Agrupa respuestas tipo Reading / Listening / MCQ (A–G) y huecos numerados. */
export function getGroupedAnswers(answers = []) {
  const groupsMap = new Map();
  const ungrouped = [];

  answers.forEach((answer) => {
    const text = answer.respuesta || '';
    const matchMcq = text.match(/^(\d+)\s+([A-G])\b\s*\)?\s+(.+)$/i);

    if (matchMcq) {
      const questionNumber = Number(matchMcq[1]);
      const optionLetter = matchMcq[2].toUpperCase();
      const optionText = matchMcq[3];
      if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
      groupsMap.get(questionNumber).push({
        ...answer,
        formattedText: `${optionLetter}) ${optionText}`,
      });
      return;
    }

    const matchLetterOnly = text.match(/^(\d+)\s+([A-G])$/i);
    if (matchLetterOnly) {
      const questionNumber = Number(matchLetterOnly[1]);
      const optionLetter = matchLetterOnly[2].toUpperCase();
      if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
      groupsMap.get(questionNumber).push({
        ...answer,
        formattedText: `${optionLetter}`,
      });
      return;
    }

    const matchGap = text.match(/^(\d+)\s+(.+)$/);
    if (matchGap) {
      const questionNumber = Number(matchGap[1]);
      const rest = matchGap[2].trim();
      if (!groupsMap.has(questionNumber)) groupsMap.set(questionNumber, []);
      groupsMap.get(questionNumber).push({
        ...answer,
        formattedText: rest,
      });
      return;
    }

    ungrouped.push(answer);
  });

  const grouped = [...groupsMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([questionNumber, options]) => ({ questionNumber, options }));

  if (ungrouped.length > 0) {
    grouped.push({
      questionNumber: null,
      options: ungrouped.map((a) => ({ ...a, formattedText: a.respuesta })),
    });
  }
  return grouped;
}

export function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Mapa número de hueco → variantes válidas (normalizadas).
 * Si `respuesta_texto` en BD viene sin prefijo (`from` en vez de `9 from`), `orderedQuestionNumbers`
 * debe listar los huecos en el mismo orden que las filas (p. ej. 9–16 en Parte 2).
 */
export function getOpenAnswerMap(
  answers = [],
  fallbackClosedAnswers = [],
  orderedQuestionNumbers = null,
) {
  const usesOpen = answers.length > 0;
  const source = usesOpen
    ? answers.map((item) => item.respuesta_texto || '')
    : fallbackClosedAnswers.map((item) => item.respuesta || '');

  /** @type {Array<{ num: number, norm: string }>} */
  const keyed = [];
  /** @type {string[]} */
  const plainNorm = [];

  source.forEach((raw) => {
    const text = String(raw || '').trim();
    const match = text.match(/(?:^|[^\d])(\d{1,2})\s+(.+)$/);
    if (match) {
      keyed.push({ num: Number(match[1]), norm: normalizeText(match[2]) });
      return;
    }
    plainNorm.push(normalizeText(text));
  });

  const map = new Map();
  for (const { num, norm } of keyed) {
    if (!norm) continue;
    if (!map.has(num)) map.set(num, new Set());
    map.get(num).add(norm);
  }

  const hints =
    Array.isArray(orderedQuestionNumbers) && orderedQuestionNumbers.length > 0
      ? [...orderedQuestionNumbers].sort((a, b) => a - b)
      : null;

  if (
    usesOpen &&
    plainNorm.length > 0 &&
    keyed.length === 0 &&
    hints &&
    hints.length >= plainNorm.length &&
    plainNorm.every(Boolean)
  ) {
    for (let i = 0; i < plainNorm.length; i++) {
      const num = hints[i];
      if (num == null) continue;
      if (!map.has(num)) map.set(num, new Set());
      map.get(num).add(plainNorm[i]);
    }
  }

  return map;
}

/** @param {string} rawText @param {number} partNumber */
export function inferOpenQuestionNumbersFromPrompt(rawText = '', partNumber = 0) {
  const matches = [...String(rawText || '').matchAll(/(?:^|\n)\s*(\d{1,2})\b/gm)];
  const nums = [...new Set(matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n)))].sort(
    (a, b) => a - b,
  );
  if (nums.length > 0) return nums;
  if (partNumber === 2) return [9, 10, 11, 12, 13, 14, 15, 16];
  if (partNumber === 3) return [17, 18, 19, 20, 21, 22, 23, 24];
  if (partNumber === 4) return [25, 26, 27, 28, 29, 30];
  return [];
}

/**
 * Primera fuente de audio en el texto: URL absoluta (http/https) o ruta desde raíz del sitio (/…mp3)
 * para ficheros en `public/` (mismo origen).
 */
export function extractFirstAudioUrl(text = '') {
  const s = String(text);
  const m = s.match(
    /https?:\/\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)(?=[\s\n"'<>]|$)|\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)(?=[\s\n"'<>]|$)/i,
  );
  return m ? m[0] : '';
}

/** Línea que solo es una referencia a audio (no mostrarla como párrafo de “Texto”). */
export function isStandaloneAudioLine(line = '') {
  const t = String(line).trim();
  if (!t) return false;
  return /^https?:\/\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)$/i.test(t) || /^\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)$/i.test(t);
}
