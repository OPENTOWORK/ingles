/**
 * Regression tests for Part 4 marking-point local repair (v1.1.1).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-ruoe-part4-marking-point-repair.mjs
 */
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';
import {
  findBestPart4MarkingPartition,
  isMarkingPointWithinAnswer,
  isPart4MarkingPartitionValid,
  repairPart4ItemMarkingPoints,
  repairPart4MarkingPoints,
} from '../src/lib/ruoePart4MarkingPointRepair.js';

function meta(keyword, fullAnswers, mp1, mp2) {
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword,
    fullAnswers,
    markingPoints: [
      { id: 1, label: 'mp1', accepted: mp1 },
      { id: 2, label: 'mp2', accepted: mp2 },
    ],
  };
}

function assertPass(name, ok, detail = '') {
  if (!ok) {
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

// --- invalid MP split → repaired ---
const badSplit = {
  number: 28,
  sentence1: 'Never before had she visited Rome.',
  keyword: 'HAD',
  sentence2Start: 'Never before __________________ Rome.',
  answer: 'had she visited',
  grading_metadata: meta('HAD', ['had she visited'], ['she'], ['had visited']),
};
const badResult = repairPart4ItemMarkingPoints(badSplit);
assertPass('invalid MP split repaired', badResult.ok && badResult.repaired);
assertPass(
  'repaired split grades 2/2',
  gradeB2KeyWordTransformation(badResult.question.answer, {
    ...badResult.question.grading_metadata,
    fullAnswers: ['__placeholder__'],
  }).score === 2,
);

// --- MP contains external words → repaired ---
const externalMp = {
  number: 25,
  sentence1: 'It is not necessary for you to use a password.',
  keyword: 'NEED',
  sentence2Start: 'You __________________ a password.',
  answer: 'do not need to use',
  grading_metadata: meta(
    'NEED',
    ['do not need to use', "don't need to use"],
    ['negative need structure'],
    ['to use'],
  ),
};
assertPass(
  'external MP words detected',
  !isMarkingPointWithinAnswer('negative need structure', externalMp.answer),
);
const extResult = repairPart4ItemMarkingPoints(externalMp);
assertPass('external MP words repaired', extResult.ok && extResult.repaired);
assertPass(
  'repaired MPs stay within answer',
  extResult.question.grading_metadata.markingPoints.every((mp) =>
    mp.accepted.every((v) =>
      externalMp.grading_metadata.fullAnswers.some((fa) =>
        isMarkingPointWithinAnswer(v, fa),
      ),
    ),
  ),
);

// --- MP1 + MP2 != canonical → repaired ---
const wrongPartition = {
  number: 26,
  sentence1: 'I am excited about hearing from you soon.',
  keyword: 'FORWARD',
  sentence2Start: 'I am __________________ from you soon.',
  answer: 'looking forward to hearing',
  grading_metadata: meta(
    'FORWARD',
    ['looking forward to hearing'],
    ['forward to'],
    ['looking hearing'],
  ),
};
assertPass(
  'wrong partition scores below 2/2',
  !isPart4MarkingPartitionValid(
    wrongPartition.answer,
    wrongPartition.grading_metadata,
    'FORWARD',
  ),
);
const wrongResult = repairPart4ItemMarkingPoints(wrongPartition);
assertPass('wrong partition repaired', wrongResult.ok && wrongResult.repaired);
assertPass(
  'repaired partition is looking forward | to hearing',
  wrongResult.partition?.mp1 === 'looking forward' && wrongResult.partition?.mp2 === 'to hearing',
);

// --- already valid → unchanged ---
const validItem = {
  number: 27,
  sentence1: 'The exam was less difficult than I expected.',
  keyword: 'AS',
  sentence2Start: 'The exam __________________ I expected.',
  answer: 'was not as hard as',
  grading_metadata: meta(
    'AS',
    ['was not as hard as', "wasn't as hard as"],
    ['was not', "wasn't"],
    ['as hard as'],
  ),
};
const beforeMeta = JSON.stringify(validItem.grading_metadata);
const validResult = repairPart4ItemMarkingPoints(validItem);
assertPass('already valid unchanged', validResult.ok && !validResult.repaired);
assertPass('valid metadata unchanged', JSON.stringify(validResult.question.grading_metadata) === beforeMeta);

// --- impossible valid partition → HARD_FAIL ---
const noPartition = findBestPart4MarkingPartition('go', 'GO');
assertPass('single-token answer has no partition', noPartition === null);
const impossibleItem = {
  number: 29,
  keyword: 'GO',
  answer: 'go',
  grading_metadata: meta('GO', ['go'], ['go'], ['']),
};
const impossibleResult = repairPart4ItemMarkingPoints(impossibleItem);
assertPass('impossible partition hard fails', !impossibleResult.ok && impossibleResult.hardFail);

// --- part-level repair passes validation ---
const partGen = {
  partTitle: 'Part 4',
  directions: 'Test',
  example: {
    number: 0,
    sentence1: 'You must do the washing-up tonight.',
    keyword: 'HAVE',
    sentence2Start: 'You __________________ the washing-up tonight.',
    answer: 'have to do',
  },
  questions: [
    { id: 'q1', type: 'transformation', ...externalMp, number: 25 },
    { id: 'q2', type: 'transformation', ...wrongPartition, number: 26 },
    { id: 'q3', type: 'transformation', ...validItem, number: 27 },
    { id: 'q4', type: 'transformation', ...badSplit, number: 28 },
    {
      id: 'q5',
      type: 'transformation',
      number: 29,
      sentence1: 'People say the museum opens at nine.',
      keyword: 'THOUGHT',
      sentence2Start: 'The museum __________________ at nine.',
      answer: 'is thought to open',
      grading_metadata: meta('THOUGHT', ['is thought to open'], ['is thought'], ['to open']),
    },
    {
      id: 'q6',
      type: 'transformation',
      number: 30,
      sentence1: 'I look forward to hearing from you.',
      keyword: 'FORWARD',
      sentence2Start: 'I am __________________ from you.',
      answer: 'looking forward to hearing',
      grading_metadata: meta(
        'FORWARD',
        ['looking forward to hearing'],
        ['looking forward'],
        ['to hearing'],
      ),
    },
  ],
  modelAnswers: [
    { id: 'q1', number: 25, answer: externalMp.answer },
    { id: 'q2', number: 26, answer: wrongPartition.answer },
    { id: 'q3', number: 27, answer: validItem.answer },
    { id: 'q4', number: 28, answer: badSplit.answer },
    { id: 'q5', number: 29, answer: 'is thought to open' },
    { id: 'q6', number: 30, answer: 'looking forward to hearing' },
  ],
};

const partRepair = repairPart4MarkingPoints(structuredClone(partGen));
assertPass('part-level repair allOk', partRepair.allOk);
assertPass('part-level repairs recorded', partRepair.repairs.length >= 3);

const validation = validateGeneratedExamPart('b2', 4, partRepair.gen);
assertPass(
  'repaired part passes mechanical validation for marking',
  !validation.errors.some((e) => /does not score 2\/2/i.test(e)),
  validation.errors.join('; '),
);

console.log(
  process.exitCode ? '\nPart 4 marking-point repair tests FAILED.' : '\nAll Part 4 marking-point repair tests passed.',
);
