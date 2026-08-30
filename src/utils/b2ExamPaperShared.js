import {
  extractKeyWordDirectionsBlock,
  extractKeyWordQuestionsBlock,
  extractTextoBloque,
  parseB2KeyWordTransformItems,
  splitPart1TextoYPreguntas,
  parsePart1QuestionOptions,
  extractReadingPart5QuestionsBlock,
  extractReadingPart6SentencesBlock,
  extractPart7PromptStemBlob,
  extractPart7ProfilesBlock,
  parseReadingAdMcqChunks,
  parseReadingPart6SentencePool,
  resolveReadingPart6SentencePool,
  inferPart6QuestionNumbersFromPassage,
  buildPart6PoolFromMcqGroups,
  isCompletePart6Pool,
  formatReadingPart6SentencesDisplay,
  parsePart7NumberedStems,
  parsePart7PeopleProfiles,
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
 * Instrucciones UoE sin Example (nunca devuelve el fallback sin filtrar).
 */
export function resolveSkillUoeEnunciado(
  descripcion = '',
  rawPregunta = '',
  partNumber = 0,
  fallbackEnunciado = '',
) {
  const composed = composeSkillUoeDirections(descripcion, rawPregunta, partNumber);
  if (composed) return composed;
  const pn = Number(partNumber);
  const fallback = String(fallbackEnunciado || '').trim();
  if (pn === 1) {
    return (
      stripMcqClozeExampleBlock(fallback) ||
      stripMcqClozeExampleBlock(descripcion) ||
      String(descripcion || '').trim()
    );
  }
  return stripTrailingExampleBlock(fallback) || String(descripcion || '').trim();
}

/** Frase del ejemplo Part 1 MCQ (línea con hueco 0) para incrustar en el pasaje. */
export function extractMcqExampleSentenceLine(rawText = '') {
  const lines = String(rawText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const start = lines.findIndex((l) => /^example\s*:?\s*$/i.test(l) || /^example\s*:/i.test(l));
  if (start === -1) return '';

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^text$/i.test(lines[i])) {
      end = i;
      break;
    }
  }

  for (const line of lines.slice(start + 1, end)) {
    if (!line || /^answer\s*:/i.test(line)) continue;
    if (/^[A-D]\s*\)/i.test(line) || /^[A-D]\s+\S/i.test(line)) continue;
    if (/^0\b|\(0\)|\.{3,}|…/.test(line)) {
      if (/\(0\)/.test(line)) return line;
      const withGap = line.replace(/\.{3,}|…+/g, '(0) _______');
      if (/\(0\)/.test(withGap)) return withGap;
      return line.replace(/^0(?:\s+|\b)/, '(0) _______ ').trim();
    }
  }
  return '';
}

/** Quita bloques Example / opciones del enunciado formateado (UI). */
export function omitExampleEnunciadoBlocks(blocks = []) {
  if (!blocks?.length) return [];
  const result = [];
  let inExample = false;
  for (const block of blocks) {
    if (block.type === 'label' && /^example\s*:/i.test(String(block.text || '').trim())) {
      inExample = true;
      continue;
    }
    if (inExample) {
      if (block.type === 'label' && !/^example\s*:/i.test(String(block.text || '').trim())) {
        inExample = false;
        result.push(block);
      }
      continue;
    }
    result.push(block);
  }
  return result;
}

