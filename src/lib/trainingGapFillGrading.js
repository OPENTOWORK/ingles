import { countCambridgeKeyWordWords } from '@/lib/countCambridgeKeyWordWords';
import { normalizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { ruoeAnswersShareCanonicalForm } from '@/lib/ruoeContractionEquivalence';
import {
  TRAINING_PATH_TYPE_FORMATS,
  passageSlotNumbers,
  trainingFormatFamily,
  trainingSlotModel,
  trainingSolutionLines,
} from '@/lib/trainingItemFormats';

/** Performance tags shared with the rest of the grammar path. */
export const GAP_FILL_ERROR_TAG_LABELS = Object.freeze({
  present_simple_third_person: 'Third-person -s',
  present_simple_negative: 'Present simple negatives',
  present_simple_question: 'Present simple questions',
  present_simple_stative: 'Stative verbs',
  present_simple_schedule: 'Timetables and schedules',
  present_simple_repeated_event: 'Repeated events and processes',
  subject_verb_agreement: 'Subject–verb agreement',
  present_simple_tense_choice: 'Choosing the right tense',
  speaker_intention: 'Speaker intention',
  present_simple_true_false: 'True or false',
  present_simple_choice: 'Choosing the correct form',
  present_simple_transformation: 'Rewriting in the present simple',
  present_simple_word_order: 'Word order',
  error_spotting: 'Spotting the mistake',
  present_continuous_temporary: 'Temporary situations',
  present_continuous_arrangement: 'Future arrangements',
  present_continuous_annoyance: 'Always + continuous',
  present_continuous_stative: 'Verbs that stay simple',
  past_simple_finished: 'Finished past time',
  past_simple_narrative: 'Narrative sequence',
  past_simple_irregular: 'Irregular past forms',
  past_continuous_background: 'Background actions',
  past_continuous_interrupted: 'Interrupted actions',
  future_will: 'Will for decisions and predictions',
  future_going_to: 'Going to for plans and evidence',
  future_arrangement: 'Present continuous for arrangements',
  future_timetable: 'Present simple for timetables',
  present_perfect_result: 'Present perfect for results',
  present_perfect_experience: 'Present perfect for experience',
  present_perfect_vs_past: 'Present perfect or past simple',
  present_perfect_for_since: 'For and since',
  tense_sequence: 'Choosing the tense in context',
  zero_conditional: 'Zero conditional',
  first_conditional: 'First conditional',
  if_unless: 'If and unless',
  modal_obligation: 'Obligation and necessity',
  modal_advice: 'Advice',
  modal_permission: 'Permission',
  modal_meaning: 'Choosing the modal',
  passive_form: 'Passive forms',
  passive_agent: 'Passive and the agent',
  reported_statements: 'Reported statements',
  reported_tense: 'Backshift',
  comparative_form: 'Comparatives and superlatives',
  article_choice: 'Articles',
  quantifier_choice: 'Quantifiers',
  preposition_choice: 'Prepositions',
  linker_choice: 'Linkers',
  sentence_combining: 'Combining sentences',
  informal_rewrite: 'Informal rewriting',
  error_correction: 'Correcting mistakes',
  word_formation: 'Word formation',
  key_word_transformation: 'Key word transformations',
  paraphrase_meaning: 'Same meaning, different words',
  phrasal_verbs: 'Phrasal verbs',
  collocations: 'Collocations',
  vocabulary_meaning: 'Vocabulary and meaning',
  synonyms_antonyms: 'Synonyms and antonyms',
  definitions: 'Definitions',
  word_classes: 'Word groups',
  functional_language: 'What to say in context',
  register_choice: 'Formal and informal English',
  british_american: 'British and American English',
  pronunciation_sounds: 'Pronunciation',
  word_stress: 'Word stress',
  listening_detail: 'Listening for detail',
  listening_gist: 'Listening for the main idea',
  dictation_accuracy: 'Dictation',
  reading_gist: 'Reading for the main idea',
  reading_detail: 'Reading for detail',
  text_cohesion: 'Text cohesion',
  text_sequencing: 'Order of events',
  modal_certainty: 'Certainty and deduction',
  sentence_transformation: 'Sentence transformations',
  translation_to_english: 'Translating into English',
  translation_to_spanish: 'Translating into Spanish',
  topic_vocabulary: 'Topic vocabulary',
  adjectives: 'Adjectives',
  spelling: 'Spelling',
  numbers_dates: 'Numbers, days and dates',
  pronoun_choice: 'Pronouns',
  possessive_choice: 'Possessives',
  verb_to_be: 'The verb to be',
  plural_forms: 'Plurals',
  there_is_are: 'There is and there are',
  demonstratives: 'This, that, these and those',
  word_order: 'Word order',
  question_forms: 'Questions',
  frequency_adverbs: 'Adverbs of frequency',
  modal_ability: 'Can and can’t',
  verb_patterns: 'Verb patterns',
  past_to_be: 'Was and were',
  have_got: 'Have got',
});

const GAP_TOKEN = /\{(\d+)\}/g;

/** Same normalisation as the exam papers: case, spacing and typographic apostrophes. */
export function normalizeGapFillAnswer(raw) {
  return normalizeB2KeyWordAnswer(raw);
}

/** A whole sentence: commas, full stops and question marks inside it do not count. */
export function normalizeTrainingSentence(raw) {
  return normalizeGapFillAnswer(raw)
    .replace(/[,;:!?."“”()\u2014\u2013]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits `sentence` into text and gap parts, in reading order.
 * @param {string} sentence
 * @returns {Array<{ type: 'text', value: string } | { type: 'gap', index: number }>}
 */
export function parseGapFillSentence(sentence = '') {
  const parts = [];
  let cursor = 0;
  GAP_TOKEN.lastIndex = 0;

  for (let match = GAP_TOKEN.exec(sentence); match; match = GAP_TOKEN.exec(sentence)) {
    if (match.index > cursor) {
      parts.push({ type: 'text', value: sentence.slice(cursor, match.index) });
    }
    parts.push({ type: 'gap', index: Number(match[1]) });
    cursor = match.index + match[0].length;
  }

  if (cursor < sentence.length) {
    parts.push({ type: 'text', value: sentence.slice(cursor) });
  }
  return parts;
}

/**
 * Accepts the listed answers and their contraction equivalents (`don't` / `do not`).
 * A different tense or person is never accepted.
 * @param {string} value
 * @param {{ canonicalAnswer: string, acceptedAnswers?: string[] }} gap
 */
export function gapFillAnswerMatches(value, gap) {
  const student = normalizeGapFillAnswer(value);
  if (!student) return false;

  const accepted = gap?.acceptedAnswers?.length
    ? gap.acceptedAnswers
    : [gap?.canonicalAnswer].filter(Boolean);

  return accepted.some((answer) => {
    const expected = normalizeGapFillAnswer(answer);
    if (!expected) return false;
    if (student === expected) return true;
    return ruoeAnswersShareCanonicalForm(student, expected);
  });
}

/**
 * A rewritten sentence. Punctuation inside it is ignored and contractions count as the full form.
 * With `strict` (dictation) the words must be exactly the ones heard.
 */
export function sentenceAnswerMatches(value, item, { strict = false } = {}) {
  const student = normalizeTrainingSentence(value);
  if (!student) return false;

  const accepted = item?.acceptedAnswers?.length
    ? item.acceptedAnswers
    : [item?.canonicalAnswer].filter(Boolean);

  return accepted.some((answer) => {
    const expected = normalizeTrainingSentence(answer);
    if (!expected) return false;
    if (student === expected) return true;
    return !strict && ruoeAnswersShareCanonicalForm(student, expected);
  });
}

/** A Spanish sentence: accents, ñ and ¿ ¡ do not count, so a keyboard without them is not penalised. */
export function normalizeSpanishSentence(raw) {
  return normalizeTrainingSentence(raw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿¡]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A translation into Spanish must be one of the listed versions. */
export function spanishAnswerMatches(value, item) {
  const student = normalizeSpanishSentence(value);
  if (!student) return false;

  const accepted = item?.acceptedAnswers?.length
    ? item.acceptedAnswers
    : [item?.canonicalAnswer].filter(Boolean);

  return accepted.some((answer) => normalizeSpanishSentence(answer) === student);
}

/**
 * @param {{ gaps: Array<{ canonicalAnswer: string, acceptedAnswers?: string[] }> }} item
 * @param {Record<number, string>} values Keyed by gap number (1-based).
 */
export function gradeGapFillItem(item, values = {}) {
  const gaps = (item?.gaps || []).map((gap, position) => {
    const index = position + 1;
    const value = values[index] ?? '';
    return { index, value, correct: gapFillAnswerMatches(value, gap) };
  });

  return { correct: gaps.length > 0 && gaps.every((gap) => gap.correct), gaps };
}

/** Canonical solution shown once the student has used up the attempts. */
export function formatGapFillSolution(item) {
  return (item?.gaps || []).map((gap) => gap.canonicalAnswer).join(' / ');
}

const CHOICE_FORMATS = new Set(['choice', 'tense', 'intention', 'true_false', 'error']);
const TYPE_FORMATS = new Set(TRAINING_PATH_TYPE_FORMATS);

function sameSet(left = [], right = []) {
  if (left.length !== right.length) return false;
  const pool = new Set(left);
  return right.every((value) => pool.has(value));
}

/** Grades any training item. `gaps` is only filled for typed gaps. */
export function gradeTrainingItem(item, values = {}) {
  const format = item?.format || 'gap';
  const family = trainingFormatFamily(item);

  if (family === 'gaps' || family === 'select_gaps') return gradeGapFillItem(item, values);

  if (family === 'choice') {
    const selected = values.selected || '';
    return { correct: Boolean(selected) && selected === item.correctId, gaps: [] };
  }

  if (family === 'order') {
    const raw = (values.sequence || []).map((index) => item.words?.[index]).join(' ');
    return {
      correct: gapFillAnswerMatches(raw, {
        canonicalAnswer: item.canonicalAnswer,
        acceptedAnswers: item.acceptedAnswers,
      }),
      gaps: [],
    };
  }

  if (family === 'text') {
    if (format === 'translate_to_spanish') {
      return { correct: spanishAnswerMatches(values.text || '', item), gaps: [] };
    }
    if (format === 'transform') {
      return {
        correct: gapFillAnswerMatches(values.text || '', {
          canonicalAnswer: item.canonicalAnswer,
          acceptedAnswers: item.acceptedAnswers,
        }),
        gaps: [],
      };
    }
    return {
      correct: sentenceAnswerMatches(values.text || '', item, { strict: format === 'dictation' }),
      gaps: [],
    };
  }

  if (family === 'short_text') {
    return {
      correct: gapFillAnswerMatches(values.text || '', {
        canonicalAnswer: item.canonicalAnswer,
        acceptedAnswers: item.acceptedAnswers,
      }),
      gaps: [],
    };
  }

  if (family === 'sequence') {
    const sequence = values.sequence || [];
    const events = item?.events || [];
    return {
      correct: sequence.length === events.length && sequence.every((value, index) => value === index),
      gaps: [],
    };
  }

  if (family === 'tap') {
    return { correct: Number.isInteger(values.token) && values.token === item.correctIndex, gaps: [] };
  }

  if (family === 'multi') {
    return { correct: sameSet(values.picked || [], item.correctIds || []), gaps: [] };
  }

  if (family === 'match') {
    const pairs = item?.pairs || [];
    return {
      correct: pairs.length > 0 && pairs.every((_, index) => values.pairs?.[index] === index),
      gaps: [],
    };
  }

  if (family === 'classify') {
    const words = item?.words || [];
    return {
      correct: words.length > 0 && words.every((word, index) => values.assign?.[index] === word.category),
      gaps: [],
    };
  }

  if (family === 'slots') {
    const model = trainingSlotModel(item);
    return {
      correct:
        model.correct.length > 0 &&
        model.correct.every((answer, index) => values.slots?.[index] === answer),
      gaps: [],
    };
  }

  return { correct: false, gaps: [] };
}

export function formatTrainingSolution(item) {
  const format = item?.format || 'gap';
  if (format === 'gap') return formatGapFillSolution(item);
  if (TYPE_FORMATS.has(format)) return trainingSolutionLines(item).join(' · ');
  return item?.solution || item?.canonicalAnswer || '';
}

/**
 * Grammar areas behind the wrong answers, most frequent first.
 * @param {Array<{ errorTag?: string }>} failedItems
 * @returns {Array<{ tag: string, label: string, count: number }>}
 */
export function summariseGapFillErrors(failedItems = []) {
  const counts = new Map();
  for (const item of failedItems) {
    const tag = item?.errorTag;
    if (!tag) continue;
    counts.set(tag, (counts.get(tag) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count, label: GAP_FILL_ERROR_TAG_LABELS[tag] || tag }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Spellings that give away American English in an item meant to be British. */
const NON_BRITISH_PATTERNS = [
  /\b(?!(?:size|sizes|sized|sizing|prize|prizes|prized|seize|seizes|seized|seizing|capsize|capsized|downsize|downsized|downsizing|oversize|oversized|resize|resized|citizen|citizens)\b)\w+iz(e|es|ed|ing|ation|ations)\b/i,
  /\bcolors?\b/i,
  /\bbehaviors?\b/i,
  /\bcenters?\b/i,
  /\bprograms?\b/i,
  /\banalyze[sd]?\b/i,
  /\bpracticing\b/i,
  /\b(favor|honor|labor|neighbor|humor|rumor|flavor|harbor)(s|ed|ing|ite|ites|able|hood)?\b/i,
  /\btheaters?\b/i,
  /\btravel(ed|ing|er|ers)\b/i,
  /\bcancel(ed|ing)\b/i,
  /\b(defense|offense|catalog|jewelry)\b/i,
  /\bgray\b/i,
  /\b(fulfill|fulfills|enroll|enrolls)\b/i,
];

function britishFindings(where, text, findings) {
  for (const pattern of NON_BRITISH_PATTERNS) {
    if (pattern.test(text)) findings.push(`${where}: non-British spelling (${pattern})`);
  }
}

/**
 * Every piece of English a student can read: not the American column of a UK/US match, nor the
 * Spanish side of a translation (or its explanation, which quotes Spanish words like "color").
 */
function itemText(item) {
  const parts = [
    item.sentence,
    item.lead,
    item.context,
    item.passage,
    item.explanation,
    item.solution,
    item.canonicalAnswer,
    item.word,
    item.correction,
    item.audio,
    ...(item.acceptedAnswers || []),
    ...(item.options || []).map((option) => (typeof option === 'string' ? option : option.text)),
    ...(item.gaps || []).flatMap((gap) => [gap.hint, ...(gap.acceptedAnswers || []), ...(gap.options || [])]),
    ...(item.chunks || []),
    ...(item.events || []),
    ...(item.categories || []),
    ...(item.words || []).map((word) => (typeof word === 'string' ? word : word.text)),
    ...(item.texts || []).flatMap((text) => [text.label, text.text]),
    ...(item.questions || []).map((question) => question.text),
    ...(item.lines || []).map((line) => line.text),
  ];
  if (item.format === 'translate_to_english' || item.format === 'translate_to_spanish') {
    const spanish =
      item.format === 'translate_to_english'
        ? [item.sentence]
        : [item.canonicalAnswer, item.solution, ...(item.acceptedAnswers || [])];
    return parts
      .filter((part) => part && part !== item.explanation && !spanish.includes(part))
      .join(' ');
  }
  if (item.format === 'british_american') {
    parts.push(...(item.pairs || []).map((pair) => pair.left));
    return parts
      .filter((part) => part !== item.explanation)
      .filter(Boolean)
      .join(' ');
  }
  parts.push(...(item.pairs || []).flatMap((pair) => [pair.left, pair.right]));
  return parts.filter(Boolean).join(' ');
}

function checkAccepted(label, canonicalRaw, acceptedRaw, findings, normalize = normalizeGapFillAnswer) {
  const canonical = normalize(canonicalRaw);
  if (!canonical) {
    findings.push(`${label}: missing canonicalAnswer`);
    return;
  }
  const accepted = acceptedRaw || [];
  if (accepted.length && !accepted.some((answer) => normalize(answer) === canonical)) {
    findings.push(`${label}: acceptedAnswers must include the canonical answer`);
  }
  const normalized = accepted.map(normalize);
  if (new Set(normalized).size !== normalized.length) {
    findings.push(`${label}: duplicated accepted answers`);
  }
}

function checkGapTokens(where, sentence, gapCount, findings) {
  const tokens = parseGapFillSentence(sentence || '').filter((part) => part.type === 'gap');
  if (tokens.length !== gapCount) {
    findings.push(`${where}: sentence has ${tokens.length} gap tokens but ${gapCount} answers`);
  }
  tokens.forEach((token, position) => {
    if (token.index !== position + 1) findings.push(`${where}: gap tokens must be numbered in reading order`);
  });
}

function checkCount(where, what, count, min, max, findings) {
  if (count < min || count > max) {
    findings.push(`${where}: needs ${min}–${max} ${what}, found ${count}`);
  }
}

function checkOptions(where, item, findings, { min = 2, max = 5 } = {}) {
  const options = item.options || [];
  checkCount(where, 'options', options.length, min, max, findings);
  if (!options.some((option) => option.id === item.correctId)) {
    findings.push(`${where}: correctId is not one of the options`);
  }
  const texts = options.map((option) => normalizeGapFillAnswer(String(option.text).replace(/\*\*/g, '')));
  if (new Set(texts).size !== texts.length) findings.push(`${where}: two options are the same`);
}

function wholeWord(text, word) {
  const escaped = String(word).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z'])${escaped}($|[^a-z'])`, 'i').test(String(text));
}

function fillGaps(sentence, gaps) {
  return String(sentence || '').replace(GAP_TOKEN, (_, number) => gaps[Number(number) - 1]?.canonicalAnswer || '');
}

/** Checks for the 45 task types and translation; the original seven formats keep their own rules below. */
function validateTypeItem(item, where, findings) {
  const format = item.format;
  const family = trainingFormatFamily(item);

  if (!item.instruction?.trim()) findings.push(`${where}: missing instruction`);

  if (family === 'gaps' || family === 'select_gaps') {
    const gaps = item.gaps || [];
    if (!gaps.length) findings.push(`${where}: no gaps`);
    checkGapTokens(where, item.sentence, gaps.length, findings);

    gaps.forEach((gap, position) => {
      const label = `${where} gap ${position + 1}`;
      checkAccepted(label, gap?.canonicalAnswer, gap?.acceptedAnswers, findings);
      if (family === 'select_gaps') {
        const options = gap?.options || [];
        checkCount(label, 'options', options.length, 2, 5, findings);
        if (!options.includes(gap?.canonicalAnswer)) findings.push(`${label}: the answer is not one of the options`);
        if (new Set(options.map(normalizeGapFillAnswer)).size !== options.length) {
          findings.push(`${label}: two options are the same`);
        }
      }
    });

    const single = ['word_formation', 'preposition', 'phrasal', 'collocation', 'key_word'];
    if (single.includes(format)) checkCount(where, 'gaps', gaps.length, 1, 1, findings);
    if (format === 'text_gaps' || format === 'open_cloze' || format === 'mc_cloze') {
      checkCount(where, 'gaps', gaps.length, 3, 6, findings);
    }
    if (format === 'linker') checkCount(where, 'gaps', gaps.length, 1, 4, findings);
    if (format === 'listen_gap') checkCount(where, 'gaps', gaps.length, 1, 2, findings);

    if (format === 'word_formation') {
      if (!item.promptWord?.trim()) findings.push(`${where}: missing base word`);
      else if (item.promptWord !== item.promptWord.toUpperCase()) {
        findings.push(`${where}: the base word must be upper case`);
      }
    }
    if (format === 'text_gaps' && gaps.some((gap) => !gap?.hint?.trim())) {
      findings.push(`${where}: every gap needs the word in brackets`);
    }
    if (format === 'open_cloze') {
      gaps.forEach((gap, position) => {
        const answers = gap?.acceptedAnswers?.length ? gap.acceptedAnswers : [gap?.canonicalAnswer];
        if (answers.some((answer) => normalizeGapFillAnswer(answer).includes(' '))) {
          findings.push(`${where} gap ${position + 1}: an open cloze answer is one word`);
        }
      });
    }
    if (format === 'key_word') {
      if (!item.lead?.trim()) findings.push(`${where}: missing first sentence`);
      const keyword = item.keyword || '';
      if (!keyword.trim() || keyword !== keyword.toUpperCase() || /\s/.test(keyword.trim())) {
        findings.push(`${where}: the key word must be one upper-case word`);
      }
      const gap = gaps[0];
      const answers = gap?.acceptedAnswers?.length ? gap.acceptedAnswers : [gap?.canonicalAnswer];
      answers.filter(Boolean).forEach((answer) => {
        if (!wholeWord(answer, keyword)) findings.push(`${where}: "${answer}" does not use the key word`);
        const words = countCambridgeKeyWordWords(answer);
        if (words < 2 || words > 5) findings.push(`${where}: "${answer}" has ${words} words, not 2–5`);
      });
    }
    if (format === 'listen_gap') {
      if (!item.audio?.trim()) findings.push(`${where}: missing audio text`);
      else if (normalizeTrainingSentence(fillGaps(item.sentence, gaps)) !== normalizeTrainingSentence(item.audio)) {
        findings.push(`${where}: the completed sentence must match the audio`);
      }
    }
  }

  if (family === 'choice') {
    const max = format === 'listen_true_false' ? 2 : 5;
    checkOptions(where, item, findings, { min: 2, max });
    if (format === 'odd_one_out' || format === 'odd_sound') {
      checkCount(where, 'options', (item.options || []).length, 4, 4, findings);
    }
    if (['listen_choice', 'listen_true_false', 'listen_intention'].includes(format) && !item.audio?.trim()) {
      findings.push(`${where}: missing audio text`);
    }
    if (format === 'image_choice') {
      if (!/^\/training\/images\/[\w-]+\.(jpg|png|webp)$/.test(item.image || '')) {
        findings.push(`${where}: image must live in /training/images/`);
      }
      if (!item.imageAlt?.trim()) findings.push(`${where}: missing image description`);
    }
    if (format === 'heading' && !item.passage?.trim()) findings.push(`${where}: missing text`);
    if (['situation', 'register', 'certainty'].includes(format) && !item.context?.trim()) {
      findings.push(`${where}: missing situation`);
    }
    if (format === 'certainty' && !String(item.sentence || '').includes('___')) {
      findings.push(`${where}: the sentence needs a ___ gap`);
    }
    if ((format === 'synonym' || format === 'antonym') && !/\*\*[^*]+\*\*/.test(item.sentence || '')) {
      findings.push(`${where}: mark the target word in **bold**`);
    }
    if (['response', 'word_to_definition', 'paraphrase', 'mcq'].includes(format) && !item.sentence?.trim()) {
      findings.push(`${where}: missing sentence`);
    }
  }

  if (family === 'text' || family === 'short_text') {
    let normalize = family === 'text' ? normalizeTrainingSentence : normalizeGapFillAnswer;
    if (format === 'translate_to_spanish') normalize = normalizeSpanishSentence;
    checkAccepted(where, item.canonicalAnswer, item.acceptedAnswers, findings, normalize);
    const needsSentence = !['dictation', 'conditional', 'situation_rewrite'].includes(format);
    if (needsSentence && !item.sentence?.trim()) findings.push(`${where}: missing sentence`);
    if ((format === 'conditional' || format === 'situation_rewrite') && !item.context?.trim()) {
      findings.push(`${where}: missing situation`);
    }
    if (format === 'dictation') {
      if (!item.audio?.trim()) findings.push(`${where}: missing audio text`);
      else if (normalizeTrainingSentence(item.audio) !== normalizeTrainingSentence(item.canonicalAnswer)) {
        findings.push(`${where}: a dictation answer is exactly the audio`);
      }
      if (/\d/.test(item.audio || '')) findings.push(`${where}: write numbers as words in a dictation`);
    }
    if (format === 'combine' || format === 'situation_rewrite') {
      const use = item.use || '';
      if (!use.trim() || use !== use.toUpperCase()) findings.push(`${where}: missing upper-case word to use`);
      const answers = item.acceptedAnswers?.length ? item.acceptedAnswers : [item.canonicalAnswer];
      answers.filter(Boolean).forEach((answer) => {
        if (!wholeWord(answer, use)) findings.push(`${where}: "${answer}" does not use "${use}"`);
      });
    }
    if (format === 'polarity' && !['negative', 'question', 'affirmative'].includes(item.target)) {
      findings.push(`${where}: target must be negative, question or affirmative`);
    }
    if (format === 'error_correction' && sentenceAnswerMatches(item.sentence, item)) {
      findings.push(`${where}: the sentence to correct is already correct`);
    }
    if (format === 'translate_to_english' || format === 'translate_to_spanish') {
      if ((item.acceptedAnswers || []).length < 2) {
        findings.push(`${where}: list at least two accepted translations`);
      }
      if (normalizeSpanishSentence(item.sentence) === normalizeSpanishSentence(item.canonicalAnswer)) {
        findings.push(`${where}: the translation is the same as the sentence`);
      }
    }
  }

  if (family === 'sequence') {
    const events = item.events || [];
    checkCount(where, 'events', events.length, 3, 6, findings);
    if (new Set(events.map(normalizeGapFillAnswer)).size !== events.length) {
      findings.push(`${where}: two events are the same`);
    }
  }

  if (format === 'spot_error') {
    const chunks = item.chunks || [];
    checkCount(where, 'parts', chunks.length, 3, 8, findings);
    if (!Number.isInteger(item.correctIndex) || !chunks[item.correctIndex]) {
      findings.push(`${where}: correctIndex does not point at a part`);
    }
    if (!item.correction?.trim()) findings.push(`${where}: missing correction`);
    else if (normalizeGapFillAnswer(item.correction) === normalizeGapFillAnswer(chunks[item.correctIndex])) {
      findings.push(`${where}: the correction is the same as the mistake`);
    }
  }

  if (format === 'stress') {
    const syllables = item.syllables || [];
    checkCount(where, 'syllables', syllables.length, 2, 6, findings);
    if (!Number.isInteger(item.correctIndex) || !syllables[item.correctIndex]) {
      findings.push(`${where}: correctIndex does not point at a syllable`);
    }
    if (syllables.join('').toLowerCase() !== String(item.word || '').toLowerCase()) {
      findings.push(`${where}: the syllables must spell the word`);
    }
  }

  if (family === 'multi') {
    const options = item.options || [];
    const correct = item.correctIds || [];
    checkCount(where, 'options', options.length, 4, 6, findings);
    if (correct.length < 2 || correct.length >= options.length) {
      findings.push(`${where}: needs at least two right answers and at least one wrong one`);
    }
    if (!correct.every((id) => options.some((option) => option.id === id))) {
      findings.push(`${where}: a correct id is not one of the options`);
    }
    if (!item.sentence?.trim()) findings.push(`${where}: missing question`);
  }

  if (family === 'match') {
    const pairs = item.pairs || [];
    checkCount(where, 'pairs', pairs.length, 3, 6, findings);
    const lefts = pairs.map((pair) => normalizeGapFillAnswer(pair.left));
    const rights = pairs.map((pair) => normalizeGapFillAnswer(pair.right));
    if (lefts.some((left) => !left) || rights.some((right) => !right)) findings.push(`${where}: empty pair`);
    if (new Set(lefts).size !== lefts.length || new Set(rights).size !== rights.length) {
      findings.push(`${where}: pairs must be unique on both sides`);
    }
  }

  if (family === 'classify') {
    const categories = item.categories || [];
    const words = item.words || [];
    checkCount(where, 'groups', categories.length, 2, 4, findings);
    checkCount(where, 'words', words.length, 4, 10, findings);
    if (!words.every((word) => Number.isInteger(word.category) && categories[word.category])) {
      findings.push(`${where}: a word points at a missing group`);
    }
    categories.forEach((category, index) => {
      if (!words.some((word) => word.category === index)) findings.push(`${where}: group "${category}" is empty`);
    });
    if (new Set(words.map((word) => normalizeGapFillAnswer(word.text))).size !== words.length) {
      findings.push(`${where}: two words are the same`);
    }
  }

  if (family === 'slots') {
    const model = trainingSlotModel(item);
    if (format === 'gapped_text') {
      const numbers = passageSlotNumbers(item.passage);
      checkCount(where, 'gaps', numbers.length, 2, 5, findings);
      if (!numbers.every((number, index) => number === index + 1)) {
        findings.push(`${where}: gaps must be [1], [2]… in reading order`);
      }
    }
    if (format === 'dialogue') {
      checkCount(where, 'missing lines', model.slots.length, 2, 5, findings);
      if ((item.lines || []).some((line) => !line.speaker?.trim())) findings.push(`${where}: every line needs a speaker`);
    }
    if (format === 'gapped_text' || format === 'dialogue') {
      if (model.options.length < model.slots.length + 1) {
        findings.push(`${where}: add at least one extra sentence that does not fit`);
      }
      const texts = model.options.map((option) => normalizeGapFillAnswer(option.text));
      if (new Set(texts).size !== texts.length) findings.push(`${where}: two sentences are the same`);
    }
    if (format === 'multiple_matching') {
      checkCount(where, 'texts', model.options.length, 3, 4, findings);
      checkCount(where, 'questions', model.slots.length, 3, 6, findings);
      if (!model.correct.every((answer) => Number.isInteger(answer) && model.options[answer])) {
        findings.push(`${where}: an answer points at a missing text`);
      }
      if (new Set(model.correct).size < 2) findings.push(`${where}: answers must use at least two people`);
    }
  }

  britishFindings(where, itemText(item), findings);
}

/**
 * Mechanical + semantic checks for an authored exercise.
 * Returns every problem found so the test suite can print them all at once.
 *
 * @param {object} exercise
 * @param {{ expectedItemCount?: number }} [options]
 * @returns {{ ok: boolean, findings: string[] }}
 */
export function validateGapFillExercise(exercise, { expectedItemCount = 10 } = {}) {
  const findings = [];
  const items = exercise?.items || [];

  if (!exercise?.exerciseId) findings.push('exercise: missing exerciseId');
  if (!exercise?.instruction) findings.push('exercise: missing instruction');
  if (items.length !== expectedItemCount) {
    findings.push(`exercise: expected ${expectedItemCount} items, found ${items.length}`);
  }

  const seenItemIds = new Set();
  const seenSolutions = new Set();
  const seenSubFocus = new Set();
  let negatives = 0;
  let questions = 0;
  let affirmatives = 0;

  items.forEach((item, position) => {
    const where = item?.itemId || `item ${position + 1}`;

    if (!item?.itemId) findings.push(`${where}: missing itemId`);
    else if (seenItemIds.has(item.itemId)) findings.push(`${where}: duplicated itemId`);
    else seenItemIds.add(item.itemId);

    if (!item?.explanation?.trim()) findings.push(`${where}: missing explanation`);
    if (!item?.subFocus) findings.push(`${where}: missing subFocus`);
    else if (seenSubFocus.has(item.subFocus)) {
      findings.push(`${where}: subFocus "${item.subFocus}" repeats another item`);
    } else seenSubFocus.add(item.subFocus);

    if (!GAP_FILL_ERROR_TAG_LABELS[item?.errorTag]) {
      findings.push(`${where}: unknown errorTag "${item?.errorTag}"`);
    }

    const format = item?.format || 'gap';
    if (TYPE_FORMATS.has(format)) {
      validateTypeItem(item, where, findings);
      return;
    }
    if (!trainingFormatFamily(item)) {
      findings.push(`${where}: unknown format "${format}"`);
      return;
    }

    if (format !== 'gap') {
      if (!item?.instruction?.trim()) findings.push(`${where}: missing instruction`);
      const solutionKey =
        format === 'true_false'
          ? `${item.correctId}|${normalizeGapFillAnswer(item.sentence)}`
          : normalizeGapFillAnswer(item?.solution || item?.canonicalAnswer);
      if (!solutionKey) findings.push(`${where}: missing solution`);
      else if (seenSolutions.has(solutionKey)) {
        findings.push(`${where}: another item already has the solution "${solutionKey}"`);
      } else seenSolutions.add(solutionKey);

      if (CHOICE_FORMATS.has(format)) {
        const options = item?.options || [];
        if (options.length < 2) findings.push(`${where}: needs at least two options`);
        if (!options.some((option) => option.id === item.correctId)) {
          findings.push(`${where}: correctId is not one of the options`);
        }
      }

      if (format === 'transform' || format === 'order') {
        checkAccepted(where, item?.canonicalAnswer, item?.acceptedAnswers, findings);
      }

      if (format === 'order' && !(item?.words || []).length) {
        findings.push(`${where}: missing words`);
      }

      const text = `${item?.sentence || ''} ${item?.explanation || ''} ${item?.solution || ''}`;
      britishFindings(where, text, findings);
      return;
    }

    if (!item?.promptWord?.trim()) findings.push(`${where}: missing promptWord`);
    else if (item.promptWord !== item.promptWord.toUpperCase()) {
      findings.push(`${where}: promptWord must be upper case`);
    }

    const gaps = item?.gaps || [];
    if (!gaps.length) findings.push(`${where}: no gaps`);
    checkGapTokens(where, item?.sentence, gaps.length, findings);

    gaps.forEach((gap, gapPosition) => {
      checkAccepted(`${where} gap ${gapPosition + 1}`, gap?.canonicalAnswer, gap?.acceptedAnswers, findings);
    });

    const solution = gaps.map((gap) => normalizeGapFillAnswer(gap?.canonicalAnswer)).join(' | ');
    if (solution) {
      if (seenSolutions.has(solution)) {
        findings.push(`${where}: another item already has the solution "${solution}"`);
      } else seenSolutions.add(solution);
    }

    const sentence = item?.sentence || '';
    britishFindings(where, `${sentence} ${item?.explanation || ''}`, findings);

    if (/\bnot\b/i.test(item?.promptWord || '')) negatives += 1;
    else if (sentence.trim().endsWith('?')) questions += 1;
    else affirmatives += 1;
  });

  if (negatives + questions + affirmatives > 0) {
    if (negatives < 1) findings.push('exercise: no negative item');
    if (questions < 1) findings.push('exercise: no question item');
    if (affirmatives < 1) findings.push('exercise: no affirmative item');
  }

  return { ok: findings.length === 0, findings };
}
