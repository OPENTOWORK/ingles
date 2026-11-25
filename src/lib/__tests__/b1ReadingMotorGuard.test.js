import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { estimateAiCost } from '@/lib/aiPricing';
import {
  B1ReadingMotorSession,
  backoffDelayMs,
  classifyApiError,
  normaliseFailureMessage,
  resolveB1MotorConfig,
  resolveGenerationAttemptLimit,
  scrubReport,
} from '@/lib/b1ReadingMotorGuard';
import {
  B1_READING_MOTOR_VERSION,
  createMemoryB1MotorStore,
  runB1ReadingMotor,
} from '@/lib/b1ReadingMotorRun';
import { B1_READING_RULES_VERSION } from '@/lib/b1ReadingRules';

const quiet = { log() {}, error() {} };

function apiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function completion(value, usage = { input_tokens: 24, output_tokens: 16, total_tokens: 40 }, model = 'gpt-4o') {
  return {
    text: JSON.stringify(value),
    model,
    usage,
  };
}

function isReviewCall(options) {
  const blob = `${options?.system || ''}\n${(options?.messages || []).map((message) => message?.content || '').join('\n')}`;
  return /WITHOUT trusting/i.test(blob);
}

function validPart1() {
  return {
    directions: 'For each question, choose the correct answer.',
    questions: Array.from({ length: 5 }, (_, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text: `Message ${i + 1}: Please check the details before Friday.`,
      prompt: 'What should the reader do?',
      options: ['A) Check the information.', 'B) Ignore the message.', 'C) Wait until next month.'],
    })),
    modelAnswers: Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, answer: 'A' })),
  };
}

function passReview() {
  return {
    answers: [1, 2, 3, 4, 5].map((number) => ({ number, letter: 'A' })),
    ambiguousItems: [],
    weakDistractors: [],
    literalSolveItems: [],
    itemEvidence: [1, 2, 3, 4, 5].map((number) => ({
      number,
      paraphrased: true,
      grounded: true,
      options: ['A', 'B', 'C'].map((letter) => ({
        letter,
        plausible: true,
        reason: letter === 'A' ? 'paraphrases the main message' : 'misreads one detail that the text does contain',
      })),
    })),
    issues: [],
    verdict: 'pass',
  };
}

function failReview() {
  return {
    answers: [1, 2, 3, 4, 5].map((number) => ({ number, letter: 'A' })),
    ambiguousItems: [{ number: 1, letters: ['A', 'B'], reason: 'two options express the text equally well' }],
    weakDistractors: [],
    literalSolveItems: [],
    issues: [],
    verdict: 'revise',
  };
}

async function runMotor(extra = {}) {
  const store = createMemoryB1MotorStore();
  const reportDir = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-motor-'));
  const calls = [];
  const result = await runB1ReadingMotor({
    examSlot: 4,
    store,
    reportDir,
    partNumbers: [1],
    dryRun: false,
    spendCapUsd: 50,
    maxElapsedMs: 60_000,
    maxAttemptsPerPart: 4,
    sameCategoryLimit: 2,
    maxConsecutiveNoProgress: 3,
    sleep: async () => {},
    logger: quiet,
    chooseVariety: async () => ({ topic: 'a library visit', context: 'notice', grammarFocus: null }),
    ...extra,
    mockModel: extra.mockModel
      ? (options) => {
        calls.push(options);
        return extra.mockModel(options, calls);
      }
      : undefined,
  });
  return { store, reportDir, result, calls };
}

test('normalises differently worded diagnostics to one failure code', () => {
  assert.equal(
    normaliseFailureMessage('B1 Reading Part 3 uses language above B1: "nuance". Replace it with ordinary B1 wording.'),
    'above_b1_level',
  );
  assert.equal(
    normaliseFailureMessage('B1 Part 3 level issue: "polyglot" — above normal B1 reading level'),
    'above_b1_level',
  );
  assert.equal(
    normaliseFailureMessage('B1 Part 1 Q1 correct option repeats wording from the notice (check, details).'),
    'literal_overlap',
  );
  assert.notEqual(
    normaliseFailureMessage('B1 Reading Part 1 question 1: answer must be one of A/B/C.'),
    normaliseFailureMessage('B1 Reading Part 1 must have exactly 5 questions (got 0).'),
  );
});

