import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  formatGapFillSolution,
  formatTrainingSolution,
  gapFillAnswerMatches,
  gradeGapFillItem,
  gradeTrainingItem,
  parseGapFillSentence,
  summariseGapFillErrors,
  validateGapFillExercise,
} from '../trainingGapFillGrading.js';
import {
  TRAINING_TYPE_FORMATS,
  canSubmitTrainingItem,
  canonicalTrainingValues,
  trainingItemFormat,
} from '../trainingItemFormats.js';
import { B2_BASIC_01_PRESENT_SIMPLE, getGapFillExercise } from '../../data/trainingGapFillContent.js';
import { B2_BASIC_TYPE_ITEMS } from '../../data/trainingTypes/index.js';
import { expandItem } from '../trainingQuestionVariants.js';

const items = B2_BASIC_01_PRESENT_SIMPLE.items;
const byId = (id) => items.find((item) => item.itemId === id);

test('the pilot exercise passes the authoring checks', () => {
  const { ok, findings } = validateGapFillExercise(B2_BASIC_01_PRESENT_SIMPLE, {
    expectedItemCount: 50,
  });
  assert.deepEqual(findings, []);
  assert.equal(ok, true);
});

test('the map level resolves to the pilot exercise', () => {
  assert.equal(getGapFillExercise('b2', 'use-of-english', 'basico', 'level-1')?.exerciseId, 'b2-basic-01');
  assert.equal(getGapFillExercise('b2', 'use-of-english', 'basico', 2)?.exerciseId, 'b2-basic-02');
  assert.equal(getGapFillExercise('b2', 'use-of-english', 'basico', 25)?.exerciseId, 'b2-basic-25');
  assert.equal(getGapFillExercise('b2', 'writing', 'basico', 1), null);
});

test('every basic level is a valid B2 exercise and its answers grade as correct', () => {
  for (let level = 1; level <= 25; level += 1) {
    const exercise = getGapFillExercise('b2', 'use-of-english', 'basico', level);
    assert.ok(exercise, `level ${level} is missing`);
    const { ok, findings } = validateGapFillExercise(exercise, {
      expectedItemCount: exercise.items.length,
    });
    assert.deepEqual(findings, [], `level ${level}`);
    assert.equal(ok, true);
    for (const item of exercise.items) {
      assert.equal(
        gradeTrainingItem(item, answerFor(item)).correct,
        true,
        `${item.itemId} should be correct`,
      );
    }
  }
});

test('sentences split into text and numbered gaps', () => {
  const parts = parseGapFillSentence('How often {1} your department {2} its procedures?');
  assert.deepEqual(
    parts.map((part) => (part.type === 'gap' ? `gap${part.index}` : part.value)),
    ['How often ', 'gap1', ' your department ', 'gap2', ' its procedures?'],
  );
});

test('case, spacing and typographic apostrophes are normalised away', () => {
  const gap = byId('b2-basic-01-q01').gaps[0];
  assert.equal(gapFillAnswerMatches('  Works  ', gap), true);
  assert.equal(gapFillAnswerMatches('WORKS', gap), true);

  const negative = byId('b2-basic-01-q03').gaps[0];
  assert.equal(gapFillAnswerMatches('don\u2019t understand', negative), true);
});

test('both contraction and full form are accepted', () => {
  const negative = byId('b2-basic-01-q09').gaps[0];
  assert.equal(gapFillAnswerMatches("don't match", negative), true);
  assert.equal(gapFillAnswerMatches('do not match', negative), true);
});

test('a different tense or person is never accepted', () => {
  const third = byId('b2-basic-01-q01').gaps[0];
  assert.equal(gapFillAnswerMatches('work', third), false);
  assert.equal(gapFillAnswerMatches('is working', third), false);
  assert.equal(gapFillAnswerMatches('worked', third), false);

  const plural = byId('b2-basic-01-q09').gaps[0];
  assert.equal(gapFillAnswerMatches("doesn't match", plural), false);
  assert.equal(gapFillAnswerMatches('does not match', plural), false);

  const stative = byId('b2-basic-01-q03').gaps[0];
  assert.equal(gapFillAnswerMatches("am not understanding", stative), false);
});

test('an empty gap is wrong, not silently correct', () => {
  const gap = byId('b2-basic-01-q02').gaps[0];
  assert.equal(gapFillAnswerMatches('', gap), false);
  assert.equal(gapFillAnswerMatches('   ', gap), false);
});

