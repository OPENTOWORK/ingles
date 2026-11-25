/**
 * B1-only linguistic variety. Callers pass previous plans. This module does not
 * read or write exam tables, and it does not share state with B2 allocation.
 * Topic variety stays in b1ReadingVarietyHistory.js.
 */
import {
  B1_PART5_LEGACY_TYPES,
  B1_PART5_LEXICAL_BANK,
  B1_PART6_LEGACY_TYPES,
  B1_PART6_TARGET_BANK,
} from '@/lib/b1ReadingConstruction';

function hashString(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function familySignature(targets) {
  return targets.map((target) => target.family).join('|');
}

const LEGACY_PART6_FAMILIES = 'determiner|preposition|reference|verb|linker|chunk';

function selectablePart6Targets() {
  return B1_PART6_TARGET_BANK.filter((item) => item.selectable !== false);
}

function part6Candidate(examSlot, attempt) {
  const random = mulberry32(hashString(`b1-part6:${examSlot}:${attempt}`));
  const pool = shuffle(selectablePart6Targets(), random);
  const chosen = [];
  for (const target of pool) {
    if (chosen.length === 6) break;
    const familyCount = chosen.filter((item) => item.family === target.family).length;
    if (familyCount >= 2) continue;
    chosen.push(target);
  }
  if (chosen.length !== 6) return null;
  if (new Set(chosen.map((item) => item.family)).size < 4) return null;
  if (familySignature(chosen) === LEGACY_PART6_FAMILIES) return null;
  if (chosen.map((item) => item.type).join('|') === B1_PART6_LEGACY_TYPES.join('|')) return null;
  return chosen;
}

function part6Score(targets, history, examSlot) {
  const types = targets.map((target) => target.type.toLowerCase());
  const families = familySignature(targets);
  let score = new Set(targets.map((target) => target.family)).size * 20;
  score += hashString(`${types.join('|')}:${examSlot}`) % 13;
  for (const prev of history) {
    const prevTypes = (prev?.types || []).map((type) => String(type).trim().toLowerCase());
    if (prevTypes.join('|') === types.join('|')) score -= 1000;
    const samePosition = types.filter((type, index) => type === prevTypes[index]).length;
    score -= samePosition * 35;
    if ((prev?.families || '') === families) score -= 80;
  }
  return score;
}

export function selectB1Part6Targets({ examSlot = 1, history = [] } = {}) {
  const previous = Array.isArray(history) ? history : [];
  let best = null;
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const targets = part6Candidate(examSlot, attempt);
    if (!targets) continue;
    const types = targets.map((target) => target.type.toLowerCase());
    const repeated = previous.some((prev) => (
      (prev?.types || []).map((type) => String(type).trim().toLowerCase()).join('|') === types.join('|')
    ));
    if (repeated) continue;
    const score = part6Score(targets, previous, examSlot);
    const signature = types.join('|');
    if (!best || score > best.score || (score === best.score && signature < best.signature)) {
      best = { score, signature, targets };
    }
  }
  if (!best) {
    throw new Error('No B1 Part 6 grammar plan avoids the previous target sequences.');
  }
  return best.targets.map((target, index) => ({
    number: 27 + index,
    id: target.id,
    type: target.type,
    family: target.family,
    words: target.words,
  }));
}

function part5Candidate(examSlot, attempt) {
  const random = mulberry32(hashString(`b1-part5:${examSlot}:${attempt}`));
  const shuffled = shuffle(B1_PART5_LEXICAL_BANK, random);
  return shuffled.slice(0, 6);
}

export function selectB1Part5LexicalPlan({ examSlot = 1, history = [] } = {}) {
  const previous = Array.isArray(history) ? history : [];
  let best = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const types = part5Candidate(examSlot, attempt);
    const signature = types.join('|');
    if (signature === B1_PART5_LEGACY_TYPES.join('|')) continue;
    if (previous.some((prev) => (prev?.types || []).join('|') === signature)) continue;
    let score = hashString(`${signature}:${examSlot}`) % 17;
    for (const prev of previous) {
      const prevTypes = prev?.types || [];
      score -= types.filter((type, index) => type === prevTypes[index]).length * 20;
    }
    if (!best || score > best.score || (score === best.score && signature < best.signature)) {
      best = { score, signature, types };
    }
  }
  if (!best) throw new Error('No B1 Part 5 lexical plan avoids the previous target order.');
  return best.types.map((type, index) => ({ number: 21 + index, type }));
}

const PART5_KEY_LAYOUTS = [
  [0, 2, 3, 1, 0, 2],
  [2, 0, 1, 3, 2, 0],
  [1, 3, 0, 2, 3, 1],
  [3, 1, 2, 0, 1, 3],
  [0, 3, 1, 2, 0, 3],
  [2, 1, 3, 0, 2, 1],
  [1, 0, 2, 3, 1, 2],
  [3, 2, 0, 1, 3, 0],
];

export function selectB1Part5KeyPositions({ examSlot = 1, history = [] } = {}) {
  const previous = new Set((Array.isArray(history) ? history : []).map((row) => (row?.positions || []).join(',')));
  const start = Math.abs(Number(examSlot) || 1) % PART5_KEY_LAYOUTS.length;
  for (let offset = 0; offset < PART5_KEY_LAYOUTS.length; offset += 1) {
    const layout = PART5_KEY_LAYOUTS[(start + offset) % PART5_KEY_LAYOUTS.length];
    if (!previous.has(layout.join(','))) return layout;
  }
  return PART5_KEY_LAYOUTS[start];
}

