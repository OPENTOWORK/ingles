import { normalizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import { ruoeAnswersShareCanonicalForm } from '@/lib/ruoeContractionEquivalence';

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
});

const GAP_TOKEN = /\{(\d+)\}/g;

/** Same normalisation as the exam papers: case, spacing and typographic apostrophes. */
export function normalizeGapFillAnswer(raw) {
  return normalizeB2KeyWordAnswer(raw);
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

/** Grades a gap, a choice, a rewrite or a word-order item. */
export function gradeTrainingItem(item, values = {}) {
  const format = item?.format || 'gap';

  if (format === 'gap') return gradeGapFillItem(item, values);

  if (CHOICE_FORMATS.has(format)) {
    const selected = values.selected || '';
    return { correct: Boolean(selected) && selected === item.correctId, gaps: [] };
  }

  if (format === 'transform' || format === 'order') {
    const raw =
      format === 'order'
        ? (values.sequence || []).map((index) => item.words?.[index]).join(' ')
        : values.text || '';
    return {
      correct: gapFillAnswerMatches(raw, {
        canonicalAnswer: item.canonicalAnswer,
        acceptedAnswers: item.acceptedAnswers,
      }),
      gaps: [],
    };
  }

  return { correct: false, gaps: [] };
}

export function formatTrainingSolution(item) {
  if ((item?.format || 'gap') === 'gap') return formatGapFillSolution(item);
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
  /\b\w+iz(e|es|ed|ing|ation|ations)\b/i,
  /\bcolors?\b/i,
  /\bbehaviors?\b/i,
  /\bcenters?\b/i,
  /\bprograms?\b/i,
  /\banalyze[sd]?\b/i,
  /\bpracticing\b/i,
];

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
        const canonical = normalizeGapFillAnswer(item?.canonicalAnswer);
        if (!canonical) findings.push(`${where}: missing canonicalAnswer`);
        const accepted = item?.acceptedAnswers || [];
        if (accepted.length && !accepted.some((answer) => normalizeGapFillAnswer(answer) === canonical)) {
          findings.push(`${where}: acceptedAnswers must include the canonical answer`);
        }
        const normalizedAccepted = accepted.map(normalizeGapFillAnswer);
        if (new Set(normalizedAccepted).size !== normalizedAccepted.length) {
          findings.push(`${where}: duplicated accepted answers`);
        }
      }

      if (format === 'order' && !(item?.words || []).length) {
        findings.push(`${where}: missing words`);
      }

      const text = `${item?.sentence || ''} ${item?.explanation || ''} ${item?.solution || ''}`;
      for (const pattern of NON_BRITISH_PATTERNS) {
        if (pattern.test(text)) findings.push(`${where}: non-British spelling (${pattern})`);
      }
      return;
    }

    if (!item?.promptWord?.trim()) findings.push(`${where}: missing promptWord`);
    else if (item.promptWord !== item.promptWord.toUpperCase()) {
      findings.push(`${where}: promptWord must be upper case`);
    }

    const gaps = item?.gaps || [];
    if (!gaps.length) findings.push(`${where}: no gaps`);

    const tokens = parseGapFillSentence(item?.sentence || '').filter((p) => p.type === 'gap');
    if (tokens.length !== gaps.length) {
      findings.push(
        `${where}: sentence has ${tokens.length} gap tokens but ${gaps.length} answers`,
      );
    }
    tokens.forEach((token, tokenPosition) => {
      if (token.index !== tokenPosition + 1) {
        findings.push(`${where}: gap tokens must be numbered in reading order`);
      }
    });

    gaps.forEach((gap, gapPosition) => {
      const label = `${where} gap ${gapPosition + 1}`;
      const canonical = normalizeGapFillAnswer(gap?.canonicalAnswer);
      if (!canonical) {
        findings.push(`${label}: missing canonicalAnswer`);
        return;
      }
      const accepted = gap?.acceptedAnswers || [];
      if (accepted.length && !accepted.some((a) => normalizeGapFillAnswer(a) === canonical)) {
        findings.push(`${label}: acceptedAnswers must include the canonical answer`);
      }
      const normalizedAccepted = accepted.map(normalizeGapFillAnswer);
      if (new Set(normalizedAccepted).size !== normalizedAccepted.length) {
        findings.push(`${label}: duplicated accepted answers`);
      }
    });

    const solution = gaps.map((gap) => normalizeGapFillAnswer(gap?.canonicalAnswer)).join(' | ');
    if (solution) {
      if (seenSolutions.has(solution)) {
        findings.push(`${where}: another item already has the solution "${solution}"`);
      } else seenSolutions.add(solution);
    }

    const sentence = item?.sentence || '';
    const text = `${sentence} ${item?.explanation || ''}`;
    for (const pattern of NON_BRITISH_PATTERNS) {
      if (pattern.test(text)) findings.push(`${where}: non-British spelling (${pattern})`);
    }

    if (/\bnot\b/i.test(item?.promptWord || '')) negatives += 1;
    else if (sentence.trim().endsWith('?')) questions += 1;
    else affirmatives += 1;
  });

  if (negatives < 1) findings.push('exercise: no negative item');
  if (questions < 1) findings.push('exercise: no question item');
  if (affirmatives < 1) findings.push('exercise: no affirmative item');

  return { ok: findings.length === 0, findings };
}
