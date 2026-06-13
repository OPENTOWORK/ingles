import {
  extractKeyWordDirectionsBlock,
  extractKeyWordQuestionsBlock,
  extractTextoBloque,
  parseB2KeyWordTransformItems,
} from '@/utils/b2ExamTextBlocks';

/**
 * Parte 4 (Key Word Transformations): separa instrucciones del bloque Questions.
 *
 * @param {{ rawPregunta?: string, descripcion?: string, fallbackEnunciado?: string }} input
 */
export function resolveB2KeyWordPartContent({
  rawPregunta = '',
  descripcion = '',
  fallbackEnunciado = '',
} = {}) {
  const textoCandidates = [
    extractTextoBloque(rawPregunta, 4, { levelSlug: 'b2' }),
    extractKeyWordQuestionsBlock(rawPregunta),
    String(rawPregunta || '').trim(),
    extractTextoBloque(descripcion, 4, { levelSlug: 'b2' }),
    extractKeyWordQuestionsBlock(descripcion),
  ].filter(Boolean);

  let texto = '';
  for (const candidate of textoCandidates) {
    if (parseB2KeyWordTransformItems(candidate).length > 0) {
      texto = candidate;
      break;
    }
  }

  const enunciado =
    extractKeyWordDirectionsBlock(descripcion) ||
    extractKeyWordDirectionsBlock(rawPregunta) ||
    String(descripcion || '').trim() ||
    String(fallbackEnunciado || '').trim();

  return { enunciado, texto };
}

/**
 * Extrae el bloque "Example:" (hasta la línea "Text") de un enunciado de Part 2.
 * Solo se considera válido si la frase de ejemplo contiene un gap real "(0) ___".
 * @param {string} rawText
 * @returns {string} bloque "Example:\n…" o '' si no hay ejemplo válido
 */
export function extractOpenClozeExampleBlock(rawText = '') {
  const lines = String(rawText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const start = lines.findIndex((l) => /^example\s*:?\s*$/i.test(l) || /^example\s*:/i.test(l));
  if (start === -1) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].toLowerCase() === 'text') {
      end = i;
      break;
    }
  }
  const block = lines.slice(start, end).filter(Boolean);
  const hasRealGap = block.some((l) => /\(0\)\s*(?:_+|\.{2,}|…+)/.test(l));
  return hasRealGap ? block.join('\n') : '';
}

/**
 * Quita el bloque "Example:" final de un texto de instrucciones (Descripción fija).
 * @param {string} text
 */
export function stripTrailingExampleBlock(text = '') {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const idx = lines.findIndex((l) => /^example\s*:/i.test(l.trim()));
  if (idx === -1) return String(text || '').trim();
  return lines.slice(0, idx).join('\n').trim();
}

/**
 * Instrucciones de Part 2 (open cloze) con ejemplo coherente:
 * - Si la pregunta generada trae su propio bloque "Example:" (con gap (0) real), se usa ese
 *   y se descarta el de la Descripción fija.
 * - Si no, y el ejemplo de la Descripción no tiene gap real (legacy "She lives in Madrid."),
 *   se elimina para no mostrar un ejemplo sin sentido.
 * @param {string} descripcion Descripción fija de levels_partes
 * @param {string} rawPregunta levels_preguntas.enunciado
 */
export function composeOpenClozeDirections(descripcion = '', rawPregunta = '') {
  const desc = String(descripcion || '').trim();
  const questionExample = extractOpenClozeExampleBlock(rawPregunta);
  if (questionExample) {
    const base = stripTrailingExampleBlock(desc);
    return base ? `${base}\n${questionExample}` : questionExample;
  }
  if (desc && !extractOpenClozeExampleBlock(desc)) {
    return stripTrailingExampleBlock(desc);
  }
  return desc;
}

/**
 * Legacy Part 2: pasajes antiguos con el gap de ejemplo `(0) ___` incrustado en el texto.
 * Extrae la frase completa que contiene el (0) para mostrarla como bloque Example separado
 * y devuelve el texto limpio (solo gaps 9–16). Devuelve null si el texto no contiene (0).
 *
 * @param {string} texto pasaje mostrado en el panel Text (título + párrafos)
 * @returns {{ exampleSentence: string, cleanedTexto: string } | null}
 */
export function extractLegacyPart2InlineExample(texto = '') {
  const normalized = String(texto || '').replace(/\r\n/g, '\n');
  const markerRe = /\(\s*[0oO]\s*\)\s*(?:_+|\.{2,}|…+)/;
  if (!markerRe.test(normalized)) return null;

  const lines = normalized.split('\n');
  const lineIdx = lines.findIndex((l) => markerRe.test(l));
  if (lineIdx === -1) return null;

  const line = lines[lineIdx];
  // Frases del párrafo (split conservador por . ! ? seguidos de espacio).
  const sentences = line.split(/(?<=[.!?])\s+/);
  const sIdx = sentences.findIndex((s) => markerRe.test(s));
  if (sIdx === -1) return null;

  const exampleSentence = sentences[sIdx].trim();
  const restOfLine = sentences.filter((_, i) => i !== sIdx).join(' ').trim();
  const cleanedLines = [...lines];
  if (restOfLine) cleanedLines[lineIdx] = restOfLine;
  else cleanedLines.splice(lineIdx, 1);

  return {
    exampleSentence,
    cleanedTexto: cleanedLines.join('\n').trim(),
  };
}

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
      const imageMatch = line.match(/^IMAGE:\s*(\S+)/i) || line.match(/^[A-G]\)\s*IMAGE:\s*(\S+)/i);
      if (imageMatch) {
        return { type: 'image', url: imageMatch[1], text: line };
      }
      if (/^(?:part|parte)\s+\d+\s*(?:[:–—-]|\s)/i.test(line)) {
        return { type: 'partTitle', text: line };
      }
      if (lower.startsWith('example:')) return { type: 'label', text: line };
      if (lower === 'text') return { type: 'label', text: line };
      if (/^(answer:)/i.test(line)) return { type: 'answer', text: line };
      if (/^\d+\s*$/.test(line)) return { type: 'number', text: line };
      if (/^[a-g]\)\s+/i.test(line)) return { type: 'option', text: line };
      return { type: 'paragraph', text: line };
    });
}

