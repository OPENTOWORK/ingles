/** Inline markup for colour-coded writing feedback (parsed server + client). */

export const WRITING_ANNOTATION_LEGEND = [
  {
    key: 'voc',
    labelEn: 'Vocabulary',
    labelEs: 'Vocabulario',
    hintEn: 'Improvable, wrong or repetitive words',
    hintEs: 'Palabras mejorables, incorrectas o repetitivas',
    className: 'writing-mark--voc',
  },
  {
    key: 'spell',
    labelEn: 'Spelling',
    labelEs: 'Ortografía',
    hintEn: 'Spelling mistakes',
    hintEs: 'Errores de ortografía',
    className: 'writing-mark--spell',
  },
  {
    key: 'gram',
    labelEn: 'Grammar',
    labelEs: 'Gramática',
    hintEn: 'Punctuation, structure, long sentences, transfer from Spanish',
    hintEs: 'Puntuación, estructura, frases largas, transfer del castellano',
    className: 'writing-mark--gram',
  },
  {
    key: 'cont',
    labelEn: 'Content',
    labelEs: 'Contenido',
    hintEn: 'Vague, repetitive or overly generic ideas',
    hintEs: 'Ideas vagas, repetición o demasiado genéricas',
    className: 'writing-mark--cont',
  },
  {
    key: 'good',
    labelEn: 'Strengths',
    labelEs: 'Logros',
    hintEn: 'Genuine strengths only — clear structure, relevant ideas',
    hintEs: 'Solo logros reales — estructura clara, ideas relevantes',
    className: 'writing-mark--good',
  },
];

const TAG_NAMES = ['voc', 'spell', 'gram', 'cont', 'good'];

const MARKUP_RE =
  /\[\[(voc|spell|gram|cont|good)(?:\|(\d+))?\]\]([\s\S]*?)\[\[\/(?:voc|spell|gram|cont|good)\]\]/gi;

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** @param {boolean} [isEn] */
export function renderWritingAnnotationLegendHtml(isEn = true) {
  const items = WRITING_ANNOTATION_LEGEND.map((item) => {
    const label = isEn ? item.labelEn : item.labelEs;
    const hint = isEn ? item.hintEn : item.hintEs;
    return `<li class="writing-annotation-legend__item">
      <span class="writing-annotation-legend__swatch writing-mark ${item.className}">${escapeHtml(label)}</span>
      <span class="writing-annotation-legend__hint">${escapeHtml(hint)}</span>
    </li>`;
  }).join('');

  const title = isEn ? 'Colour key' : 'Leyenda de colores';
  return `<div class="writing-annotation-legend" role="note" aria-label="${title}">
    <p class="writing-annotation-legend__title">${title}</p>
    <ul class="writing-annotation-legend__list">${items}</ul>
  </div>`;
}

/**
 * @param {string} line
 * @returns {Array<{ type: 'text' | 'mark', text: string, tag?: string, correctionIndex?: number | null }>}
 */
export function parseAnnotatedLineSegments(line) {
  return parseAnnotatedTextSegments(line);
}

/** Parse [[tag|index]]…[[/tag]] markup in the student's exact text (preserves newlines). */
export function parseAnnotatedTextSegments(raw) {
  const input = String(raw ?? '');
  /** @type {Array<{ type: 'text' | 'mark', text: string, tag?: string, correctionIndex?: number | null }>} */
  const segments = [];
  let last = 0;
  MARKUP_RE.lastIndex = 0;
  let match = MARKUP_RE.exec(input);

  while (match) {
    if (match.index > last) {
      segments.push({ type: 'text', text: input.slice(last, match.index) });
    }
    segments.push({
      type: 'mark',
      tag: match[1].toLowerCase(),
      correctionIndex: match[2] != null ? Number(match[2]) : null,
      text: match[3],
    });
    last = MARKUP_RE.lastIndex;
    match = MARKUP_RE.exec(input);
  }

  if (last < input.length) {
    segments.push({ type: 'text', text: input.slice(last) });
  }

  if (!segments.length && input) {
    segments.push({ type: 'text', text: input });
  }

  return segments;
}

/**
 * Map a correction card to an annotation colour tag.
 * Teacher labels in Problem override Type when they conflict (WW → yellow, not red).
 */
