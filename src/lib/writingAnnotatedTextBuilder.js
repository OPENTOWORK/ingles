import { parseWritingCorrectionBlocks } from '@/lib/formatWritingFeedbackHtml';
import { findCorrectionForPhrase, mapCorrectionToAnnotationTag } from '@/lib/writingAnnotatedMarkup';

const SECTION_BREAK =
  /^(📝|💪|🎯|🎓|📊|🔍|✏️|📈|🚀|📚|✅|🟡|❌)/;

function escapeRegex(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSectionBody(feedback, emojiPrefix) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith(emojiPrefix)) start = i;
    } else if (SECTION_BREAK.test(t) && !t.startsWith(emojiPrefix)) {
      end = i;
      break;
    }
  }

  if (start === -1) return '';
  return lines.slice(start + 1, end).join('\n').trim();
}

function isInsideMark(text, index) {
  const before = String(text || '').slice(0, index);
  const opens = (before.match(/\[\[(?:voc|spell|gram|cont|good)(?:\|\d+)?\]\]/g) || []).length;
  const closes = (before.match(/\[\[\/(?:voc|spell|gram|cont|good)\]\]/g) || []).length;
  return opens > closes;
}

function findPhraseFlexible(text, phrase) {
  const raw = String(phrase || '').trim();
  if (!raw || raw.length < 2) return null;

  const direct = text.indexOf(raw);
  if (direct >= 0 && !isInsideMark(text, direct)) {
    return { idx: direct, len: raw.length };
  }

  const loose = new RegExp(escapeRegex(raw).replace(/\s+/g, '\\s+'), 'i');
  const m = text.match(loose);
  if (m && m.index != null && !isInsideMark(text, m.index)) {
    return { idx: m.index, len: m[0].length };
  }

  const words = raw.split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 2) {
    const partial = words.slice(0, Math.min(5, words.length)).join(' ');
    const re = new RegExp(escapeRegex(partial).replace(/\s+/g, '\\s+'), 'i');
    const pm = text.match(re);
    if (pm && pm.index != null && !isInsideMark(text, pm.index)) {
      return { idx: pm.index, len: pm[0].length };
    }
  }

  return null;
}

function findBlockIndexForPhrase(phrase, blocks) {
  const match = findCorrectionForPhrase(phrase, blocks);
  if (!match) return null;
  const index = blocks.indexOf(match);
  return index >= 0 ? index : null;
}

function withCorrectionIndex(mark, blocks) {
  if (mark.correctionIndex != null) return mark;
  const index = findBlockIndexForPhrase(mark.phrase, blocks);
  return index == null ? mark : { ...mark, correctionIndex: index };
}

const REPETITION_STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'can', 'that', 'this', 'these', 'those', 'it', 'they', 'we', 'you', 'i', 'my', 'your',
  'their', 'our', 'with', 'from', 'as', 'by', 'not', 'no', 'so', 'if', 'when', 'which', 'who', 'what',
  'how', 'all', 'some', 'many', 'much', 'more', 'most', 'very', 'also', 'however', 'because', 'although',
  'while', 'where', 'there', 'here', 'about', 'into', 'through', 'during', 'before', 'after', 'essay',
  'libraries', 'library', 'online', 'people', 'students', 'student', 'teacher', 'school', 'college',
]);

function collectRepetitionVocabMarks(text, limit = 4) {
  const marks = [];
  const wordRe = /\b[a-z]{4,}\b/gi;
  /** @type {Map<string, Array<{ index: number, len: number, word: string }>>} */
  const occurrences = new Map();
  let match = wordRe.exec(text);

  while (match) {
    const word = match[0];
    const key = word.toLowerCase();
    if (!REPETITION_STOP_WORDS.has(key)) {
      if (!occurrences.has(key)) occurrences.set(key, []);
      occurrences.get(key).push({ index: match.index, len: word.length, word });
    }
    match = wordRe.exec(text);
  }

  for (const [, hits] of occurrences) {
    if (hits.length < 2) continue;
    for (let i = 1; i < hits.length && marks.length < limit; i += 1) {
      const hit = hits[i];
      if (!isInsideMark(text, hit.index)) {
        marks.push({ phrase: hit.word, tag: 'voc' });
      }
    }
  }

  return marks;
}

function applyMarkAt(text, idx, len, tag, correctionIndex = null) {
  const open =
    correctionIndex != null && correctionIndex >= 0
      ? `[[${tag}|${correctionIndex}]]`
      : `[[${tag}]]`;
  return (
    text.slice(0, idx) +
    open +
    text.slice(idx, idx + len) +
    `[[/${tag}]]` +
    text.slice(idx + len)
  );
}

