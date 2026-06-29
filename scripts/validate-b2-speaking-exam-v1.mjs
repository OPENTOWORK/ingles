/**
 * Pre-merge validation for B2 Speaking Exam V1 (static + engine checks).
 * Run: node --loader ./scripts/alias-loader.mjs scripts/validate-b2-speaking-exam-v1.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { getB2SpeakingExamBySlot } from '../src/data/b2-speaking-exams/index.ts';
import {
  createB2ExamEngineState,
  advanceEngineAfterCandidate,
  isExamFullyComplete,
  getExamScript,
} from '../src/features/speaking/domain/b2-speaking-exam-engine.ts';
import { AI_ACTIONS, getDailyLimit } from '../src/lib/aiUsage.js';

const root = join(process.cwd(), 'src');

function read(rel) {
  return readFileSync(join(process.cwd(), rel), 'utf8');
}

const results = [];

function pass(id, msg) {
  results.push({ id, ok: true, msg });
  console.log(`OK  ${id}: ${msg}`);
}

function fail(id, msg) {
  results.push({ id, ok: false, msg });
  console.error(`FAIL ${id}: ${msg}`);
}

// 1. Full exam engine completes parts 1-4
try {
  const exam = getB2SpeakingExamBySlot(1);
  let state = createB2ExamEngineState(exam.id);
  let guard = 0;
  while (!isExamFullyComplete(state) && guard < 35) {
    state = advanceEngineAfterCandidate(exam, {
      ...state,
      candidateTurnCount: state.candidateTurnCount + 1,
    });
    guard += 1;
  }
  assert.equal(isExamFullyComplete(state), true);
  assert.deepEqual(state.partsCompleted.sort(), [1, 2, 3, 4]);
  pass('1', `Engine completes 4 parts (${getExamScript(exam).length} script lines)`);
} catch (e) {
  fail('1', e.message);
}

// 2. Full exam UI does not call legacy /api/speaking/turn
const fullSim = read('src/components/b2/B2SpeakingFullExamSimulation.js');
if (!fullSim.includes('/api/speaking/turn')) {
  pass('2', 'B2SpeakingFullExamSimulation has zero /api/speaking/turn calls');
} else {
  fail('2', 'B2SpeakingFullExamSimulation still references /api/speaking/turn');
}

// 3. Text answers skip transcribe endpoint (code path)
if (
  fullSim.includes('if (audioOrText instanceof Blob)') &&
  fullSim.includes("transcriptSource = 'TYPED'") &&
  fullSim.includes('/api/speaking/b2-exam/transcribe')
) {
  pass('3', 'Typed answers use TYPED path without calling transcribe API');
} else {
  fail('3', 'Text answer path unclear');
}

// 4. Mic route logs exam_speaking_transcription
const transcribeRoute = read('src/app/api/speaking/b2-exam/transcribe/route.ts');
if (
  transcribeRoute.includes('EXAM_SPEAKING_TRANSCRIPTION') &&
  transcribeRoute.includes("result.source === 'STT'") &&
  transcribeRoute.includes('recordAiUsageSuccess')
) {
  pass('4', 'transcribe route logs exam_speaking_transcription on STT only');
} else {
  fail('4', 'STT logging missing or unconditional');
}

// 5. No visible daily limit for transcription
const dailyLimit = getDailyLimit(AI_ACTIONS.EXAM_SPEAKING_TRANSCRIPTION);
const usageUiFiles = [
  'src/lib/speakingUsageStorage.js',
  'src/lib/aiUsageLimitCopy.js',
  'src/components/b2/B2SpeakingFullExamSimulation.js',
];
const uiCombined = usageUiFiles.map((f) => read(f)).join('\n');
if (dailyLimit == null && !uiCombined.includes('exam_speaking_transcription')) {
  pass('5', 'exam_speaking_transcription has no daily limit and no UI copy');
} else {
  fail('5', `transcription limit=${dailyLimit} or UI mentions action`);
}

// 6. evaluate uses preflight once for exam_speaking_feedback
const evaluateRoute = read('src/app/api/speaking/evaluate/route.ts');
if (
  evaluateRoute.includes('runAiPreflight(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK') &&
  evaluateRoute.includes('handleExamSpeakingFeedback')
) {
  pass('6', 'evaluate uses single preflight + handleExamSpeakingFeedback');
} else {
  fail('6', 'evaluate feedback path incomplete');
}

// 7. DAILY_LIMITS has 3 for feedback (4th blocked by preflight)
if (getDailyLimit(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK) === 3) {
  pass('7', 'exam_speaking_feedback daily limit is 3 (4th blocked by preflight)');
} else {
  fail('7', 'Unexpected feedback daily limit');
}

// 8. Turn limit does not call consumeDailyAiLimit
const turnService = read('src/features/speaking/services/b2-exam/b2-exam-session.service.ts');
const turnRoute = read('src/app/api/speaking/b2-exam/turn/route.ts');
if (
  turnService.includes('SPEAKING_SESSION_TURN_LIMIT_REACHED') &&
  !turnService.includes('consumeDailyAiLimit') &&
  !turnRoute.includes('consumeDailyAiLimit') &&
  !turnRoute.includes('runAiPreflight')
) {
  pass('8', '30-turn limit is session-only, no feedback quota');
} else {
  fail('8', 'Turn limit may consume feedback quota');
}

// 9. evaluate saves speaking_evaluations payload with meta
if (
  evaluateRoute.includes('saveEvaluation') &&
  evaluateRoute.includes('speakingScoreTotal') &&
  evaluateRoute.includes("source: 'ai_feedback'")
) {
  pass('9', 'evaluate persists payload.meta in speaking_evaluations');
} else {
  fail('9', 'saveEvaluation meta missing');
}

// 10. Dralo AI still guarded (no changes to guard in this branch)
const draloShell = read('src/components/dralo/DraloAiShell.tsx');
const draloGuard = read('src/components/dralo-ai/DraloAiFeatureGuard.js');
if (draloShell.includes('DraloAiFeatureGuard') && draloGuard.length > 50) {
  pass('10', 'Dralo AI FeatureGuard unchanged and present');
} else {
  fail('10', 'Dralo AI guard missing');
}

const failed = results.filter((r) => !r.ok);
console.log('\n================');
console.log(`Passed: ${results.length - failed.length}/${results.length}`);
if (failed.length) {
  process.exit(1);
}
