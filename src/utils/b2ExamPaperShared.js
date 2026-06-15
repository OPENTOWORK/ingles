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
 * Part 1 (MCQ cloze): bloque "Example:" con opciones A–D y Answer.
 * @returns {{ questionNumber: 0, options: Partial<Record<'A'|'B'|'C'|'D', string>>, answerLetter: string } | null}
 */
export function extractMcqClozeExampleBlock(rawText = '') {
  const lines = String(rawText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const start = lines.findIndex((l) => /^example\s*:?\s*$/i.test(l) || /^example\s*:/i.test(l));
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^text$/i.test(lines[i])) {
      end = i;
      break;
    }
  }

  const block = lines.slice(start + 1, end).filter(Boolean);
  /** @type {Partial<Record<'A'|'B'|'C'|'D', string>>} */
  const options = {};
  let answerLetter = '';

  for (const line of block) {
    if (/^answer\s*:/i.test(line)) {
      const m = line.match(/answer\s*:\s*(?:0\s*[→\-–]>\s*)?([A-D])\b/i);
      if (m) answerLetter = m[1].toUpperCase();
      continue;
    }
    const optM = line.match(/^([A-D])\s*\)\s*(.+)$/i) || line.match(/^([A-D])\s+(.+)$/i);
    if (optM) {
      const letter = optM[1].toUpperCase();
      if (letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D') {
        options[letter] = optM[2].trim();
      }
    }
  }

  if (Object.keys(options).length < 2) return null;
  return { questionNumber: 0, options, answerLetter };
}

/** Quita el bloque Example de instrucciones Part 1 (el ejemplo va en el texto). */
export function stripMcqClozeExampleBlock(text = '') {
  return stripTrailingExampleBlock(text);
}

/**
 * Instrucciones Part 1 sin el bloque Example embebido (ejemplo en el pasaje).
 * Prioriza ejemplo específico de la pregunta sobre la plantilla fija de levels_partes.
 */
export function composeMcqClozeDirections(descripcion = '', rawPregunta = '') {
  const desc = String(descripcion || '').trim();
  if (extractMcqClozeExampleBlock(rawPregunta)) {
    return stripMcqClozeExampleBlock(desc) || stripMcqClozeExampleBlock(rawPregunta) || desc;
  }
  return stripMcqClozeExampleBlock(desc) || desc;
}

/**
 * Bloque Example UoE (partes 2–4): frase de ejemplo + línea Answer / 0 → …
 * @returns {{ bodyLines: string[], answerLine: string, sentence: string } | null}
 */
export function extractUoeExampleBlock(rawText = '') {
  const lines = String(rawText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const start = lines.findIndex((l) => /^example\s*:?\s*$/i.test(l) || /^example\s*:/i.test(l));
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^text$/i.test(lines[i])) {
      end = i;
      break;
    }
  }

  const block = lines.slice(start + 1, end).filter(Boolean);
  if (!block.length) return null;

  const bodyLines = [];
  let answerLine = '';
  for (const line of block) {
    if (/^answer\s*:/i.test(line)) {
      answerLine = line.replace(/^answer\s*:\s*/i, '').trim();
    } else if (/^0\s*[→\-–>]/i.test(line)) {
      answerLine = line.trim();
    } else {
      bodyLines.push(line);
    }
  }

  return {
    bodyLines,
    answerLine,
    sentence: bodyLines.join(' '),
  };
}

/** Respuesta modelo del gap (0) desde BD. */
export function resolveGap0ModelAnswer(respuestas = [], respuestasAbiertas = []) {
  for (const row of respuestasAbiertas || []) {
    const num = Number(row?.numero ?? row.questionNumber ?? row.pregunta_numero);
    if (num === 0) {
      const t = String(row.respuesta_texto ?? row.respuesta ?? row.texto ?? '').trim();
      if (t) return t;
    }
  }
  for (const row of respuestas || []) {
    if (row?.correcta !== true) continue;
    const parts = parseMcqRespuestaRowParts(row?.respuesta);
    if (parts?.num === 0 && parts.word) return parts.word;
    const t = String(row.respuesta || '').trim();
    const m = t.match(/^0\s+(?:→\s*)?(.+)$/i);
    if (m) return m[1].trim();
  }
  return '';
}

