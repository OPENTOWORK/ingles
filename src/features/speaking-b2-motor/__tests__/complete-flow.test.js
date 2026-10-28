import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { completeSpeakingB2Session } from '../services/evaluation/complete-flow.js';
import { createSharedEvaluationClaim } from '../services/session-persistence.js';
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

  it('does not charge a second time after a timeout retry that already has a pending report', async () => {
    const session = finishingSession({
      pendingReport: { scores: { grammarVocabulary: 3 } },
      evaluationInFlight: false,
    });
    const { quota, calls } = recordingQuota();
    const first = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist: async (current) => current,
    });
    assert.equal(first.body.recovered, true);
    const retry = await completeSpeakingB2Session({
      session: { ...session, state: 'COMPLETED', report: first.body.report, evaluationCharged: true },
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist: async (current) => current,
    });
    assert.equal(retry.body.reused, true);
    assert.equal(calls.filter((item) => item === 'charge').length, 1);
  });

  it('keeps the pending report when charge fails after a successful evaluation', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota({ chargeOk: false });
    let last = session;
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 3.5 } }),
      persist: async (current) => {
        last = current;
        return current;
      },
    });
    assert.equal(result.status, 429);
    assert.equal(last.pendingReport.scores.grammarVocabulary, 3.5);
    assert.equal(last.evaluationCharged, false);
    assert.deepEqual(calls, ['check', 'charge']);
  });

  it('returns a controlled error when persistence fails after evaluation', async () => {
    const session = finishingSession();
    const { quota, calls } = recordingQuota();
    await assert.rejects(
      () =>
        completeSpeakingB2Session({
          session,
          userId: 'user-1',
          quota,
          evaluate: async () => ({ scores: { grammarVocabulary: 3 } }),
          persist: async (current) => {
            if (current.pendingReport) {
              const error = new Error('store down');
              error.code = 'STORE_UNAVAILABLE';
              throw error;
            }
            return current;
          },
        }),
      /store down/,
    );
    assert.equal(calls.includes('charge'), false);
  });

  it('lets only one of five concurrent completions charge', async () => {
    const shared = { evaluationInFlight: false, evaluationCharged: false };
    const claim = createSharedEvaluationClaim(shared);
    const { quota, calls } = recordingQuota();
    const evaluate = async () => {
      await new Promise((resolve) => setTimeout(resolve, 15));
      return { scores: { grammarVocabulary: 3 } };
    };
    const persist = async (current) => {
      if (current.evaluationCharged) shared.evaluationCharged = true;
      if (current.report) shared.report = current.report;
      if (!current.evaluationInFlight) shared.evaluationInFlight = false;
      return current;
    };
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        completeSpeakingB2Session({
          session: finishingSession(),
          userId: 'user-1',
          quota,
          evaluate,
          persist,
          claim,
        }),
      ),
    );
    const ok = results.filter((item) => item.status === 200);
    const busy = results.filter((item) => item.status === 409);
    assert.equal(ok.length, 1);
    assert.equal(busy.length, 4);
    assert.equal(calls.filter((item) => item === 'charge').length, 1);
  });

  it('recovers a pending report after a simulated process restart', async () => {
    const disk = {};
    const persist = async (current) => {
      disk[current.id] = { ...current, turns: [...(current.turns || [])] };
      return current;
    };
    const { quota, calls } = recordingQuota({ chargeOk: false });
    await completeSpeakingB2Session({
      session: finishingSession({ id: 'restart-1' }),
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 4 } }),
      persist,
    });
    assert.equal(disk['restart-1'].pendingReport.scores.grammarVocabulary, 4);
    const recovered = { ...disk['restart-1'], evaluationInFlight: false };
    const { quota: quota2, calls: calls2 } = recordingQuota();
    const result = await completeSpeakingB2Session({
      session: recovered,
      userId: 'user-1',
      quota: quota2,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist,
    });
    assert.equal(result.body.recovered, true);
    assert.equal(result.body.report.scores.grammarVocabulary, 4);
    assert.deepEqual(calls2, ['charge']);
    assert.equal(calls.filter((item) => item === 'charge').length, 1);
  });

  it('completes a pending report that is already charged without charging again', async () => {
    const session = finishingSession({
      pendingReport: { scores: { grammarVocabulary: 3 } },
      evaluationCharged: true,
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
    assert.equal(result.body.report.scores.grammarVocabulary, 3);
    assert.deepEqual(calls, []);
  });

  it('does not treat a pending charge row as a completed consume', async () => {
    const session = finishingSession({
      pendingReport: { scores: { grammarVocabulary: 3 } },
    });
    const calls = [];
    const quota = {
      async check() {
        calls.push('check');
        return { ok: true };
      },
      async claimCharge() {
        calls.push('claim');
        return { ok: false, code: 'CHARGE_PENDING', unknownConsume: true };
      },
      async charge() {
        calls.push('charge');
        return { ok: true };
      },
    };
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota,
      evaluate: async () => ({ scores: { grammarVocabulary: 1 } }),
      persist: async (current) => current,
    });
    assert.equal(result.status, 409);
    assert.equal(result.body.code, 'CHARGE_PENDING');
    assert.equal(calls.includes('charge'), false);
    assert.equal(session.evaluationCharged, false);
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
    assert.match(quotaSource, /resolveSpeakingB2QuotaChargeArgs/);
    assert.match(quotaSource, /staff_daily/);
    assert.equal(PLAN_USAGE_KEYS.SPEAKING_CORRECTION, 'speaking_correction');
    assert.equal(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, 'exam_speaking_feedback');
    const routeSource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../app/api/speaking-b2/complete/route.js'),
      'utf8',
    );
    assert.match(routeSource, /resolveSpeakingB2QuotaChargeArgs/);
    assert.match(routeSource, /finalizeSpeakingB2QuotaCharge/);
    assert.equal(routeSource.includes('consumePlanUsage'), false);
    assert.equal(routeSource.includes('consumeDailyAiLimit'), false);
  });

  it('prefers quota.finalize over the split charge path', async () => {
    const session = finishingSession();
    const calls = [];
    const result = await completeSpeakingB2Session({
      session,
      userId: 'user-1',
      quota: {
        async check() {
          calls.push('check');
          return { ok: true };
        },
        async charge() {
          calls.push('charge');
          return { ok: true };
        },
        async finalize() {
          calls.push('finalize');
          return { ok: true };
        },
      },
      evaluate: async () => ({ scores: { grammarVocabulary: 3 } }),
      persist: async (current) => current,
    });
    assert.equal(result.status, 200);
    assert.deepEqual(calls, ['check', 'finalize']);
  });
});
