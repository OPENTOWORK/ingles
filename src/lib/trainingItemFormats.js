/**
 * Every question type the grammar path can ask, grouped by how the student answers it.
 * The family decides the widget, the grading and the shape of `values`.
 */
export const TRAINING_FORMAT_FAMILY = Object.freeze({
  gap: 'gaps',
  word_formation: 'gaps',
  preposition: 'gaps',
  phrasal: 'gaps',
  collocation: 'gaps',
  key_word: 'gaps',
  text_gaps: 'gaps',
  open_cloze: 'gaps',
  listen_gap: 'gaps',

  mc_cloze: 'select_gaps',
  linker: 'select_gaps',

  choice: 'choice',
  tense: 'choice',
  intention: 'choice',
  true_false: 'choice',
  error: 'choice',
  mcq: 'choice',
  paraphrase: 'choice',
  odd_one_out: 'choice',
  heading: 'choice',
  synonym: 'choice',
  antonym: 'choice',
  word_to_definition: 'choice',
  situation: 'choice',
  response: 'choice',
  register: 'choice',
  odd_sound: 'choice',
  certainty: 'choice',
  listen_choice: 'choice',
  listen_true_false: 'choice',
  listen_intention: 'choice',
  image_choice: 'choice',

  transform: 'text',
  error_correction: 'text',
  situation_rewrite: 'text',
  polarity: 'text',
  passive: 'text',
  reported: 'text',
  conditional: 'text',
  combine: 'text',
  dictation: 'text',

  define_word: 'short_text',

  order: 'order',
  sequence: 'sequence',

  spot_error: 'tap',
  stress: 'tap',

  multi_select: 'multi',

  match: 'match',
  british_american: 'match',

  classify: 'classify',

  gapped_text: 'slots',
  dialogue: 'slots',
  multiple_matching: 'slots',
});

/** The 45 task types every basic level offers on top of its original items. */
export const TRAINING_TYPE_FORMATS = Object.freeze([
  'error_correction',
  'spot_error',
  'mcq',
  'multi_select',
  'match',
  'word_formation',
  'key_word',
  'paraphrase',
  'preposition',
  'phrasal',
  'collocation',
  'odd_one_out',
  'classify',
  'sequence',
  'text_gaps',
  'open_cloze',
  'mc_cloze',
  'gapped_text',
  'heading',
  'multiple_matching',
  'synonym',
  'antonym',
  'define_word',
  'word_to_definition',
  'situation',
  'response',
  'dialogue',
  'register',
  'british_american',
  'odd_sound',
  'stress',
  'dictation',
  'listen_choice',
  'listen_gap',
  'listen_true_false',
  'listen_intention',
  'image_choice',
  'situation_rewrite',
  'polarity',
  'passive',
  'reported',
  'conditional',
  'combine',
  'linker',
  'certainty',
]);

export const TRAINING_LISTENING_FORMATS = Object.freeze(
  new Set(['dictation', 'listen_choice', 'listen_gap', 'listen_true_false', 'listen_intention']),
);

/** Long texts that are hidden on a phone once the answer is shown, so nothing scrolls. */
export const TRAINING_LONG_TEXT_FORMATS = Object.freeze(
  new Set(['text_gaps', 'open_cloze', 'mc_cloze', 'linker']),
);

export function trainingItemFormat(item) {
  return item?.format || 'gap';
}

export function trainingFormatFamily(item) {
  return TRAINING_FORMAT_FAMILY[trainingItemFormat(item)] || null;
}

export function isTrainingListeningItem(item) {
  return TRAINING_LISTENING_FORMATS.has(trainingItemFormat(item));
}

/** Letters for options and texts: A, B, C… */
export function trainingLetter(index) {
  return String.fromCharCode(65 + index);
}

