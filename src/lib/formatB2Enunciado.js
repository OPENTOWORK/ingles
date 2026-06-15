import { getB2PartDef } from '@/lib/b2ExamCatalog';

export function asGeneratedArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function pushLines(lines, text) {
  for (const line of String(text || '').split('\n')) {
    const t = line.trimEnd();
    if (t) lines.push(t);
  }
}

function parseOptionLetterText(opt) {
  if (typeof opt === 'string') {
    const m = opt.match(/^([A-H])\)\s*(.*)$/i) || opt.match(/^([A-H])\s+(.*)$/i);
    if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  }
  if (opt && typeof opt === 'object') {
    const letter = String(opt.letter || opt.id || '')
      .replace(/[^A-H]/gi, '')
      .charAt(0)
      .toUpperCase();
    const text = String(opt.text || opt.label || opt.sentence || '').trim();
    if (letter) return { letter, text };
  }
  return null;
}

/** Reading Part 5: one line per question — `31. stem A. opt B. opt C. opt D. opt` */
function formatReadingMcqQuestionLine(q) {
  const num = q.number ?? '';
  const stem = String(q.prompt || q.stem || '').trim();
  const opts = asGeneratedArray(q.options)
    .map(parseOptionLetterText)
    .filter(Boolean);
  if (!opts.length) return `${num}. ${stem}`.trim();
  const optPart = opts.map(({ letter, text }) => `${letter}. ${text}`).join(' ');
  return `${num}. ${stem} ${optPart}`.trim();
}

/** Sentence pool A–G for gapped text / listening matching. */
function formatLetterPoolLines(poolItems, letters = 'ABCDEFG') {
  const lines = [];
  const arr = asGeneratedArray(poolItems);
  for (let i = 0; i < letters.length; i += 1) {
    const letter = letters[i];
    const raw = arr[i];
    const parsed = parseOptionLetterText(raw);
    if (parsed?.text) {
      lines.push(`${parsed.letter || letter} ${parsed.text}`);
    } else if (typeof raw === 'string' && raw.trim()) {
      lines.push(raw.replace(/^([A-G])\)\s*/i, '$1 ').trim());
    }
  }
  return lines;
}

/**
 * Formato levels_preguntas.enunciado alineado con exámenes B2 existentes en Supabase.
 */