test('an item with two gaps needs both of them right', () => {
  const item = byId('b2-basic-01-q04');
  assert.equal(gradeGapFillItem(item, { 1: 'does', 2: 'review' }).correct, true);
  assert.equal(gradeGapFillItem(item, { 1: 'does', 2: 'reviews' }).correct, false);
  assert.equal(gradeGapFillItem(item, { 1: 'do', 2: 'review' }).correct, false);

  const partial = gradeGapFillItem(item, { 1: 'does', 2: '' });
  assert.deepEqual(partial.gaps.map((gap) => gap.correct), [true, false]);
  assert.equal(formatGapFillSolution(item), 'does / review');
});

const TYPE_FORMATS = new Set(TRAINING_TYPE_FORMATS);

function answerFor(item) {
  const format = item.format || 'gap';
  if (TYPE_FORMATS.has(format)) return canonicalTrainingValues(item);
  if (format === 'gap') {
    return Object.fromEntries(item.gaps.map((gap, index) => [index + 1, gap.canonicalAnswer]));
  }
  if (format === 'transform') return { text: item.canonicalAnswer };
  if (format === 'order') {
    const pool = item.words.map((word, index) => ({ word, index }));
    const sequence = [];
    for (const word of item.canonicalAnswer.split(' ')) {
      const found = pool.find((entry) => entry.word.toLowerCase() === word.toLowerCase());
      sequence.push(found.index);
      pool.splice(pool.indexOf(found), 1);
    }
    return { sequence };
  }
  return { selected: item.correctId };
}

test('every item is solvable with its own canonical answers', () => {
  for (const item of items) {
    assert.equal(
      gradeTrainingItem(item, answerFor(item)).correct,
      true,
      `${item.itemId} should be correct`,
    );
  }
});

test('mistakes are grouped into grammar areas, most frequent first', () => {
  const summary = summariseGapFillErrors([
    byId('b2-basic-01-q03'),
    byId('b2-basic-01-q09'),
    byId('b2-basic-01-q02'),
  ]);
  assert.deepEqual(summary, [
    { tag: 'present_simple_negative', label: 'Present simple negatives', count: 2 },
    { tag: 'present_simple_schedule', label: 'Timetables and schedules', count: 1 },
  ]);
  assert.deepEqual(summariseGapFillErrors([]), []);
});

test('a present-simple gap can be asked in more than one format', () => {
  const variants = expandItem(byId('b2-basic-01-q01'));
  const formats = variants.map((variant) => variant.format);
  assert.ok(formats.includes('gap'));
  assert.ok(formats.includes('choice'));
  assert.ok(formats.length > 1);

  for (const variant of variants) {
    assert.equal(gradeTrainingItem(variant, answerFor(variant)).correct, true, variant.format);
    if (variant.format === 'choice') {
      const correct = variant.options.find((option) => option.id === variant.correctId);
      assert.equal(correct.text, 'works');
    }
  }
});

test('a question stays in its own format when others do not fit', () => {
  assert.deepEqual(
    expandItem(byId('b2-basic-01-q21')).map((variant) => variant.format),
    ['intention'],
  );
  assert.deepEqual(
    expandItem(byId('b2-basic-01-q26')).map((variant) => variant.format),
    ['true_false'],
  );
});

test('every variant of every question grades as correct present simple', () => {
  const continuous = /^(am|is|are|isn't|aren't)( not)? \w+ing\b/i;
  for (const item of items) {
    const variants = expandItem(item);
    assert.ok(variants.length >= 1, item.itemId);
    for (const variant of variants) {
      const graded = gradeTrainingItem(variant, answerFor(variant));
      assert.equal(graded.correct, true, `${item.itemId} ${variant.format}`);
      if (variant.options && variant.correctId) {
        const correct = variant.options.find((option) => option.id === variant.correctId);
        assert.equal(continuous.test(correct.text), false, `${item.itemId} ${correct.text}`);
      }
    }
  }
});

test('authoring checks catch broken items', () => {
  const broken = {
    exerciseId: 'test',
    instruction: 'Complete.',
    items: [
      {
        itemId: 'a',
        subFocus: 'x',
        sentence: 'She {1} it {2}.',
        promptWord: 'go',
        gaps: [{ canonicalAnswer: 'goes', acceptedAnswers: ['went'] }],
        explanation: '',
        errorTag: 'not_a_tag',
      },
    ],
  };

  const { ok, findings } = validateGapFillExercise(broken, { expectedItemCount: 1 });
  assert.equal(ok, false);
  const joined = findings.join('\n');
  assert.match(joined, /promptWord must be upper case/);
  assert.match(joined, /missing explanation/);
  assert.match(joined, /unknown errorTag/);
  assert.match(joined, /2 gap tokens but 1 answers/);
  assert.match(joined, /acceptedAnswers must include the canonical answer/);
  assert.match(joined, /no negative item/);
  assert.match(joined, /no question item/);
});