test('historical attempt limits stay in place unless the isolated motor session is active', () => {
  assert.equal(resolveGenerationAttemptLimit({ mode: 'reading', isB2Ruoe: true, partNumber: 4 }), 8);
  assert.equal(resolveGenerationAttemptLimit({ mode: 'listening', partNumber: 11 }), 5);
  assert.equal(resolveGenerationAttemptLimit({ isB1Reading: true, partNumber: 4 }), 10);
  assert.equal(resolveGenerationAttemptLimit({ isB1Reading: true, partNumber: 5 }), 8);
  assert.equal(resolveGenerationAttemptLimit({ isB1Reading: true, partNumber: 1 }), 5);
  assert.equal(resolveGenerationAttemptLimit({ partNumber: 9 }), 3);
  assert.equal(resolveGenerationAttemptLimit({
    isB1Reading: true,
    partNumber: 4,
    motor: { config: { maxAttemptsPerPart: 4 } },
  }), 4);
});

test('backoff delays grow exponentially and stay bounded', () => {
  const config = { backoffBaseMs: 400, backoffMaxMs: 1000 };
  assert.deepEqual(
    [0, 1, 2, 3].map((index) => backoffDelayMs(index, config)),
    [400, 800, 1000, 1000],
  );
});

test('classifies non-retryable API failures separately from rate limits and server errors', () => {
  assert.deepEqual(classifyApiError(apiError(401, 'Incorrect API key provided')), {
    code: 'invalid_credentials',
    retryable: false,
  });
  assert.deepEqual(classifyApiError(apiError(429, 'You exceeded your current quota')), {
    code: 'quota_exhausted',
    retryable: false,
  });
  assert.deepEqual(classifyApiError(apiError(402, 'no credits remaining')), {
    code: 'insufficient_credits',
    retryable: false,
  });
  assert.deepEqual(classifyApiError(apiError(404, 'The model `gpt-nope` does not exist')), {
    code: 'unsupported_model',
    retryable: false,
  });
  assert.equal(classifyApiError(apiError(429, 'Rate limit reached for requests')).retryable, true);
  assert.equal(classifyApiError(apiError(503, 'The server had an error')).code, 'server_error');
  assert.equal(classifyApiError(apiError(500, 'internal error')).retryable, true);
});

test('same category twice without progress stops, and a resolved code counts as progress', () => {
  const session = new B1ReadingMotorSession(resolveB1MotorConfig({
    sameCategoryLimit: 2,
    maxConsecutiveNoProgress: 5,
    spendCapUsd: 5,
  }), {});
  session.examSlot = 2;
  session.beginAttempt(3);
  const first = session.recordAttemptFailure(3, [
    'B1 Reading Part 3 uses language above B1: "nuance".',
    'B1 Part 4 mechanical repeated phrase at gap 16: breakfast list.',
  ]);
  assert.equal(first.stop, false);
  session.beginAttempt(3);
  const improved = session.recordAttemptFailure(3, [
    'B1 Part 3 level issue: "polyglot" — above normal B1 reading level',
  ]);
  assert.equal(improved.stop, false);
  session.beginAttempt(3);
  const stalled = session.recordAttemptFailure(3, [
    'B1 Reading Part 3 uses language above B1: "unparalleled".',
  ]);
  assert.equal(stalled.stop, true);
  assert.equal(stalled.reason, 'repeated_failure');
  assert.equal(stalled.failureCategory, 'above_b1_level');
});

