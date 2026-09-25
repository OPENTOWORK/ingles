import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGapFillSolution,
  gapFillAnswerMatches,
  gradeGapFillItem,
  gradeTrainingItem,
  parseGapFillSentence,
  summariseGapFillErrors,
  validateGapFillExercise,
} from '../trainingGapFillGrading.js';
import { B2_BASIC_01_PRESENT_SIMPLE, getGapFillExercise } from '../../data/trainingGapFillContent.js';
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

function answerFor(item) {
  const format = item.format || 'gap';
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
