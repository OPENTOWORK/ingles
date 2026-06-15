/**
 * Build fixed preview JSON for B2 Exam 1 Parts 3–7 from dump (no AI generation).
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dumpPath = path.join(root, 'scripts', 'generated', 'dump-exam1-b2.json');
const dump = JSON.parse(readFileSync(dumpPath, 'utf8'));

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');

function partItem(n) {
  const p = dump.partes.find((x) => x.partNumber === n);
  return p?.items?.[0] || null;
}

function parseOpenAnswers(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const m = String(row).trim().match(/^(\d{1,2})\s+(.+)$/);
    if (!m) continue;
    const num = Number(m[1]);
    const word = m[2].trim();
    if (!map.has(num)) map.set(num, word);
  }
  return map;
}

function parseMcqKey(rows = []) {
  const map = new Map();
  for (const row of rows) {
    if (row?.correcta !== true) continue;
    const m = String(row.respuesta || '').trim().match(/^(\d{1,2})\s+([A-G])\b/i);
    if (m) map.set(Number(m[1]), m[2].toUpperCase());
  }
  return map;
}

function splitPassageTitleBody(text = '') {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { title: '', body: '' };
  if (lines[0].toLowerCase() === 'text') lines.shift();
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n').trim();
  return { title, body };
}

function buildPart3() {
  const item = partItem(3);
  const enunciado = item.enunciado.replace(/^Text\n/, '');
  const { title, body } = splitPassageTitleBody(`Text\n${enunciado}`);
  const answers = parseOpenAnswers(item.respuestasAbiertas);
  const stems = {
    17: 'ENVIRONMENT',
    18: 'HEALTH',
    19: 'ACTIVE',
    20: 'STRENGTH',
    21: 'RELAX',
    22: 'SUCCESS',
    23: 'RESPONSIBLE',
    24: 'COMPETE',
  };
  const questions = Object.entries(stems).map(([n, stem]) => ({
    id: `q${n}`,
    number: Number(n),
    type: 'word-formation',
    stem,
  }));
  const modelAnswers = [...answers.entries()].map(([n, answer]) => ({
    id: `q${n}`,
    number: Number(n),
    answer: answer.replace(/^\d+\s+/, ''),
  }));
  return {
    partNumber: 3,
    title,
    passage: body,
    example: {
      sentence: 'We should protect (0) ___ (NATURE) spaces to ensure a healthy planet for future generations.',
      answer: 'natural',
    },
    questions,
    modelAnswers,
  };
}

function buildPart4() {
  const answers = parseOpenAnswers(partItem(4).respuestasAbiertas);
  const items = [
    {
      num: 25,
      sentence1: 'Not many people find it easy to adjust to life in a big city.',
      keyword: 'HARDLY',
      sentence2: '____________________ it easy to adjust to life in a big city.',
      answer: 'Hardly anyone finds',
    },
    {
      num: 26,
      sentence1: 'The city has introduced new laws to reduce pollution.',
      keyword: 'BY',
      sentence2: 'Pollution is being reduced ____________________ new laws.',
      answer: 'by the introduction of',
    },
    {
      num: 27,
      sentence1: 'She regrets not moving to the city when she had the chance.',
      keyword: 'WISHES',
      sentence2: 'She ____________________ to the city when she had the chance.',
      answer: 'wishes she had moved',
    },
    {
      num: 28,
      sentence1: "There aren't as many public parks in this city as in my hometown.",
      keyword: 'FEWER',
      sentence2: 'This city has ____________________ my hometown.',
      answer: 'fewer public parks than',
    },
    {
      num: 29,
      sentence1: "It isn't necessary to use a smartphone for this task.",
      keyword: 'NEED',
      sentence2: 'You ____________________ a smartphone for this task.',
      answer: 'do not need to use',
    },
    {
      num: 30,
      sentence1: 'Even though the subway is crowded, it is still the fastest way to travel.',
      keyword: 'SPITE',
      sentence2: 'In ____________________ crowded, it is still the fastest way to travel.',
      answer: 'spite of the subway being',
    },
  ];
  return {
    partNumber: 4,
    directions: `For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).

Example:
0. I last saw him two years ago.
seen
I haven't __________________ him for two years.
Answer: haven't seen`,
    questions: items.map((it) => ({
      id: `q${it.num}`,
      number: it.num,
      type: 'transformation',
      sentence1: it.sentence1,
      keyword: it.keyword,
      sentence2Start: it.sentence2,
    })),
    modelAnswers: items.map((it) => ({
      id: `q${it.num}`,
      number: it.num,
      answer: answers.get(it.num) || it.answer,
    })),
  };
}

function buildPart5() {
  const item = partItem(5);
  const raw = item.enunciado;
  const textBlock = raw.split(/\nText\n/i)[1]?.split(/\nQuestions\n/i)[0]?.trim() || '';
  const { title, body } = splitPassageTitleBody(`Text\n${textBlock}`);
  const qBlock = raw.split(/\nQuestions\n/i)[1]?.trim() || '';
  const chunks = [];
  for (const chunk of qBlock.split(/\n(?=\d{1,2}\.\s+)/)) {
    const m = chunk.match(/^(\d{1,2})\.\s*([\s\S]+)$/);
    if (!m) continue;
    const questionNumber = Number(m[1]);
    const rest = m[2].trim();
    const idxA = rest.search(/\bA\.\s+/i);
    if (idxA < 0) continue;
    const stem = rest.slice(0, idxA).trim();
    const optTail = rest.slice(idxA);
    const options = {};
    for (const L of ['A', 'B', 'C', 'D']) {
      const next = L === 'D' ? null : ['B', 'C', 'D'][['A', 'B', 'C'].indexOf(L)];
      const re = new RegExp(`${L}\\.\\s+`, 'i');
      const start = optTail.search(re);
      if (start < 0) continue;
      const from = start + optTail.slice(start).match(re)[0].length;
      let end = optTail.length;
      if (next) {
        const nre = new RegExp(`\\b${next}\\.\\s+`, 'i');
        const npos = optTail.slice(from).search(nre);
        if (npos >= 0) end = from + npos;
      }
      options[L] = optTail.slice(from, end).trim();
    }
    chunks.push({ questionNumber, stem, options });
  }
  const key = parseMcqKey(item.respuestasMcq);
  const questions = chunks.map(({ questionNumber, stem, options }) => ({
    id: `q${questionNumber}`,
    number: questionNumber,
    type: 'multiple-choice',
    prompt: stem,
    options: ['A', 'B', 'C', 'D'].map((L) => ({ letter: L, text: options[L] || L })),
    answer: key.get(questionNumber) || 'A',
  }));
  return {
    partNumber: 5,
    directions:
      'You are going to read a magazine article about unusual hobbies. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    title,
    passage: body,
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

function buildPart6() {
  const item = partItem(6);
  const raw = item.enunciado;
  const textBlock = raw.split(/\nText\n/i)[1]?.split(/\nSentences\n/i)[0]?.trim() || '';
  let { title, body } = splitPassageTitleBody(`Text\n${textBlock}`);
  for (let oldN = 31; oldN <= 36; oldN += 1) {
    const newN = oldN + 6;
    body = body.replace(new RegExp(`\\(${oldN}\\)`, 'g'), `(${newN})`);
  }
  const sentBlock = raw.split(/\nSentences\n/i)[1]?.trim() || '';
  const poolLines = sentBlock.split(/\n(?=[A-G]\s)/).map((l) => l.trim()).filter(Boolean);
  const sentencePool = poolLines.map((l) => l.replace(/^([A-G])\s+/, '$1 '));
  const keyOld = parseMcqKey(item.respuestasMcq);
  const questions = [];
  for (let oldN = 31; oldN <= 36; oldN += 1) {
    const newN = oldN + 6;
    questions.push({
      id: `q${newN}`,
      number: newN,
      type: 'gapped-text',
      answer: keyOld.get(oldN) || 'A',
    });
  }
  return {
    partNumber: 6,
    directions:
      'You are going to read an article about the rise of community projects in modern towns. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.',
    title,
    passage: body,
    sentencePool,
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

const PART7_STEMS = [
  [37, 'was concerned about the cost of starting again in a competitive field?'],
  [38, 'enjoys seeing a clear physical result from their work?'],
  [39, 'completed training for the new profession while continuing their old job?'],
  [40, 'was warned by people at work that the change could be risky?'],
  [41, 'appreciates not being tied to one workplace or fixed timetable?'],
  [42, 'prefers a practical, physically active job to working at a desk?'],
  [43, 'uses experience from a previous technical career to explain things clearly?'],
  [44, 'feels rewarded when other people understand difficult ideas?'],
  [45, 'accepts tiring working conditions because the work feels more personally meaningful?'],
  [46, 'combines analytical ability from a previous job with creative work?'],
];

function buildPart7() {
  const item = partItem(7);
  const profilesBlock = item.enunciado.split(/\nTexts\n/i)[1]?.trim() || '';
  const sections = [];
  for (const part of profilesBlock.split(/\n_{3,}\n|________________________________________\n/)) {
    const m = part.trim().match(/^([A-D])\s*[–-]\s*([^\n]+)\n+([\s\S]*)$/i);
    if (!m) continue;
    sections.push({
      letter: m[1].toUpperCase(),
      name: m[2].trim(),
      text: m[3].trim(),
    });
  }
  const keyOld = parseMcqKey(item.respuestasMcq);
  const questions = PART7_STEMS.map(([oldN, tail]) => {
    const newN = oldN + 6;
    const prompt = `Who ${tail.charAt(0).toLowerCase()}${tail.slice(1)}`;
    return {
      id: `q${newN}`,
      number: newN,
      type: 'matching',
      prompt,
      answer: keyOld.get(oldN) || 'A',
    };
  });
  return {
    partNumber: 7,
    directions:
      'You are going to read four short texts about people who changed career. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
    sections,
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

const builders = {
  3: buildPart3,
  4: buildPart4,
  5: buildPart5,
  6: buildPart6,
  7: buildPart7,
};

const summary = [];

for (const partNumber of [3, 4, 5, 6, 7]) {
  const generated = builders[partNumber]();
  const validation = validateGeneratedExamPart('b2', partNumber, generated);
  const outPath = path.join(root, 'scripts', 'generated', `preview-exam1-part${partNumber}-b2.json`);
  const payload = {
    levelSlug: 'b2',
    examSlot: 1,
    partNumber,
    generated,
    validation,
  };
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  summary.push({
    partNumber,
    path: outPath,
    validationOk: validation.ok,
    errors: validation.errors,
    warnings: validation.warnings,
  });
  console.log(`Part ${partNumber}: validation ${validation.ok ? 'OK' : 'FAILED'}`);
  if (validation.errors?.length) console.log('  errors:', validation.errors);
  if (validation.warnings?.length) console.log('  warnings:', validation.warnings);
}

writeFileSync(
  path.join(root, 'scripts', 'generated', 'exam1-parts-3-7-preview-summary.json'),
  JSON.stringify(summary, null, 2),
  'utf8',
);

console.log(JSON.stringify(summary, null, 2));