/**
 * Instrucciones skill UoE (partes 1–4) sin bloque Example arriba.
 */
export function composeSkillUoeDirections(descripcion = '', rawPregunta = '', partNumber = 0) {
  const pn = Number(partNumber);
  if (pn === 1) return composeMcqClozeDirections(descripcion, rawPregunta);
  if (pn >= 2 && pn <= 4) {
    const desc = stripTrailingExampleBlock(String(descripcion || '').trim());
    if (desc) return desc;
    const fallback = splitEnunciadoAndTextFallback(rawPregunta);
    return stripTrailingExampleBlock(fallback.enunciado) || String(descripcion || '').trim();
  }
  return String(descripcion || '').trim();
}

/**
 * Ejemplo inline para partes 2–3 en skill practice (fuera de Directions).
 * @returns {{ bodyLines: string[], answerLine: string, sentence: string, cleanedTexto?: string } | null}
 */
export function resolveUoeInlineExample({
  partNumber = 0,
  descripcion = '',
  rawPregunta = '',
  texto = '',
  respuestas = [],
  respuestasAbiertas = [],
}) {
  const pn = Number(partNumber);
  const gap0Answer = resolveGap0ModelAnswer(respuestas, respuestasAbiertas);
  let block = extractUoeExampleBlock(rawPregunta) || extractUoeExampleBlock(descripcion);

  if (pn === 2) {
    const legacy = extractLegacyPart2InlineExample(texto);
    if (legacy) {
      const answerLine = gap0Answer
        ? `0 → ${gap0Answer}`
        : block?.answerLine || '';
      return {
        bodyLines: [legacy.exampleSentence],
        answerLine,
        sentence: legacy.exampleSentence,
        cleanedTexto: `${legacy.exampleSentence}\n\n${legacy.cleanedTexto}`.trim(),
      };
    }
  }

  if (!block) return null;
  if (!block.answerLine && gap0Answer) {
    block = { ...block, answerLine: `0 → ${gap0Answer}` };
  }
  return block;
}

/** Palabra a mostrar en el hueco (0) a partir de "0 → word (STEM)" o "Answer: …". */
export function parseExampleAnswerWord(answerLine = '') {
  const line = String(answerLine || '').trim();
  if (!line) return '';
  const arrow = line.match(/^0\s*[→\-–>]\s*(.+)$/i);
  if (arrow) {
    const raw = arrow[1].trim();
    const wordForm = raw.replace(/\s*\([A-Z]{2,}\)\s*$/, '').trim();
    if (/^[A-D]$/i.test(wordForm)) return '';
    return wordForm || raw;
  }
  const answerMatch = line.match(/^answer\s*:\s*(.+)$/i);
  if (answerMatch) {
    const raw = answerMatch[1].trim();
    if (/^[A-D]$/i.test(raw)) return '';
    const arrowInAnswer = raw.match(/^0\s*[→\-–>]\s*(.+)$/i);
    if (arrowInAnswer) return parseExampleAnswerWord(arrowInAnswer[0]);
    return raw;
  }
  return '';
}

/** Parsea fila levels_respuestas: "1 C) word", "1 C word" o "1 C". */
export function parseMcqRespuestaRowParts(text = '') {
  const t = String(text || '').trim();
  let m = t.match(/^(\d{1,2})\s+([A-D])\b\s*\)?\s+(.+)$/i);
  if (m) {
    return { num: Number(m[1]), letter: m[2].toUpperCase(), word: m[3].trim() };
  }
  m = t.match(/^(\d{1,2})\s+([A-D])$/i);
  if (m) {
    return { num: Number(m[1]), letter: m[2].toUpperCase(), word: '' };
  }
  return null;
}

/** Opciones A–D de una pregunta Part 1 desde levels_respuestas (todas las filas). */
export function collectPart1OptionsFromRespuestas(respuestas = [], questionNumber = 0) {
  /** @type {Partial<Record<'A'|'B'|'C'|'D', string>>} */
  const options = {};
  for (const row of respuestas) {
    const parts = parseMcqRespuestaRowParts(row?.respuesta);
    if (!parts || parts.num !== questionNumber || !parts.word) continue;
    if (parts.letter === 'A' || parts.letter === 'B' || parts.letter === 'C' || parts.letter === 'D') {
      options[parts.letter] = parts.word;
    }
  }
  return options;
}

