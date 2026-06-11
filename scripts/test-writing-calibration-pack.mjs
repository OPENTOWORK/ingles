/**
 * Local test for the Writing Calibration Pack (Phase 1).
 *
 * Usage:
 *   node scripts/test-writing-calibration-pack.mjs
 *
 * Does NOT touch Supabase, the feedback prompt, or production.
 */

import { WRITING_CALIBRATION_PACK } from '../src/lib/calibration/writingCalibrationPack.js';
import {
  validateWritingCalibrationPack,
  countWords,
} from '../src/lib/calibration/writingCalibrationSchema.js';
import { selectWritingCalibrationExamples } from '../src/lib/calibration/selectWritingCalibrationExamples.js';

function header(title) {
  console.log(`\n=== ${title} ===`);
}

function summarize(example) {
  return `${example.id} [${example.taskType}, ${example.estimatedLevel}, ${example.wordCount}w]`;
}

let failures = 0;

header('Pack');
console.log(`Examples in pack: ${WRITING_CALIBRATION_PACK.length}`);
for (const ex of WRITING_CALIBRATION_PACK) {
  console.log(`  - ${summarize(ex)} (real words: ${countWords(ex.studentText)})`);
}

header('Validation');
const { valid, results } = validateWritingCalibrationPack(WRITING_CALIBRATION_PACK);
for (const r of results) {
  console.log(`  ${r.valid ? 'OK   ' : 'ERROR'} ${r.id}`);
  for (const e of r.errors) console.log(`        error: ${e}`);
  for (const w of r.warnings) console.log(`        warning: ${w}`);
}
console.log(valid ? 'Pack validation: OK' : 'Pack validation: FAILED');
if (!valid) failures += 1;

header('Selection by taskType');
const byEssayB1 = selectWritingCalibrationExamples({ taskType: 'essay', estimatedLevel: 'B1' });
console.log(`  essay/B1       -> ${byEssayB1.map((e) => `${e.id} (${e.estimatedLevel})`).join(', ') || '(none)'}`);
const byEmail = selectWritingCalibrationExamples({ taskType: 'email', estimatedLevel: 'B1+' });
console.log(`  email/B1+      -> ${byEmail.map((e) => `${e.id} (${e.estimatedLevel})`).join(', ') || '(none)'}`);
const byReport = selectWritingCalibrationExamples({ taskType: 'report', estimatedLevel: 'B2' });
console.log(`  report/B2      -> ${byReport.map((e) => e.id).join(', ') || '(none)'} (no report in pack: max 1 fallback)`);

if (byEssayB1[0]?.id !== 'wcp-001' || byEssayB1.some((e) => e.taskType !== 'essay')) {
  console.log('  FAIL: essay/B1 should return essays only, wcp-001 first');
  failures += 1;
}
if (byEmail.length !== 1 || byEmail[0]?.id !== 'wcp-003') {
  console.log('  FAIL: email/B1+ should return only wcp-003 (no type mixing)');
  failures += 1;
}
if (byReport.length > 1) {
  console.log('  FAIL: fallback selection (no type match) should return at most 1 example');
  failures += 1;
}

header('Selection by level');
const lowB2 = selectWritingCalibrationExamples({ taskType: 'essay', estimatedLevel: 'low B2', maxExamples: 1 });
console.log(`  essay/low B2 (max 1) -> ${lowB2.map((e) => `${e.id} (${e.estimatedLevel})`).join(', ')}`);
const b1 = selectWritingCalibrationExamples({ taskType: 'essay', estimatedLevel: 'B1', maxExamples: 1 });
console.log(`  essay/B1 (max 1)     -> ${b1.map((e) => `${e.id} (${e.estimatedLevel})`).join(', ')}`);

if (lowB2[0]?.id !== 'wcp-002') {
  console.log('  FAIL: essay/low B2 should rank wcp-002 (low B2) first');
  failures += 1;
}
if (b1[0]?.id !== 'wcp-001') {
  console.log('  FAIL: essay/B1 should rank wcp-001 (B1) first');
  failures += 1;
}

header('Never return the whole pack');
const greedy = selectWritingCalibrationExamples({ taskType: 'essay', estimatedLevel: 'B2', maxExamples: 99 });
console.log(`  maxExamples=99 -> ${greedy.length} examples (hard cap 2)`);
if (greedy.length > 2) {
  console.log('  FAIL: selector must never return more than 2 examples');
  failures += 1;
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
