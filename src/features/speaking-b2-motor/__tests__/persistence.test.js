import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SpeakingStoreUnavailableError,
  decideSpeakingB2SessionPersist,
  isSpeakingB2PublishedRuntime,
} from '../services/session-store.js';
import { speakingB2MustPersistStore } from '../services/test-target-guard.js';
import {
  SpeakingStoreConflictError,
  hydrateSpeakingB2Session,
  incomingTurnIsSafeToWrite,
  planSpeakingB2TurnWrites,
  sessionUpdateLost,
} from '../services/session-persistence.js';

const storeSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/session-store.js'),
  'utf8',
);

describe('speaking B2 persistence mode', () => {
  it('treats production or Vercel as a published runtime that cannot use the temp JSON store', () => {
    const previousNode = process.env.NODE_ENV;
    const previousVercel = process.env.VERCEL;
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    assert.equal(isSpeakingB2PublishedRuntime(), true);
    process.env.NODE_ENV = 'development';
    process.env.VERCEL = '1';
    assert.equal(isSpeakingB2PublishedRuntime(), true);
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    assert.equal(isSpeakingB2PublishedRuntime(), false);
    process.env.NODE_ENV = previousNode;
    if (previousVercel == null) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
  });

  it('exposes a controlled store error', () => {
    const error = new SpeakingStoreUnavailableError();
    assert.equal(error.code, 'STORE_UNAVAILABLE');
    assert.equal(new SpeakingStoreConflictError().code, 'STORE_CONFLICT');
  });

  it('loads published sessions from Supabase and never from temp JSON', () => {
    assert.match(storeSource, /export async function loadSpeakingB2Session/);
    assert.match(storeSource, /loadSessionFromSupabase/);
    assert.match(storeSource, /speakingB2MustPersistStore\(\) \? null : loadDisk\(\)/);
    assert.match(storeSource, /if \(published\) throw new SpeakingStoreUnavailableError/);
    assert.match(storeSource, /decideSpeakingB2SessionPersist/);
    assert.equal(storeSource.includes('await admin.from(\'speaking_b2_turns\').delete()'), false);
    assert.match(storeSource, /SCHEMA_V2_REQUIRED/);
    assert.match(storeSource, /finalizeSpeakingB2QuotaCharge/);
    assert.match(storeSource, /p_daily_action/);
    assert.match(storeSource, /p_daily_limit/);
    assert.match(storeSource, /PLAN_FEATURE_LOCKED/);
    assert.match(storeSource, /DAILY_LIMIT_REACHED/);
  });

  it('does not use an in-memory lock when the published schema is missing', () => {
    const claimFn = storeSource.slice(storeSource.indexOf('export async function claimSpeakingB2Evaluation'));
    assert.match(claimFn, /if \(published\) throw new SpeakingStoreUnavailableError/);
    assert.equal(
      /isMissingRelationError\(error\)\) \{\s*return claimEvaluationInMemory/.test(claimFn),
      false,
    );
  });

  it('hydrates a session from the database row after a restart', () => {
    const session = hydrateSpeakingB2Session(
      {
        id: 'sess-1',
        user_id: 'user-1',
        exam_code: 'SP-EX001',
        state: 'FINISHING',
        started_at: '2026-10-27T10:00:00.000Z',
        expires_at: '2026-10-28T10:00:00.000Z',
        access_token_hash: 'abc',
        candidate_speaking_ms: 12000,
        row_version: 4,
        evaluation_charged: false,
        evaluation_in_flight: false,
        pending_report: { scores: { grammarVocabulary: 3.5 } },
        metadata: { questionIndex: 4, currentQuestionId: 'SP-EX001-P1-Q05', fixtureMode: false },
      },
      [
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
          audio_path: 'user-1/sess-1/a.webm',
        },
      ],
    );
    assert.equal(session.persisted, true);
    assert.equal(session.state, 'FINISHING');
    assert.equal(session.rowVersion, 4);
    assert.equal(session.pendingReport.scores.grammarVocabulary, 3.5);
    assert.equal(session.turns.length, 2);
    assert.equal(session.turns[1].audioPath, 'user-1/sess-1/a.webm');
    assert.equal(session.currentQuestionId, 'SP-EX001-P1-Q05');
  });

  it('plans turn upserts and refuses to overwrite a valid answer with an empty retry', () => {
    const existing = [
      {
        id: 't1',
        turn_index: 1,
        transcript: 'I usually walk in the park with my brother.',
        audio_path: 'user/sess/a.webm',
      },
    ];
    const incoming = [
      { role: 'examiner', questionId: 'SP-EX001-P1-Q01', transcript: 'Hello', source: 'SCRIPT' },
      { role: 'candidate', questionId: 'SP-EX001-P1-Q01', transcript: '', source: 'STT' },
    ];
    const plan = planSpeakingB2TurnWrites(existing, incoming, 'sess-1');
    assert.equal(plan.upserts.length, 1);
    assert.equal(plan.upserts[0].turn_index, 0);
    assert.equal(plan.skipped[0].reason, 'protect-valid-answer');
    assert.equal(
      incomingTurnIsSafeToWrite({ transcript: '', audio_path: null }, existing[0]),
      false,
    );
  });

  it('detects a lost update when the stored version moved', () => {
    assert.equal(sessionUpdateLost(3, 4), true);
    assert.equal(sessionUpdateLost(3, 3), false);
  });

  it('requires real persist on published runtimes and ENGLISH_PROD, not isolated development', () => {
    assert.equal(
      speakingB2MustPersistStore({ NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' }),
      true,
    );
    assert.equal(
      speakingB2MustPersistStore({ NODE_ENV: 'development', VERCEL: '1', NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' }),
      true,
    );
    assert.equal(
      speakingB2MustPersistStore({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://qnazrzvwvkwhkfbqsbmr.supabase.co',
      }),
      true,
    );
    assert.equal(
      speakingB2MustPersistStore({
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'https://abcdtestxxxx.supabase.co',
      }),
      false,
    );
  });

  it('never reports a persisted session unless it was saved, and never falls back to memory when persist is required', () => {
    assert.deepEqual(decideSpeakingB2SessionPersist({ persistRequired: true, saved: true }), {
      persisted: true,
      allowMemoryFallback: false,
    });
    assert.deepEqual(decideSpeakingB2SessionPersist({ persistRequired: false, saved: false }), {
      persisted: false,
      allowMemoryFallback: true,
    });
    assert.throws(
      () => decideSpeakingB2SessionPersist({ persistRequired: true, saved: false, errorMessage: 'insert failed' }),
      (error) => error instanceof SpeakingStoreUnavailableError && error.code === 'STORE_UNAVAILABLE',
    );
    const isolatedSaved = decideSpeakingB2SessionPersist({ persistRequired: false, saved: true });
    assert.equal(isolatedSaved.persisted, true);
    assert.equal(isolatedSaved.allowMemoryFallback, false);
  });
});