function applyMarks(text, marks) {
  const resolved = [];

  for (const mark of marks) {
    const hit = findPhraseFlexible(text, mark.phrase);
    if (!hit) continue;
    resolved.push({
      ...hit,
      tag: mark.tag,
      phrase: mark.phrase,
      correctionIndex: mark.correctionIndex ?? null,
    });
  }

  resolved.sort((a, b) => b.idx - a.idx);

  let out = text;
  const usedRanges = [];

  for (const mark of resolved) {
    if (isInsideMark(out, mark.idx)) continue;
    const overlaps = usedRanges.some(
      (r) => mark.idx < r.end && mark.idx + mark.len > r.start,
    );
    if (overlaps) continue;

    out = applyMarkAt(out, mark.idx, mark.len, mark.tag, mark.correctionIndex);
    usedRanges.push({ start: mark.idx, end: mark.idx + mark.len });
  }

  return out;
}

function collectQuotedMarks(sectionText, tag) {
  const marks = [];
  const re = /"([^"]{3,120})"/g;
  let m = re.exec(sectionText);
  while (m) {
    marks.push({ phrase: m[1], tag });
    m = re.exec(sectionText);
  }
  return marks;
}

function countAnnotationTags(text) {
  const s = String(text || '');
  const countTag = (tag) => (s.match(new RegExp(`\\[\\[${tag}(?:\\|\\d+)?\\]\\]`, 'gi')) || []).length;
  return {
    voc: countTag('voc'),
    spell: countTag('spell'),
    gram: countTag('gram'),
    cont: countTag('cont'),
    good: countTag('good'),
    total: countTag('voc') + countTag('spell') + countTag('gram') + countTag('cont') + countTag('good'),
  };
}

/**
 * Build colour-coded annotated essay from correction cards + heuristics.
 * @param {string} essay
 * @param {ReturnType<typeof parseWritingCorrectionBlocks>} blocks
 * @param {string} strengthsText
 * @param {string} problemsText
 */
export function buildAnnotatedEssayText(essay, blocks = [], strengthsText = '', problemsText = '') {
  const base = String(essay ?? '');
  if (!base.trim()) return '';

  /** @type {Array<{ phrase: string, tag: string, correctionIndex?: number }>} */
  const marks = [];

  blocks.forEach((block, index) => {
    if (!block.original) return;
    marks.push({
      phrase: block.original,
      tag: mapCorrectionToAnnotationTag(block.type, block.problem, block.why),
      correctionIndex: index,
    });
  });

  for (const q of collectQuotedMarks(problemsText, 'cont')) {
    marks.push(withCorrectionIndex(q, blocks));
  }
  for (const q of collectQuotedMarks(strengthsText, 'good')) {
    marks.push(withCorrectionIndex(q, blocks));
  }

  let annotated = applyMarks(base, marks);

  const counts = countAnnotationTags(annotated);
  if (counts.voc < 1) {
    annotated = applyMarks(
      annotated,
      collectRepetitionVocabMarks(base, 3).map((m) => withCorrectionIndex(m, blocks)),
    );
  }
  if (counts.cont < 1) {
    annotated = applyMarks(
      annotated,
      collectQuotedMarks(problemsText, 'cont').map((m) => withCorrectionIndex(m, blocks)),
    );
  }

  return annotated;
}

function findAnnotatedInsertIndex(lines) {
  let corrStart = lines.findIndex((l) => /^✏️/.test(l.trim()));
  if (corrStart >= 0) {
    for (let j = corrStart + 1; j < lines.length; j += 1) {
      if (SECTION_BREAK.test(lines[j].trim()) && !lines[j].trim().startsWith('✏️')) {
        return j;
      }
    }
    return lines.length;
  }
  const improved = lines.findIndex((l) => /^📈/.test(l.trim()));
  return improved >= 0 ? improved : lines.length;
}

function upsertAnnotatedSection(feedback, annotatedBody) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t.startsWith('🔍')) {
      start = i;
      for (let j = i + 1; j < lines.length; j += 1) {
        if (SECTION_BREAK.test(lines[j].trim()) && !lines[j].trim().startsWith('🔍')) {
          end = j;
          break;
        }
      }
      break;
    }
  }

  const block = ['🔍 Annotated text', annotatedBody, ''];

  if (start === -1) {
    const insertAt = findAnnotatedInsertIndex(lines);
    return [...lines.slice(0, insertAt), ...block, ...lines.slice(insertAt)].join('\n');
  }

  return [...lines.slice(0, start), ...block, ...lines.slice(end)].join('\n');
}

/**
 * Replace AI annotated section with a deterministic, richer markup built from corrections.
 * @param {string} feedback
 * @param {string} essay
 */
export function injectServerAnnotatedText(feedback, essay) {
  const correctionsBody = extractSectionBody(feedback, '✏️');
  const blocks = parseWritingCorrectionBlocks(correctionsBody);
  const strengthsBody = extractSectionBody(feedback, '💪');
  const problemsBody = extractSectionBody(feedback, '🎯');

  const annotated = buildAnnotatedEssayText(essay, blocks, strengthsBody, problemsBody);
  if (!annotated) return feedback;

  return upsertAnnotatedSection(feedback, annotated);
}
