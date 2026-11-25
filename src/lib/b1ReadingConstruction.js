/**
 * Deterministic, fail-closed checks for B1 Preliminary Reading construction.
 * These do not call a model and do not author an exam.
 */
import { B1_PART3_PASSAGE_LIMITS, B1_PART4_COHESION_DEVICES, B1_PART5_PASSAGE_LIMITS } from '@/lib/b1ReadingRules';

export { B1_PART3_PASSAGE_LIMITS, B1_PART4_COHESION_DEVICES };

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

/**
 * Approved one-word B1 Part 6 targets. `selectable: false` entries stay valid
 * for older items, but the planner must not keep assigning that fixed order.
 * The repeated pilot order was article, preposition, relative, auxiliary,
 * linker, phrasal particle.
 */
export const B1_PART6_TARGET_BANK = [
  {
    id: 'article',
    type: 'article/determiner',
    family: 'determiner',
    words: ['a', 'an', 'the'],
  },
  {
    id: 'quantifier',
    type: 'quantifier',
    family: 'determiner',
    words: ['some', 'any', 'much', 'many', 'few', 'little', 'enough', 'several', 'both', 'all', 'each', 'every', 'no', 'another'],
  },
  {
    id: 'preposition',
    type: 'preposition',
    family: 'preposition',
    words: ['in', 'on', 'at', 'for', 'with', 'from', 'to', 'of', 'about', 'by', 'into', 'over', 'after', 'before', 'between', 'during', 'without', 'through'],
  },
  {
    id: 'relative',
    type: 'relative pronoun',
    family: 'reference',
    words: ['who', 'which', 'that', 'whose', 'where'],
  },
  {
    id: 'pronoun',
    type: 'pronoun',
    family: 'reference',
    words: ['it', 'they', 'them', 'their', 'her', 'his', 'him', 'she', 'he', 'we', 'us', 'our', 'you', 'your'],
  },
  {
    id: 'pronoun-relative-legacy',
    type: 'pronoun/relative',
    family: 'reference',
    selectable: false,
    words: ['who', 'which', 'that', 'what', 'it', 'they', 'them', 'their', 'her', 'his', 'him', 'she', 'he', 'we', 'us', 'our', 'you', 'your', 'whose', 'where'],
  },
  {
    id: 'modal',
    type: 'modal verb',
    family: 'verb',
    words: ['can', 'could', 'will', 'would', 'should', 'may', 'might', 'must'],
  },
  {
    id: 'auxiliary',
    type: 'auxiliary/modal',
    family: 'verb',
    selectable: false,
    words: ['is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must'],
  },
  {
    id: 'present-perfect',
    type: 'present perfect',
    family: 'verb',
    words: ['have', 'has', 'had', 'been'],
  },
  {
    id: 'verb-form',
    type: 'verb form',
    family: 'verb',
    words: ['been', 'being', 'going', 'got'],
  },
  {
    id: 'conjunction',
    type: 'conjunction',
    family: 'linker',
    words: ['and', 'but', 'or', 'because', 'if', 'when', 'while', 'although', 'until', 'unless', 'since'],
  },
  {
    id: 'linking',
    type: 'linking word',
    family: 'linker',
    selectable: false,
    words: ['and', 'but', 'or', 'because', 'if', 'when', 'while', 'so', 'although', 'before', 'after', 'until', 'unless', 'since', 'as', 'than'],
  },
  {
    id: 'comparative',
    type: 'comparative',
    family: 'linker',
    words: ['than', 'more', 'less', 'as'],
  },
  {
    id: 'phrasal',
    type: 'phrasal verb',
    family: 'chunk',
    words: ['up', 'out', 'off', 'away', 'back', 'down', 'on', 'in', 'over'],
  },
  {
    id: 'fixed',
    type: 'fixed expression',
    family: 'chunk',
    words: ['part', 'place', 'time', 'account', 'care', 'touch', 'mind', 'least', 'spite'],
  },
  {
    id: 'phrasal-legacy',
    type: 'phrasal particle/fixed phrase',
    family: 'chunk',
    selectable: false,
    words: ['up', 'out', 'off', 'away', 'back', 'down', 'over', 'part', 'place', 'time', 'account', 'care', 'touch', 'mind'],
  },
];

export const B1_PART6_LEGACY_TYPES = [
  'article/determiner',
  'preposition',
  'pronoun/relative',
  'auxiliary/modal',
  'linking word',
  'phrasal particle/fixed phrase',
];

/** Legacy fixed positions. Do not use this as the generator template. */
export const B1_PART6_TARGETS = B1_PART6_LEGACY_TYPES.map((type, index) => {
  const entry = B1_PART6_TARGET_BANK.find((item) => item.type === type);
  return { number: 27 + index, type, words: entry?.words || [] };
});

export const B1_PART6_COHESION_NOTE = 'Part 6 targets are chosen per exam. A single grammar-focus label must not be treated as the six-gap template.';

export const B1_PART5_LEXICAL_BANK = [
  'fixed collocation',
  'phrasal/prepositional verb',
  'verb-noun collocation',
  'dependent preposition/complementation',
  'fixed phrase',
  'precise lexical choice',
  'adjective-noun collocation',
];

