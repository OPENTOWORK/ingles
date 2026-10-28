import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { completeSpeakingB2Session } from '../services/evaluation/complete-flow.js';
import {
  createSharedEvaluationClaim,
  hydrateSpeakingB2Session,
  planSpeakingB2TurnWrites,
} from '../services/session-persistence.js';

function finishingSession(extra = {}) {
  return {
    id: extra.id || 'session-multi',
    userId: null,
    state: 'FINISHING',
    evaluationCharged: false,
    evaluationInFlight: false,
    report: null,
    pendingReport: null,
    persisted: true,
    rowVersion: extra.rowVersion || 1,
    ...extra,
  };
}

function recordingQuota() {
  const calls = [];
  return {
    calls,
    quota: {
      async check() {
        calls.push('check');
        return { ok: true };
      },
      async charge() {
        calls.push('charge');
        return { ok: true };
      },
    },
  };
}

describe('speaking B2 multi-instance behaviour (mocked shared store)', () => {
  it('does not treat an in-memory Map as a cross-server guarantee', () => {
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/session-store.js'),
      'utf8',
    );
    assert.match(source, /claimSpeakingB2Evaluation/);
    assert.match(source, /evaluation_charged/);
    assert.match(source, /row_version/);
    assert.match(source, /speaking_b2_quota_charges/);
  });

  it('lets only one of two independent session copies complete', async () => {
    const shared = { evaluationInFlight: false, evaluationCharged: false };
    const claim = createSharedEvaluationClaim(shared);
    const { quota, calls } = recordingQuota();
    const persist = async (current) => {
      if (current.evaluationCharged) shared.evaluationCharged = true;
      if (current.report) shared.report = current.report;
      if (!current.evaluationInFlight) shared.evaluationInFlight = false;
      return current;
    };
    const evaluate = async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { scores: { grammarVocabulary: 3 } };
    };
    const [left, right] = await Promise.all([
      completeSpeakingB2Session({
        session: finishingSession({ id: 'a' }),
        userId: 'user-1',
        quota,
        evaluate,
        persist,
        claim,
      }),
      completeSpeakingB2Session({
        session: finishingSession({ id: 'a' }),
        userId: 'user-1',
        quota,
        evaluate,
        persist,
        claim,
      }),
    ]);
    const statuses = [left.status, right.status].sort();
    assert.deepEqual(statuses, [200, 409]);
    assert.equal(calls.filter((item) => item === 'charge').length, 1);
  });

  it('rehydrates turns after a simulated restart instead of trusting process memory', () => {
    const dbTurns = [
      {
        turn_index: 0,
        role: 'examiner',
        question_id: 'SP-EX001-P1-Q01',
        transcript: 'How do you usually spend your weekends?',
        transcript_source: 'SCRIPT',
      },
      {
        turn_index: 1,
        role: 'candidate',
        question_id: 'SP-EX001-P1-Q01',
        transcript: 'I walk with my family.',
        transcript_source: 'STT',
        audio_path: 'u/s/a.webm',
      },
    ];
    const afterRestart = hydrateSpeakingB2Session(
      {
        id: 'sess-restart',
        user_id: 'user-1',
        exam_code: 'SP-EX001',
        state: 'LISTENING',
        started_at: '2026-10-27T10:00:00.000Z',
        expires_at: '2026-10-28T10:00:00.000Z',
        row_version: 2,
        metadata: { currentQuestionId: 'SP-EX001-P1-Q02', questionIndex: 1 },
      },
      dbTurns,
    );
    assert.equal(afterRestart.turns.length, 2);
    assert.equal(afterRestart.turns[1].transcript, 'I walk with my family.');
  });

  it('keeps the first valid write when a duplicate turn arrives from another process', () => {
    const existing = [
      {
        id: 'kept',
        turn_index: 1,
        transcript: 'I usually walk in the park because I like the quiet streets.',
        audio_path: 'u/s/a.webm',
      },
    ];
    const stale = [
      { role: 'examiner', questionId: 'SP-EX001-P1-Q01', transcript: 'Hello', source: 'SCRIPT' },
      { role: 'candidate', questionId: 'SP-EX001-P1-Q01', transcript: 'ok', source: 'STT' },
    ];
    const plan = planSpeakingB2TurnWrites(existing, stale, 'sess-1');
    assert.equal(
      plan.upserts.some((row) => row.turn_index === 1 && row.transcript === 'ok'),
      false,
    );
    assert.equal(plan.skipped[0].reason, 'protect-valid-answer');
  });
});