function hashSeed(text) {
  let hash = 2166136261;
  for (const char of String(text || '')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffledIndexes(count, next) {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** How much of the original order survives: items left in place plus neighbours still in sequence. */
function orderGiveaway(order) {
  return order.reduce(
    (score, value, index) => score + (value === index) + (index > 0 && value === order[index - 1] + 1),
    0,
  );
}

/**
 * Stable shuffle of `0…count-1`, so an item keeps the same order while the student works on it.
 * Unless `allowIdentity`, it never returns the original order and keeps as little of it as it can
 * (steps to order, pairs to match and sentences to place must not read off the screen).
 */
export function seededOrder(count, seed, { allowIdentity = false } = {}) {
  let state = hashSeed(seed) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  if (allowIdentity || count < 2) return shuffledIndexes(count, next);

  const enough = Math.floor(count / 3);
  let best = null;
  let bestScore = Infinity;
  for (let attempt = 0; attempt < 40 && bestScore > enough; attempt += 1) {
    const order = shuffledIndexes(count, next);
    const score = orderGiveaway(order);
    if (score < bestScore && order.some((value, index) => value !== index)) {
      best = order;
      bestScore = score;
    }
  }
  return best || Array.from({ length: count }, (_, index) => (index + 1) % count);
}

/**
 * The order in which a list of the item is shown. Authors often write the right option first,
 * so the new task types are always shuffled; `salt` separates several lists in one item.
 */
export function trainingDisplayOrder(item, count, salt = '', { allowIdentity = true } = {}) {
  return seededOrder(count, `${item?.displaySeed || item?.itemId || ''}|${salt}`, { allowIdentity });
}

const SLOT_MARKER = /\[(\d+)\]/g;

/** `[1]`, `[2]`… markers in a gapped text, in reading order. */
export function passageSlotNumbers(passage = '') {
  return [...String(passage).matchAll(SLOT_MARKER)].map((match) => Number(match[1]));
}

/**
 * Slots, options and key for the three "place each piece" formats.
 * `options` stay in authored order; the widget decides the display order.
 */
export function trainingSlotModel(item) {
  const format = trainingItemFormat(item);
  if (format === 'multiple_matching') {
    const texts = item?.texts || [];
    return {
      reuse: true,
      slots: (item?.questions || []).map((question) => question.text),
      options: texts.map((text, index) => ({
        label: trainingLetter(index),
        name: text.label,
        text: text.text,
      })),
      correct: (item?.questions || []).map((question) => question.answer),
    };
  }

  const count =
    format === 'dialogue'
      ? (item?.lines || []).filter((line) => line.text == null).length
      : passageSlotNumbers(item?.passage).length;
  return {
    reuse: false,
    slots: Array.from({ length: count }, (_, index) => `Gap ${index + 1}`),
    options: (item?.options || []).map((text) => ({ text })),
    correct: Array.from({ length: count }, (_, index) => index),
  };
}

function orderSequenceFor(item) {
  const pool = (item?.words || []).map((word, index) => ({ word, index }));
  const sequence = [];
  for (const word of String(item?.canonicalAnswer || '').split(' ')) {
    const found = pool.find((entry) => entry.word.toLowerCase() === word.toLowerCase());
    if (!found) return null;
    sequence.push(found.index);
    pool.splice(pool.indexOf(found), 1);
  }
  return sequence;
}

/** The `values` a student would send with every answer right. */
export function canonicalTrainingValues(item) {
  const family = trainingFormatFamily(item);
  if (family === 'gaps' || family === 'select_gaps') {
    return Object.fromEntries((item.gaps || []).map((gap, index) => [index + 1, gap.canonicalAnswer]));
  }
  if (family === 'choice') return { selected: item.correctId };
  if (family === 'text' || family === 'short_text') return { text: item.canonicalAnswer };
  if (family === 'order') return { sequence: orderSequenceFor(item) || [] };
  if (family === 'sequence') {
    return { sequence: (item.events || []).map((_, index) => index) };
  }
  if (family === 'tap') return { token: item.correctIndex };
  if (family === 'multi') return { picked: [...(item.correctIds || [])] };
  if (family === 'match') {
    return { pairs: Object.fromEntries((item.pairs || []).map((_, index) => [index, index])) };
  }
  if (family === 'classify') {
    return {
      assign: Object.fromEntries((item.words || []).map((word, index) => [index, word.category])),
    };
  }
  if (family === 'slots') {
    const model = trainingSlotModel(item);
    return { slots: Object.fromEntries(model.correct.map((answer, index) => [index, answer])) };
  }
  return {};
}

/** True once the student has given something for every part of the item. */
export function canSubmitTrainingItem(item, values = {}) {
  const family = trainingFormatFamily(item);
  if (family === 'gaps' || family === 'select_gaps') {
    return (item?.gaps || []).every((_, position) => String(values[position + 1] ?? '').trim());
  }
  if (family === 'text' || family === 'short_text') return Boolean(String(values.text || '').trim());
  if (family === 'order') return (values.sequence || []).length === (item?.words || []).length;
  if (family === 'sequence') return (values.sequence || []).length === (item?.events || []).length;
  if (family === 'tap') return Number.isInteger(values.token);
  if (family === 'multi') return (values.picked || []).length > 0;
  if (family === 'match') {
    return (item?.pairs || []).every((_, index) => Number.isInteger(values.pairs?.[index]));
  }
  if (family === 'classify') {
    return (item?.words || []).every((_, index) => Number.isInteger(values.assign?.[index]));
  }
  if (family === 'slots') {
    return trainingSlotModel(item).slots.every((_, index) => Number.isInteger(values.slots?.[index]));
  }
  return Boolean(values.selected);
}

/** The key, one line per part, for the feedback box and the mistakes review. */
export function trainingSolutionLines(item) {
  const format = trainingItemFormat(item);
  const family = trainingFormatFamily(item);

  if (family === 'gaps' || family === 'select_gaps') {
    const answers = (item.gaps || []).map((gap) => gap.canonicalAnswer);
    if (answers.length >= 3) return answers.map((answer, index) => `${index + 1}. ${answer}`);
    return [answers.join(' / ')];
  }
  if (family === 'sequence') return (item.events || []).map((event, index) => `${index + 1}. ${event}`);
  if (format === 'spot_error') {
    return [`${item.chunks?.[item.correctIndex] ?? ''} → ${item.correction ?? ''}`];
  }
  if (format === 'stress') {
    return [
      (item.syllables || [])
        .map((syllable, index) => (index === item.correctIndex ? syllable.toUpperCase() : syllable))
        .join('·'),
    ];
  }
  if (family === 'multi') {
    return (item.options || [])
      .filter((option) => (item.correctIds || []).includes(option.id))
      .map((option) => option.text);
  }
  if (family === 'match') return (item.pairs || []).map((pair) => `${pair.left} → ${pair.right}`);
  if (family === 'classify') {
    return (item.categories || []).map((category, categoryIndex) => {
      const words = (item.words || [])
        .filter((word) => word.category === categoryIndex)
        .map((word) => word.text);
      return `${category}: ${words.join(', ')}`;
    });
  }
  if (family === 'slots') {
    const model = trainingSlotModel(item);
    if (format === 'multiple_matching') {
      return model.slots.map((slot, index) => {
        const option = model.options[model.correct[index]];
        return `${slot} → ${option?.label} (${option?.name})`;
      });
    }
    return model.correct.map((answer, index) => `${index + 1}. ${model.options[answer]?.text ?? ''}`);
  }
  const single = item?.solution || item?.canonicalAnswer || '';
  return single ? [single] : [];
}

/** One line that reminds the student what the item was, for the mistakes review. */
export function trainingItemPromptText(item) {
  const raw =
    item?.lead ||
    item?.sentence ||
    item?.context ||
    item?.passage ||
    (item?.chunks ? item.chunks.join(' ') : '') ||
    item?.word ||
    (item?.pairs ? item.pairs.map((pair) => pair.left).join(', ') : '') ||
    (item?.words ? item.words.map((word) => word.text || word).join(', ') : '') ||
    (item?.lines ? item.lines.map((line) => line.text || '…').join(' / ') : '') ||
    (item?.questions ? item.questions.map((question) => question.text).join(' / ') : '') ||
    (item?.events ? item.events.join(' / ') : '') ||
    item?.audio ||
    item?.instruction ||
    '';
  const text = String(raw)
    .replace(/\*\*/g, '')
    .replace(/\{\d+\}/g, '___')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

/** Plain text for speech: no bold markers, no gap tokens. */
export function trainingSpeechText(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/\{\d+\}/g, '')
    .trim();
}
