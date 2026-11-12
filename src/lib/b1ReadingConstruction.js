/**
 * Deterministic, fail-closed checks for B1 Preliminary Reading construction.
 * These do not call a model and do not author an exam.
 */

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for',
  'with', 'from', 'by', 'is', 'are', 'was', 'were', 'it', 'this', 'that',
  'these', 'those', 'as', 'so',
]);

/** Words and phrases that are above normal B1 Preliminary reading level. */
export const B1_ABOVE_LEVEL_TERMS = [
  'cognitive abilities',
  'predominantly',
  'cognitive',
  'adept',
  'nuances',
  'nuance',
  'polyglot',
  'immersion',
  'unparalleled',
  'albeit',
  'notwithstanding',
  'paradigm',
  'plethora',
  'ubiquitous',
  'multifaceted',
  'juxtaposition',
  'juxtaposed',
  'juxtapose',
  'meticulous',
  'exacerbate',
  'commensurate',
  'henceforth',
  'thereof',
  'whereby',
  'therein',
];

const PART3_BUCKETS = [
  { id: 'detail', types: ['detail'] },
  { id: 'inference', types: ['inference'] },
  { id: 'attitude', types: ['attitude', 'opinion'] },
  { id: 'gist', types: ['gist', 'global'] },
];

export const B1_PART6_TARGETS = [
  {
    number: 27,
    type: 'article/determiner',
    words: ['a', 'an', 'the', 'this', 'these', 'those', 'some', 'any', 'no', 'each', 'every', 'both', 'all', 'another'],
  },
  {
    number: 28,
    type: 'preposition',
    words: ['in', 'on', 'at', 'for', 'with', 'from', 'to', 'of', 'about', 'by', 'into', 'over', 'after', 'before', 'between', 'during', 'without', 'through'],
  },
  {
    number: 29,
    type: 'pronoun/relative',
    words: ['who', 'which', 'that', 'what', 'it', 'they', 'them', 'their', 'her', 'his', 'him', 'she', 'he', 'we', 'us', 'our', 'you', 'your', 'whose', 'where'],
  },
  {
    number: 30,
    type: 'auxiliary/modal',
    words: ['is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must'],
  },
  {
    number: 31,
    type: 'linking word',
    words: ['and', 'but', 'or', 'because', 'if', 'when', 'while', 'so', 'although', 'before', 'after', 'until', 'unless', 'since', 'as', 'than'],
  },
  {
    number: 32,
    type: 'phrasal particle/fixed phrase',
    words: ['up', 'out', 'off', 'away', 'back', 'down', 'over', 'part', 'place', 'time', 'account', 'care', 'touch', 'mind'],
  },
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findB1AboveLevelTerms(text) {
  const source = String(text || '');
  const hits = [];
  for (const term of B1_ABOVE_LEVEL_TERMS) {
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    if (pattern.test(source)) hits.push(term);
  }
  return hits;
}

export function b1Part3CoverageGaps(questions) {
  const types = (Array.isArray(questions) ? questions : [])
    .map((question) => String(question?.questionType || '').trim().toLowerCase());
  return PART3_BUCKETS
    .filter((bucket) => !types.some((type) => bucket.types.includes(type)))
    .map((bucket) => bucket.id);
}

export function part4CohesionProblems({ chunks, removed, extras }) {
  const errors = [];
  const safeChunks = Array.isArray(chunks) ? chunks.map((chunk) => String(chunk || '')) : [];
  const anchors = [];
  for (const row of Array.isArray(removed) ? removed : []) {
    const number = Number(row?.number);
    const sentence = String(row?.sentence || '').toLowerCase();
    const anchor = String(row?.anchor || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const words = anchor.split(' ').filter(Boolean);
    if (!Number.isInteger(number)) continue;
    if (words.length < 2 || words.every((word) => FUNCTION_WORDS.has(word))) {
      errors.push(`B1 Part 4 gap ${number} needs a unique cohesion anchor of at least two content words.`);
      continue;
    }
    if (!sentence.includes(anchor)) {
      errors.push(`B1 Part 4 gap ${number} anchor "${anchor}" is not inside the removed sentence.`);
    }
    const before = String(safeChunks[number - 16] || '').toLowerCase();
    const after = String(safeChunks[number - 15] || '').toLowerCase();
    if (!before.includes(anchor) && !after.includes(anchor)) {
      errors.push(`B1 Part 4 gap ${number} anchor "${anchor}" does not appear in the text immediately before or after the gap.`);
    }
    anchors.push({ number, anchor });
  }
  const seen = new Map();
  for (const item of anchors) {
    if (seen.has(item.anchor)) {
      errors.push(`B1 Part 4 gaps ${seen.get(item.anchor)} and ${item.number} share the cohesion anchor "${item.anchor}".`);
    } else {
      seen.set(item.anchor, item.number);
    }
  }
  for (const extra of Array.isArray(extras) ? extras : []) {
    const text = String(extra?.sentence || extra || '').toLowerCase();
    for (const item of anchors) {
      if (text.includes(item.anchor)) {
        errors.push(`B1 Part 4 extra sentence repeats the anchor of gap ${item.number}: "${item.anchor}".`);
      }
    }
  }
  return errors;
}

export function markedAnswerMismatches(markedPassage, pairs) {
  const source = String(markedPassage || '');
  const errors = [];
  for (const pair of Array.isArray(pairs) ? pairs : []) {
    const number = Number(pair?.number);
    const answer = String(pair?.answer || '').trim().toLowerCase();
    const match = source.match(new RegExp(`\\[\\[${number}:([^\\]]+)\\]\\]`, 'i'));
    if (!match || !answer) continue;
    const marked = match[1].trim().toLowerCase();
    if (marked !== answer) {
      errors.push(`B1 marked gap ${number} contains "${match[1].trim()}" but the answer is "${pair.answer}".`);
    }
  }
  return errors;
}

export function part6TargetProblems(items) {
  const errors = [];
  const byNumber = new Map((Array.isArray(items) ? items : []).map((item) => [Number(item?.number), item]));
  const answers = [];
  for (const target of B1_PART6_TARGETS) {
    const item = byNumber.get(target.number);
    const answer = String(item?.answer || '').trim().toLowerCase();
    const type = String(item?.targetType || '').trim().toLowerCase();
    if (!item) {
      errors.push(`B1 Part 6 is missing the ${target.type} item ${target.number}.`);
      continue;
    }
    if (type !== target.type) {
      errors.push(`B1 Part 6 Q${target.number} must test ${target.type}; got "${type || 'missing'}".`);
    }
    if (!target.words.includes(answer)) {
      errors.push(`B1 Part 6 Q${target.number} answer "${answer || '?'}" is not an ordinary ${target.type} word.`);
    }
    if (answer) answers.push(answer);
  }
  if (answers.length === B1_PART6_TARGETS.length && new Set(answers).size !== answers.length) {
    errors.push('B1 Part 6 must use six different one-word answers.');
  }
  return errors;
}
