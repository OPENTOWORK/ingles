/**
 * Read-only diagnostic: try candidate marking-point splits for a Part 4 item and
 * report what the official validator says about the whole part.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/b2-probe-part4-marking-points.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  root,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);

const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');

const APO = '\u2019';

/** Each candidate rewrites one question of a Part 4 payload, then re-validates the part. */
const CASES = [
  {
    label: 'Exam 3 · Q25',
    file: path.join(PACK, '05_OUTPUTS_PILOT_E03_v1_0', 'EXAM-03', 'TBP-PILOT-EX03_Part4.json'),
    number: 25,
    candidates: [
      {
        name: 'split B — negative BE + first AS / adjective + second AS',
        markingPoints: [
          { id: 1, label: 'negative BE + first AS', accepted: ['was not as', `wasn${APO}t as`] },
          { id: 2, label: 'gradable adjective + second AS', accepted: ['good as'] },
        ],
      },
      {
        name: 'split C — negative BE / as + adjective + as',
        markingPoints: [
          { id: 1, label: 'negative BE', accepted: ['was not', `wasn${APO}t`] },
          { id: 2, label: 'as + adjective + as', accepted: ['as good as'] },
        ],
      },
    ],
  },
  {
    label: 'Exam 4 · Q28',
    file: path.join(PACK, '05_OUTPUTS_PILOT_E04_v1_0', 'EXAM-04', 'TBP-PILOT-EX04_Part4.json'),
    number: 28,
    candidates: [
      {
        name: 'reworded gap: "I ____ tell anyone about this yet."',
        sentence2Start: 'I __________________ tell anyone about this yet.',
        answer: `would rather you didn${APO}t`,
        fullAnswers: [`would rather you didn${APO}t`, 'would rather you did not', `${APO}d rather you didn${APO}t`],
        markingPoints: [
          { id: 1, label: 'WOULD RATHER + second subject', accepted: ['would rather you', `${APO}d rather you`] },
          { id: 2, label: 'negative past-simple auxiliary', accepted: [`didn${APO}t`, 'did not'] },
        ],
      },
      {
        name: 'reworded gap, alternative split',
        sentence2Start: 'I __________________ tell anyone about this yet.',
        answer: `would rather you didn${APO}t`,
        fullAnswers: [`would rather you didn${APO}t`, 'would rather you did not', `${APO}d rather you didn${APO}t`],
        markingPoints: [
          { id: 1, label: 'WOULD RATHER', accepted: ['would rather', `${APO}d rather`] },
          { id: 2, label: 'second subject + negative past simple', accepted: [`you didn${APO}t`, 'you did not'] },
        ],
      },
    ],
  },
];

for (const testCase of CASES) {
  const payload = JSON.parse(readFileSync(testCase.file, 'utf8'));
  console.log(`\n=== ${testCase.label}`);

  const baseline = validateGeneratedExamPart('b2', 4, payload.generated);
  const baselineForItem = baseline.errors.filter((e) => e.includes(`question ${testCase.number}`));
  console.log(`baseline: ok=${baseline.ok} · errors for Q${testCase.number}=${baselineForItem.length}`);
  for (const e of baselineForItem) console.log(`  - ${e}`);

  for (const candidate of testCase.candidates) {
    const generated = JSON.parse(JSON.stringify(payload.generated));
    const question = generated.questions.find((q) => Number(q.number) === testCase.number);

    if (candidate.sentence2Start) question.sentence2Start = candidate.sentence2Start;
    if (candidate.answer) {
      question.answer = candidate.answer;
      const modelAnswer = (generated.modelAnswers || []).find((m) => Number(m.number) === testCase.number);
      if (modelAnswer) modelAnswer.answer = candidate.answer;
    }
    if (candidate.fullAnswers) question.grading_metadata.fullAnswers = candidate.fullAnswers;
    question.grading_metadata.markingPoints = candidate.markingPoints;

    const result = validateGeneratedExamPart('b2', 4, generated);
    const itemErrors = result.errors.filter((e) => e.includes(`question ${testCase.number}`));
    console.log(`\n  [${candidate.name}]`);
    console.log(`  part ok=${result.ok} · errors for Q${testCase.number}=${itemErrors.length} · total errors=${result.errors.length}`);
    for (const e of itemErrors) console.log(`    - ${e}`);
    if (result.errors.length && !itemErrors.length) {
      console.log('    other errors in part:');
      for (const e of result.errors) console.log(`      - ${e}`);
    }
  }
}
