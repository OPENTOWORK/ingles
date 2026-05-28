/**
 * Parsers for A2 Key Reading & Writing (official QP format).
 */

function parseOptionLine(line) {
  const trimmed = String(line || '').trim();
  const imageOnly = trimmed.match(/^([A-H])\)\s*IMAGE:\s*(\S+)/i);
  if (imageOnly) {
    const letter = imageOnly[1].toUpperCase();
    return {
      letter,
      text: letter,
      imageUrl: imageOnly[2],
      formattedText: letter,
    };
  }
  let m = trimmed.match(/^([A-H])\)\s*(.+)$/i);
  if (m) {
    const letter = m[1].toUpperCase();
    const text = m[2].trim();
    const img = text.match(/^IMAGE:\s*(\S+)/i);
    if (img) {
      return { letter, text: letter, imageUrl: img[1], formattedText: letter };
    }
    return { letter, text, formattedText: text ? `${letter}) ${text}` : letter };
  }
  m = trimmed.match(/^([A-H])\s+(.+)$/i);
  if (m) {
    const letter = m[1].toUpperCase();
    const text = m[2].trim();
    return { letter, text, formattedText: `${letter}) ${text}` };
  }
  m = trimmed.match(/^([A-H])$/i);
  if (m) {
    const letter = m[1].toUpperCase();
    return { letter, text: letter, formattedText: letter };
  }
  return null;
}