const typeItem = (format, level = 1) => B2_BASIC_TYPE_ITEMS[level].find((item) => item.format === format);

test('every basic level offers each of the 45 task types exactly once, in order', () => {
  for (let level = 1; level <= 25; level += 1) {
    const exercise = getGapFillExercise('b2', 'use-of-english', 'basico', level);
    const counts = {};
    for (const item of exercise.items) {
      const format = trainingItemFormat(item);
      if (TYPE_FORMATS.has(format)) counts[format] = (counts[format] || 0) + 1;
    }
    for (const format of TRAINING_TYPE_FORMATS) {
      assert.equal(counts[format], 1, `level ${level}: ${format}`);
    }
    const prefix = `b2-basic-${String(level).padStart(2, '0')}-t`;
    B2_BASIC_TYPE_ITEMS[level].forEach((item, index) => {
      assert.equal(item.itemId, `${prefix}${String(index + 1).padStart(2, '0')}`);
      assert.equal(item.format, TRAINING_TYPE_FORMATS[index], item.itemId);
    });
  }
});

test('the pilot keeps its fifty items and the task types come on top', () => {
  assert.equal(B2_BASIC_01_PRESENT_SIMPLE.items.length, 50);
  const level1 = getGapFillExercise('b2', 'use-of-english', 'basico', 1);
  assert.equal(level1.items.length, 50 + TRAINING_TYPE_FORMATS.length);
});

test('every picture question points at an image that exists', () => {
  for (let level = 1; level <= 25; level += 1) {
    for (const item of B2_BASIC_TYPE_ITEMS[level].filter((entry) => entry.format === 'image_choice')) {
      assert.ok(existsSync(path.join(process.cwd(), 'public', item.image)), `${item.itemId}: ${item.image}`);
    }
  }
});

test('a task cannot be sent until every part has an answer', () => {
  for (const item of B2_BASIC_TYPE_ITEMS[1]) {
    assert.equal(canSubmitTrainingItem(item, {}), false, item.itemId);
    assert.equal(canSubmitTrainingItem(item, canonicalTrainingValues(item)), true, item.itemId);
    assert.ok(formatTrainingSolution(item), `${item.itemId} has a key to show`);
  }
});

test('written sentences ignore punctuation and case, but not grammar', () => {
  const item = typeItem('error_correction');
  assert.equal(gradeTrainingItem(item, { text: 'how often does your team review its targets' }).correct, true);
  assert.equal(gradeTrainingItem(item, { text: 'How often does your team review their targets?' }).correct, true);
  assert.equal(gradeTrainingItem(item, { text: 'How often does your team reviews its targets?' }).correct, false);
  assert.equal(gradeTrainingItem(item, { text: '   ' }).correct, false);
});

test('written sentences accept the full form of a contraction; a dictation does not', () => {
  const negative = {
    format: 'polarity',
    target: 'negative',
    sentence: 'It works.',
    canonicalAnswer: "It doesn't work.",
    acceptedAnswers: ["It doesn't work."],
  };
  assert.equal(gradeTrainingItem(negative, { text: 'It does not work' }).correct, true);
  assert.equal(gradeTrainingItem(negative, { text: 'It not works.' }).correct, false);

  const dictation = typeItem('dictation');
  assert.equal(
    gradeTrainingItem(dictation, { text: "she doesn't usually check her emails before breakfast" }).correct,
    true,
  );
  assert.equal(
    gradeTrainingItem(dictation, { text: 'She does not usually check her emails before breakfast.' }).correct,
    false,
  );
});