/** Oculta preguntas del examinador en instrucciones Speaking (se preguntan en vivo con Play). */
export function omitSpeakingExaminerQuestionBlocks(blocks = [], partNumber = 0) {
  if (!blocks?.length) return [];
  const pn = Number(partNumber);
  if (pn < 14 || pn > 17) return blocks;

  if (pn === 14 || pn === 17) {
    return blocks.filter((block) => !/\?\s*$/.test(String(block.text || '').trim()));
  }

  if (pn === 15) {
    return blocks.filter((block) => {
      const text = String(block.text || '').trim();
      const lower = text.toLowerCase();
      if (/^compare the two photographs/i.test(text)) return false;
      if (/^theme:/i.test(lower)) return false;
      if (/^photo [ab]:/i.test(text)) return false;
      if (/partner follow-up/i.test(lower)) return false;
      if (/\?\s*$/.test(text)) return false;
      return true;
    });
  }

  return blocks;
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
        cleanedTexto: legacy.cleanedTexto,
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

/**
 * Índice de la línea título del pasaje (sin huecos numerados).
 * @param {string[]} lines
 * @param {number} [startIdx=0]
 */
export function findPassageTitleLineIndex(lines = [], startIdx = 0) {
  for (let i = startIdx; i < lines.length; i += 1) {
    const candidate = String(lines[i] || '').trim();
    if (!candidate || candidate.length >= 120 || /^IMAGE:/i.test(candidate)) continue;
    if (/\(\d{1,2}\)/.test(candidate)) continue;
    return i;
  }
  return -1;
}

/**
 * Inserta la frase de ejemplo (hueco 0) después del título del pasaje, dentro del texto.
 */
export function insertUoeExampleAfterPassageTitle(texto = '', exampleLine = '') {
  let line = String(exampleLine || '').trim();
  const body = String(texto || '').trim();
  if (!line) return body;
  if (!body) return line;
  if (/\(0\)/.test(body)) return body;

  if (!/\(0\)/.test(line)) {
    line = line.replace(/\.{3,}|…+/g, '(0) _______');
  }

  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let startIdx = 0;
  if (lines[0]?.toLowerCase() === 'text') startIdx = 1;

  const titleIdx = findPassageTitleLineIndex(lines, startIdx);
  if (titleIdx >= 0) {
    const before = lines.slice(0, titleIdx + 1);
    const after = lines.slice(titleIdx + 1);
    return [...before, line, ...after].join('\n\n');
  }

  if (startIdx > 0) {
    return [...lines.slice(0, startIdx), line, ...lines.slice(startIdx)].join('\n\n');
  }

  return `${line}\n\n${body}`;
}

/** Si el pasaje no trae (0), inserta la frase de ejemplo tras el título del pasaje. */
export function ensureExampleGap0InPassage(texto = '', inlineExample = null) {
  if (!inlineExample?.bodyLines?.length) return String(texto || '').trim();
  if (/\(0\)/.test(texto)) return String(texto || '').trim();

  const line = inlineExample.bodyLines.join(' ').trim();
  return insertUoeExampleAfterPassageTitle(texto, line);
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

/** Ejemplo UoE en el pasaje (no en instrucciones): skill practice partes 1–4; exam mode partes 1–3. */
export function shouldUseSkillUoeExampleLayout({
  skillPractice = false,
  examMode = false,
  partNumber = 0,
} = {}) {
  const pn = Number(partNumber);
  if (!Number.isFinite(pn) || pn < 1) return false;
  if (skillPractice && pn <= 4) return true;
  if (examMode && pn <= 3) return true;
  return false;
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

function buildCorrectLetterMapFromRespuestas(respuestas, pattern) {
  const map = new Map();
  for (const row of respuestas || []) {
    if (row?.correcta !== true) continue;
    const t = String(row.respuesta || '').trim();
    let m = t.match(pattern);
    if (!m) {
      m = t.match(/^(\d{1,2})\s+([A-G])\b\s*\)?\s*/i);
    }
    if (m) map.set(Number(m[1]), m[2].toUpperCase());
  }
  return map;
}

/** MCQ groups for Reading parts 5–7 (same IDs as the practice UI). */
export function buildReadingSyntheticMcqGroups(
  partNumber,
  enunciado,
  preguntaId,
  respuestas = [],
  passageTextOverride = '',
) {
  const raw = enunciado || '';
  const pid = preguntaId;
  if (!raw || !pid || partNumber < 5 || partNumber > 7) return null;

  const readingCorrectLetterByQuestion = buildCorrectLetterMapFromRespuestas(
    respuestas,
    /^(\d{1,2})\s+([A-G])\b/i,
  );

  if (partNumber === 5) {
    const block = extractReadingPart5QuestionsBlock(raw);
    const chunks = parseReadingAdMcqChunks(block);
    if (!chunks.length) return null;
    const letters = ['A', 'B', 'C', 'D'];
    const groups = chunks
      .map(({ questionNumber, stem, options: byLetter }) => {
        const correctL = readingCorrectLetterByQuestion.get(questionNumber);
        const opts = letters
          .map((L) => {
            const text = byLetter[L];
            if (!text || !String(text).trim()) return null;
            return {
              id: `reading-${pid}-q${questionNumber}-${L}`,
              respuesta: `${questionNumber} ${L} ${text}`,
              formattedText: `${L}) ${text}`,
              correcta: correctL != null ? L === correctL : false,
            };
          })
          .filter(Boolean);
        if (!opts.length) return null;
        return { questionNumber, questionStem: stem || '', options: opts };
      })
      .filter(Boolean);
    return groups.length ? groups : null;
  }

  if (partNumber === 6) {
    const passageText = passageTextOverride || extractExamModePartTexto(partNumber, raw);
    const pool = resolveReadingPart6SentencePool(raw, passageText);
    const letters = [...'ABCDEFG'];
    let qnums = [...readingCorrectLetterByQuestion.keys()].sort((a, b) => a - b);
    if (!qnums.length) {
      qnums = inferPart6QuestionNumbersFromPassage(passageText, raw);
    }
    if (!qnums.length) return null;
    return qnums.map((questionNumber) => {
      const correctL = readingCorrectLetterByQuestion.get(questionNumber);
      const opts = letters.map((L) => {
        const text = pool[L] || '';
        return {
          id: `reading-${pid}-q${questionNumber}-${L}`,
          respuesta: `${questionNumber} ${L}`,
          formattedText: `${L})`,
          compactLabel: `${L}`,
          optionText: text,
          correcta: correctL != null ? L === correctL : false,
        };
      });
      return { questionNumber, questionStem: '', options: opts };
    });
  }

  if (partNumber === 7) {
    const stemBlob = extractPart7PromptStemBlob(raw);
    const stemsParsed = parsePart7NumberedStems(stemBlob);
    const stemByNum = new Map(stemsParsed.map((x) => [x.questionNumber, x.stem]));
    const people = parsePart7PeopleProfiles(extractPart7ProfilesBlock(raw));
    const letters = ['A', 'B', 'C', 'D'];
    if (!letters.every((L) => people[L]?.label)) return null;
    const qnums = [...readingCorrectLetterByQuestion.keys()].sort((a, b) => a - b);
    if (!qnums.length) return null;
    return qnums.map((questionNumber) => {
      const stem = stemByNum.get(questionNumber) || '';
      const correctL = readingCorrectLetterByQuestion.get(questionNumber);
      const opts = letters.map((L) => {
        const { label = '' } = people[L];
        return {
          id: `reading-${pid}-q${questionNumber}-${L}`,
          respuesta: `${questionNumber} ${L}`,
          formattedText: `${L}) ${label}`,
          correcta: correctL != null ? L === correctL : false,
        };
      });
      return { questionNumber, questionStem: stem, options: opts };
    });
  }

  return null;
}

/** Fallback Part 6 groups from DB letter-only answers (skills layout). */
export function buildPart6McqGroupsFromGroupedAnswers(
  groupedAnswers = [],
  preguntaId,
  passageText = '',
  rawEnunciado = '',
  respuestas = [],
) {
  const pid = preguntaId;
  if (!pid) return null;
  const groups = (groupedAnswers || []).filter((g) => g?.questionNumber != null);
  if (!groups.length) return null;

  const readingCorrectLetterByQuestion = buildCorrectLetterMapFromRespuestas(
    respuestas,
    /^(\d{1,2})\s+([A-G])\b/i,
  );
  const pool = resolveReadingPart6SentencePool(rawEnunciado, passageText);
  const letters = [...'ABCDEFG'];

  let qnums = groups.map((g) => g.questionNumber).sort((a, b) => a - b);
  if (!qnums.length) {
    qnums = inferPart6QuestionNumbersFromPassage(passageText, rawEnunciado);
  }
  if (!qnums.length) return null;

  const groupByNum = new Map(groups.map((g) => [g.questionNumber, g]));

  return qnums.map((questionNumber) => {
    const group = groupByNum.get(questionNumber);
    const options = group?.options || [];
    const correctFromDb = readingCorrectLetterByQuestion.get(questionNumber);
    const correctFromOpts = options.find((o) => o.correcta);
    const correctLetter =
      correctFromDb ||
      String(correctFromOpts?.formattedText || correctFromOpts?.respuesta || '')
        .match(/^([A-G])\)?/i)?.[1]
        ?.toUpperCase() ||
      '';

    const opts = letters.map((L) => {
      const existing = options.find((o) => {
        const t = String(o.formattedText || o.respuesta || '').trim();
        const m = t.match(/^([A-G])\)?(?:\s|$)/i);
        return m && m[1].toUpperCase() === L;
      });
      return {
        id: existing?.id || `reading-${pid}-q${questionNumber}-${L}`,
        respuesta: existing?.respuesta || `${questionNumber} ${L}`,
        formattedText: `${L})`,
        compactLabel: L,
        optionText: pool[L] || '',
        correcta: existing?.correcta ?? (correctLetter ? L === correctLetter : false),
      };
    });

    return { questionNumber, questionStem: '', options: opts };
  });
}