test('no-progress limit stops when categories change but nothing is resolved', () => {
  const session = new B1ReadingMotorSession(resolveB1MotorConfig({
    sameCategoryLimit: 9,
    maxConsecutiveNoProgress: 3,
    spendCapUsd: 5,
  }), {});
  session.beginAttempt(1);
  assert.equal(session.recordAttemptFailure(1, [
    'B1 Part 1 Q1 correct option repeats wording from the notice (check).',
  ]).stop, false);
  session.beginAttempt(1);
  assert.equal(session.recordAttemptFailure(1, [
    'B1 Part 1 Q1 correct option repeats wording from the notice (check).',
    'B1 Reading Part 1 must have exactly 5 questions (got 4).',
  ]).stop, false);
  session.beginAttempt(1);
  const stopped = session.recordAttemptFailure(1, [
    'B1 Part 1 Q1 correct option repeats wording from the notice (check).',
    'B1 Reading Part 1 must have exactly 5 questions (got 4).',
    'B1 Reading Part 1 question 2: answer must be one of A/B/C.',
  ]);
  assert.equal(stopped.stop, true);
  assert.equal(stopped.reason, 'no_progress');
});

test('elapsed-time limit stops before another attempt', () => {
  let now = 1_000;
  const session = new B1ReadingMotorSession(resolveB1MotorConfig({
    maxElapsedMs: 500,
    spendCapUsd: 5,
  }), { now: () => now });
  session.examSlot = 8;
  session.beginAttempt(2);
  now = 1_600;
  assert.throws(() => session.beginAttempt(2), (error) => error.reason === 'time_limit' && error.report.examSlot === 8);
});

test('diagnostic reports redact credentials', () => {
  const report = scrubReport({
    detail: 'Incorrect API key provided: sk-thisIsNotARealKey123456.',
    apiKey: 'sk-thisIsNotARealKey123456',
    tokens: { input: 3 },
  });
  const serialised = JSON.stringify(report);
  assert.equal(serialised.includes('sk-thisIsNotARealKey123456'), false);
  assert.equal(report.apiKey, '[redacted]');
  assert.equal(report.tokens.input, 3);
  assert.match(report.detail, /\[redacted\]/);
});

test('repeated validation failures stop the part and write a local diagnostic report', async () => {
  const { result, store } = await runMotor({
    mockModel: () => completion({ questions: [], modelAnswers: [] }, undefined),
  });
  assert.equal(result.stopped, true);
  assert.equal(result.report.reason, 'repeated_failure');
  assert.equal(result.report.examSlot, 4);
  assert.equal(result.report.partNumber, 1);
  assert.equal(result.report.attempts, 2);
  assert.equal(result.report.modelCalls, 2);
  assert.equal(result.report.paidApiCalls, 0);
  assert.equal(typeof result.report.approximateCostUsd, 'number');
  assert.equal(typeof result.report.tokens.total, 'number');
  assert.match(result.report.recommendedAction, /Failure category/);
  assert.match(result.report.billingNote, /not an exact OpenAI invoice/);
  assert.equal(store.exams.length, 0);
  assert.equal(store.parts.size, 0);
  const written = fs.readFileSync(result.reportFile, 'utf8');
  assert.equal(written.includes('sk-'), false);
  assert.match(written, /"examSlot": 4/);
  const saved = JSON.parse(written);
  assert.equal(saved.failureCategory, result.report.failureCategory);
  assert.equal(saved.attemptHistory[0].primary, saved.attemptHistory[1].primary);
  assert.equal(saved.attemptHistory[1].progress, false);
});

