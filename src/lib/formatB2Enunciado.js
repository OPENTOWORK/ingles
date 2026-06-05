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
    lines.push('Questions');
    for (const q of g.questions) {
      const num = q.number ?? '';
      const sentence1 = String(q.sentence1 || '').trim();
      const keyword = String(q.keyword || q.keyWord || '').trim();
      let sentence2 = String(q.sentence2Start || q.sentence2 || '').trim();
      if (sentence2 && !/_{2,}|\.{4,}/.test(sentence2)) {
        sentence2 = `${sentence2} __________________`;
      }
      if (sentence1 && keyword) {
        lines.push(`${num}${sentence1}.${keyword}`);
        if (sentence2) lines.push(sentence2);
      } else {
        lines.push(String(num));
        if (sentence1) lines.push(sentence1);
        if (keyword) lines.push(keyword);
        if (sentence2) lines.push(sentence2);
      }
      lines.push('');
    }
    return lines.join('\n').trim();
  }

  if (pn === 7) {
    if (g.matchingIntro) pushLines(lines, g.matchingIntro);
    for (const q of g.questions) {
      if (q.prompt) lines.push(q.prompt);
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

  if (g.questions.length && pn !== 4 && pn !== 8 && pn < 10) {
    if (!useTextPanel || pn === 1) lines.push('Questions');
    for (const q of g.questions) {
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