/** Palabra del hueco (0) en Part 1 MCQ cloze. */
export function resolveMcqGap0DisplayWord({
  respuestas = [],
  respuestasAbiertas = [],
  correctLetterByQuestion = new Map(),
  exampleBlock = null,
  inlineExample = null,
  mcqGroup0 = null,
  rawPregunta = '',
  descripcion = '',
  parsed = [],
  texto = '',
}) {
  const wordFromOption = (opt) => {
    const t = String(opt?.formattedText || opt?.respuesta || '');
    const m = t.match(/^[A-D]\)\s*(.+)$/i) || t.match(/^\d+\s+[A-D]\b\s*\)?\s*(.+)$/i);
    return m ? m[1].trim() : '';
  };

  const correctOpt = mcqGroup0?.options?.find((o) => o.correcta);
  const groupWord = correctOpt ? wordFromOption(correctOpt) : '';
  if (groupWord) return groupWord;

  const fromPregunta = extractMcqClozeExampleBlock(rawPregunta);
  const fromTexto = extractMcqClozeExampleBlock(texto);
  const fromDesc = extractMcqClozeExampleBlock(descripcion);
  const letter =
    correctLetterByQuestion.get(0) ||
    exampleBlock?.answerLetter ||
    fromPregunta?.answerLetter ||
    fromTexto?.answerLetter ||
    fromDesc?.answerLetter ||
    '';

  const optsFromRows = collectPart1OptionsFromRespuestas(respuestas, 0);
  const parsed0 = parsed.find((p) => p.questionNumber === 0);
  const opts = {
    ...(exampleBlock?.options || {}),
    ...(parsed0?.options || {}),
    ...optsFromRows,
    ...(fromPregunta?.options || {}),
    ...(fromTexto?.options || {}),
  };
  if (letter && opts[letter]) return String(opts[letter]).trim();

  const rowLetters = Object.keys(optsFromRows);
  if (rowLetters.length === 1) return String(optsFromRows[rowLetters[0]]).trim();

  for (const row of respuestas) {
    if (row?.correcta !== true) continue;
    const parts = parseMcqRespuestaRowParts(row?.respuesta);
    if (parts?.num === 0 && parts.word) return parts.word;
  }

  if (letter && fromDesc?.options?.[letter]) return String(fromDesc.options[letter]).trim();

  const fromOpen = resolveGap0ModelAnswer(respuestas, respuestasAbiertas);
  if (fromOpen && !/^[A-D]$/i.test(fromOpen)) return fromOpen;

  const anyGroupWord = mcqGroup0?.options?.map(wordFromOption).find(Boolean);
  if (anyGroupWord) return anyGroupWord;

  return parseExampleAnswerWord(inlineExample?.answerLine);
}

/** Si el pasaje no trae (0), antepone la frase de ejemplo con marcador (0). */
export function ensureExampleGap0InPassage(texto = '', inlineExample = null) {
  if (!inlineExample?.bodyLines?.length) return String(texto || '').trim();
  if (/\(0\)/.test(texto)) return String(texto || '').trim();

  let line = inlineExample.bodyLines.join(' ').trim();
  if (!/\(0\)/.test(line)) {
    line = line.replace(/\.{3,}|…+/g, '(0) _______');
  }
  const body = String(texto || '').trim();
  return body ? `${line}\n\n${body}` : line;
}

/**
 * Opciones A–D de una pregunta Part 1 desde levels_respuestas.
 */
export function extractPart1OptionsFromRespuestas(respuestas = [], questionNumber = 0) {
  const options = collectPart1OptionsFromRespuestas(respuestas, questionNumber);
  return Object.keys(options).length >= 2 ? options : null;
}

/**
 * Bloque de ejemplo (0) adaptado al texto: Questions → enunciado → respuestas → descripción fija.
 */
