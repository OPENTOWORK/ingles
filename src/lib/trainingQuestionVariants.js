/**
 * Turns one authored question into the formats that still make sense for it.
 * A format is left out when the sentence cannot support it.
 */

function shuffle(list) {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/** Correct form → other present-simple mistakes and other tenses. */
const DISTRACTORS = {
  works: ['work', 'is working', 'worked'],
  stops: ['stop', 'is stopping', 'stopped'],
  creates: ['create', 'is creating', 'created'],
  seems: ['seem', 'is seeming', 'seemed'],
  gives: ['give', 'is giving', 'gave'],
  uses: ['use', 'is using', 'used'],
  leaves: ['leave', 'is leaving', 'left'],
  runs: ['run', 'is running', 'ran'],
  cost: ['costs', 'are costing', 'were'],
  opens: ['open', 'is opening', 'opened'],
  describes: ['describe', 'is describing', 'described'],
  listen: ['listens', 'am listening', 'listened'],
  rise: ['rises', 'are rising', 'rose'],
  makes: ['make', 'is making', 'made'],
  are: ['is', 'are being', 'were'],
  buy: ['buys', 'are buying', 'bought'],
  serves: ['serve', 'is serving', 'served'],
  open: ['opens', 'is opening', 'opened'],
  travels: ['travel', 'is travelling', 'travelled'],
  "don't understand": ["doesn't understand", 'am not understanding', "didn't understand"],
  "don't match": ["doesn't match", "aren't matching", "didn't match"],
  "doesn't permit": ["don't permit", "isn't permitting", "didn't permit"],
  "doesn't warn": ["don't warn", "isn't warning", "didn't warn"],
  "doesn't allow": ["don't allow", "isn't allowing", "didn't allow"],
  "doesn't stop": ["don't stop", "isn't stopping", "didn't stop"],
  "don't mind": ["doesn't mind", 'am not minding', "didn't mind"],
  supports: ['support', 'is supporting', 'supported'],
  "doesn't consider": ["don't consider", "isn't considering", "didn't consider"],
  work: ['works', 'are working', 'worked'],
  costs: ['cost', 'is costing', 'costed'],
  belongs: ['belong', 'is belonging', 'belonged'],
  applies: ['apply', 'is applying', 'applied'],
  contradicts: ['contradict', 'are contradicting', 'contradicted'],
  publishes: ['publish', 'is publishing', 'published'],
  argues: ['argue', 'are arguing', 'argued'],
  wants: ['want', 'are wanting', 'wanted'],
  close: ['closes', 'is closing', 'closed'],
  recommends: ['recommend', 'is recommending', 'recommended'],
  tend: ['tends', 'are tending', 'tended'],
  submits: ['submit', 'are submitting', 'submitted'],
  'object to': ['objects to', 'is objecting to', 'objected to'],
};

const TWO_GAP_CHOICES = {
  'b2-basic-01-q04': {
    sentence: 'How often ___ its cybersecurity procedures?',
    correct: 'does your department review',
    distractors: [
      'do your department reviews',
      'is your department reviewing',
      'did your department review',
    ],
  },
  'b2-basic-01-q07': {
    sentence: 'Why ___ so much more than the standard version?',
    correct: 'does this particular model cost',
    distractors: [
      'do this particular model costs',
      'is this particular model costing',
      'did this particular model cost',
    ],
  },
  'b2-basic-01-q10': {
    sentence: 'What ___ in the final paragraph of the report?',
    correct: 'does this abbreviation mean',
    distractors: [
      'do this abbreviation means',
      'is this abbreviation meaning',
      'did this abbreviation mean',
    ],
  },
  'b2-basic-01-q33': {
    sentence: 'How often ___ the legal threshold in practice?',
    correct: 'does either proposal meet',
    distractors: [
      'do either proposal meets',
      'is either proposal meeting',
      'did either proposal meet',
    ],
  },
};

function keyOf(value) {
  return String(value || '')
    .replace(/\u2019/g, "'")
    .toLowerCase()
    .trim();
}

function distractorsFor(correct) {
  return DISTRACTORS[keyOf(correct)] || null;
}

function completedSentence(item) {
  let sentence = item.sentence || '';
  (item.gaps || []).forEach((gap, index) => {
    sentence = sentence.replace(`{${index + 1}}`, gap.canonicalAnswer);
  });
  if (sentence.includes('___')) {
    const correct = (item.options || []).find((option) => option.id === item.correctId);
    if (correct) sentence = sentence.replace('___', correct.text);
  }
  return sentence.replace(/\s+/g, ' ').trim();
}

function choiceFromForms(
  item,
  sentence,
  correct,
  distractors,
  instruction = 'Choose the correct answer.',
) {
  const forms = [correct, ...distractors.filter((form) => keyOf(form) !== keyOf(correct))].slice(0, 4);
  if (forms.length < 2) return null;
  const options = shuffle(forms).map((text, index) => ({
    id: ['a', 'b', 'c', 'd'][index],
    text,
  }));
  return {
    ...item,
    format: 'choice',
    instruction,
    sentence,
    promptWord: '',
    options,
    correctId: options.find((option) => keyOf(option.text) === keyOf(correct)).id,
    solution: correct,
    gaps: undefined,
    words: undefined,
    canonicalAnswer: undefined,
  };
}

function trueFalseFrom(item, correctSentence, wrongSentence) {
  const useWrong = Boolean(wrongSentence) && Math.random() < 0.5;
  const sentence = useWrong ? wrongSentence : correctSentence;
  return {
    ...item,
    format: 'true_false',
    instruction: 'Is this sentence correct?',
    sentence,
    promptWord: '',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctId: useWrong ? 'false' : 'true',
    solution: useWrong ? 'False' : 'True',
    explanation: item.explanation,
    gaps: undefined,
    words: undefined,
    canonicalAnswer: undefined,
  };
}

function replaceForm(sentence, correct, wrong) {
  const escaped = correct.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, wrong);
}