export function mapCorrectionToAnnotationTag(type = '', problem = '', why = '') {
  const blob = `${type || ''} ${problem || ''} ${why || ''}`.toLowerCase();
  const p = String(problem || '').trim().toLowerCase();
  const t = String(type || '').trim().toLowerCase();

  if (/passive!|good connector|idiom\s*\/?\s*set phrase|well done|^✓|strength/.test(blob)) {
    return 'good';
  }

  if (/spelling\s*[⇒=>]|^spelling\b|typo|misspell|orthograph/.test(p) || t === 'spelling') {
    return 'spell';
  }

  if (
    /^ww\b|^ww[—–-]|rep\.?\s*vocab/.test(p) ||
    /wrong word|word choice|lexis|colloc|awkward|unnatural|style upgrade|flat adjective|repetitive (word|vocab|phrase)|repeated use of/.test(
      blob,
    ) ||
    t === 'vocabulary' ||
    t === 'register'
  ) {
    return 'voc';
  }

  if (
    /tell me which|needs more developing|needs developing|more developing|right concept|mentioned in passing|only mentioned|too generic|underdeveloped|not specific enough|develop this|main justification|which benefits|which services|vague idea|generic point|task point missing|answer the question|focus\?/.test(
      p,
    ) ||
    /tell me which|needs more developing|right concept|mentioned in passing|too generic|underdeveloped|task point|main justification/.test(
      blob,
    ) ||
    t === 'task response'
  ) {
    return 'cont';
  }

  if (/rep\.?\s*vocab|repetitive vocab|repeated (word|phrase)/.test(blob)) return 'voc';
  if (/repetit/.test(blob) && /vocab|word|phrase|adjective|verb|lexis|since|learning/.test(blob)) {
    return 'voc';
  }
  if (/repetit/.test(blob) && /idea|point|content|paragraph|develop|service|benefit|justification/.test(blob)) {
    return 'cont';
  }

  if (
    /too long|clunk|break the sentence|need an object|subject-verb|translated from spanish|sounds translated|grammar|verb tense|article|preposition|word order|punctuation|structure|long sentence|missing subject|passive form/.test(
      blob,
    ) ||
    ['grammar', 'word order', 'articles', 'prepositions', 'verb tense', 'subject-verb agreement'].includes(t)
  ) {
    return 'gram';
  }

  if (t === 'cohesion') {
    return /break the sentence|clunk|whereas|however|connector|linker|long/.test(blob) ? 'gram' : 'cont';
  }

  if (t === 'vocabulary' || t === 'register') return 'voc';
  if (t === 'task response') return 'cont';
  if (t === 'spelling') return 'spell';

  return 'gram';
}

/** Teacher margin-note chip (matches FCE paper marking guide). */
export function getTeacherMarkChip(tag, correction, phrase) {
  const p = String(correction?.problem || '').trim();
  const c = String(correction?.correct || '').replace(/^"|"$/g, '').trim();
  const ph = String(phrase || '').trim();

  if (tag === 'good') {
    if (/passive/i.test(p)) return 'passive! ✓';
    if (/connector|linker/i.test(p) && /good connector|✓|well done|strength/i.test(p)) {
      return 'good connector! ✓';
    }
    if (/idiom|set phrase|colloc/i.test(p)) return 'idiom / set phrase! ✓';
    if (/clear paragraph|good contrast|relevant example|paragraphing/i.test(p)) return p || '✓ well done';
    if (/\b(is|are|was|were)\s+\w+ed\b/i.test(ph) && /passive/i.test(p)) return 'passive! ✓';
    return p || '✓ well done';
  }

  if (/^WW\b/i.test(p) || /^WW —/i.test(p)) return 'WW';
  if (/rep\.?\s*vocab/i.test(p)) return 'rep. vocab.';
  if (/spelling\s*⇒/i.test(p) || /spelling\s*=>/i.test(p)) {
    const m = p.match(/spelling\s*[⇒=>]\s*(.+)$/i);
    return m ? `spelling ⇒ ${m[1].trim()}` : c ? `spelling ⇒ ${c}` : 'spelling';
  }
  if (tag === 'spell') return c ? `spelling ⇒ ${c}` : 'spelling';

  if (/too long/i.test(p)) return 'Too long…';
  if (/clunk/i.test(p)) return 'clunky';
  if (/break the sentence/i.test(p)) return 'break the sentence.';
  if (/need an object/i.test(p)) return 'need an object here';
  if (/translated from spanish|transfer/i.test(p)) return 'sounds translated';

  if (/tell me which/i.test(p)) return 'tell me which!';
  if (/needs more developing|more developing/i.test(p)) return 'needs more developing';
  if (/right concept/i.test(p)) return 'is this the right concept?';
  if (/mentioned in passing|only mentioned/i.test(p)) return 'only mentioned in passing';
  if (/too generic|generic/i.test(p)) return 'too generic';

  if (p) return p.length > 42 ? `${p.slice(0, 40)}…` : p;
  return getAnnotationLabel(tag);
}

