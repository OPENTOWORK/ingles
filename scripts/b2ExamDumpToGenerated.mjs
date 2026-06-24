/**
 * Convert dump-b2-exam.mjs JSON into generated exam-part objects for validation/review.
 */
export function parseOpenAnswers(rows = []) {
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

export function parseMcqKey(rows = []) {
  const map = new Map();
  for (const row of rows) {
    if (row?.correcta !== true) continue;
    const m = String(row.respuesta || '').trim().match(/^(\d{1,2})\s+([A-G])\b/i);
    if (m) map.set(Number(m[1]), m[2].toUpperCase());
  }
  return map;
}

export function splitPassageTitleBody(text = '') {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { title: '', body: '' };
  if (lines[0].toLowerCase() === 'text') lines.shift();
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n').trim();
  return { title, body };
}

function partItem(dump, n) {
  const p = dump.partes?.find((x) => x.partNumber === n);
  return p?.items?.[0] || null;
}

export function buildPart5FromDump(dump) {
  const item = partItem(dump, 5);
  if (!item) return null;
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
  const directions = raw.split(/\nText\n/i)[0]?.trim() || '';
  return {
    partNumber: 5,
    directions,
    title,
    passage: body,
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

export function buildPart7FromDump(dump) {
  const item = partItem(dump, 7);
  if (!item) return null;
  const raw = item.enunciado;
  const beforeTexts = raw.split(/\nTexts\n/i)[0]?.trim() || '';
  const profilesBlock = raw.split(/\nTexts\n/i)[1]?.trim() || '';
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

  const qLines = beforeTexts
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d{1,2}\s/.test(l));

  const key = parseMcqKey(item.respuestasMcq);
  const questions = qLines.map((line) => {
    const m = line.match(/^(\d{1,2})\s+(.+)$/);
    const num = Number(m[1]);
    let prompt = m[2].trim();
    if (!/^who\b/i.test(prompt) && /^which person/i.test(beforeTexts)) {
      prompt = `Who ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`;
    }
    return {
      id: `q${num}`,
      number: num,
      type: 'matching',
      prompt,
      answer: key.get(num) || 'A',
    };
  });

  const directionsLine = beforeTexts.split('\n')[0] || '';
  return {
    partNumber: 7,
    directions: directionsLine,
    matchingIntro:
      'For questions 43–52, choose from the people A–D below. The people may be chosen more than once.',
    sections,
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

export function buildPartFromDump(dump, partNumber) {
  if (partNumber === 5) return buildPart5FromDump(dump);
  if (partNumber === 7) return buildPart7FromDump(dump);
  return null;
}