export function resolvePart1ExampleBlock({
  parsed = [],
  rawPregunta = '',
  descripcion = '',
  respuestas = [],
  correctLetterByQuestion = new Map(),
}) {
  const parsed0 = parsed.find((p) => p.questionNumber === 0);
  if (parsed0?.options) {
    return {
      questionNumber: 0,
      options: parsed0.options,
      answerLetter: correctLetterByQuestion.get(0) || '',
    };
  }
  const fromPregunta = extractMcqClozeExampleBlock(rawPregunta);
  if (fromPregunta) return fromPregunta;
  const fromRows = collectPart1OptionsFromRespuestas(respuestas, 0);
  if (Object.keys(fromRows).length >= 1) {
    return {
      questionNumber: 0,
      options: fromRows,
      answerLetter: correctLetterByQuestion.get(0) || '',
    };
  }
  const fromRespuestas = extractPart1OptionsFromRespuestas(respuestas, 0);
  if (fromRespuestas) {
    return {
      questionNumber: 0,
      options: fromRespuestas,
      answerLetter: correctLetterByQuestion.get(0) || '',
    };
  }
  const fromDesc = extractMcqClozeExampleBlock(descripcion);
  if (fromDesc?.options) return fromDesc;
  return null;
}

/** Ejemplo UoE en el pasaje (no en instrucciones): solo skill practice, partes 1–4. */
export function shouldUseSkillUoeExampleLayout({ skillPractice = false, partNumber = 0 } = {}) {
  const pn = Number(partNumber);
  return Boolean(skillPractice) && Number.isFinite(pn) && pn >= 1 && pn <= 4;
}

/**
 * Grupos MCQ Part 1 (0–8): incluye ejemplo (0) cuando hay opciones en Questions o en Example.
 */
export function buildPart1McqGroups({
  parsed = [],
  correctLetterByQuestion = new Map(),
  preguntaId = '',
  exampleBlock = null,
  rawPregunta = '',
  descripcion = '',
  respuestas = [],
  includeExample = true,
}) {
  const letters = ['A', 'B', 'C', 'D'];
  const buildGroup = (questionNumber, optionsByLetter, correctOverride) => {
    const correctL =
      correctOverride != null && correctOverride !== ''
        ? String(correctOverride).toUpperCase()
        : correctLetterByQuestion.get(questionNumber);
    const opts = letters
      .map((L) => {
        const word = optionsByLetter?.[L];
        if (!word || !String(word).trim()) return null;
        return {
          id: `part1-${preguntaId}-q${questionNumber}-${L}`,
          respuesta: `${questionNumber} ${L} ${word}`,
          formattedText: `${L}) ${word}`,
          correcta: correctL != null ? L === correctL : false,
        };
      })
      .filter(Boolean);
    if (opts.length < 2) return null;
    return { questionNumber, options: opts };
  };

  const groups = [];
  if (includeExample) {
    const resolvedExample =
      exampleBlock ||
      resolvePart1ExampleBlock({
        parsed,
        rawPregunta,
        descripcion,
        respuestas,
        correctLetterByQuestion,
      });
    const parsed0 = parsed.find((p) => p.questionNumber === 0);
    const exampleOptions = parsed0?.options || resolvedExample?.options;
    if (exampleOptions) {
      const exGroup = buildGroup(
        0,
        exampleOptions,
        resolvedExample?.answerLetter || correctLetterByQuestion.get(0),
      );
      if (exGroup) groups.push(exGroup);
    } else {
      for (const row of respuestas) {
        const parts = parseMcqRespuestaRowParts(row?.respuesta);
        if (!parts || parts.num !== 0 || !parts.word) continue;
        const letter = parts.letter;
        groups.push({
          questionNumber: 0,
          options: [
            {
              id: `part1-${preguntaId}-q0-${letter}`,
              respuesta: `0 ${letter}) ${parts.word}`,
              formattedText: `${letter}) ${parts.word}`,
              correcta: row?.correcta === true || letter === correctLetterByQuestion.get(0),
            },
          ],
        });
        break;
      }
    }
  }

  for (const { questionNumber, options } of parsed) {
    if (questionNumber === 0) continue;
    const group = buildGroup(questionNumber, options);
    if (group) groups.push(group);
  }

  return groups.length ? groups.sort((a, b) => a.questionNumber - b.questionNumber) : null;
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

/** Drop redundant part-title lines when the card already shows an external heading. */
export function omitPartTitleBlocks(blocks, externalTitle) {
  if (!externalTitle || !blocks?.length) return blocks || [];
  return blocks.filter((block) => block.type !== 'partTitle');
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
