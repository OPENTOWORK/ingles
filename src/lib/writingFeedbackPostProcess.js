/** Deterministic post-processing for B2 writing feedback quality. */

function linesOf(text) {
  return String(text || '').split('\n');
}

function joinLines(lines) {
  return lines.join('\n');
}

/** First line looks like an essay title (short, not a full sentence). */
export function detectEssayTitle(essay) {
  const first = String(essay || '')
    .trim()
    .split('\n')[0]
    ?.trim();
  if (!first || first.length > 90) return false;
  if (/^(it is|first|however|many|in conclusion|the world|nowadays|today)/i.test(first)) return false;
  if (/[.!?]$/.test(first) && first.split(/\s+/).length > 8) return false;
  return first.split(/\s+/).length <= 12;
}

/** "Do you agree?" tasks need an explicit stance somewhere in the essay. */
export function essayStatesClearOpinion(essay, taskPack = '') {
  const task = String(taskPack || '');
  if (!/do you agree/i.test(task)) return true;
  const text = String(essay || '').toLowerCase();
  return /\b(i agree|i disagree|i do not agree|i don't agree|in my opinion|from my point of view|partially agree|completely agree|do not agree|don't agree|i believe|i think that libraries|libraries are (?:still )?(?:needed|essential|important)|libraries are no longer needed)\b/.test(
    text,
  );
}

function insertBulletAfterHeading(feedback, headingEmoji, bullet) {
  const lines = linesOf(feedback);
  let start = -1;
  let insertAt = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith(headingEmoji)) start = i;
      continue;
    }
    if (/^(📝|💪|🎯|🎓|📊|🔍|✏️|📈|🚀|📚|✅|🟡|❌|📋)/.test(t)) break;
    if (t.startsWith('-')) insertAt = i + 1;
  }
  if (start === -1) return feedback;
  if (insertAt === -1) insertAt = start + 1;
  if (lines.some((l) => l.includes(bullet.replace(/^-\s*/, '').slice(0, 24)))) return feedback;
  lines.splice(insertAt, 0, bullet);
  return joinLines(lines);
}

/** Ensure missing essay title is flagged in Main problems. */
export function ensureMissingTitleProblem(feedback, essay) {
  if (detectEssayTitle(essay)) return feedback;
  if (/missing (?:essay )?title|no title|without a title|title at the top/i.test(feedback)) {
    return feedback;
  }
  return insertBulletAfterHeading(
    feedback,
    '🎯',
    '- Missing essay title — Part 1 essays must include a title at the top (Communicative Achievement).',
  );
}

/** Patch Task check when "Do you agree?" lacks a clear stance. */
export function ensureUnclearOpinionTaskCheck(feedback, essay, taskPack = '') {
  if (essayStatesClearOpinion(essay, taskPack)) return feedback;
  let out = String(feedback || '');
  if (/Clear opinion:\s*(no|partial)/i.test(out)) return out;

  const lines = linesOf(out);
  const idx = lines.findIndex((l) => /Task match:/i.test(l));
  if (idx === -1) {
    const scoresIdx = lines.findIndex((l) => /^📊/.test(l.trim()));
    const block = [
      '📋 Task check',
      'Task match: PARTLY OFF TASK — the essay discusses libraries but does not clearly answer “Do you agree?”',
      'Title included: no',
      'Clear opinion: no',
      'All notes covered: partial',
      'Word count ok: yes',
      'Paragraphing: acceptable',
      '',
    ];
    if (scoresIdx >= 0) {
      lines.splice(scoresIdx, 0, ...block);
      return joinLines(lines);
    }
    return `${out}\n\n${block.join('\n')}`;
  }

  if (!/Title included:/i.test(out)) {
    lines.splice(idx + 1, 0, 'Title included: no', 'Clear opinion: no', 'All notes covered: partial');
    out = joinLines(lines);
  }

  if (!/missing.*opinion|clear opinion|do you agree/i.test(out)) {
    out = insertBulletAfterHeading(
      out,
      '🎯',
      '- The essay does not clearly answer “Do you agree?” — state your opinion in the introduction or conclusion.',
    );
  }
  return out;
}

/** Replace "Not needed yet" stronger-B2 placeholder when the student wrote a full essay. */
export function stripStrongerB2SkipPlaceholder(feedback, wordCount = 0) {
  if (Number(wordCount) < 80) return feedback;
  if (!/not needed yet/i.test(String(feedback || ''))) return feedback;

  const lines = linesOf(feedback);
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith('🚀')) start = i;
    } else if (/^(📚|✅|🟡|❌)/.test(t)) {
      end = i;
      break;
    }
  }
  if (start === -1) return feedback;

  const replacement = [
    'A stronger B2 rewrite is required for every complete essay.',
    'Rewrite the same ideas with a clear title, a direct answer to “Do you agree?”, fuller development of library services, natural B2 vocabulary, and shorter sentences.',
    'Aim for 140–190 words.',
  ].join('\n');

  return joinLines([...lines.slice(0, start + 1), replacement, ...lines.slice(end)]);
}