/** Part 6 MCQ groups for exam mode + skills (synthetic first, then DB fallback). */
export function buildPart6ReadingMcqGroups({
  enunciado = '',
  passageText = '',
  preguntaId,
  respuestas = [],
  groupedAnswers = [],
}) {
  const synthetic = buildReadingSyntheticMcqGroups(
    6,
    enunciado,
    preguntaId,
    respuestas,
    passageText,
  );
  if (synthetic?.length) return synthetic;
  return buildPart6McqGroupsFromGroupedAnswers(
    groupedAnswers,
    preguntaId,
    passageText,
    enunciado,
    respuestas,
  );
}

/** Texto del pasaje extraído igual que en la UI de práctica (exam mode). */
export function extractExamModePartTexto(partNumber, rawEnunciado = '') {
  const textoExtracted = extractTextoBloque(rawEnunciado, partNumber, { levelSlug: 'b2' });
  const fallback = splitEnunciadoAndTextFallback(rawEnunciado);
  let texto = (textoExtracted || fallback.texto || '').trim();
  if (partNumber === 1 && texto) {
    const split = splitPart1TextoYPreguntas(texto);
    texto = split.texto.trim();
  }
  return texto;
}

/** Enunciado + pasaje — mismo blob que usa la UI para detectar huecos abiertos. */
export function buildExamModeScoringPromptBlob(partNumber, question) {
  const raw = question?.enunciado || '';
  const texto = extractExamModePartTexto(partNumber, raw);
  return [raw, texto].filter(Boolean).join('\n');
}

