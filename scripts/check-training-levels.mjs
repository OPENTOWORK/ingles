/**
 * Checks the task-type items of one or more B2 basic levels.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/check-training-levels.mjs 2 3
 *
 * Each level file is loaded on its own, so a broken file in another level does not stop the check.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { B2_BASIC_LEVELS_A } from '../src/data/b2BasicTrainingBankA.js';
import { B2_BASIC_LEVELS_B } from '../src/data/b2BasicTrainingBankB.js';
import { B2_BASIC_LEVELS_C } from '../src/data/b2BasicTrainingBankC.js';
import { B2_BASIC_LEVELS_D } from '../src/data/b2BasicTrainingBankD.js';
import { B2_BASIC_LEVELS_E } from '../src/data/b2BasicTrainingBankE.js';
import { gradeTrainingItem, validateGapFillExercise } from '../src/lib/trainingGapFillGrading.js';
import {
  TRAINING_TYPE_FORMATS,
  canSubmitTrainingItem,
  canonicalTrainingValues,
} from '../src/lib/trainingItemFormats.js';

const BANKS = {
  ...B2_BASIC_LEVELS_A,
  ...B2_BASIC_LEVELS_B,
  ...B2_BASIC_LEVELS_C,
  ...B2_BASIC_LEVELS_D,
  ...B2_BASIC_LEVELS_E,
};

async function originalExercise(level) {
  if (level !== 1) return BANKS[level];
  const { B2_BASIC_01_PRESENT_SIMPLE } = await import('../src/data/trainingGapFillContent.js');
  return B2_BASIC_01_PRESENT_SIMPLE;
}

const levels = process.argv.slice(2).map(Number).filter(Boolean);
if (!levels.length) {
  console.error('Pass one or more level numbers, e.g. 2 3');
  process.exit(1);
}

let failed = false;
for (const level of levels) {
  const problems = [];
  const notes = [];
  const code = String(level).padStart(2, '0');
  const original = await originalExercise(level);
  if (!original) {
    console.log(`Level ${level}: not found`);
    failed = true;
    continue;
  }

  let typeItems = [];
  try {
    const file = pathToFileURL(path.join(process.cwd(), 'src', 'data', 'trainingTypes', `b2Basic${code}.js`));
    typeItems = (await import(file.href)).default || [];
  } catch (error) {
    problems.push(`cannot load b2Basic${code}.js: ${error.message}`);
  }

  const exercise = { ...original, items: [...original.items, ...typeItems] };
  problems.push(...validateGapFillExercise(exercise, { expectedItemCount: exercise.items.length }).findings);

  if (typeItems.length !== TRAINING_TYPE_FORMATS.length) {
    problems.push(`expected ${TRAINING_TYPE_FORMATS.length} task items, found ${typeItems.length}`);
  }
  const prefix = `b2-basic-${code}-t`;
  typeItems.forEach((item, index) => {
    const id = `${prefix}${String(index + 1).padStart(2, '0')}`;
    if (item.itemId !== id) problems.push(`item ${index + 1}: itemId should be ${id}, found ${item.itemId}`);
    if (item.format !== TRAINING_TYPE_FORMATS[index]) {
      problems.push(`${id}: format should be ${TRAINING_TYPE_FORMATS[index]}, found ${item.format}`);
    }
    const values = canonicalTrainingValues(item);
    if (!canSubmitTrainingItem(item, values)) problems.push(`${id}: the key cannot be submitted`);
    if (!gradeTrainingItem(item, values).correct) problems.push(`${id}: the key is graded as wrong`);
    if (item.format === 'image_choice' && !existsSync(path.join(process.cwd(), 'public', item.image || ''))) {
      notes.push(`${id}: image ${item.image} does not exist yet`);
    }
  });

  if (problems.length) failed = true;
  console.log(`Level ${level}: ${problems.length ? `${problems.length} problem(s)` : 'OK'} (${typeItems.length} task items)`);
  problems.forEach((problem) => console.log(`  ✗ ${problem}`));
  notes.forEach((note) => console.log(`  · ${note}`));
}

process.exitCode = failed ? 1 : 0;