test('different failure categories continue until the attempt limit', async () => {
  const steps = [
    { directions: 'For each question, choose the correct answer.', questions: [], modelAnswers: [] },
    (() => {
      const generated = validPart1();
      generated.modelAnswers = generated.modelAnswers.map((row) => ({ ...row, answer: 'Z' }));
      return generated;
    })(),
    (() => {
      const generated = validPart1();
      generated.questions = generated.questions.map((question) => ({
        ...question,
        text: 'Please check the details before Friday and bring the signed form.',
        options: ['A) Please check the details before Friday.', 'B) Ignore the message.', 'C) Wait until next month.'],
      }));
      return generated;
    })(),
    (() => {
      const generated = validPart1();
      generated.questions = generated.questions.map((question) => ({ ...question, prompt: '' }));
      return generated;
    })(),
  ];
  let index = 0;
  const { result, calls } = await runMotor({
    maxAttemptsPerPart: 4,
    mockModel: (options) => {
      assert.equal(isReviewCall(options), false);
      const body = steps[index];
      index += 1;
      return completion(body);
    },
  });
  assert.equal(result.report.reason, 'attempt_limit');
  assert.equal(result.report.attempts, 4);
  assert.equal(calls.length, 4);
  const primaries = result.report.attemptHistory.map((row) => row.primary);
  assert.equal(new Set(primaries).size >= 3, true);
});

test('semantic validation still rejects a part at the attempt limit', async () => {
  const { result, store, calls } = await runMotor({
    maxAttemptsPerPart: 1,
    mockModel: (options) => completion(isReviewCall(options) ? failReview() : validPart1()),
  });
  assert.equal(result.stopped, true);
  assert.equal(result.ok, false);
  assert.equal(result.report.failureCategory, 'ambiguity');
  assert.equal(calls.some((options) => isReviewCall(options)), true);
  assert.equal(store.parts.size, 0);
  assert.equal(store.exams.length, 0);
});

test('spend cap blocks the next model call and does not waive semantic review', async () => {
  const billed = estimateAiCost('gpt-4o', 0, 45000).costUsd;
  const { result, calls, store } = await runMotor({
    spendCapUsd: billed + billed / 2,
    callEstimateUsd: billed,
    mockModel: (options) => {
      assert.equal(isReviewCall(options), false);
      return completion(validPart1(), { input_tokens: 0, output_tokens: 45000, total_tokens: 45000 }, 'gpt-4o');
    },
  });
  assert.equal(result.report.reason, 'spend_cap');
  assert.equal(calls.length, 1);
  assert.equal(result.report.modelCalls, 1);
  assert.equal(result.report.tokens.output, 45000);
  assert.equal(result.report.tokens.source, 'actual');
  assert.ok(Math.abs(result.report.approximateCostUsd - billed) < 0.000001);
  assert.equal(store.parts.size, 0);
  assert.match(result.report.billingNote, /not an exact OpenAI invoice/);
});

test('estimated spend cap stops a second generation call', async () => {
  const { result, calls } = await runMotor({
    spendCapUsd: 1,
    callEstimateUsd: 0.6,
    mockModel: () => ({
      text: JSON.stringify({ questions: [], modelAnswers: [] }),
      model: 'gpt-4o',
    }),
  });
  assert.equal(result.report.reason, 'spend_cap');
  assert.equal(calls.length, 1);
  assert.equal(result.report.attempts, 1);
  assert.equal(result.report.tokens.source, 'estimate');
  assert.ok(result.report.approximateCostUsd >= 0.6);
});

test('non-retryable API errors stop immediately and the report omits the key', async () => {
  const cases = [
    [401, 'Incorrect API key provided: sk-thisIsNotARealKey123456.', 'invalid_credentials'],
    [429, 'You exceeded your current quota, please check your plan and billing details.', 'quota_exhausted'],
    [404, 'The model `gpt-nope` does not exist or you do not have access to it.', 'unsupported_model'],
    [402, 'no credits remaining', 'insufficient_credits'],
  ];
  for (const [status, message, reason] of cases) {
    let calls = 0;
    const slept = [];
    const { result } = await runMotor({
      sleep: async (ms) => { slept.push(ms); },
      mockModel: () => {
        calls += 1;
        throw apiError(status, message);
      },
    });
    assert.equal(calls, 1, reason);
    assert.equal(slept.length, 0, reason);
    assert.equal(result.report.reason, reason);
    assert.equal(result.report.paidApiCalls, 0);
    const written = fs.readFileSync(result.reportFile, 'utf8');
    assert.equal(written.includes('sk-thisIsNotARealKey123456'), false, reason);
    assert.match(result.report.recommendedAction, /run again|Wait|Restore|Choose a supported|quota/i);
  }
});