/**
 * Decide cómo corregir una parte en exam mode (MCQ vs open cloze), alineado con exam-reading.
 * @returns {{ useOpenInputUi: boolean, openQuestionNumbers: number[], groupedAnswers: object[], promptBlob: string }}
 */
export function resolveExamModePartScoringMode(partNumber, question, partDescripcion = '') {
  const respuestas = question?.respuestas || [];
  const preguntaId = question?.preguntaId || question?.id || '';
  const desc = String(partDescripcion || '').replace(/\r\n/g, '\n').trim();
  const raw = question?.enunciado || '';
  const promptBlob = buildExamModeScoringPromptBlob(partNumber, question);

  if (partNumber >= 2 && partNumber <= 4) {
    const openNumsFromPrompt = inferOpenQuestionNumbersFromPrompt(promptBlob, partNumber);
    const openAnswerMap = getOpenAnswerMap(
      question?.respuestasAbiertas || [],
      respuestas,
      openNumsFromPrompt,
    );
    const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
    const openQuestionNumbers =
      openNumsFromPrompt.length > 0
        ? openNumsFromPrompt
        : fromAnswers.length > 0
          ? fromAnswers
          : [];
    return {
      useOpenInputUi: true,
      openQuestionNumbers,
      groupedAnswers: [],
      promptBlob,
    };
  }

  if (partNumber >= 5 && partNumber <= 7) {
    const groupedAnswers =
      buildReadingSyntheticMcqGroups(partNumber, raw, preguntaId, respuestas) ||
      getGroupedAnswers(respuestas);
    return {
      useOpenInputUi: false,
      openQuestionNumbers: [],
      groupedAnswers: groupedAnswers || [],
      promptBlob,
    };
  }

  if (partNumber === 1) {
    const groupedAnswers = buildExamModeMcqGroupsForPart(partNumber, question, desc, {
      includeExample: true,
    });
    if (groupedAnswers?.length) {
      return {
        useOpenInputUi: false,
        openQuestionNumbers: [],
        groupedAnswers,
        promptBlob,
      };
    }
  }

  /** B2 Listening: MCQ for 10/12/13; sentence completion (open) for 11 only. */
  if (partNumber >= 10 && partNumber <= 13) {
    if (partNumber === 11) {
      const openNums = inferOpenQuestionNumbersFromPrompt(promptBlob, partNumber);
      const openAnswerMap = getOpenAnswerMap(
        question?.respuestasAbiertas || [],
        respuestas,
        openNums,
      );
      const fromAnswers = [...openAnswerMap.keys()].sort((a, b) => a - b);
      const openQuestionNumbers =
        openNums.length > 0
          ? openNums
          : fromAnswers.length > 0
            ? fromAnswers
            : [];
      return {
        useOpenInputUi: true,
        openQuestionNumbers,
        groupedAnswers: [],
        promptBlob,
      };
    }
    const groupedAnswers =
      buildExamModeMcqGroupsForPart(partNumber, question, desc) || getGroupedAnswers(respuestas);
    return {
      useOpenInputUi: false,
      openQuestionNumbers: [],
      groupedAnswers: groupedAnswers || [],
      promptBlob,
    };
  }

  const openNums = inferOpenQuestionNumbersFromPrompt(promptBlob, partNumber);
  if (openNums.length > 0) {
    return {
      useOpenInputUi: true,
      openQuestionNumbers: openNums,
      groupedAnswers: [],
      promptBlob,
    };
  }

  const groupedAnswers =
    buildExamModeMcqGroupsForPart(partNumber, question, desc) || getGroupedAnswers(respuestas);
  return {
    useOpenInputUi: false,
    openQuestionNumbers: [],
    groupedAnswers: groupedAnswers || [],
    promptBlob,
  };
}

