import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getTrainingPathCurriculum } from '../../data/trainingPathCurriculum.js';
import { buildReviewExercise, getPathReviews } from '../../data/trainingReviews.js';
import { TRAINING_PATH_SECTIONS } from '../../data/trainingPaths/curricula.js';
import { loadTrainingPathExercise } from '../../data/trainingPaths/index.js';
import {
  formatTrainingSolution,
  gradeTrainingItem,
  validateGapFillExercise,
} from '../trainingGapFillGrading.js';
import {
  TRAINING_PATH_TYPE_FORMATS,
  canSubmitTrainingItem,
  canonicalTrainingValues,
} from '../trainingItemFormats.js';

const PATHS = Object.keys(TRAINING_PATH_SECTIONS).map((key) => {
  const [cefr, difficulty] = key.split('|');
  return { cefr, difficulty, curriculum: getTrainingPathCurriculum(cefr, difficulty, 'use-of-english') };
});

test('A2 basic starts with colours, numbers and days, with a review after each section but the last', () => {
  const curriculum = getTrainingPathCurriculum('a2', 'basico', 'use-of-english');
  assert.equal(curriculum.totalLevels, 24);
  assert.deepEqual(
    [1, 2, 3].map((n) => curriculum.levelMap[n].topic),
    ['Colours', 'Numbers', 'Days of the week'],
  );
  const reviews = getPathReviews(curriculum.sections);
  assert.equal(reviews.length, curriculum.sections.length - 1);
  assert.deepEqual(reviews[0], { ...reviews[0], from: 1, to: 4 });
});

test('paths without level files keep their own content', async () => {
  assert.equal(await loadTrainingPathExercise('b2', 'use-of-english', 'basico', 1), null);
  assert.equal(await loadTrainingPathExercise('a2', 'vocabulary', 'basico', 1), null);
  assert.equal(await loadTrainingPathExercise('a2', 'use-of-english', 'basico', 99), null);
});

test('every level of every path asks the 47 task types, valid and solvable', async () => {
  for (const { cefr, difficulty, curriculum } of PATHS) {
    for (let level = 1; level <= curriculum.totalLevels; level += 1) {
      const exercise = await loadTrainingPathExercise(cefr, 'use-of-english', difficulty, level);
      const where = `${cefr} ${difficulty} level ${level}`;
      assert.equal(exercise.items.length, TRAINING_PATH_TYPE_FORMATS.length, where);
      const { findings } = validateGapFillExercise(exercise, {
        expectedItemCount: TRAINING_PATH_TYPE_FORMATS.length,
      });
      assert.deepEqual(findings, [], where);
      exercise.items.forEach((item, index) => {
        assert.equal(item.format, TRAINING_PATH_TYPE_FORMATS[index], item.itemId);
        assert.equal(item.itemId, `${exercise.exerciseId}-t${String(index + 1).padStart(2, '0')}`);
        const values = canonicalTrainingValues(item);
        assert.equal(canSubmitTrainingItem(item, values), true, item.itemId);
        assert.equal(gradeTrainingItem(item, values).correct, true, item.itemId);
        assert.ok(formatTrainingSolution(item), `${item.itemId} has a key to show`);
        if (item.format === 'image_choice') {
          assert.ok(existsSync(path.join(process.cwd(), 'public', item.image)), `${item.itemId}: ${item.image}`);
        }
      });
    }
  }
});

test('a review of a path with level files mixes that section and has its own id', async () => {
  const curriculum = getTrainingPathCurriculum('a2', 'basico', 'use-of-english');
  const review = getPathReviews(curriculum.sections)[0];
  const exercise = await buildReviewExercise(review, 'a2', 'use-of-english', 'basico');
  assert.equal(exercise.exerciseId, 'a2-basic-review-01');
  assert.ok(exercise.items.every((item) => item.itemId.startsWith('review-1-a2-basic-0')));
  assert.equal(exercise.items.some((item) => item.itemId.includes('a2-basic-05-')), false);
});

test('a translation into Spanish ignores accents, ñ and ¿ ¡, but not the words', async () => {
  const { items } = await loadTrainingPathExercise('a2', 'use-of-english', 'basico', 1);
  const item = items.find((entry) => entry.format === 'translate_to_spanish');
  assert.equal(gradeTrainingItem(item, { text: 'tengo un coche rojo' }).correct, true);
  assert.equal(gradeTrainingItem(item, { text: '  Yo tengo un coche rojo ' }).correct, true);
  const accented = { ...item, acceptedAnswers: ['¿Cuántos años tienes?'], canonicalAnswer: '¿Cuántos años tienes?' };
  assert.equal(gradeTrainingItem(accented, { text: 'cuantos anos tienes' }).correct, true);
  assert.equal(gradeTrainingItem(item, { text: 'Tengo un coche azul.' }).correct, false);
  assert.equal(gradeTrainingItem(item, { text: '' }).correct, false);
});

test('a translation into English accepts the listed versions and contractions, not other words', async () => {
  const { items } = await loadTrainingPathExercise('a2', 'use-of-english', 'basico', 1);
  const item = items.find((entry) => entry.format === 'translate_to_english');
  assert.equal(gradeTrainingItem(item, { text: 'green is my favourite colour' }).correct, true);
  assert.equal(gradeTrainingItem(item, { text: 'My favourite colour is the green.' }).correct, false);

  const negative = { ...item, canonicalAnswer: 'I don’t like red.', acceptedAnswers: ['I don’t like red.', 'I do not like red.'] };
  assert.equal(gradeTrainingItem(negative, { text: "I don't like red" }).correct, true);
});

test('authoring checks catch broken translation items', () => {
  const base = { explanation: 'Why.', errorTag: 'translation_to_english', instruction: 'Translate.' };
  const exercise = {
    exerciseId: 'test',
    instruction: 'Translate.',
    items: [
      {
        ...base,
        itemId: 'one',
        subFocus: 'one',
        format: 'translate_to_english',
        sentence: 'Mi color favorito es el azul.',
        canonicalAnswer: 'My favourite colour is blue.',
        acceptedAnswers: ['My favourite colour is blue.'],
      },
      {
        ...base,
        itemId: 'us',
        subFocus: 'us',
        format: 'translate_to_english',
        sentence: 'Mi color favorito es el gris.',
        canonicalAnswer: 'My favorite color is gray.',
        acceptedAnswers: ['My favorite color is gray.', 'Gray is my favorite color.'],
      },
    ],
  };
  const joined = validateGapFillExercise(exercise, { expectedItemCount: 2 }).findings.join('\n');
  assert.match(joined, /one: list at least two accepted translations/);
  assert.match(joined, /us: non-British spelling/);
  assert.doesNotMatch(joined, /one: non-British spelling/);
});
