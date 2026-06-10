/** B2 First Writing — task defaults, parsing and AI context builders. */

export const B2_WRITING_WORD_MIN = 140;
export const B2_WRITING_WORD_MAX = 190;

export const B2_WRITING_PART1_DEFAULT = {
  writingType: 'essay',
  title: 'Writing Part 1 — Essay',
  instructions:
    'Write an essay in 140–190 words. You must answer the question and include the three points below.',
  question: 'Some people say that fast food is always a bad thing to eat. Do you agree?',
  points: ['health', 'price and convenience', 'your own idea'],
  wordMin: B2_WRITING_WORD_MIN,
  wordMax: B2_WRITING_WORD_MAX,
};

export const B2_WRITING_PART2_DEFAULT = {
  title: 'Writing Part 2 — Choose one task',
  instructions: 'Choose ONE of the tasks below and write your answer in 140–190 words.',
  wordMin: B2_WRITING_WORD_MIN,
  wordMax: B2_WRITING_WORD_MAX,
  options: [
    {
      id: 1,
      writingType: 'article',
      label: 'Article',
      context: 'You see this announcement on an English-language website:',
      task:
        'Articles wanted: Healthy habits for busy students\n\nWhat healthy habits would you recommend to students who have little free time?\n\nWrite an article giving advice and examples.',
    },
    {
      id: 2,
      writingType: 'email',
      label: 'Email / Letter',
      context: 'You have received an email from your English-speaking friend Sam:',
      task:
        'I’m visiting your town next month and I’d like to try some local food. Where should I go and what should I eat?\n\nWrite your email.',
    },
    {
      id: 3,
      writingType: 'review',
      label: 'Review',
      context: 'You see this announcement in an English-language magazine:',
      task:
        'Reviews wanted: A restaurant I would recommend\n\nWrite a review of a restaurant or café you know. Say what the food is like and whether you would recommend it.',
    },
    {
      id: 4,
      writingType: 'report',
      label: 'Report',
      context: 'Your English teacher has asked you to write a report about food options at your school or college.',
      task:
        'Write a report explaining what is good, what could be improved and making recommendations.',
    },
  ],
};

const WRITING_PART_LABELS = {
  8: 'Writing Part 1',
  9: 'Writing Part 2',
};

export function getB2WritingPartLabel(partNumber) {
  return WRITING_PART_LABELS[Number(partNumber)] || null;
}

export function getB2WritingPartTabLabel(part) {
  const n = Number(part?.partNumber || String(part?.nombre || '').match(/\d+/)?.[0] || 0);
  if (n === 8) return 'Writing Part 1';
  if (n === 9) return 'Writing Part 2';
  return null;
}

function isLegacySummariseTask(text) {
  return /two short texts|summaris|evaluating the key points|discussing both texts|text 1:|text 2:/i.test(
    String(text || ''),
  );
}

function parseWordLimit(text, fallbackMin, fallbackMax) {
  const m = String(text || '').match(/Word limit:\s*(\d+)\s*[–\-—]\s*(\d+)/i);
  if (!m) return { wordMin: fallbackMin, wordMax: fallbackMax };
  return { wordMin: Number(m[1]) || fallbackMin, wordMax: Number(m[2]) || fallbackMax };
}

function parsePointsBlock(text) {
  const section = String(text || '').match(
    /(?:You should write about:|Points to include:|Required points:|Notes:)\s*\n([\s\S]*?)(?:\n(?:Instructions|Word limit)|$)/i,
  );
  if (!section) return [];

  return section[1]
    .split('\n')
    .map((line) => line.replace(/^\d+[\).\s]+/, '').replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function parseQuestion(text) {
  const raw = String(text || '');
  const labelled = raw.match(/(?:^|\n)\s*(?:Question:|Essay question:|Topic:)\s*(.+)/i);
  if (labelled) return labelled[1].trim();

  const instr = raw.match(/Instructions:\s*\n([\s\S]*?)(?:\nWord limit:|$)/i);
  if (instr) {
    const body = instr[1].trim();
    const firstLine = body.split('\n').find((l) => l.trim().length > 15);
    if (firstLine && !/write an essay|using all the notes/i.test(firstLine)) {
      return firstLine.trim();
    }
  }

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !/^text\s*\d/i.test(l) &&
        !/^instructions:/i.test(l) &&
        !/^word limit:/i.test(l) &&
        !/^writing part/i.test(l),
    );

  const candidate = lines.find(
    (l) =>
      l.includes('?') ||
      /do you agree|what is your opinion|some people say|should|whether/i.test(l),
  );
  return candidate || '';
}

/**
 * @param {string} [enunciado]
 * @param {typeof B2_WRITING_PART1_DEFAULT} [fallback]
 */
export function parseB2WritingPart1Task(enunciado = '', fallback = B2_WRITING_PART1_DEFAULT) {
  const raw = String(enunciado || '').trim();
  if (!raw || raw.length < 24 || isLegacySummariseTask(raw)) {
    return { ...fallback, fromDefault: true };
  }

  const { wordMin, wordMax } = parseWordLimit(raw, fallback.wordMin, fallback.wordMax);
  const points = parsePointsBlock(raw);
  const question = parseQuestion(raw);

  const instrMatch = raw.match(/Instructions:\s*\n([\s\S]*?)(?:\nWord limit:|$)/i);
  const instructions = instrMatch
    ? instrMatch[1].trim()
    : raw.includes('Write an essay')
      ? 'Write an essay in 140–190 words. You must answer the question and include the three points below.'
      : fallback.instructions;

  if (!question && points.length < 2) {
    return { ...fallback, fromDefault: true };
  }

  return {
    ...fallback,
    title: 'Writing Part 1 — Essay',
    instructions,
    question: question || fallback.question,
    points: points.length >= 2 ? points.slice(0, 5) : fallback.points,
    wordMin,
    wordMax,
    fromDefault: false,
  };
}

