function arr(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function parseOption(raw, fallbackLetter = '') {
  if (typeof raw === 'string') {
    const m = raw.trim().match(/^([A-H])\)\s*(.*)$/i) || raw.trim().match(/^([A-H])\s+(.*)$/i);
    if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  }
  if (raw && typeof raw === 'object') {
    const letter = String(raw.letter || raw.id || fallbackLetter).replace(/[^A-H]/gi, '').charAt(0).toUpperCase();
    return { letter, text: String(raw.text || raw.label || raw.name || raw.title || '').trim() };
  }
  return { letter: fallbackLetter, text: String(raw || '').trim() };
}

function answerFor(gen, q, index) {
  const answers = arr(gen.modelAnswers);
  const byId = answers.find((a) => q?.id != null && a?.id === q.id);
  const byNumber = answers.find((a) => Number(a?.number) === Number(q?.number));
  const byIndex = answers[index];
  const raw = byId?.answer ?? byNumber?.answer ?? byIndex?.answer ?? byIndex ?? q?.answer ?? '';
  return String(raw).trim().toUpperCase();
}

function push(lines, text) {
  String(text || '').split('\n').forEach((line) => {
    if (line.trim()) lines.push(line.trimEnd());
  });
}

export function buildB1ReadingEnunciadoFromGenerated(gen = {}, partNumber) {
  const p = Number(partNumber);
  const questions = arr(gen.questions);
  const lines = [];
  if (gen.directions) push(lines, gen.directions);

  if (p === 1) {
    questions.forEach((q) => {
      lines.push('', String(q.number || ''));
      push(lines, q.text || q.message || q.notice || '');
      push(lines, q.prompt || q.question || '');
      arr(q.options).forEach((o) => push(lines, typeof o === 'string' ? o : `${o.letter || ''}) ${o.text || ''}`));
    });
    return lines.join('\n').trim();
  }

  if (p === 2) {
    questions.forEach((q) => {
      lines.push('', `${q.number || ''} ${q.prompt || q.description || ''}`.trim());
    });
    lines.push('', 'Texts');
    arr(gen.sections).forEach((sec, i) => {
      const letter = String(sec?.letter || 'ABCDEFGH'[i] || '').toUpperCase();
      lines.push(`${letter} ${sec?.name || sec?.title || ''}`.trim());
      push(lines, sec?.text || sec?.body || '');
      lines.push('');
    });
    return lines.join('\n').trim();
  }

  if ([3, 4, 5, 6].includes(p)) {
    if (gen.title) lines.push('', gen.title);
    if (gen.passage) push(lines, gen.passage);
  }

  if (p === 3) {
    lines.push('', 'Questions');
    questions.forEach((q) => {
      lines.push(`${q.number || ''} ${q.prompt || q.question || ''}`.trim());
      arr(q.options).forEach((o) => push(lines, typeof o === 'string' ? o : `${o.letter || ''}) ${o.text || ''}`));
      lines.push('');
    });
  } else if (p === 4) {
    lines.push('', 'Sentences');
    arr(gen.sentencePool).forEach((s, i) => {
      const parsed = parseOption(s, 'ABCDEFGH'[i] || '');
      lines.push(`${parsed.letter} ${parsed.text}`.trim());
    });
  } else if (p === 5) {
    lines.push('', 'Questions');
    questions.forEach((q) => {
      lines.push(String(q.number || ''));
      arr(q.options).forEach((o) => push(lines, typeof o === 'string' ? o : `${o.letter || ''}) ${o.text || ''}`));
      lines.push('');
    });
  }

  return lines.join('\n').trim();
}

export function buildB1ReadingAnswerRowsFromGenerated(gen = {}, partNumber) {
  const p = Number(partNumber);
  const questions = arr(gen.questions);
  const mcq = [];
  const open = [];

  if (p === 6) {
    questions.forEach((q, i) => {
      const answers = arr(gen.modelAnswers);
      const byId = answers.find((a) => q?.id != null && a?.id === q.id);
      const byNumber = answers.find((a) => Number(a?.number) === Number(q?.number));
      const byIndex = answers[i];
      const raw = byId?.answer ?? byNumber?.answer ?? byIndex?.answer ?? byIndex ?? q?.answer ?? '';
      open.push({ questionNumber: Number(q.number), text: String(raw).trim() });
    });
    return { mcq, open };
  }

  if (p === 2) {
    const pool = arr(gen.sections).map((sec, i) => ({
      letter: String(sec?.letter || 'ABCDEFGH'[i] || '').toUpperCase(),
      text: String(sec?.name || sec?.title || sec?.text || '').trim(),
    }));
    questions.forEach((q, i) => {
      const correct = answerFor(gen, q, i);
      pool.forEach((opt) => mcq.push({
        questionNumber: Number(q.number), letter: opt.letter, text: opt.text || opt.letter, correcta: opt.letter === correct,
      }));
    });
    return { mcq, open };
  }

  if (p === 4) {
    const pool = arr(gen.sentencePool).map((raw, i) => parseOption(raw, 'ABCDEFGH'[i] || ''));
    questions.forEach((q, i) => {
      const correct = answerFor(gen, q, i);
      pool.forEach((opt) => mcq.push({
        questionNumber: Number(q.number), letter: opt.letter, text: opt.text || opt.letter, correcta: opt.letter === correct,
      }));
    });
    return { mcq, open };
  }

  questions.forEach((q, i) => {
    const correct = answerFor(gen, q, i);
    arr(q.options).forEach((raw, oi) => {
      const opt = parseOption(raw, 'ABCD'[oi] || '');
      mcq.push({
        questionNumber: Number(q.number), letter: opt.letter, text: opt.text || opt.letter, correcta: opt.letter === correct,
      });
    });
  });
  return { mcq, open };
}
