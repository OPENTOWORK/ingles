import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { completeSpeakingB2Session } from '../services/evaluation/complete-flow.js';
import { PLAN_USAGE_KEYS } from '@/lib/planUsageKeys';
import { AI_ACTIONS } from '@/lib/aiUsage';

function finishingSession(extra = {}) {
  return {
    id: 'session-1',
    userId: null,
    state: 'FINISHING',
    evaluationCharged: false,
    evaluationInFlight: false,
    report: null,
    pendingReport: null,
    ...extra,
  };
}

function recordingQuota({ checkOk = true, chargeOk = true, checkStatus = 429, chargeStatus = 429 } = {}) {
  const calls = [];
  return {
    calls,
    quota: {
      async check() {
        calls.push('check');
        return checkOk ? { ok: true } : { ok: false, status: checkStatus, body: { code: 'PLAN_LIMIT_REACHED' } };
      },
      async charge() {
        calls.push('charge');
        return chargeOk ? { ok: true } : { ok: false, status: chargeStatus, body: { code: 'PLAN_LIMIT_REACHED' } };
      },
    },
  };
}

describe('speaking B2 complete quota flow', () => {
  it('charges once after a successful evaluation', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota();
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 3 } }),
      persist: async (current) => current,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.report.scores.grammarVocabulary, 3);
    assert.deepEqual(calls, ['check', 'charge']);
    assert.equal(session.evaluationCharged || result.body.state === 'COMPLETED', true);
  });

  it('does not charge when evaluation fails', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota();
    await assert.rejects(() =>
      completeSpeakingB2Session({
        session,
        userId: 'user-1',
        quota,
        evaluate: async () => {
          throw new Error('rubric down');
        },
        persist: async (current) => current,
      }),
    );
    assert.deepEqual(calls, ['check']);
    assert.equal(session.evaluationCharged, false);
    assert.equal(session.evaluationFailed, true);
  });

  it('reuses a completed report without charging again', async () => {
    const session = finishingSession({
      state: 'COMPLETED',
      evaluationCharged: true,
      report: { scores: { grammarVocabulary: 4 } },
    });
    const { quota, calls } = recordingQuota();
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist: async (current) => current,
    });
    assert.equal(result.body.reused, true);
    assert.deepEqual(calls, []);
    assert.equal(result.body.report.scores.grammarVocabulary, 4);
  });

  it('recovers a pending report with a single charge', async () => {
    const session = finishingSession({
      pendingReport: { scores: { grammarVocabulary: 3.5 } },
    });
    const { quota, calls } = recordingQuota();
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist: async (current) => current,
    });
    assert.equal(result.body.recovered, true);
    assert.deepEqual(calls, ['charge']);
    assert.equal(result.body.report.scores.grammarVocabulary, 3.5);
  });

  it('returns a controlled response when the user has no quota', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota({ checkOk: false });
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 5 } }),
      persist: async (current) => current,
    });
    assert.equal(result.status, 429);
    assert.equal(result.body.code, 'PLAN_LIMIT_REACHED');
    assert.deepEqual(calls, ['check']);
    assert.equal(session.evaluationCharged, false);
  });

  it('lets only one of two simultaneous completions charge', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota();
    const persist = async (current) => current;
    const evaluate = async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { scores: { grammarVocabulary: 3 } };
    };
    const [first, second] = await Promise.all([
      completeSpeakingB2Session({ session, userId: 'user-1', quota, evaluate, persist }),
      completeSpeakingB2Session({ session, userId: 'user-1', quota, evaluate, persist }),
    ]);
    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [200, 409]);
    assert.equal(calls.filter((item) => item === 'charge').length, 1);
  });

  it('keeps the live speaking_correction wiring', () => {
    const quotaSource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/evaluation/quota.js'),
      'utf8',
    );
    assert.match(quotaSource, /PLAN_USAGE_KEYS\.SPEAKING_CORRECTION/);
    assert.match(quotaSource, /AI_ACTIONS\.EXAM_SPEAKING_FEEDBACK/);
    assert.match(quotaSource, /checkPlanUsage/);
    assert.match(quotaSource, /runAiPreflight/);
    assert.equal(PLAN_USAGE_KEYS.SPEAKING_CORRECTION, 'speaking_correction');
    assert.equal(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, 'exam_speaking_feedback');
  });
});
