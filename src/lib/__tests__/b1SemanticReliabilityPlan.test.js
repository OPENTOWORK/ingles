import test from 'node:test';
import assert from 'node:assert/strict';
import { reliabilityCallPlan, RELIABILITY_CASES } from '../../../scripts/b1-semantic-reliability/cases.mjs';
import { validateB1ReadingQuality } from '@/lib/b1ReadingQualityValidator';
import { B1_READING_RULES_VERSION } from '@/lib/b1ReadingRules';

test('the semantic reliability set has one expected production call path', () => {
  const plan = reliabilityCallPlan();
  assert.equal(plan.cases, 8);
  assert.equal(plan.callsExpected, 13);
  assert.equal(plan.callsCeiling, 14);
  assert.equal(RELIABILITY_CASES.filter((item) => item.outcome === 'fail').length, 5);
  assert.equal(RELIABILITY_CASES.filter((item) => item.outcome === 'pass').length, 3);
  const invalidPart5 = RELIABILITY_CASES.find((item) => item.id === 'p5-invalid-exam8');
  assert.match(invalidPart5.generated.passage, /\(25\)/);
  assert.ok(invalidPart5.generated.questions.some((question) => question.options.includes('A) boost')));
  assert.ok(invalidPart5.generated.questions.some((question) => question.options.includes('C) keep')));
});

test('a local transport measures the real review path without a model call', async () => {
  let calls = 0;
  const result = await validateB1ReadingQuality(6, {
    passage: 'She thanked him (32) ___ the map.',
    questions: [{ number: 32, grammarTarget: 'preposition' }],
    modelAnswers: [{ number: 32, answer: 'for' }],
  }, {
    transport: async (options) => {
      calls += 1;
      assert.match(options.system, new RegExp(B1_READING_RULES_VERSION));
      assert.match(options.system, /empty alternatives/);
      assert.equal(options.temperature, 0);
      return { text: JSON.stringify({ answers: [], verdict: 'revise' }) };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.ok, false);
  assert.equal(result.approval.humanTeacherApproved, false);
});