function parseQuestionsBlock(block) {
  const lines = String(block || '')
    .split('\n')
    .map((l) => l.trim());

  const items = [];
  let current = null;
  let autoNum = 0;
  const messageLines = [];
  let optionLines = [];

  const flush = () => {
    if (!current) return;
    const message = messageLines.join('\n').trim();
    const options = optionLines.map(parseOptionLine).filter(Boolean);
    const prompt =
      messageLines.length > 1 && /[?]/.test(messageLines[messageLines.length - 1])
        ? messageLines[messageLines.length - 1]
        : '';
    const noticeText = prompt ? messageLines.slice(0, -1).join('\n').trim() : message;
    current.message = noticeText || message;
    current.prompt = prompt || '';
    current.options = options;
    if (!current.stimulusType) current.stimulusType = '';
    items.push(current);
    messageLines.length = 0;
    optionLines.length = 0;
    current = null;
  };

  for (const line of lines) {
    if (!line) continue;
    if (/^Questions$/i.test(line)) continue;
    if (/^Part\s+\d/i.test(line)) continue;
    if (/^Questions\s+\d/i.test(line)) continue;
    if (/^For each question/i.test(line)) continue;
    if (/^Example:/i.test(line)) continue;
    if (/^Answer:/i.test(line)) continue;
    if (/^Text$/i.test(line)) continue;

    if (/^\d{1,2}$/.test(line)) {
      flush();
      current = {
        questionNumber: Number(line),
        message: '',
        prompt: '',
        options: [],
        imageUrl: '',
        stimulusType: '',
      };
      continue;
    }

    const stimLine = line.match(/^STIMULUS:\s*(\w+)/i);
    if (stimLine && current) {
      current.stimulusType = stimLine[1].toLowerCase();
      continue;
    }

    const stimulusImg = line.match(/^IMAGE:\s*(\S+)/i);
    if (stimulusImg) {
      if (!current) {
        flush();
        autoNum += 1;
        current = {
          questionNumber: autoNum,
          message: '',
          prompt: '',
          options: [],
          imageUrl: stimulusImg[1],
          stimulusType: '',
        };
      } else {
        current.imageUrl = stimulusImg[1];
      }
      continue;
    }

    if (parseOptionLine(line)) {
      optionLines.push(line);
      continue;
    }

    if (current) messageLines.push(line);
  }
  flush();

  return items.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * @param {string} rawEnunciado
 * @returns {Array<{
 *   questionNumber: number,
 *   message: string,
 *   prompt: string,
 *   options: Array<{ letter: string, text: string, formattedText: string }>,
 * }>}
 */
export function parseA2QuestionsFromEnunciado(rawEnunciado) {
  const normalized = String(rawEnunciado || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const qIdx = normalized.search(/\nQuestions\s*\n/i);
  let block = qIdx >= 0 ? normalized.slice(qIdx) : normalized;

  let items = parseQuestionsBlock(block);
  const withOptions = items.filter((q) => q.options.length >= 2);
  if (withOptions.length >= 2) return items;

  const textIdx = normalized.search(/\nText\s*\n/i);
  if (textIdx >= 0) {
    const afterText = normalized.slice(textIdx);
    const q2 = afterText.search(/\nQuestions\s*\n/i);
    block = q2 >= 0 ? afterText.slice(q2) : afterText;
    items = parseQuestionsBlock(block);
    if (items.filter((q) => q.options.length >= 2).length >= 2) return items;
  }

  const firstQ = normalized.search(/\n([1-9]|[1-2][0-9]|3[0-2])\n/);
  if (firstQ >= 0) {
    items = parseQuestionsBlock(normalized.slice(firstQ));
  }

  return items;
}

/**
 * MCQ groups from enunciado when levels_respuestas is empty or incomplete.
 */
export function buildMcqGroupsFromEnunciado(rawEnunciado, respuestas = []) {
  const parsed = parseA2QuestionsFromEnunciado(rawEnunciado);
  if (!parsed.length) return [];

  const correctByQ = new Map();
  for (const row of respuestas || []) {
    if (row?.correcta !== true) continue;
    const t = String(row.respuesta || '').trim();
    const m = t.match(/^(\d{1,2})\s+([A-H])\b/i);
    if (m) correctByQ.set(Number(m[1]), m[2].toUpperCase());
  }

  return parsed
    .filter((q) => q.options.length >= 2)
    .map((q) => ({
      questionNumber: q.questionNumber,
      prompt: q.prompt,
      questionStem: q.message || q.prompt,
      stimulusImageUrl: q.imageUrl || '',
      options: q.options.map((opt) => ({
        id: `a2-enun-${q.questionNumber}-${opt.letter}`,
        respuesta: `${q.questionNumber} ${opt.letter}) ${opt.text}`.trim(),
        formattedText: opt.formattedText,
        imageUrl: opt.imageUrl,
        correcta: opt.letter === (correctByQ.get(q.questionNumber) || ''),
      })),
    }));
}

export function parseA2Part2Profiles(texto = '') {
  const lines = String(texto || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const profiles = [];
  let current = null;
  const buf = [];

  const flush = () => {
    if (!current) return;
    current.text = buf.join(' ').trim();
    profiles.push(current);
    buf.length = 0;
    current = null;
  };

  for (const line of lines) {
    const m = line.match(/^([A-C])\)\s*(.+)$/i);
    if (m) {
      flush();
      current = { letter: m[1].toUpperCase(), name: m[2].trim(), text: '' };
      continue;
    }
    if (current) buf.push(line);
  }
  flush();
  return profiles;
}

export function parseA2Part2ProfileNames(texto = '') {
  return parseA2Part2Profiles(texto).map((p) => p.name);
}

/** Título e intro del panel Text (líneas antes del primer perfil A/B/C). */
export function parseA2Part2TextIntro(texto = '') {
  const lines = String(texto || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const intro = [];
  for (const line of lines) {
    if (/^[A-C]\)\s+/i.test(line)) break;
    intro.push(line);
  }
  return {
    title: intro[0] || '',
    subtitle: intro.length > 1 ? intro.slice(1).join(' ') : '',
  };
}

/** Instrucciones oficiales (bloque antes de «Text» en el enunciado). */
export function parseA2Part2Directions(rawEnunciado = '') {
  const normalized = String(rawEnunciado || '').replace(/\r\n/g, '\n').trim();
  const textIdx = normalized.search(/\nText\s*\n/i);
  let block = textIdx >= 0 ? normalized.slice(0, textIdx).trim() : normalized;
  block = block.replace(/^Part\s*2\s*\n?/i, '').trim();
  return block;
}

export function mergeA2McqPrompts(groupedAnswers, parsed) {
  const byNum = new Map(parsed.map((p) => [p.questionNumber, p]));
  return groupedAnswers.map((g) => {
    const extra = byNum.get(g.questionNumber);
    if (!extra) return g;
    const imageByLetter = new Map(
      (extra.options || []).filter((o) => o.imageUrl).map((o) => [o.letter, o.imageUrl]),
    );
    const options =
      imageByLetter.size > 0
        ? g.options.map((opt) => {
            const m = String(opt.formattedText || opt.respuesta || '').match(/^([A-H])\b/i);
            const letter = m?.[1]?.toUpperCase();
            const imageUrl = letter ? imageByLetter.get(letter) : undefined;
            return imageUrl ? { ...opt, imageUrl } : opt;
          })
        : g.options;
    const isNoticePart = g.questionNumber >= 1 && g.questionNumber <= 6;
    return {
      ...g,
      options,
      stimulusType: extra.stimulusType || g.stimulusType || '',
      stimulusImageUrl: extra.imageUrl || g.stimulusImageUrl || '',
      message: extra.message || g.message || '',
      prompt: isNoticePart ? extra.prompt || g.prompt : extra.prompt || extra.message || g.prompt,
      questionStem: isNoticePart
        ? extra.message || g.questionStem
        : extra.message || extra.prompt || g.questionStem,
    };
  });
}

export function extractA2MatchingOptionPool(linesOrText) {
  const raw = Array.isArray(linesOrText)
    ? linesOrText.map((l) => String(l || '').trim()).filter(Boolean)
    : String(linesOrText || '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
  const pool = [];
  for (const line of raw) {
    if (/^Questions$/i.test(line)) break;
    if (/^\d{1,2}$/.test(line)) break;
    const m = line.match(/^([A-H])\)\s*(.+)$/i) || line.match(/^([A-H])\s+(.+)$/i);
    if (m) pool.push(`${m[1].toUpperCase()}) ${m[2].trim()}`);
  }
  return pool;
}

export function parseA2MatchingSituations(preguntasBlock) {
  return parseA2QuestionsFromEnunciado(`Questions\n${preguntasBlock}`).map((q) => ({
    questionNumber: q.questionNumber,
    prompt: q.prompt || q.message,
  }));
}

export function buildA2MatchingMcqGroups(respuestas = [], optionPool = [], situations = []) {
  const lettersFromPool = optionPool
    .map((line) => {
      const m = line.match(/^([A-H])\)/i);
      return m ? m[1].toUpperCase() : '';
    })
    .filter(Boolean);
  const letters =
    lettersFromPool.length >= 3
      ? [...new Set(lettersFromPool)]
      : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const correctByQ = new Map();
  for (const row of respuestas || []) {
    if (row?.correcta !== true) continue;
    const t = String(row.respuesta || '').trim();
    const m = t.match(/^(\d{1,2})\s+([A-H])\b/i);
    if (m) correctByQ.set(Number(m[1]), m[2].toUpperCase());
  }

  const qNums = new Set();
  situations.forEach((s) => qNums.add(s.questionNumber));
  for (const row of respuestas || []) {
    const t = String(row.respuesta || '').trim();
    const m = t.match(/^(\d{1,2})\s+([A-H])\b/i);
    if (m) qNums.add(Number(m[1]));
  }
  if (qNums.size === 0) [1, 2, 3, 4, 5].forEach((n) => qNums.add(n));

  return [...qNums]
    .sort((a, b) => a - b)
    .map((questionNumber) => {
      const correctLetter = correctByQ.get(questionNumber) || '';
      const prompt = situations.find((s) => s.questionNumber === questionNumber)?.prompt || '';
      return {
        questionNumber,
        prompt,
        options: letters.map((letter) => ({
          id: `a2-m-${questionNumber}-${letter}`,
          respuesta: `${questionNumber} ${letter}`,
          formattedText: `${letter}) ${optionPool.find((l) => l.startsWith(`${letter})`))?.replace(/^[A-H]\)\s*/i, '') || letter}`,
          correcta: letter === correctLetter,
        })),
      };
    });
}

/** Razón legible cuando no hay MCQ que mostrar (admin). */
export function describeA2PartDataGap({ partNumber, enunciado, respuestasCount }) {
  const hasEnun = String(enunciado || '').trim().length > 40;
  const hasResp = (respuestasCount || 0) > 0;
  if (!hasEnun && !hasResp) return 'No hay enunciado ni respuestas guardados para esta parte.';
  if (!hasResp) {
    const parsed = parseA2QuestionsFromEnunciado(enunciado);
    if (parsed.some((q) => q.options.length >= 2)) {
      return 'Hay texto en el enunciado pero faltan respuestas en la base de datos; la app intentará leer las opciones del enunciado.';
    }
    return 'El enunciado no contiene un bloque Questions con opciones A/B/C reconocibles.';
  }
  if (partNumber >= 5 && partNumber <= 7) {
    return 'Esta parte es de escritura u open cloze; no usa opciones A/B/C.';
  }
  return 'Las respuestas en la base de datos no tienen el formato esperado (p. ej. "1 A) texto").';
}
