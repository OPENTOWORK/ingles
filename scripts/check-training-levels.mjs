/**
 * Checks the task-type items of Training levels.
 *   B2 basic:         node --loader ./scripts/alias-loader.mjs scripts/check-training-levels.mjs 2 3
 *   A path with files: node --loader ./scripts/alias-loader.mjs scripts/check-training-levels.mjs a2-basic 1 2
 *   A whole path:      node --loader ./scripts/alias-loader.mjs scripts/check-training-levels.mjs a2-basic all
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
import {
  TRAINING_PATH_DIFFICULTY_SLUGS,
  trainingPathSections,
} from '../src/data/trainingPaths/curricula.js';
import { buildTrainingPathExercise } from '../src/data/trainingPaths/index.js';
import { gradeTrainingItem, validateGapFillExercise } from '../src/lib/trainingGapFillGrading.js';
import {
  TRAINING_PATH_TYPE_FORMATS,
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

async function importItems(file, problems) {
  try {
    const url = pathToFileURL(path.join(process.cwd(), ...file.split('/')));
    return (await import(url.href)).default || [];
  } catch (error) {
    problems.push(`cannot load ${file}: ${error.message}`);
    return [];
  }
}

/** Ids, order, key and picture of each task item. */
function checkTaskItems(typeItems, formats, prefix, problems, notes) {
  if (typeItems.length !== formats.length) {
    problems.push(`expected ${formats.length} task items, found ${typeItems.length}`);
  }
  typeItems.forEach((item, index) => {
    const id = `${prefix}${String(index + 1).padStart(2, '0')}`;
    if (item.itemId !== id) problems.push(`item ${index + 1}: itemId should be ${id}, found ${item.itemId}`);
    if (item.format !== formats[index]) {
      problems.push(`${id}: format should be ${formats[index]}, found ${item.format}`);
    }
    const values = canonicalTrainingValues(item);
    if (!canSubmitTrainingItem(item, values)) problems.push(`${id}: the key cannot be submitted`);
    if (!gradeTrainingItem(item, values).correct) problems.push(`${id}: the key is graded as wrong`);
    if (item.format === 'image_choice' && !existsSync(path.join(process.cwd(), 'public', item.image || ''))) {
      notes.push(`${id}: image ${item.image} does not exist yet`);
    }
  });
}

async function checkB2BasicLevel(level, problems, notes) {
  const code = String(level).padStart(2, '0');
  let original = BANKS[level];
  if (level === 1) {
    ({ B2_BASIC_01_PRESENT_SIMPLE: original } = await import('../src/data/trainingGapFillContent.js'));
  }
  if (!original) {
    problems.push('not found');
    return 0;
  }

  const typeItems = await importItems(`src/data/trainingTypes/b2Basic${code}.js`, problems);
  const exercise = { ...original, items: [...original.items, ...typeItems] };
  problems.push(...validateGapFillExercise(exercise, { expectedItemCount: exercise.items.length }).findings);

  /** Translation items are optional in B2 basic until every level has them. */
  const formats =
    typeItems.length === TRAINING_PATH_TYPE_FORMATS.length ? TRAINING_PATH_TYPE_FORMATS : TRAINING_TYPE_FORMATS;
  checkTaskItems(typeItems, formats, `b2-basic-${code}-t`, problems, notes);
  return typeItems.length;
}

async function checkPathLevel(slug, cefr, difficulty, level, problems, notes) {
  const code = String(level).padStart(2, '0');
  const items = await importItems(`src/data/trainingPaths/${slug}/level${code}.js`, problems);
  const exercise = buildTrainingPathExercise(cefr, difficulty, level, items);
  if (!exercise) {
    problems.push(`${slug} has no level ${level}`);
    return items.length;
  }
  problems.push(
    ...validateGapFillExercise(exercise, { expectedItemCount: TRAINING_PATH_TYPE_FORMATS.length }).findings,
  );
  checkTaskItems(items, TRAINING_PATH_TYPE_FORMATS, `${slug}-${code}-t`, problems, notes);
  return items.length;
}

function parsePath(slug) {
  const [cefr, diffSlug] = String(slug).split('-');
  const difficulty = Object.keys(TRAINING_PATH_DIFFICULTY_SLUGS).find(
    (key) => TRAINING_PATH_DIFFICULTY_SLUGS[key] === diffSlug,
  );
  const sections = difficulty ? trainingPathSections(cefr, difficulty) : null;
  if (!sections) return null;
  return { cefr, difficulty, total: sections.reduce((sum, section) => sum + section.topics.length, 0) };
}

const args = process.argv.slice(2);
const pathSlug = args[0] && !/^\d+$/.test(args[0]) ? args.shift() : null;
const pathInfo = pathSlug ? parsePath(pathSlug) : null;
if (pathSlug && !pathInfo) {
  console.error(`Unknown path "${pathSlug}". Use a slug such as a2-basic.`);
  process.exit(1);
}

const levels =
  args[0] === 'all'
    ? Array.from({ length: pathInfo ? pathInfo.total : 25 }, (_, index) => index + 1)
    : args.map(Number).filter(Boolean);
if (!levels.length) {
  console.error('Pass one or more level numbers, e.g. 2 3, or "all".');
  process.exit(1);
}

let failed = false;
for (const level of levels) {
  const problems = [];
  const notes = [];
  const count = pathInfo
    ? await checkPathLevel(pathSlug, pathInfo.cefr, pathInfo.difficulty, level, problems, notes)
    : await checkB2BasicLevel(level, problems, notes);

  if (problems.length) failed = true;
  console.log(`Level ${level}: ${problems.length ? `${problems.length} problem(s)` : 'OK'} (${count} task items)`);
  problems.forEach((problem) => console.log(`  ✗ ${problem}`));
  notes.forEach((note) => console.log(`  · ${note}`));
}

process.exitCode = failed ? 1 : 0;
