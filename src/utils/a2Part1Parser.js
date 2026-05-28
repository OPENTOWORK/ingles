/**
 * Parser del enunciado A2 Key Reading Part 1 (avisos, SMS, carteles + MCQ).
 */

function parseStimulusType(line) {
  const m = String(line || '').match(/^STIMULUS:\s*(\w+)/i);
  return m ? m[1].toLowerCase() : '';
}

/**
 * @param {string} rawEnunciado
 */
export function parseA2Part1Pack(rawEnunciado = '') {
  const normalized = String(rawEnunciado || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return { directions: '', example: null, items: [] };
  }

  const questionsIdx = normalized.search(/\nQuestions\s*\n/i);
  const directionsRaw =
    questionsIdx >= 0 ? normalized.slice(0, questionsIdx).trim() : normalized;

  let example = null;
  const exMatch = directionsRaw.match(/\nExample:\s*\n([\s\S]*?)(?=\n(?:Text|Questions)\s*\n|$)/i);
  if (exMatch) {
    const exBlock = exMatch[1].trim();
    const answerM = exBlock.match(/\nAnswer:\s*([A-C])/i);
    const lines = exBlock
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^Answer:/i.test(l) && !/^The /i.test(l));
    example = {
      body: lines.filter((l) => !/^[A-C]\)/i.test(l)).join('\n'),
      options: lines.filter((l) => /^[A-C]\)/i.test(l)),
      answer: answerM?.[1]?.toUpperCase() || '',
    };
  }

  const directions = directionsRaw
    .replace(/\nExample:[\s\S]*/i, '')
    .replace(/\nText\s*\n?$/i, '')
    .trim();

  const qBlock = questionsIdx >= 0 ? normalized.slice(questionsIdx) : '';
  const items = parseA2Part1Items(qBlock);

  return { directions, example, items };
}

function parseA2Part1Items(block) {
  const lines = String(block || '')
    .split('\n')
    .map((l) => l.trim());

  const items = [];
  let current = null;
  const bodyLines = [];
  let optionLines = [];
  let autoNum = 0;

  const flush = () => {
    if (!current) return;
    const body = bodyLines.join('\n').trim();
    const options = optionLines
      .map((line) => {
        const m = line.match(/^([A-C])\)\s*(.+)$/i);
        return m ? { letter: m[1].toUpperCase(), text: m[2].trim() } : null;
      })
      .filter(Boolean);

    let prompt = '';
    let message = body;
    const bodyParts = body.split('\n').map((l) => l.trim()).filter(Boolean);
    if (bodyParts.length > 1 && /\?$/.test(bodyParts[bodyParts.length - 1])) {
      prompt = bodyParts[bodyParts.length - 1];
      message = bodyParts.slice(0, -1).join('\n');
    }

    current.message = message;
    current.prompt = prompt;
    current.options = options;
    items.push(current);
    bodyLines.length = 0;
    optionLines.length = 0;
    current = null;
  };

  for (const line of lines) {
    if (!line || /^Questions$/i.test(line)) continue;

    if (/^\d{1,2}$/.test(line)) {
      flush();
      current = {
        questionNumber: Number(line),
        stimulusType: '',
        imageUrl: '',
        message: '',
        prompt: '',
        options: [],
      };
      continue;
    }

    const stim = parseStimulusType(line);
    if (stim && current) {
      current.stimulusType = stim;
      continue;
    }

    const img = line.match(/^IMAGE:\s*(\S+)/i);
    if (img) {
      if (!current) {
        flush();
        autoNum += 1;
        current = {
          questionNumber: autoNum,
          stimulusType: '',
          imageUrl: img[1],
          message: '',
          prompt: '',
          options: [],
        };
      } else {
        current.imageUrl = img[1];
      }
      continue;
    }

    if (/^[A-C]\)/i.test(line)) {
      optionLines.push(line);
      continue;
    }

    if (current) bodyLines.push(line);
  }
  flush();

  return items.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * Construye grupos MCQ solo desde el bloque Questions del enunciado (sin filas en BD).
 */
export function buildPart1GroupsFromPackItems(items = [], respuestas = []) {
  const correctByQ = new Map();
  for (const row of respuestas || []) {
    if (row?.correcta !== true) continue;
    const t = String(row.respuesta || '').trim();
    const m = t.match(/^(\d{1,2})\s+([A-C])\b/i);
    if (m) correctByQ.set(Number(m[1]), m[2].toUpperCase());
  }

  return items.map((item) => {
    const qn = item.questionNumber;
    const correctLetter = correctByQ.get(qn) || '';
    return {
      questionNumber: qn,
      stimulusType: item.stimulusType || '',
      stimulusImageUrl: item.imageUrl || '',
      message: item.message || '',
      prompt: item.prompt || '',
      questionStem: item.message || '',
      options: (item.options || []).map((opt) => ({
        id: `a2-p1-pack-${qn}-${opt.letter}`,
        respuesta: `${qn} ${opt.letter}) ${opt.text}`.trim(),
        formattedText: `${opt.letter}) ${opt.text}`,
        correcta: opt.letter === correctLetter,
      })),
    };
  });
}

/**
 * Fusiona items del enunciado con grupos MCQ de la BD.
 */
export function mergeA2Part1Groups(mcqGroups = [], part1Items = []) {
  const byNum = new Map(part1Items.map((i) => [i.questionNumber, i]));
  return mcqGroups.map((g) => {
    const extra = byNum.get(g.questionNumber) || {};
    const imageByLetter = new Map(
      (extra.options || []).filter((o) => o.imageUrl).map((o) => [o.letter, o.imageUrl]),
    );
    return {
      ...g,
      stimulusType: extra.stimulusType || g.stimulusType || '',
      stimulusImageUrl: extra.imageUrl || g.stimulusImageUrl || '',
      message: extra.message || g.message || '',
      prompt: extra.prompt || g.prompt || '',
      questionStem: extra.message || g.questionStem || '',
      options: (g.options || []).map((opt) => {
        const m = String(opt.formattedText || opt.respuesta || '').match(/^([A-C])\b/i);
        const letter = m?.[1]?.toUpperCase();
        const imageUrl = letter ? imageByLetter.get(letter) : undefined;
        return imageUrl ? { ...opt, imageUrl } : opt;
      }),
    };
  });
}