function orderFrom(item, sentence) {
  const clean = sentence.replace(/[.?!]+$/g, '').trim();
  const words = clean.split(' ');
  if (words.length < 4 || words.length > 12) return null;
  if (words.some((word) => /[,:;]/.test(word))) return null;
  return {
    ...item,
    format: 'order',
    instruction: 'Put the words in order.',
    sentence: '',
    promptWord: '',
    words: shuffle(words),
    canonicalAnswer: clean,
    acceptedAnswers: [clean, sentence],
    solution: sentence,
    gaps: undefined,
    options: undefined,
  };
}

function gapFromChoice(item) {
  const correct = (item.options || []).find((option) => option.id === item.correctId);
  if (!item.sentence?.includes('___') || !correct) return null;
  if (correct.text.split(' ').length > 4) return null;
  if (/^(states|gives|describes|talks|complains|makes|suggests)\b/i.test(correct.text)) return null;
  return {
    ...item,
    format: 'gap',
    instruction: 'Complete the gap.',
    sentence: item.sentence.replace('___', '{1}'),
    promptWord: '',
    gaps: [{ canonicalAnswer: correct.text, acceptedAnswers: [correct.text] }],
    options: undefined,
    correctId: undefined,
    words: undefined,
    canonicalAnswer: undefined,
  };
}