export const B1_PART5_LEGACY_TYPES = [
  'fixed collocation',
  'phrasal/prepositional verb',
  'dependent preposition/complementation',
  'verb-noun collocation',
  'fixed phrase',
  'precise lexical choice',
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

const COHESION_DEVICE_PATTERNS = {
  'pronoun-reference': /\b(he|she|they|them|their|her|his|him|it|its|this|that|these|those)\b/i,
  chronology: /\b(then|later|afterwards|afterward|after|before|next|earlier|finally|once|when|while|during|yesterday|tomorrow|tonight|today|morning|afternoon|evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december|\d{4}|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,
  contrast: /\b(but|however|although|though|instead|rather|unlike|despite|whereas|yet)\b/i,
  'cause-effect': /\b(because|therefore|since|so that|as a result|which meant|for this reason)\b|\bso\b/i,
  'logical-progression': /\b(then|so|therefore|as a result|for this reason|that is why|this meant|after that|by then)\b/i,
};

const CONTENT_STOP = new Set([
  ...FUNCTION_WORDS,
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no',
  'if', 'then', 'than', 'into', 'over', 'after', 'before', 'about', 'because',
  'when', 'while', 'who', 'which', 'their', 'his', 'her', 'its', 'they', 'them',
  'she', 'he', 'we', 'you', 'your', 'our', 'my', 'me', 'him', 'an', 'please',
  'just', 'only', 'also', 'there', 'here', 'very', 'more', 'most', 'can', 'could',
  'will', 'would', 'should', 'may', 'might', 'must',
]);

function tokens(text) {
  return String(text || '')
    .replace(/[^A-Za-z0-9'’-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function contentBigrams(text) {
  const raw = tokens(text);
  const found = [];
  for (let i = 0; i < raw.length - 1; i += 1) {
    const a = raw[i];
    const b = raw[i + 1];
    const al = a.toLowerCase();
    const bl = b.toLowerCase();
    if (CONTENT_STOP.has(al) || CONTENT_STOP.has(bl)) continue;
    if (al.length < 3 || bl.length < 3) continue;
    found.push({
      phrase: `${al} ${bl}`,
      proper: /^[A-Z]/.test(a) && /^[A-Z]/.test(b),
    });
  }
  return found;
}

function contentWordSet(text) {
  return new Set(
    tokens(text)
      .map((word) => word.toLowerCase())
      .filter((word) => word.length >= 4 && !CONTENT_STOP.has(word)),
  );
}

function sharedContentWords(left, right) {
  const rightWords = contentWordSet(right);
  return [...contentWordSet(left)].filter((word) => rightWords.has(word));
}

function mechanicalBigramHits(sentence, neighbor, allChunks) {
  const hits = [];
  for (const bigram of contentBigrams(sentence)) {
    if (bigram.proper) continue;
    const inNeighbor = contentBigrams(neighbor).some((item) => item.phrase === bigram.phrase);
    if (!inNeighbor) continue;
    const elsewhere = (Array.isArray(allChunks) ? allChunks : [])
      .filter((chunk) => chunk !== neighbor)
      .some((chunk) => contentBigrams(chunk).some((item) => item.phrase === bigram.phrase));
    if (!elsewhere) hits.push(bigram.phrase);
  }
  return hits;
}

function extraSentenceText(extra) {
  return String(extra?.sentence || extra || '');
}

/**
 * Part 4 cohesion. Exact two-word copies are a defect, not a requirement.
 * A cohesion name is a label, not a keyword test. Semantic multifit review stays mandatory.
 */
export function part4CohesionProblems({ chunks, removed, extras, requireDevice = true }) {
  const errors = [];
  const safeChunks = Array.isArray(chunks) ? chunks.map((chunk) => String(chunk || '')) : [];
  const removedRows = Array.isArray(removed) ? removed : [];
  for (const row of removedRows) {
    const number = Number(row?.number);
    const sentence = String(row?.sentence || '');
    if (!Number.isInteger(number)) continue;
    const before = safeChunks[number - 16] || '';
    const after = safeChunks[number - 15] || '';
    const neighbor = `${before} ${after}`;
    const copied = [
      ...mechanicalBigramHits(sentence, before, safeChunks),
      ...mechanicalBigramHits(sentence, after, safeChunks),
    ];
    for (const phrase of [...new Set(copied)]) {
      errors.push(`B1 Part 4 gap ${number} copies the two-word phrase "${phrase}" beside the gap. Use pronoun reference, time, contrast, cause, or a single lexical link instead.`);
    }
    if (requireDevice) {
      const device = String(row?.cohesion || row?.device || '').trim().toLowerCase();
      if (device && !B1_PART4_COHESION_DEVICES.includes(device) && !COHESION_DEVICE_PATTERNS[device]) {
        errors.push(`B1 Part 4 gap ${number} uses an unknown cohesion name "${device}". Use ${B1_PART4_COHESION_DEVICES.join(', ')}.`);
      }
    }
  }
  const article = [...safeChunks, ...removedRows.map((row) => row?.sentence)].join(' ');
  const articleWords = contentWordSet(article);
  for (const extra of Array.isArray(extras) ? extras : []) {
    const text = extraSentenceText(extra);
    if (!text.trim()) continue;
    for (const row of removedRows) {
      const copied = contentBigrams(text).filter((bigram) => (
        !bigram.proper && contentBigrams(row?.sentence).some((item) => item.phrase === bigram.phrase)
      ));
      for (const bigram of copied) {
        errors.push(`B1 Part 4 extra sentence repeats a phrase from gap ${row?.number}: "${bigram.phrase}".`);
      }
    }
    const related = [...contentWordSet(text)].some((word) => articleWords.has(word));
    if (articleWords.size >= 6 && !related) {
      errors.push('B1 Part 4 extra sentence is not thematically connected to the passage. Write a plausible sentence about the same situation.');
    }
    if (requireDevice && extra?.rejectionReason != null && !String(extra.rejectionReason).trim() && !String(extra?.cohesionNote || '').trim()) {
      errors.push('B1 Part 4 extra sentence needs a reason why it fits none of the five gaps.');
    }
  }
  return errors;
}

export function splitB1Part4Chunks(passage) {
  const source = String(passage || '');
  const parts = source.split(/\((1[6-9]|20)\)\s*(?:_+|\.{2,}|…+)/);
  if (parts.length !== 11) return null;
  const chunks = [];
  for (let i = 0; i < parts.length; i += 2) chunks.push(parts[i] || '');
  return chunks.length === 6 ? chunks : null;
}

export function part4MechanicalAnchorProblems(generated) {
  const chunks = splitB1Part4Chunks(generated?.passage);
  if (!chunks) return [];
  const pool = new Map();
  for (const entry of Array.isArray(generated?.sentencePool) ? generated.sentencePool : []) {
    const raw = typeof entry === 'string' ? entry : `${entry?.letter || ''}) ${entry?.text || entry?.sentence || ''}`;
    const match = String(raw).match(/^\s*([A-H])\)\s*([\s\S]*)$/i);
    if (match) pool.set(match[1].toUpperCase(), match[2].trim());
  }
  const answers = new Map(
    (Array.isArray(generated?.modelAnswers) ? generated.modelAnswers : [])
      .map((row) => [Number(row?.number), String(row?.answer || '').trim().toUpperCase()]),
  );
  const removed = [];
  const used = new Set();
  for (let number = 16; number <= 20; number += 1) {
    const letter = answers.get(number);
    if (!letter || !pool.get(letter)) return [];
    used.add(letter);
    removed.push({ number, sentence: pool.get(letter) });
  }
  const extras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    .filter((letter) => !used.has(letter) && pool.get(letter))
    .map((letter) => ({ sentence: pool.get(letter) }));
  return part4CohesionProblems({ chunks, removed, extras, requireDevice: false });
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

export function resolveB1Part6Target(type) {
  const key = String(type || '').trim().toLowerCase();
  return B1_PART6_TARGET_BANK.find((item) => item.type.toLowerCase() === key) || null;
}

export function part6TargetProblems(items) {
  const errors = [];
  const byNumber = new Map((Array.isArray(items) ? items : []).map((item) => [Number(item?.number), item]));
  const answers = [];
  const types = [];
  for (let number = 27; number <= 32; number += 1) {
    const item = byNumber.get(number);
    const answer = String(item?.answer || '').trim().toLowerCase();
    const type = String(item?.targetType || item?.grammarTarget || '').trim();
    if (!item) {
      errors.push(`B1 Part 6 is missing item ${number}.`);
      continue;
    }
    const target = resolveB1Part6Target(type);
    if (!target) {
      errors.push(`B1 Part 6 Q${number} target "${type || 'missing'}" is not an approved B1 grammar target.`);
      continue;
    }
    if (!/^[a-z]+(?:'[a-z]+)?$/.test(answer)) {
      errors.push(`B1 Part 6 Q${number} answer "${answer || '?'}" must be exactly one word.`);
      continue;
    }
    if (!target.words.includes(answer)) {
      errors.push(`B1 Part 6 Q${number} answer "${answer || '?'}" is not an ordinary ${target.type} word.`);
    }
    answers.push(answer);
    types.push(target.type.toLowerCase());
  }
  if (answers.length === 6 && new Set(answers).size !== answers.length) {
    errors.push('B1 Part 6 must use six different one-word answers.');
  }
  if (types.length === 6 && new Set(types).size !== types.length) {
    errors.push('B1 Part 6 must use six different grammar targets.');
  }
  if (types.length === 6 && types.join('|') === B1_PART6_LEGACY_TYPES.join('|')) {
    errors.push('B1 Part 6 repeats the fixed article-preposition-relative-auxiliary-linker-phrasal sequence. Choose a different combination and order.');
  }
  return errors;
}

export function part6PlanRepetitionProblems(items, history = []) {
  const ordered = [...(Array.isArray(items) ? items : [])].sort((a, b) => Number(a?.number) - Number(b?.number));
  const types = ordered.map((item) => String(item?.targetType || item?.grammarTarget || '').trim().toLowerCase());
  const answers = ordered.map((item) => String(item?.answer || '').trim().toLowerCase());
  const errors = [];
  for (const prev of Array.isArray(history) ? history : []) {
    const prevTypes = (prev?.types || []).map((type) => String(type).trim().toLowerCase());
    const prevAnswers = (prev?.answers || []).map((answer) => String(answer).trim().toLowerCase());
    if (prevTypes.length === 6 && types.join('|') === prevTypes.join('|')) {
      errors.push('B1 Part 6 repeats a previous grammar-target sequence.');
    }
    if (prevAnswers.length === 6 && answers.join('|') === prevAnswers.join('|')) {
      errors.push('B1 Part 6 repeats a previous six-answer sequence.');
    }
    if (prevAnswers.length && answers.filter((answer) => prevAnswers.includes(answer)).length >= 5) {
      errors.push('B1 Part 6 repeats too many answers from a previous exam.');
    }
  }
  return [...new Set(errors)];
}

export function part6LocalAmbiguityProblems(markedPassage, items) {
  const source = String(markedPassage || '');
  const errors = [];
  for (const item of Array.isArray(items) ? items : []) {
    const number = Number(item?.number);
    const answer = String(item?.answer || '').trim().toLowerCase();
    const marker = new RegExp(`\\[\\[${number}:[^\\]]+\\]\\]`);
    const match = source.match(marker);
    if (!match) continue;
    const at = source.indexOf(match[0]);
    const window = source.slice(Math.max(0, at - 80), at + match[0].length + 80);
    const completed = window.replace(marker, answer);
    if (/\bof the two\b/i.test(window) && answer === 'a') {
      errors.push(`B1 Part 6 Q${number} follows "of the two", so "a" is not a safe unique article. Use a frame that forces one word.`);
    }
    if ((answer === 'was' || answer === 'were') && new RegExp(`\\[\\[${number}:[^\\]]+\\]\\]\\s+\\w+ing\\b`, 'i').test(window)) {
      errors.push(`B1 Part 6 Q${number} sits before an -ing verb, so started, continued or kept may also fit. Rewrite the gap.`);
    }
    if ((answer === 'was' || answer === 'were') && /\b(locked|stuck|hurt|dressed|married)\b/i.test(completed)) {
      errors.push(`B1 Part 6 Q${number} passive may also accept "got". Use a form that only one auxiliary can fill.`);
    }
  }
  return errors;
}

export function part6DeclaredTargetProblems(questions, modelAnswers) {
  const rows = Array.isArray(questions) ? questions : [];
  const declared = rows.filter((question) => question?.grammarTarget || question?.targetType);
  if (!declared.length) return [];
  const answers = new Map((Array.isArray(modelAnswers) ? modelAnswers : []).map((row) => [Number(row?.number), row?.answer]));
  return part6TargetProblems(rows.map((question) => ({
    number: question?.number,
    answer: answers.get(Number(question?.number)),
    targetType: question?.grammarTarget || question?.targetType,
  })));
}

function optionText(option) {
  return String(option || '').replace(/^\s*[A-H]\)\s*/i, '');
}

function answerLetter(modelAnswers, question, index) {
  const rows = Array.isArray(modelAnswers) ? modelAnswers : [];
  const row = rows.find((item) => Number(item?.number) === Number(question?.number)) || rows[index];
  return String(row?.answer || '').trim().toUpperCase();
}

export function part1LiteralOverlapProblems(questions, modelAnswers) {
  const errors = [];
  (Array.isArray(questions) ? questions : []).forEach((question, index) => {
    const letter = answerLetter(modelAnswers, question, index);
    const options = Array.isArray(question?.options) ? question.options : [];
    const correct = options.find((option) => String(option).trim().toUpperCase().startsWith(`${letter})`));
    if (!correct) return;
    const optionWords = [...contentWordSet(optionText(correct))];
    const source = contentWordSet(question?.text || question?.message || question?.notice || '');
    const shared = optionWords.filter((word) => source.has(word));
    if (optionWords.length >= 2 && shared.length >= 2 && shared.length / optionWords.length >= 0.66) {
      errors.push(`B1 Part 1 Q${question?.number ?? index + 1} correct option repeats wording from the notice (${shared.join(', ')}). Paraphrase the main message.`);
    }
  });
  return errors;
}

const PROFILE_NAME_STOP = new Set([
  'The', 'This', 'That', 'These', 'Those', 'There', 'They', 'She', 'He',
  'A', 'An', 'On', 'At', 'In', 'For', 'After', 'Before', 'When', 'If',
]);

function keyedTextIsAdultsOnly(text) {
  const source = String(text || '');
  return /\b(adults only|only for adults|session is for adults|morning for adults|for adults, not)\b/i.test(source)
    || (/\bfor adults\b/i.test(source) && !/\b(children|all ages|teenagers)\b/i.test(source));
}

function statedAgeYears(profile) {
  const text = String(profile || '');
  const match = text.match(/\b(?:aged|age)\s+(\d{1,2})\b/i)
    || text.match(/\bis\s+(\d{1,2})\b/i)
    || text.match(/\b(\d{1,2})\s*(?:years old|-year-old)\b/i);
  if (!match) return null;
  const age = Number(match[1]);
  if (!Number.isInteger(age) || age < 5 || age > 99) return null;
  return age;
}

function activityMinimumAge(text) {
  const source = String(text || '');
  const stated = [];
  const lead = source.match(/\b(?:over|older than|at least|aged)\s+(\d{2})\b/i);
  const trail = source.match(/\b(\d{2})\s*(?:or over|or older|\+)\b/i);
  if (lead) stated.push(Number(lead[1]));
  if (trail) stated.push(Number(trail[1]));
  if (/\b(seniors?|retired people|over 60)\b/i.test(source)) stated.push(60);
  const minimum = stated.length ? Math.max(...stated) : 18;
  return Math.max(18, minimum);
}

function profileDescribesYoungPerson(profile) {
  const text = String(profile || '');
  if (/\b(teenager|teenagers|teenage|schoolboy|schoolgirl|schoolchild|pupil)\b/i.test(text)) return true;
  if (/\b(at school|secondary school|primary school|high school)\b/i.test(text)
    && !/\b(works|working|teaches|teaching|teacher|job)\b/i.test(text)) return true;
  if (/\b(GCSE|homework)\b/i.test(text)) return true;
  if (/\b(?:is|am)\s+a\s+(?:child|kid)\b/i.test(text)) return true;
  return false;
}

function profileMeetsAdultActivity(profile, minimumAge) {
  const age = statedAgeYears(profile);
  if (age != null) return age >= minimumAge;
  return minimumAge <= 18 && /\badult\b/i.test(String(profile || ''));
}

function qualifyingAgeChoices(profile, minimumAge) {
  const text = String(profile || '');
  let band = [23, 25, 27, 30, 35, 40, 44];
  if (/\b(retired|retirement|grandchildren|grandson|granddaughter)\b/i.test(text)) band = [64, 67, 70, 72];
  else if (/\b(university|at college|degree)\b/i.test(text)) band = [19, 20, 21, 22];
  else if (/\b(?:her|his|their)\s+(?:son|daughter|children|child)\b/i.test(text) || /\b(parent|mother|father|mum|dad)\b/i.test(text)) {
    band = [29, 33, 36, 41];
  } else if (/\b(works|working|job|office|colleague|manager)\b/i.test(text)) {
    band = [26, 28, 31, 34, 38, 43];
  }
  const eligible = band.filter((age) => age >= minimumAge);
  if (eligible.length) return eligible;
  const raised = [];
  for (let age = minimumAge; age <= Math.min(minimumAge + 12, 80); age += 3) raised.push(age);
  return raised.length ? raised : [minimumAge];
}

function stableAgeChoice(options, seed) {
  let hash = 2166136261;
  const text = String(seed || '');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return options[(hash >>> 0) % options.length];
}

function appendQualifyingAge(profile, age) {
  const text = String(profile || '').trim();
  const name = text.match(/^([A-Z][a-z]+)\b/);
  const clause = name && !PROFILE_NAME_STOP.has(name[1])
    ? `${name[1]} is ${age}.`
    : `This person is ${age} years old.`;
  const body = /[.!?]$/.test(text) ? text : `${text}.`;
  return `${body} ${clause}`;
}

/**
 * When the matched text is adults-only and the profile gives no age, add one
 * age that fits that person's life and the activity. A stated age, a child,
 * or a teenager is left unchanged so the eligibility check can reject the match.
 * The original requirement sentence, the matched text, and the answer stay.
 */
export function repairB1Part2AdultProfiles(generated) {
  const sections = new Map(
    (Array.isArray(generated?.sections) ? generated.sections : []).map((section) => [
      String(section?.letter || '').trim().toUpperCase(),
      String(section?.text || section?.body || ''),
    ]),
  );
  const questions = (Array.isArray(generated?.questions) ? generated.questions : []).map((question, index) => {
    const letter = answerLetter(generated?.modelAnswers, question, index);
    const text = sections.get(letter) || '';
    const profile = String(question?.prompt || question?.description || '');
    if (!keyedTextIsAdultsOnly(text)) return question;
    const minimumAge = activityMinimumAge(text);
    const stated = statedAgeYears(profile);
    if (stated != null || profileDescribesYoungPerson(profile) || profileMeetsAdultActivity(profile, minimumAge)) {
      return question;
    }
    const age = stableAgeChoice(qualifyingAgeChoices(profile, minimumAge), `${profile}|${minimumAge}`);
    const repaired = appendQualifyingAge(profile, age);
    if (question?.prompt) return { ...question, prompt: repaired };
    return { ...question, description: repaired };
  });
  return { ...generated, questions };
}

const PROFILE_SCHEDULE = [
  { label: 'a weekend', profile: /\bweekends?\b/i, text: /\b(weekends?|saturdays?|sundays?)\b/i },
  { label: 'Saturday', profile: /\bsaturdays?\b/i, text: /\b(saturdays?|weekends?)\b/i },
  { label: 'Sunday', profile: /\bsundays?\b/i, text: /\b(sundays?|weekends?)\b/i },
  { label: 'an evening', profile: /\bevenings?\b/i, text: /\b(evenings?|nights?|\d{1,2}(?::\d{2})?\s*p\.?m\.?)\b/i },
  { label: 'a morning', profile: /\bmornings?\b/i, text: /\b(mornings?|\d{1,2}(?::\d{2})?\s*a\.?m\.?)\b/i },
  { label: 'an afternoon', profile: /\bafternoons?\b/i, text: /\bafternoons?\b/i },
];

function textAgeWindow(text) {
  const source = String(text || '');
  const range = source.match(/\b(?:aged\s+)?(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\b/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const andOver = source.match(/\b(\d{1,2})\s+and over\b/i);
  if (andOver) return { min: Number(andOver[1]), max: 99 };
  const over = source.match(/\bover\s+(\d{1,2})\b/i);
  if (over) return { min: Number(over[1]) + 1, max: 99 };
  const under = source.match(/\bunder\s+(\d{1,2})\b/i);
  if (under) return { min: 0, max: Number(under[1]) - 1 };
  if (/\ball ages\b/i.test(source)) return { min: 0, max: 99 };
  return null;
}

export function part3OptionFormatProblems(questions) {
  const errors = [];
  for (const question of Array.isArray(questions) ? questions : []) {
    const number = question?.number ?? '?';
    const labels = [];
    for (const option of Array.isArray(question?.options) ? question.options : []) {
      const match = String(option || '').trim().match(/^([A-D])\)\s*(.*)$/i);
      if (!match) {
        errors.push(`B1 Part 3 Q${number} option must use one letter label.`);
        continue;
      }
      labels.push(match[1].toUpperCase());
      if (/^[A-D][).]\s+/i.test(match[2])) {
        errors.push(`B1 Part 3 Q${number} repeats the answer letter inside the option.`);
      }
    }
    if (new Set(labels).size !== labels.length) {
      errors.push(`B1 Part 3 Q${number} repeats an answer letter.`);
    }
  }
  return errors;
}

export function part2ProfileSupportProblems(generated) {
  const errors = [];
  const sections = new Map(
    (Array.isArray(generated?.sections) ? generated.sections : []).map((section) => [
      String(section?.letter || '').trim().toUpperCase(),
      String(section?.text || section?.body || ''),
    ]),
  );
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  questions.forEach((question, index) => {
    const letter = answerLetter(generated?.modelAnswers, question, index);
    const text = sections.get(letter) || '';
    const profile = String(question?.prompt || question?.description || '');
    const number = question?.number ?? index + 6;
    const adultsOnly = keyedTextIsAdultsOnly(text);
    const minimumAge = adultsOnly ? activityMinimumAge(text) : 18;
    const stated = statedAgeYears(profile);
    if (adultsOnly && stated != null && stated < minimumAge) {
      errors.push(`B1 Part 2 Q${number} keyed text is limited to adults, but the profile states an age under ${minimumAge}.`);
    } else if (adultsOnly && profileDescribesYoungPerson(profile) && !profileMeetsAdultActivity(profile, minimumAge)) {
      errors.push(`B1 Part 2 Q${number} keyed text is limited to adults, but the profile describes a young person. Do not match them to that activity.`);
    } else if (adultsOnly && !profileMeetsAdultActivity(profile, minimumAge)) {
      errors.push(`B1 Part 2 Q${number} keyed text is limited to adults, but the profile does not state an age.`);
    }
    const window = textAgeWindow(text);
    if (stated != null && window && (stated < window.min || stated > window.max)) {
      errors.push(`B1 Part 2 unsupported requirement Q${number}: the profile age ${stated} is outside the keyed text's age limit of ${window.min}–${window.max}.`);
    }
    for (const constraint of PROFILE_SCHEDULE) {
      if (constraint.profile.test(profile) && !constraint.text.test(text)) {
        errors.push(`B1 Part 2 unsupported requirement Q${number}: the profile requires ${constraint.label}, and the keyed text does not make that time possible.`);
      }
    }
    const locksAtNoon = /\b(locks?|closes?|closed|shuts?)\b[^.]{0,40}\b(at noon|at 12)\b/i.test(text);
    const leaveByNoon = /\b(by noon|before noon|leave by 12|leave before 12)\b/i.test(profile);
    if (locksAtNoon && leaveByNoon) {
      errors.push(`B1 Part 2 Q${number} pairs a leave-by-noon requirement with a place that closes or locks at noon. Make the departure clearly possible.`);
    }
  });
  return errors;
}

export function reconstructPart5Passage(generated) {
  let passage = String(generated?.passage || '');
  const questions = Array.isArray(generated?.questions) ? generated.questions : [];
  const answers = Array.isArray(generated?.modelAnswers) ? generated.modelAnswers : [];
  for (const question of questions) {
    const number = Number(question?.number);
    const letter = answerLetter(answers, question, 0);
    const option = (Array.isArray(question?.options) ? question.options : [])
      .find((item) => String(item).trim().toUpperCase().startsWith(`${letter})`));
    if (!option) continue;
    const word = optionText(option).trim().split(/\s+/)[0];
    passage = passage.replace(new RegExp(`\\(${number}\\)\\s*(?:_+|\\.{2,}|…)`, 'i'), word);
  }
  return passage;
}

const PART5_REFERENCE = /\b(i|me|my|mine|we|us|our|ours|you|your|yours|he|him|his|she|her|hers|they|them|their|theirs|it|its|this|that|these|those)\b/gi;

function part5KeepsReference(text, sentences) {
  const references = String(text || '').match(PART5_REFERENCE) || [];
  if (references.length >= 2) return true;
  const seen = new Map();
  for (const sentence of sentences) {
    for (const word of contentWordSet(sentence)) {
      seen.set(word, (seen.get(word) || 0) + 1);
    }
  }
  return [...seen.values()].some((count) => count >= 2);
}

export function part5CoherenceProblems(passage) {
  const text = String(passage || '').replace(/\(\d+\)\s*(?:_+|\.{2,}|…+)/g, ' ');
  const words = text.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  const errors = [];
  if (words.length < B1_PART5_PASSAGE_LIMITS.hardMin) {
    errors.push(`B1 Part 5 completed text is ${words.length} words. Write one short connected passage of at least ${B1_PART5_PASSAGE_LIMITS.hardMin} words, inside the ${B1_PART5_PASSAGE_LIMITS.targetMin}-${B1_PART5_PASSAGE_LIMITS.targetMax} word target, not six isolated lines.`);
  }
  if (words.length < 40) return errors;
  const sentences = text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  const linkers = (text.match(/\b(because|so|after|before|when|then|later|once|while|although|however)\b/gi) || []).length;
  if (sentences.length >= 5 && linkers < 2) {
    errors.push('B1 Part 5 passage lacks cohesion and reads as separate example sentences. Connect the ideas with time, cause or contrast.');
  }
  if (sentences.length >= 5 && !part5KeepsReference(text, sentences)) {
    errors.push('B1 Part 5 passage lacks cohesion and does not keep a person, object or idea in view across sentences.');
  }
  return errors;
}

export function part5UnnaturalFrameProblems(passage) {
  const text = String(passage || '');
  const errors = [];
  if (/\bget off\b[\s\S]{0,90}\bafter\b[\s\S]{0,50}\b(got|get|getting) on\b/i.test(text)) {
    errors.push('B1 Part 5 bus item has passengers getting off after others get on. Rewrite it so people get off first.');
  }
  if (/\bmusical\b[\s\S]{0,50}\bcame out\b|\bcame out\b[\s\S]{0,50}\bmusical\b/i.test(text)) {
    errors.push('B1 Part 5 uses "came out" for a musical. Use a theatre expression such as "opened".');
  }
  return errors;
}

export function part5TargetOrderProblems(questions, { forbidLegacy = false } = {}) {
  const types = (Array.isArray(questions) ? questions : [])
    .slice()
    .sort((a, b) => Number(a?.number) - Number(b?.number))
    .map((question) => String(question?.targetType || '').trim().toLowerCase())
    .filter(Boolean);
  if (types.length !== 6) return [];
  if (forbidLegacy && types.join('|') === B1_PART5_LEGACY_TYPES.join('|')) {
    return ['B1 Part 5 repeats the same lexical-target order as the first pilots. Vary the sequence.'];
  }
  return [];
}

export function b1Part3GistPositionProblems(questions) {
  const rows = Array.isArray(questions) ? questions : [];
  const last = rows.find((question) => Number(question?.number) === 15);
  const type = String(last?.questionType || '').trim().toLowerCase();
  if (!last || (type !== 'gist' && type !== 'global')) {
    return ['B1 Reading Part 3 must place the whole-text question at Q15.'];
  }
  return [];
}

const PART3_CONTRACTION_EXPANSIONS = [
  [/\bI'm\b/, 'I am'],
  [/\bdon't\b/i, 'do not'],
  [/\bdoesn't\b/i, 'does not'],
  [/\bdidn't\b/i, 'did not'],
  [/\bisn't\b/i, 'is not'],
  [/\baren't\b/i, 'are not'],
  [/\bwasn't\b/i, 'was not'],
  [/\bweren't\b/i, 'were not'],
  [/\bcan't\b/i, 'can not'],
  [/\bwon't\b/i, 'will not'],
  [/\bcouldn't\b/i, 'could not'],
  [/\bwouldn't\b/i, 'would not'],
  [/\bshouldn't\b/i, 'should not'],
  [/\bhaven't\b/i, 'have not'],
  [/\bhasn't\b/i, 'has not'],
  [/\bhadn't\b/i, 'had not'],
  [/\bI'll\b/, 'I will'],
  [/\bwe'll\b/i, 'we will'],
  [/\bthey'll\b/i, 'they will'],
  [/\bhe'll\b/i, 'he will'],
  [/\bshe'll\b/i, 'she will'],
  [/\byou'll\b/i, 'you will'],
  [/\bit's\b/i, 'it is'],
  [/\bthat's\b/i, 'that is'],
  [/\bthere's\b/i, 'there is'],
  [/\bhere's\b/i, 'here is'],
  [/\bwhat's\b/i, 'what is'],
  [/\blet's\b/i, 'let us'],
  [/\byou're\b/i, 'you are'],
  [/\bwe're\b/i, 'we are'],
  [/\bthey're\b/i, 'they are'],
  [/\bI've\b/, 'I have'],
  [/\bwe've\b/i, 'we have'],
  [/\bthey've\b/i, 'they have'],
  [/\byou've\b/i, 'you have'],
];

const PART3_CLAUSE_VERBS = 'said|thought|knew|felt|hoped|decided|realised|realized|explained|noticed|believed|understood';
const PART3_CLAUSE_FOLLOW = 'he|she|they|it|I|we|you|the|a|an';
const PART3_OPTIONAL_THAT = new RegExp(
  `\\b(${PART3_CLAUSE_VERBS})\\s+(?!that\\b)(?=(?:${PART3_CLAUSE_FOLLOW})\\b)`,
  'i',
);
const PART3_REMOVABLE_THAT = new RegExp(
  `\\b(${PART3_CLAUSE_VERBS})\\s+that(?=\\s+(?:${PART3_CLAUSE_FOLLOW})\\b)`,
  'i',
);

export function countB1PassageWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function straightenApostrophes(text) {
  return String(text || '').replace(/[’‘]/g, "'");
}

function replaceOnce(text, pattern, replacement) {
  const flags = pattern.flags.replace('g', '');
  return text.replace(new RegExp(pattern.source, flags), replacement);
}

function normalizePart3LengthWording(text) {
  let value = straightenApostrophes(text).replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of PART3_CONTRACTION_EXPANSIONS) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    value = value.replace(new RegExp(pattern.source, flags), replacement);
  }
  value = value.replace(new RegExp(`\\b(${PART3_CLAUSE_VERBS})\\s+that\\b`, 'gi'), '$1');
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function lengthenPart3Wording(text, min, max) {
  let current = text;
  const steps = [...PART3_CONTRACTION_EXPANSIONS, [PART3_OPTIONAL_THAT, '$1 that ']];
  let guard = 0;
  while (countB1PassageWords(current) < min && guard < 40) {
    guard += 1;
    let changed = false;
    for (const [pattern, replacement] of steps) {
      const next = replaceOnce(current, pattern, replacement).replace(/\s+/g, ' ').trim();
      if (next !== current && countB1PassageWords(next) <= max) {
        current = next;
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  const words = countB1PassageWords(current);
  return words >= min && words <= max ? current : null;
}

function shortenPart3Wording(text, min, max) {
  let current = text;
  let guard = 0;
  while (countB1PassageWords(current) > max && guard < 40) {
    guard += 1;
    const next = replaceOnce(current, PART3_REMOVABLE_THAT, '$1').replace(/\s+/g, ' ').trim();
    if (next === current || countB1PassageWords(next) < min) break;
    current = next;
  }
  const words = countB1PassageWords(current);
  return words >= min && words <= max ? current : null;
}

/**
 * Adjust a Part 3 passage that is only slightly outside 180–520 words.
 * The edit may expand a contraction or add or remove an optional "that".
 * It does not add facts. If that cannot reach the range, the original passage stays.
 */
export function repairB1Part3PassageLength(passage, limits = B1_PART3_PASSAGE_LIMITS) {
  const min = limits.min ?? B1_PART3_PASSAGE_LIMITS.min;
  const max = limits.max ?? B1_PART3_PASSAGE_LIMITS.max;
  const slight = limits.slight ?? B1_PART3_PASSAGE_LIMITS.slight;
  const original = String(passage || '').replace(/\s+/g, ' ').trim();
  const words = countB1PassageWords(original);
  if (words >= min && words <= max) {
    return { ok: true, repaired: false, passage: original, words };
  }
  const slightlyUnder = words >= min - slight && words < min;
  const slightlyOver = words > max && words <= max + slight;
  if (!slightlyUnder && !slightlyOver) {
    return { ok: false, repaired: false, passage: original, words };
  }
  const source = straightenApostrophes(original);
  const candidate = slightlyUnder
    ? lengthenPart3Wording(source, min, max)
    : shortenPart3Wording(source, min, max);
  const candidateWords = countB1PassageWords(candidate);
  const addedContent = candidate
    ? [...contentWordSet(candidate)].filter((word) => !contentWordSet(original).has(word))
    : [];
  if (
    !candidate
    || candidateWords < min
    || candidateWords > max
    || addedContent.length
    || normalizePart3LengthWording(source) !== normalizePart3LengthWording(candidate)
  ) {
    return { ok: false, repaired: false, passage: original, words };
  }
  return { ok: true, repaired: true, passage: candidate, words: candidateWords };
}

export function repairB1Part3Draft(draft, limits = B1_PART3_PASSAGE_LIMITS) {
  const questions = draft?.questions;
  const modelAnswers = draft?.modelAnswers;
  const lengthRepair = repairB1Part3PassageLength(draft?.passage, limits);
  return {
    ...draft,
    passage: lengthRepair.passage,
    questions,
    modelAnswers,
    lengthRepair,
  };
}
