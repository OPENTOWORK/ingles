import test from 'node:test';
import assert from 'node:assert/strict';
import {
  conservativeCallEstimate,
  createEvaluationLedger,
} from '../../../scripts/b1-semantic-reliability/spendGuard.mjs';
import { scoreCase } from '../../../scripts/b1-semantic-reliability/score.mjs';

const request = { system: 'Review this gap.', messages: [{ content: 'prepared item' }], max_tokens: 4096 };

test('a call is refused before it is sent when the conservative estimate exceeds the budget', async () => {
  const ledger = createEvaluationLedger({ budgetUsd: 0.000001, maxCalls: 14 });
  let called = 0;
  await assert.rejects(
    () => ledger.guardedCall(request, async () => {
      called += 1;
      return { text: '{}' };
    }),
    (error) => error.code === 'budget',
  );
  assert.equal(called, 0);
  assert.equal(ledger.state.paidCalls, 0);
  assert.equal(ledger.state.spentUsd, 0);
});

test('missing usage is charged at the conservative estimate and blocks the following call', async () => {
  const estimate = conservativeCallEstimate(request);
  const ledger = createEvaluationLedger({ budgetUsd: estimate.costUsd, maxCalls: 14 });
  let called = 0;
  await ledger.guardedCall(request, async () => {
    called += 1;
    return { text: '{}', model: 'gpt-4o' };
  });
  assert.equal(ledger.state.spentUsd, estimate.costUsd);
  assert.equal(ledger.state.actualInputTokens, 0);
  assert.equal(ledger.state.estimatedInputTokens, estimate.inputTokens);
  await assert.rejects(
    () => ledger.guardedCall(request, async () => {
      called += 1;
      return { text: '{}' };
    }),
    (error) => error.code === 'budget',
  );
  assert.equal(called, 1);
  assert.equal(ledger.state.records[0].source, 'estimate');
});

test('zero token usage is treated as missing and does not under-charge the call', async () => {
  const estimate = conservativeCallEstimate(request);
  const ledger = createEvaluationLedger({ budgetUsd: 1, maxCalls: 14 });
  await ledger.guardedCall(request, async () => ({
    text: '{}',
    usage: { input_tokens: 0, output_tokens: 0 },
  }));
  assert.equal(ledger.state.spentUsd, estimate.costUsd);
  assert.equal(ledger.state.records[0].source, 'estimate');
});

test('the call count stops at the configured limit and a thrown response is not retried', async () => {
  const ledger = createEvaluationLedger({ budgetUsd: 10, maxCalls: 2 });
  let called = 0;
  const respond = async () => {
    called += 1;
    return { text: '{}', usage: { input_tokens: 12, output_tokens: 8 }, model: 'gpt-4o' };
  };
  await ledger.guardedCall(request, respond);
  await ledger.guardedCall(request, respond);
  await assert.rejects(
    () => ledger.guardedCall(request, respond),
    (error) => error.code === 'call_limit',
  );
  assert.equal(called, 2);
  assert.equal(ledger.state.paidCalls, 2);

  const failing = createEvaluationLedger({ budgetUsd: 10, maxCalls: 14 });
  let attempts = 0;
  await assert.rejects(() => failing.guardedCall(request, async () => {
    attempts += 1;
    throw new Error('upstream failed');
  }));
  assert.equal(attempts, 1);
  assert.equal(failing.state.paidCalls, 1);
  assert.equal(failing.state.records[0].source, 'estimate');
  assert.ok(failing.state.spentUsd > 0);
});

test('actual token usage is recorded and leaves the remaining budget available', async () => {
  const estimate = conservativeCallEstimate(request);
  const ledger = createEvaluationLedger({ budgetUsd: estimate.costUsd * 1.5, maxCalls: 14 });
  await ledger.guardedCall(request, async () => ({
    text: '{}',
    model: 'gpt-4o',
    usage: { input_tokens: 40, output_tokens: 25 },
  }));
  assert.equal(ledger.state.actualInputTokens, 40);
  assert.equal(ledger.state.actualOutputTokens, 25);
  assert.ok(ledger.state.spentUsd < estimate.costUsd);
  let second = 0;
  await ledger.guardedCall(request, async () => {
    second += 1;
    return { text: '{}', usage: { input_tokens: 40, output_tokens: 25 }, model: 'gpt-4o' };
  });
  assert.equal(second, 1);
  assert.equal(ledger.state.paidCalls, 2);
});

test('scoring separates linguistic detection from a missing-evidence rejection', () => {
  const failCase = {
    id: 'p5-invalid-exam8',
    partNumber: 5,
    outcome: 'fail',
    mustDetect: [{ number: 24, letters: ['B', 'C'], words: ['stick', 'keep'] }],
  };
  const detected = scoreCase(failCase, {
    ok: false,
    errors: ['B1 Part 5 Q24 has more than one natural answer: B / C.'],
  });
  assert.equal(detected.status, 'PASS');
  assert.equal(detected.falseNegatives.length, 0);

  const missing = scoreCase(failCase, {
    ok: false,
    errors: ['B1 review evidence is missing for Q24.'],
  });
  assert.equal(missing.status, 'INCONCLUSIVE');
  assert.equal(missing.falseNegatives.length, 0);

  const accepted = scoreCase(failCase, { ok: true, errors: [] });
  assert.equal(accepted.status, 'FAIL');
  assert.equal(accepted.falseNegatives.length, 1);

  const valid = {
    id: 'p5-valid-single-answer',
    partNumber: 5,
    outcome: 'pass',
    mustDetect: [],
  };
  assert.equal(scoreCase(valid, { ok: true, errors: [] }).status, 'PASS');
  const falseRejection = scoreCase(valid, {
    ok: false,
    errors: ['B1 Part 5 Q21 has more than one natural answer: A / B.'],
  });
  assert.equal(falseRejection.status, 'FAIL');
  assert.equal(falseRejection.falsePositives.length, 1);
  const incompleteValid = scoreCase(valid, {
    ok: false,
    errors: ['B1 review evidence is missing for Q21.'],
  });
  assert.equal(incompleteValid.status, 'INCONCLUSIVE');
  assert.equal(incompleteValid.falsePositives.length, 0);
});