test('matching, grouping and placing need every piece in the right place', () => {
  const pairs = typeItem('match');
  assert.equal(gradeTrainingItem(pairs, { pairs: { 0: 0, 1: 1, 2: 2, 3: 3 } }).correct, true);
  assert.equal(gradeTrainingItem(pairs, { pairs: { 0: 0, 1: 1, 2: 3, 3: 2 } }).correct, false);

  const groups = typeItem('classify');
  const assign = canonicalTrainingValues(groups).assign;
  assert.equal(gradeTrainingItem(groups, { assign }).correct, true);
  assert.equal(gradeTrainingItem(groups, { assign: { ...assign, 0: 1 } }).correct, false);

  const gapped = typeItem('gapped_text');
  assert.equal(gradeTrainingItem(gapped, { slots: { 0: 0, 1: 1, 2: 2 } }).correct, true);
  assert.equal(gradeTrainingItem(gapped, { slots: { 0: 1, 1: 0, 2: 2 } }).correct, false);
  assert.equal(gradeTrainingItem(gapped, { slots: { 0: 0, 1: 1, 2: 3 } }).correct, false);

  const people = typeItem('multiple_matching');
  assert.equal(gradeTrainingItem(people, { slots: { 0: 1, 1: 2, 2: 0, 3: 3 } }).correct, true);
  assert.equal(gradeTrainingItem(people, { slots: { 0: 1, 1: 1, 2: 0, 3: 3 } }).correct, false);

  const steps = typeItem('sequence');
  assert.equal(gradeTrainingItem(steps, { sequence: [0, 1, 2, 3, 4] }).correct, true);
  assert.equal(gradeTrainingItem(steps, { sequence: [1, 0, 2, 3, 4] }).correct, false);
});

test('several right answers must all be chosen, and nothing else', () => {
  const item = typeItem('multi_select');
  const right = item.correctIds;
  assert.equal(gradeTrainingItem(item, { picked: [...right].reverse() }).correct, true);
  assert.equal(gradeTrainingItem(item, { picked: right.slice(1) }).correct, false);
  const wrong = item.options.find((option) => !right.includes(option.id)).id;
  assert.equal(gradeTrainingItem(item, { picked: [...right, wrong] }).correct, false);
});

test('tapping grades only the part with the mistake or the stress', () => {
  const spot = typeItem('spot_error');
  assert.equal(gradeTrainingItem(spot, { token: 1 }).correct, true);
  assert.equal(gradeTrainingItem(spot, { token: 0 }).correct, false);
  assert.equal(formatTrainingSolution(spot), 'have → has');

  const stressed = typeItem('stress');
  assert.equal(gradeTrainingItem(stressed, { token: 1 }).correct, true);
  assert.equal(gradeTrainingItem(stressed, { token: 0 }).correct, false);
  assert.equal(formatTrainingSolution(stressed), 'pho·TO·gra·pher');
});

test('authoring checks catch broken task-type items', () => {
  const base = { subFocus: 'x', explanation: 'Why.', errorTag: 'present_simple_choice', instruction: 'Do it.' };
  const broken = {
    exerciseId: 'test',
    instruction: 'Complete.',
    items: [
      {
        ...base,
        itemId: 'kw',
        subFocus: 'kw',
        format: 'key_word',
        lead: 'I rarely go out.',
        keyword: 'OFTEN',
        sentence: 'I {1} out.',
        gaps: [{ canonicalAnswer: 'hardly ever go', acceptedAnswers: ['hardly ever go'] }],
      },
      {
        ...base,
        itemId: 'mu',
        subFocus: 'mu',
        format: 'multi_select',
        sentence: 'Pick.',
        options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id })),
        correctIds: ['a'],
      },
      {
        ...base,
        itemId: 'im',
        subFocus: 'im',
        format: 'image_choice',
        image: '/images/cat.jpg',
        sentence: 'What?',
        options: [
          { id: 'a', text: 'One.' },
          { id: 'b', text: 'Two.' },
        ],
        correctId: 'c',
      },
      {
        ...base,
        itemId: 'dc',
        subFocus: 'dc',
        format: 'dictation',
        audio: 'The train leaves at 8.',
        canonicalAnswer: 'The train leaves at eight.',
        acceptedAnswers: ['The train leaves at eight.'],
      },
      {
        ...base,
        itemId: 'uk',
        subFocus: 'uk',
        format: 'mcq',
        sentence: 'What is your favorite color?',
        options: [
          { id: 'a', text: 'Red.' },
          { id: 'b', text: 'Blue.' },
        ],
        correctId: 'a',
      },
    ],
  };

  const joined = validateGapFillExercise(broken, { expectedItemCount: 5 }).findings.join('\n');
  assert.match(joined, /does not use the key word/);
  assert.match(joined, /at least two right answers/);
  assert.match(joined, /image must live in \/training\/images\//);
  assert.match(joined, /missing image description/);
  assert.match(joined, /correctId is not one of the options/);
  assert.match(joined, /a dictation answer is exactly the audio/);
  assert.match(joined, /write numbers as words/);
  assert.match(joined, /non-British spelling/);
});