export function getAnnotationLabel(tag, isEn = true) {
  const item = WRITING_ANNOTATION_LEGEND.find((l) => l.key === tag);
  if (!item) return tag;
  return isEn ? item.labelEn : item.labelEs;
}

function normalizeComparable(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/["'""'']/g, '')
    .replace(/\s+/g, ' ');
}

/** Match a highlighted phrase to a parsed correction card. */
export function findCorrectionForPhrase(phrase, corrections = []) {
  const target = normalizeComparable(phrase);
  if (!target || !corrections.length) return null;

  const exact = corrections.find((c) => normalizeComparable(c.original) === target);
  if (exact) return exact;

  const nested = corrections.find((c) => {
    const orig = normalizeComparable(c.original);
    return orig && (target.includes(orig) || orig.includes(target));
  });
  if (nested) return nested;

  const targetWords = target.split(' ').filter((w) => w.length > 2);
  if (targetWords.length) {
    return (
      corrections.find((c) => {
        const orig = normalizeComparable(c.original);
        const correct = normalizeComparable(c.correct);
        return (
          targetWords.some((w) => orig.includes(w) || correct.includes(w)) ||
          orig.split(' ').some((w) => w.length > 2 && target.includes(w))
        );
      }) || null
    );
  }

  return null;
}

/** Find a strengths/problems bullet that mentions the highlighted phrase. */
export function findContextNoteForMarkedPhrase(phrase, sectionText = '') {
  const target = normalizeComparable(phrase);
  if (!target) return '';

  const lines = String(sectionText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const cleaned = line.replace(/^[-*•]\s+/, '');
    const normalized = normalizeComparable(cleaned);
    if (!normalized) continue;
    if (normalized.includes(target) || target.includes(normalized)) return cleaned;

    const words = target.split(' ').filter((w) => w.length > 3);
    if (words.some((w) => normalized.includes(w))) return cleaned;
  }

  return '';
}

/**
 * Build popup explanation lines for any mark colour.
 * @param {{ tag: string, correction?: object|null, phrase?: string, chip?: string, problemsText?: string, strengthsText?: string, isEn?: boolean }} opts
 */
export function buildWritingMarkPopupNotes({
  tag,
  correction = null,
  phrase = '',
  chip = '',
  problemsText = '',
  strengthsText = '',
  isEn = true,
}) {
  /** @type {string[]} */
  const notes = [];
  const why = String(correction?.why || '').trim();
  const problem = String(correction?.problem || '').trim();
  const severity = String(correction?.severity || '').trim();
  const normWhy = normalizeComparable(why);
  const normProblem = normalizeComparable(problem);
  const normChip = normalizeComparable(chip);

  if (severity && /^(minor|medium|major)$/i.test(severity)) {
    notes.push(isEn ? `Severity: ${severity}` : `Gravedad: ${severity}`);
  }

  if (why) notes.push(why);

  if (problem && normProblem !== normWhy) {
    const chipIsSubset =
      normChip && (normProblem.includes(normChip) || normProblem.startsWith(normChip));
    if (normProblem !== normChip || problem.length > chip.length + 8 || chipIsSubset) {
      notes.push(problem);
    }
  }

  if (!notes.length) {
    const section = tag === 'good' ? strengthsText : problemsText;
    const context = findContextNoteForMarkedPhrase(phrase, section);
    if (context) notes.push(context);
  }

  if (!notes.length) {
    const item = WRITING_ANNOTATION_LEGEND.find((l) => l.key === tag);
    if (item) notes.push(isEn ? item.hintEn : item.hintEs);
  }

  return notes;
}

export function renderAnnotatedWritingHtml(raw) {
  const source = String(raw ?? '');
  if (!source.trim()) return '';

  let text = escapeHtml(source);

  for (const key of TAG_NAMES) {
    const cls = WRITING_ANNOTATION_LEGEND.find((l) => l.key === key)?.className || 'writing-mark';
    const re = new RegExp(
      `\\[\\[${key}(?:\\|\\d+)?\\]\\]([\\s\\S]*?)\\[\\[\\/${key}\\]\\]`,
      'gi',
    );
    text = text.replace(re, (_, inner) => `<mark class="writing-mark ${cls}">${inner}</mark>`);
  }

  return `<div class="writing-annotated-text__body">${text}</div>`;
}

export function isAnnotatedTextSection(heading) {
  return /annotated text|marked text|text with highlights|texto anotado/i.test(String(heading || ''));
}