export function buildB2EnunciadoFromGenerated(gen = {}, partNumber) {
  const g = {
    ...gen,
    questions: asGeneratedArray(gen.questions),
    sections: asGeneratedArray(gen.sections),
    optionPool: asGeneratedArray(gen.optionPool),
    sentencePool: asGeneratedArray(gen.sentencePool),
    matchingAnswers: asGeneratedArray(gen.matchingAnswers),
    bulletPoints: asGeneratedArray(gen.bulletPoints),
    speakingPrompts: asGeneratedArray(gen.speakingPrompts),
    collaborativePrompts: asGeneratedArray(gen.collaborativePrompts),
    discussionQuestions: asGeneratedArray(gen.discussionQuestions),
  };
  const partDef = partNumber != null ? getB2PartDef(partNumber) : null;
  const lines = [];
  const pn = Number(partNumber);

  if (pn === 4) {
    if (g.directions) pushLines(lines, g.directions);
    lines.push('Questions');
    for (const q of g.questions) {
      const num = q.number ?? '';
      const sentence1 = String(q.sentence1 || '').trim();
      const keyword = String(q.keyword || q.keyWord || '').trim().toUpperCase();
      let sentence2 = String(q.sentence2Start || q.sentence2 || '').trim();
      if (sentence2 && !/_{2,}|\.{4,}/.test(sentence2)) {
        sentence2 = `${sentence2} __________________`;
      }
      if (sentence1) lines.push(`${num}. ${sentence1}`);
      else lines.push(`${num}.`);
      if (keyword) lines.push(keyword);
      if (sentence2) lines.push(sentence2);
      lines.push('');
    }
    return lines.join('\n').trim();
  }

  if (pn === 5) {
    if (g.directions) pushLines(lines, g.directions);
    lines.push('Text');
    if (g.title) lines.push(g.title);
    if (g.passage) pushLines(lines, g.passage);
    lines.push('');
    lines.push('Questions');
    for (const q of g.questions) {
      lines.push(formatReadingMcqQuestionLine(q));
    }
    return lines.join('\n').trim();
  }

  if (pn === 6) {
    if (g.directions) pushLines(lines, g.directions);
    lines.push('Text');
    if (g.title) lines.push(g.title);
    if (g.passage) pushLines(lines, g.passage);
    lines.push('');
    lines.push('Sentences');
    const poolLines = formatLetterPoolLines(g.sentencePool);
    if (poolLines.length) poolLines.forEach((l) => lines.push(l));
    return lines.join('\n').trim();
  }

  if (pn === 7) {
    if (g.directions) pushLines(lines, g.directions);
    const defaultIntro =
      'For questions 43–52, choose from the people A–D below. The people may be chosen more than once.';
    const intro = g.matchingIntro || defaultIntro;
    const directionsBlob = String(g.directions || '').toLowerCase();
    const introRedundant =
      directionsBlob.includes('choose from the people') &&
      (directionsBlob.includes('43') || directionsBlob.includes('43–52') || directionsBlob.includes('43-52'));
    if (!g.directions && intro) pushLines(lines, intro);
    else if (g.directions && intro && !introRedundant && g.matchingIntro) pushLines(lines, intro);
    for (const q of g.questions) {
      const num = q.number ?? '';
      const prompt = String(q.prompt || q.stem || '').trim();
      if (num && prompt) lines.push(`${num} ${prompt}`);
      else if (prompt) lines.push(prompt);
    }
    lines.push('________________________________________');
    lines.push('Texts');
    for (const sec of g.sections) {
      const letter = sec.letter || sec.id || '';
      const name = sec.name || sec.title || '';
      lines.push(`${letter} – ${name}`.trim());
      pushLines(lines, sec.text || sec.body || '');
      lines.push('________________________________________');
    }
    return lines.join('\n').trim();
  }

  if (pn === 12 && g.optionPool?.length) {
    if (g.directions) pushLines(lines, g.directions);
    if (g.setting) pushLines(lines, g.setting);
    const poolLines = formatLetterPoolLines(g.optionPool, 'ABCDEFGH');
    poolLines.forEach((l) => lines.push(l));
    lines.push('');
    for (let i = 1; i <= 5; i += 1) {
      lines.push(`Speaker ${i}`);
    }
    return lines.join('\n').trim();
  }

  if (pn === 8) {
    lines.push('Writing Part 1 — Essay');
    if (g.question || g.taskTitle) {
      lines.push(`Question: ${g.question || g.taskTitle}`);
    }
    const bullets = asGeneratedArray(g.bulletPoints);
    if (bullets.length) {
      lines.push('You should write about:');
      bullets.forEach((b, i) => lines.push(`${i + 1}. ${b}`));
    }
    lines.push('Instructions:');
    pushLines(
      lines,
      g.instructions ||
        g.directions ||
        'Write an essay in 140–190 words. You must answer the question and include the three points below.',
    );
    lines.push(`Word limit: ${g.wordMin || 140}–${g.wordMax || 190} words`);
    return lines.join('\n').trim();
  }

  if (pn === 9) {
    lines.push('Writing Part 2 — Choose one task');
    pushLines(
      lines,
      g.instructions ||
        g.directions ||
        'Choose ONE of the tasks below and write your answer in 140–190 words.',
    );
    if (g.wordMin || g.wordMax) {
      lines.push(`Word limit: ${g.wordMin || 140}–${g.wordMax || 190} words`);
    }
    lines.push('');
    for (const q of g.questions) {
      lines.push(String(q.number ?? ''));
      pushLines(lines, q.prompt || q.task || '');
      if (q.bulletPoints?.length) {
        for (const b of q.bulletPoints) lines.push(b);
      }
      lines.push('Write your ' + (q.format || 'answer') + '.');
      lines.push('');
    }
    return lines.join('\n').trim();
  }

  if (pn >= 10 && pn <= 13 && g.questions.length) {
    if (g.setting) pushLines(lines, g.setting);
    if (pn === 11) {
      for (const q of g.questions) {
        const num = q.number ?? '';
        const lead = q.lead || q.prompt || q.stem || '';
        if (lead) lines.push(lead);
        lines.push(`(${num}) __________________`);
        lines.push('');
      }
      return lines.join('\n').trim();
    }
    for (const q of g.questions) {
      lines.push('');
      lines.push(String(q.number ?? ''));
      if (q.prompt) lines.push(q.prompt);
      if (q.stem) lines.push(q.stem);
      for (const opt of asGeneratedArray(q.options)) {
        lines.push(typeof opt === 'string' ? opt : `${opt.letter || ''}) ${opt.text || ''}`.trim());
      }
    }
    return lines.join('\n').trim();
  }

  if (pn >= 14 && pn <= 17) {
    if (g.directions) pushLines(lines, g.directions);
    if (g.taskTitle) lines.push(g.taskTitle);
    if (g.instructions) pushLines(lines, g.instructions);
    lines.push('');
    lines.push('Assessment criteria: Fluency · Grammar and Vocabulary · Pronunciation · Interactive Communication · Global Achievement');
    lines.push('Typed speaking practice — write your response if you are not recording audio.');
    if (g.comparePrompt) lines.push(g.comparePrompt);
    if (g.theme) lines.push(`Theme: ${g.theme}`);
    for (const p of g.speakingPrompts) lines.push(p);
    for (const p of g.collaborativePrompts) lines.push(p);
    for (const p of g.discussionQuestions) lines.push(p);
    for (const b of g.bulletPoints) lines.push(`• ${b}`);
    return lines.join('\n').trim();
  }

  const useTextPanel = pn >= 1 && pn <= 6;
  if (useTextPanel) {
    // Part 1 (MCQ cloze): opciones del ejemplo (0) antes del texto; el gap (0) va en el pasaje.
    if (pn === 1 && g.example && typeof g.example === 'object') {
      const exOpts = asGeneratedArray(g.example.options);
      if (exOpts.length >= 2) {
        lines.push('Example:');
        for (const opt of exOpts) {
          lines.push(typeof opt === 'string' ? opt : `${opt.letter || ''}) ${opt.text || ''}`.trim());
        }
        const ans = String(g.example.answer || '').trim();
        if (ans) {
          lines.push(/^[A-D]$/i.test(ans) ? `Answer: ${ans.toUpperCase()}` : `Answer: 0 → ${ans}`);
        }
      }
    }
    // Part 2 (open cloze): ejemplo (0) como bloque separado ANTES del texto;
    // el pasaje no debe contener el gap (0).
    if (pn === 2 && g.example && typeof g.example === 'object') {
      const exampleSentence = String(
        g.example.sentence || g.example.text || g.example.prompt || '',
      ).trim();
      const exampleAnswer = String(g.example.answer || '').trim();
      if (exampleSentence && exampleAnswer) {
        lines.push('Example:');
        lines.push(exampleSentence);
        lines.push(`Answer: 0 → ${exampleAnswer}`);
      }
    }
    lines.push('Text');
    if (g.title) lines.push(g.title);
    if (g.passage) pushLines(lines, g.passage);
    if (pn === 6 && g.sentencePool.length) {
      lines.push('');
      for (const s of g.sentencePool) {
        lines.push(typeof s === 'string' ? s : `${s.letter || ''}) ${s.text || ''}`.trim());
      }
    }
  } else if (g.title) {
    lines.push(g.title);
    if (g.passage) pushLines(lines, g.passage);
  }

  if (g.questions.length && pn !== 4 && pn !== 5 && pn !== 6 && pn !== 7 && pn !== 8 && pn < 10) {
    if (!useTextPanel || pn === 1) lines.push('Questions');
    const part1Questions = g.questions.filter((q) => Number(q.number) !== 0);
    for (const q of pn === 1 ? part1Questions : g.questions) {
      if (pn === 1 || pn === 5 || pn === 6) {
        lines.push('');
        lines.push(String(q.number ?? ''));
        if (pn === 1) {
          for (const opt of asGeneratedArray(q.options)) {
            const raw = typeof opt === 'string' ? opt : `${opt.letter || ''}) ${opt.text || ''}`.trim();
            const m = raw.match(/^([A-D])\)\s*(.*)$/i) || raw.match(/^([A-D])\s+(.*)$/i);
            if (m) lines.push(`${m[1].toUpperCase()} ${m[2].trim()}`);
            else lines.push(raw);
          }
        } else {
          if (q.prompt) lines.push(q.prompt);
          for (const opt of asGeneratedArray(q.options)) {
            lines.push(typeof opt === 'string' ? opt : `${opt.letter || ''}) ${opt.text || ''}`.trim());
          }
        }
      }
    }
  }

  return lines.join('\n').trim();
}

export { buildAnswerRowsFromGenerated, formatMcqRespuestaRow, formatOpenRespuestaRow } from '@/lib/formatLevelsEnunciado';