const PART3_PREFIXES = [
  ['detail', 'inference', 'attitude', 'detail'],
  ['inference', 'detail', 'attitude', 'detail'],
  ['attitude', 'detail', 'inference', 'detail'],
  ['detail', 'attitude', 'inference', 'inference'],
  ['inference', 'attitude', 'detail', 'detail'],
  ['detail', 'inference', 'detail', 'attitude'],
  ['attitude', 'inference', 'detail', 'inference'],
  ['inference', 'detail', 'detail', 'attitude'],
];

const PART3_GIST_FORMS = [
  {
    id: 'purpose',
    instruction: 'Ask what the writer is doing in the whole text. The correct option must paraphrase the overall purpose.',
  },
  {
    id: 'might-say',
    instruction: 'Ask what the writer might say to someone about the experience. Use four ordinary A–D sentences, not speech bubbles. The correct option must follow from the whole text.',
  },
  {
    id: 'main-point',
    instruction: 'Ask for the main point of the text. Distractors may be true details that are not the overall point.',
  },
  {
    id: 'writer-message',
    instruction: 'Ask what message the writer wants the reader to take from the whole text.',
  },
];

export function selectB1Part3QuestionPlan({ examSlot = 1, history = [] } = {}) {
  const previous = Array.isArray(history) ? history : [];
  const slot = Math.abs(Number(examSlot) || 1);
  let best = null;
  for (let attempt = 0; attempt < PART3_PREFIXES.length * PART3_GIST_FORMS.length; attempt += 1) {
    const prefix = PART3_PREFIXES[(slot + attempt) % PART3_PREFIXES.length];
    const gist = PART3_GIST_FORMS[(slot * 3 + attempt) % PART3_GIST_FORMS.length];
    const signature = `${prefix.join('|')}|${gist.id}`;
    if (previous.some((prev) => prev?.signature === signature)) continue;
    const positionOverlap = previous.reduce((sum, prev) => {
      const prevPrefix = prev?.prefix || [];
      return sum + prefix.filter((type, index) => type === prevPrefix[index]).length;
    }, 0);
    const score = 100 - positionOverlap * 10 + (attempt === 0 ? 1 : 0);
    if (!best || score > best.score) best = { score, prefix, gist, signature };
  }
  if (!best) {
    best = {
      prefix: PART3_PREFIXES[slot % PART3_PREFIXES.length],
      gist: PART3_GIST_FORMS[slot % PART3_GIST_FORMS.length],
      signature: 'fallback',
    };
  }
  const questions = best.prefix.map((questionType, index) => ({
    number: 11 + index,
    questionType,
  }));
  questions.push({ number: 15, questionType: 'gist', gistForm: best.gist.id, instruction: best.gist.instruction });
  return { signature: best.signature, questions, gistForm: best.gist.id, gistInstruction: best.gist.instruction };
}

function sectionText(section) {
  return String(section?.text || section?.body || '');
}

export function redistributeB1Part2Answers(generated, { examSlot = 1, previousKeys = [] } = {}) {
  const sections = Array.isArray(generated?.sections) ? generated.sections : [];
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const modelAnswers = Array.isArray(generated?.modelAnswers) ? generated.modelAnswers : [];
  if (sections.length !== 8 || questions.length !== 5) return generated;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const byLetter = new Map(sections.map((section) => [String(section?.letter || '').trim().toUpperCase(), section]));
  if (letters.some((letter) => !byLetter.get(letter))) return generated;
  const answerFor = (number) => String(
    modelAnswers.find((row) => Number(row?.number) === number)?.answer || '',
  ).trim().toUpperCase();
  const originalKey = [6, 7, 8, 9, 10].map(answerFor);
  if (originalKey.some((letter) => !/^[A-H]$/.test(letter))) return generated;
  const banned = new Set(
    ['ABCDE', ...previousKeys.map((key) => String(key || '').replace(/[^A-H]/gi, '').toUpperCase())]
      .filter((key) => key.length === 5),
  );
  let chosen = null;
  for (let attempt = 0; attempt < 48; attempt += 1) {
    const random = mulberry32(hashString(`b1-part2:${examSlot}:${attempt}`));
    const perm = shuffle(letters, random);
    const map = new Map(letters.map((letter, index) => [letter, perm[index]]));
    const nextKey = originalKey.map((letter) => map.get(letter)).join('');
    if (banned.has(nextKey)) continue;
    if (new Set(nextKey).size !== 5) continue;
    chosen = map;
    break;
  }
  if (!chosen) {
    throw new Error('B1 Part 2 could not vary the answer key without repeating a previous pattern.');
  }
  const relabelled = letters.map((letter) => {
    const sourceLetter = [...chosen.entries()].find(([, next]) => next === letter)?.[0];
    const source = byLetter.get(sourceLetter);
    return { ...source, letter };
  });
  const nextAnswers = modelAnswers.map((row) => (
    Number(row?.number) >= 6 && Number(row?.number) <= 10
      ? { ...row, answer: chosen.get(String(row.answer || '').trim().toUpperCase()) }
      : row
  ));
  const beforeTexts = originalKey.map((letter) => sectionText(byLetter.get(letter)));
  const afterTexts = [6, 7, 8, 9, 10].map((number) => {
    const letter = nextAnswers.find((row) => Number(row?.number) === number)?.answer;
    return sectionText(relabelled.find((section) => section.letter === letter));
  });
  if (beforeTexts.join('\n') !== afterTexts.join('\n')) {
    throw new Error('B1 Part 2 answer-key shuffle changed which text matches a person.');
  }
  return { ...generated, sections: relabelled, modelAnswers: nextAnswers };
}