/** Agrupa respuestas tipo Reading / Listening / MCQ (A–H) y huecos numerados. */
export function getGroupedAnswers(answers = []) {
  const groupsMap = new Map();
  const ungrouped = [];

  answers.forEach((answer) => {
    const text = answer.respuesta || '';
    const matchMcq = text.match(/^(\d+)\s+([A-H])\b\s*\)?\s+(.+)$/i);

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

    const matchLetterOnly = text.match(/^(\d+)\s+([A-H])$/i);
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

/**
 * Normaliza para comparar respuestas del usuario contra la BD:
 * - Quita diacríticos (NFD + strip de marcas combinantes).
 * - Mapea comillas tipográficas (’ ‘ ‛ ′ → '; “ ” „ ‟ ″ → ") a sus equivalentes ASCII
 *   para que `didn't` (escrito por el alumno) coincida con `didn’t` (importado del Excel).
 * - Colapsa espacios internos y aplica trim + lowercase.
 */
export function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/\s+/g, ' ')
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
    let match = text.match(/(?:^|[^\d])(\d{1,2})\s+(.+)$/);
    if (!match) match = text.match(/^(\d{1,2})[\.\)]\s*(.+)$/);
    // p. ej. "10wildlife" desde Excel sin espacio tras el número
    if (!match) match = text.match(/^(\d{1,2})([A-Za-z].+)$/);
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

/**
 * Detecta los números de hueco realmente presentes en el enunciado.
 *
 * Orden de detección:
 * 1) Marcadores `(N) ___` (Open Cloze, Word Formation, Missing Sentences). Se descarta `(0)`
 *    por ser ejemplo y no un hueco evaluable.
 * 2) Números al inicio de línea (Key Word Transformation, Multiple Matching).
 * 3) Rangos canónicos de Use of English como último recurso.
 *
 * @param {string} rawText
 * @param {number} partNumber
 */
export function inferOpenQuestionNumbersFromPrompt(rawText = '', partNumber = 0) {
  const text = String(rawText || '');

  const gapMatches = [
    ...text.matchAll(/\((\d{1,2})\)\s*(?:_+|\.{2,}|…{2,})/g),
  ];
  const gapNums = [
    ...new Set(gapMatches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n) && n > 0)),
  ].sort((a, b) => a - b);
  if (gapNums.length > 0) return gapNums;

  if (partNumber === 4) {
    const fromKwt = parseB2KeyWordTransformItems(text)
      .map((item) => item.questionNumber)
      .filter((n) => Number.isFinite(n) && n > 0);
    if (fromKwt.length > 0) return [...new Set(fromKwt)].sort((a, b) => a - b);
  }

  const lineMatches = [...text.matchAll(/(?:^|\n)\s*(\d{1,2})\b/gm)];
  const lineNums = [
    ...new Set(lineMatches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n))),
  ].sort((a, b) => a - b);
  if (lineNums.length > 0) return lineNums;

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

const AUDIO_EXT_RE = /\.(?:mp3|m4a|wav|ogg)(?:\?|#|$)/i;

/**
 * URL usable en un elemento `<audio>`: http(s) con extensión de audio, o Storage público de Supabase.
 * Rechaza cadenas truncadas (p. ej. solo `https://ref.supabase` sin `.co` ni ruta).
 *
 * @param {string} url
 */
export function isPlausibleAudioUrl(url = '') {
  const s = String(url).trim();
  if (!s || !/^https?:\/\//i.test(s)) return false;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    if (host.endsWith('.supabase.co')) {
      return u.pathname.includes('/storage/v1/object/') && AUDIO_EXT_RE.test(u.pathname + u.search);
    }
    return AUDIO_EXT_RE.test(u.pathname + u.search + u.hash) || AUDIO_EXT_RE.test(s);
  } catch {
    return AUDIO_EXT_RE.test(s);
  }
}

/**
 * URL en `levels_preguntas_audios.audio_url` lista para `<audio src>`.
 * Acepta cualquier objeto bajo `/storage/v1/object/` en `*.supabase.co` con ruta suficiente
 * (p. ej. firmada o con extensión no listada en AUDIO_EXT_RE). Rechaza hosts truncados tipo `*.supabase` sin `.co`.
 *
 * @param {string} url
 */
export function isUsableQuestionAudioUrl(url = '') {
  const s = String(url).trim();
  if (!/^https?:\/\//i.test(s)) return false;
  let u;
  try {
    u = new URL(s);
  } catch {
    return false;
  }
  const host = u.hostname.toLowerCase();
  if (host.endsWith('.supabase') && !host.endsWith('.supabase.co')) return false;
  if (isPlausibleAudioUrl(s)) return true;
  if (host.endsWith('.supabase.co') && u.pathname.includes('/storage/v1/object/')) {
    return u.pathname.length >= 28;
  }
  return false;
}

/** Línea que solo es una referencia a audio (no mostrarla como párrafo de “Texto”). */
export function isStandaloneAudioLine(line = '') {
  const t = String(line).trim();
  if (!t) return false;
  return /^https?:\/\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)$/i.test(t) || /^\/[^\s"'<>]+\.(?:mp3|m4a|wav|ogg)$/i.test(t);
}