const FORMAT_LABELS = {
  article: 'Article',
  email: 'Email / Letter',
  letter: 'Email / Letter',
  review: 'Review',
  report: 'Report',
  story: 'Story',
};

function inferFormatFromPrompt(prompt, formatField) {
  const f = String(formatField || '').trim().toLowerCase();
  if (f && FORMAT_LABELS[f]) return f;
  const p = String(prompt || '').toLowerCase();
  if (/write an article|write a article/.test(p)) return 'article';
  if (/write your email|write an email|write a letter/.test(p)) return 'email';
  if (/write a review/.test(p)) return 'review';
  if (/write a report/.test(p)) return 'report';
  if (/write a story/.test(p)) return 'story';
  return 'article';
}

function splitPart2Options(raw) {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const chunks = text.split(/\n(?=\d+\s*\n)/).filter(Boolean);
  /** @type {Array<{ number: number, body: string }>} */
  const items = [];

  for (const chunk of chunks) {
    const m = chunk.match(/^(\d+)\s*\n([\s\S]*)$/);
    if (!m) continue;
    const number = Number(m[1]);
    const body = m[2].trim();
    // Options may be numbered 1–4 (Dralo content) or 2–5 (official-style numbering).
    if (number >= 1 && number <= 9 && body.length > 20) {
      items.push({ number, body });
    }
  }

  if (items.length >= 2) return items;

  const alt = text.split(/\n(?=Option\s+\d+)/i).filter((c) => /Option\s+\d+/i.test(c));
  if (alt.length >= 2) {
    return alt.map((block, i) => ({
      number: i + 1,
      body: block.replace(/^Option\s+\d+\s*[—–-]?\s*/i, '').trim(),
    }));
  }

  return [];
}

function parsePart2OptionBody(body, index) {
  const lines = String(body || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const writeIdx = lines.findIndex((l) => /^Write your/i.test(l));
  const promptLines = writeIdx >= 0 ? lines.slice(0, writeIdx) : lines.slice(0, -1);
  const taskLines = writeIdx >= 0 ? [...promptLines, lines[writeIdx]] : lines;

  const formatField = (lines.find((l) => /^Write your/i.test(l)) || '').replace(/^Write your\s+/i, '').replace(/\.$/, '');
  const writingType = inferFormatFromPrompt(body, formatField);
  const label = FORMAT_LABELS[writingType] || `Option ${index + 1}`;

  const context = promptLines[0] || '';
  const taskBody = taskLines.slice(context ? 1 : 0).join('\n') || body;

  return {
    id: index + 1,
    writingType,
    label,
    context,
    task: taskBody,
  };
}

/**
 * @param {string} [enunciado]
 * @param {typeof B2_WRITING_PART2_DEFAULT} [fallback]
 */
export function parseB2WritingPart2Task(enunciado = '', fallback = B2_WRITING_PART2_DEFAULT) {
  const raw = String(enunciado || '').trim();
  if (!raw || raw.length < 40) {
    return { ...fallback, fromDefault: true };
  }

  const { wordMin, wordMax } = parseWordLimit(raw, fallback.wordMin, fallback.wordMax);
  const introMatch = raw.match(/^([\s\S]*?)\n\d+\s*\n/);
  const instructions = introMatch
    ? introMatch[1].trim()
    : fallback.instructions;

  const chunks = splitPart2Options(raw);
  if (chunks.length < 2) {
    return { ...fallback, fromDefault: true };
  }

  const options = chunks.slice(0, 5).map((chunk, i) => parsePart2OptionBody(chunk.body, i));

  return {
    ...fallback,
    title: 'Writing Part 2 — Choose one task',
    instructions: instructions || fallback.instructions,
    wordMin,
    wordMax,
    options,
    fromDefault: false,
  };
}

export function buildB2WritingPart1ExamContext(task, studentAnswer) {
  const t = task || B2_WRITING_PART1_DEFAULT;
  const points = (t.points || []).map((p, i) => `${i + 1}. ${p}`).join('\n');
  return [
    'Exam: B2 Writing',
    'Writing Part: Part 1',
    `Writing type: ${t.writingType || 'essay'}`,
    `Word limit: ${t.wordMin || B2_WRITING_WORD_MIN}–${t.wordMax || B2_WRITING_WORD_MAX} words`,
    '',
    'Task:',
    t.question || '',
    '',
    'Required points:',
    points,
    '',
    'Student writing:',
    studentAnswer || '',
  ].join('\n');
}

export function buildB2WritingPart2ExamContext(option, taskMeta, studentAnswer) {
  const opt = option || {};
  const meta = taskMeta || B2_WRITING_PART2_DEFAULT;
  const taskText = [opt.context, opt.task].filter(Boolean).join('\n\n');
  return [
    'Exam: B2 Writing',
    'Writing Part: Part 2',
    `Writing type: ${opt.writingType || 'article'}`,
    `Word limit: ${meta.wordMin || B2_WRITING_WORD_MIN}–${meta.wordMax || B2_WRITING_WORD_MAX} words`,
    '',
    'Task:',
    taskText,
    '',
    'Student writing:',
    studentAnswer || '',
  ].join('\n');
}