test('rate limits retry with bounded backoff and can then complete', async () => {
  let generationCalls = 0;
  const delays = [];
  const { result, calls } = await runMotor({
    maxTransientRetries: 2,
    backoffBaseMs: 25,
    backoffMaxMs: 1000,
    sleep: async (ms) => { delays.push(ms); },
    mockModel: (options) => {
      if (isReviewCall(options)) return completion(passReview());
      generationCalls += 1;
      if (generationCalls <= 2) throw apiError(429, 'Rate limit reached for requests');
      return completion(validPart1());
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(delays, [25, 50]);
  assert.equal(result.report.transientRetries, 2);
  assert.equal(result.report.paidApiCalls, 0);
  assert.equal(calls.length, 4);
  assert.equal(result.report.stopped, false);
});

test('server errors retry once and do not continue after the bound', async () => {
  let generationCalls = 0;
  const delays = [];
  const recovered = await runMotor({
    maxTransientRetries: 2,
    backoffBaseMs: 10,
    backoffMaxMs: 40,
    sleep: async (ms) => { delays.push(ms); },
    mockModel: (options) => {
      if (isReviewCall(options)) return completion(passReview());
      generationCalls += 1;
      if (generationCalls === 1) throw apiError(503, 'The server had an error while processing your request.');
      return completion(validPart1());
    },
  });
  assert.equal(recovered.result.ok, true);
  assert.deepEqual(delays, [10]);

  let exhaustedCalls = 0;
  const exhausted = await runMotor({
    maxTransientRetries: 2,
    backoffBaseMs: 5,
    backoffMaxMs: 20,
    sleep: async () => {},
    mockModel: () => {
      exhaustedCalls += 1;
      throw apiError(502, 'bad gateway');
    },
  });
  assert.equal(exhausted.result.report.reason, 'server_error');
  assert.equal(exhaustedCalls, 3);
  assert.equal(exhausted.result.report.transientRetries, 2);
});

test('a stopped run keeps previously validated cache entries', async () => {
  const store = createMemoryB1MotorStore();
  const payload = {
    partNumber: 1,
    rulesVersion: B1_READING_RULES_VERSION,
    allocation: { topic: 'cached library', context: 'notice', grammarFocus: null },
    generated: { marker: 'keep-me' },
    validation: { ok: true, errors: [], warnings: ['cached warning'] },
  };
  await store.saveValidatedPart(4, B1_READING_MOTOR_VERSION, 1, payload);
  const before = JSON.stringify(store.parts.get(`4:${B1_READING_MOTOR_VERSION}:1`));
  let savedExam = false;
  let calls = 0;
  const result = await runB1ReadingMotor({
    examSlot: 4,
    store,
    partNumbers: [1, 2],
    dryRun: false,
    spendCapUsd: 50,
    maxAttemptsPerPart: 4,
    sleep: async () => {},
    logger: quiet,
    reportDir: fs.mkdtempSync(path.join(os.tmpdir(), 'b1-motor-cache-')),
    chooseVariety: async () => ({ topic: 'a club', context: 'notice', grammarFocus: null }),
    beforeSaveExam: async () => { savedExam = true; },
    mockModel: () => {
      calls += 1;
      return completion({ questions: [], modelAnswers: [] }, undefined);
    },
  });
  assert.equal(result.stopped, true);
  assert.equal(result.report.partNumber, 2);
  assert.equal(calls, 2);
  assert.equal(savedExam, false);
  assert.equal(store.exams.length, 0);
  assert.deepEqual(result.report.preservedPartNumbers, [1]);
  assert.equal(JSON.stringify(store.parts.get(`4:${B1_READING_MOTOR_VERSION}:1`)), before);
  assert.equal(store.parts.has(`4:${B1_READING_MOTOR_VERSION}:2`), false);
});

test('a validated part is stored after mocked generation and semantic review', async () => {
  let savedExam = false;
  const { result, store, calls } = await runMotor({
    beforeSaveExam: async () => { savedExam = true; },
    mockModel: (options) => completion(isReviewCall(options) ? passReview() : validPart1()),
  });
  assert.equal(result.ok, true);
  assert.equal(result.stopped, undefined);
  assert.equal(savedExam, true);
  assert.equal(store.exams.length, 1);
  assert.equal(calls.length, 2);
  const cached = store.parts.get(`4:${B1_READING_MOTOR_VERSION}:1`);
  assert.equal(cached.validation.ok, true);
  assert.equal(cached.validation.semanticQuality.ok, true);
  assert.equal(result.report.paidApiCalls, 0);
  assert.equal(result.report.reason, 'completed');
});

test('dry run exercises the breaker without a paid model call', async () => {
  const { result } = await runMotor({
    dryRun: true,
    mockModel: () => {
      throw new Error('dry run invoked the mock transport');
    },
  });
  assert.equal(result.stopped, true);
  assert.equal(result.report.dryRun, true);
  assert.equal(result.report.paidApiCalls, 0);
  assert.equal(result.report.reason, 'repeated_failure');
  assert.equal(result.report.modelCalls, 2);
  assert.equal(result.report.attempts, 2);
  const written = fs.readFileSync(result.reportFile, 'utf8');
  assert.equal(written.includes('sk-'), false);
});

test('an adults-only profile failure is not recorded as invalid JSON', () => {
  const message = 'B1 Part 2 Q9 keyed text is limited to adults, but the profile does not state an age.';
  assert.equal(normaliseFailureMessage(message), 'unsupported_requirement');
  assert.equal(normaliseFailureMessage(`Generation/parse error: ${message}`), 'unsupported_requirement');
  assert.equal(
    normaliseFailureMessage('B1 Part 2 Q9 keyed text is limited to adults, but the profile describes a young person.'),
    'unsupported_requirement',
  );
  assert.equal(
    normaliseFailureMessage('B1 Part 2 Q7 keyed text is limited to adults, but the profile states an age under 18.'),
    'unsupported_requirement',
  );
  assert.equal(normaliseFailureMessage('Generation/parse error: Unexpected token in JSON'), 'json_parse');
  const shortPassage = 'B1 Part 3 planner passage is 177 words; keep it between 180 and 520.';
  assert.equal(normaliseFailureMessage(shortPassage), 'word_count');
  assert.equal(normaliseFailureMessage(`Generation/parse error: ${shortPassage}`), 'word_count');
  const device = 'B1 Part 4 gap 17 is labelled chronology, but that signal is missing from the sentence and the text beside the gap.';
  assert.equal(normaliseFailureMessage(device), 'cohesion');
  assert.equal(normaliseFailureMessage(`Generation/parse error: ${device}`), 'cohesion');
});

test('a different failing gap counts as progress and the same gap twice stops', () => {
  const session = new B1ReadingMotorSession(resolveB1MotorConfig({
    sameCategoryLimit: 2,
    maxConsecutiveNoProgress: 5,
    spendCapUsd: 1,
  }), {});
  session.beginAttempt(4);
  const first = session.recordAttemptFailure(4, [
    'B1 Part 4 gap 17 is labelled chronology, but that signal is missing from the sentence and the text beside the gap.',
  ]);
  assert.equal(first.stop, false);
  assert.equal(first.failureCategory, 'cohesion');
  session.beginAttempt(4);
  const switched = session.recordAttemptFailure(4, [
    'B1 Part 4 gap 20 is labelled logical-progression, but that signal is missing from the sentence and the text beside the gap.',
  ]);
  assert.equal(switched.stop, false);
  session.beginAttempt(4);
  const repeated = session.recordAttemptFailure(4, [
    'B1 Part 4 gap 20 is labelled logical-progression, but that signal is missing from the sentence and the text beside the gap.',
  ]);
  assert.equal(repeated.stop, true);
  assert.equal(repeated.failureCategory, 'cohesion');
});