function wrongPresent(sentence) {
  const swaps = [
    [/\bdoesn't\b/i, "don't"],
    [/\bdon't\b/i, "doesn't"],
    [/\bDoes\b/, 'Do'],
    [/\battracts\b/, 'attract'],
    [/\bfreezes\b/, 'freeze'],
    [/\brecycles\b/i, 'recycle'],
    [/\bunderstands\b/i, 'understand'],
  ];
  for (const [pattern, next] of swaps) {
    if (pattern.test(sentence)) return sentence.replace(pattern, next);
  }
  return null;
}

function expandGap(item) {
  const variants = [{ ...item, format: 'gap' }];
  const pair = TWO_GAP_CHOICES[item.itemId];
  if (pair) {
    variants.push(choiceFromForms(item, pair.sentence, pair.correct, pair.distractors));
    const filled = completedSentence(item);
    const wrong = pair.distractors[0];
    const wrongSentence = item.sentence.includes('{1}')
      ? pair.sentence.replace('___', wrong)
      : null;
    if (wrongSentence) variants.push(trueFalseFrom(item, filled, wrongSentence));
    return variants.filter(Boolean);
  }

  if ((item.gaps || []).length !== 1) return variants;

  const correct = item.gaps[0].canonicalAnswer;
  const distractors = distractorsFor(correct);
  const blank = item.sentence.replace('{1}', '___');
  const filled = completedSentence(item);

  if (distractors) {
    variants.push(choiceFromForms(item, blank, correct, distractors));
    const wrongSentence = replaceForm(filled, correct, distractors[0]);
    if (wrongSentence) variants.push(trueFalseFrom(item, filled, wrongSentence));
  }

  const ordered = orderFrom(item, filled);
  if (ordered) variants.push(ordered);
  return variants.filter(Boolean);
}

function expandChoice(item) {
  const variants = [{ ...item, format: item.format || 'choice' }];
  const asGap = gapFromChoice(item);
  if (asGap) variants.push(asGap);

  const correct = (item.options || []).find((option) => option.id === item.correctId);
  const wrong = (item.options || []).find((option) => option.id !== item.correctId);
  if (item.sentence?.includes('___') && correct && wrong && correct.text.split(' ').length <= 4) {
    const filled = item.sentence.replace('___', correct.text);
    const incorrect = item.sentence.replace('___', wrong.text);
    variants.push(trueFalseFrom(item, filled, incorrect));
    const ordered = orderFrom(item, filled);
    if (ordered) variants.push(ordered);
  }
  return variants;
}

function expandTransform(item) {
  const variants = [{ ...item, format: 'transform' }];
  const correct = String(item.canonicalAnswer || '').replace(/[.?!]+$/g, '');
  const original = String(item.sentence || '').replace(/[.?!]+$/g, '');
  const broken = wrongPresent(correct);
  const distractors = [original, broken].filter((text) => text && keyOf(text) !== keyOf(correct));
  if (distractors.length) {
    variants.push(
      choiceFromForms(item, item.sentence, correct, distractors, 'Choose the correct sentence.'),
    );
  }
  return variants.filter(Boolean);
}

function expandOrder(item) {
  const variants = [{ ...item, format: 'order' }];
  const correct = String(item.canonicalAnswer || '').trim();
  const words = correct.split(' ');
  if (words.length >= 4) {
    const rotated = [...words.slice(1), words[0]].join(' ');
    if (keyOf(rotated) !== keyOf(correct)) {
      const mark = String(item.solution || '').trim().endsWith('?') ? '?' : '.';
      variants.push(
        choiceFromForms(item, '', correct + mark, [rotated + mark], 'Choose the correct sentence.'),
      );
      variants.push(trueFalseFrom(item, correct + mark, rotated + mark));
    }
  }
  return variants.filter(Boolean);
}

/** Every way this question can be asked. Always includes the original. */
export function expandItem(item) {
  const format = item?.format || 'gap';
  if (format === 'gap') return dedupe(expandGap(item));
  if (format === 'choice' || format === 'tense') return dedupe(expandChoice(item));
  if (format === 'transform') return dedupe(expandTransform(item));
  if (format === 'order') return dedupe(expandOrder(item));
  return [{ ...item, format }];
}

function dedupe(variants) {
  const seen = new Set();
  return variants.filter((variant) => {
    if (!variant?.format || seen.has(variant.format)) return false;
    seen.add(variant.format);
    return true;
  });
}