/**
 * MCQ groups aligned with the exam UI (Part 1 cloze + Reading 5–7 synthetic groups).
 */
export function buildExamModeMcqGroupsForPart(
  partNumber,
  question,
  partDescripcion = '',
  { includeExample = false } = {},
) {
  const respuestas = question?.respuestas || [];
  const raw = question?.enunciado || '';
  const preguntaId = question?.preguntaId || question?.id || '';
  const desc = String(partDescripcion || '').replace(/\r\n/g, '\n').trim();

  if (partNumber === 1) {
    const textoExtracted = extractTextoBloque(raw, 1, { levelSlug: 'b2' });
    const fallback = splitEnunciadoAndTextFallback(raw);
    let texto = (textoExtracted || fallback.texto || '').trim();
    let parsed = [];
    if (texto) {
      const split = splitPart1TextoYPreguntas(texto);
      parsed = parsePart1QuestionOptions(split.preguntas);
    }
    if (parsed.length) {
      const correctLetterByQuestion = buildCorrectLetterMapFromRespuestas(
        respuestas,
        /^(\d{1,2})\s+([A-D])\b/i,
      );
      const groups = buildPart1McqGroups({
        parsed,
        correctLetterByQuestion,
        preguntaId,
        rawPregunta: raw,
        descripcion: desc,
        respuestas,
        includeExample,
      });
      if (groups?.length) return groups;
    }
  }

  if (partNumber >= 5 && partNumber <= 7) {
    const synthetic = buildReadingSyntheticMcqGroups(partNumber, raw, preguntaId, respuestas);
    if (synthetic?.length) return synthetic;
  }

  return getGroupedAnswers(respuestas);
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

/** Re-label global exam part numbers to local section numbers (e.g. 11 → Part 2 in Listening). */
export function remapSectionPartNumbersInText(text, partMin, partMax = null) {
  if (!text || partMin == null) return text;
  const min = Number(partMin);
  const max = partMax != null ? Number(partMax) : null;
  return String(text).replace(/\b(Part|Parte)\s*[:–—-]?\s*(\d+)\b/gi, (full, word, digits) => {
    const n = Number(digits);
    if (!Number.isFinite(n) || n < min || (max != null && n > max)) return full;
    const local = n - min + 1;
    const sep = /[:–—-]/.test(full.slice(word.length, word.length + 3)) ? ': ' : ' ';
    return /^parte$/i.test(word) ? `Parte${sep}${local}` : `Part${sep}${local}`;
  });
}

/** @param {Array<{ type?: string, text?: string }>} blocks */
export function remapSectionPartNumbersInEnunciadoBlocks(blocks, partMin, partMax = null) {
  if (!blocks?.length || partMin == null) return blocks || [];
  return blocks.map((block) =>
    block?.text
      ? { ...block, text: remapSectionPartNumbersInText(block.text, partMin, partMax) }
      : block,
  );
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
      if (/^(?:part|parte)\s*[:–—-]?\s*\d+\b/i.test(line)) {
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
