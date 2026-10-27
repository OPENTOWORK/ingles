import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { buildReferenceWav } from '../domain/audio-diagnostics.js';
import { estimateSttConfidence, isUncertainTranscript } from '../domain/stt-quality.js';
import {
  SPEAKING_B2_AUDIO_MAX_BYTES,
  validateSpeakingB2CandidateAudio,
} from '../services/audio/persist.js';
import { resolveSpeakingB2AnswerAudio } from '../services/evaluation/answer-audio.js';
import { completeSpeakingB2Session } from '../services/evaluation/complete-flow.js';
import {
  authorizeSpeakingSession,
  createSpeakingAccessToken,
  hashSpeakingAccessToken,
  speakingSessionExpiresAt,
} from '../services/session-auth.js';
import {
  compareSpeakingB2FixtureItem,
  compareSpeakingB2FixtureRun,
} from '../fixtures/compare.js';
import { getSpeakingB2Fixture, listSpeakingB2FixturePack } from '../fixtures/catalog.js';
import { materializeSpeakingB2Fixture, resolveSpeakingB2FixtureAudio } from '../fixtures/materialize.js';
import {
  canUseSpeakingB2FixtureAnswer,
  createSpeakingB2FixtureQuota,
  isSpeakingB2FixtureRuntime,
} from '../fixtures/runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('speaking B2 fixture mode without a physical microphone', () => {
  it('never enables fixture mode in published runtimes', () => {
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'production', flag: '1' }), false);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'development', vercel: '1', flag: '1' }), false);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'development', flag: '0' }), false);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'development' }), true);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'test', flag: '1' }), true);
    assert.equal(canUseSpeakingB2FixtureAnswer({ fixtureMode: true }, false), false);
    assert.equal(canUseSpeakingB2FixtureAnswer({ fixtureMode: false }, true), false);
    assert.equal(canUseSpeakingB2FixtureAnswer({ fixtureMode: true }, true), true);
  });

  it('validates empty, unsupported and oversized audio', () => {
    assert.equal(validateSpeakingB2CandidateAudio({ buffer: null }).ok, true);
    assert.equal(validateSpeakingB2CandidateAudio({ buffer: Buffer.alloc(0) }).code, 'AUDIO_EMPTY');
    assert.equal(
      validateSpeakingB2CandidateAudio({
        buffer: Buffer.from('nope'),
        mimeType: 'application/octet-stream',
      }).code,
      'AUDIO_FORMAT',
    );
    assert.equal(
      validateSpeakingB2CandidateAudio({
        buffer: { length: SPEAKING_B2_AUDIO_MAX_BYTES + 1 },
        mimeType: 'audio/wav',
      }).code,
      'AUDIO_TOO_LONG',
    );
    assert.equal(
      validateSpeakingB2CandidateAudio({
        buffer: buildReferenceWav({ seconds: 0.2, frequency: 220 }),
        mimeType: 'audio/wav',
      }).ok,
      true,
    );
  });

  it('materializes catalog fixtures and labels them as synthetic', async () => {
    const developed = materializeSpeakingB2Fixture('q01-developed');
    assert.equal(developed.fixture.authenticity, 'synthetic-technical');
    assert.equal(developed.available, false);
    assert.equal(developed.reason, 'NO_SPEECH_AUDIO');
    assert.equal(materializeSpeakingB2Fixture('empty-audio').buffer.length, 0);
    assert.equal(materializeSpeakingB2Fixture('invalid-format').mimeType, 'application/octet-stream');
    assert.ok(materializeSpeakingB2Fixture('too-long').buffer.length > SPEAKING_B2_AUDIO_MAX_BYTES);
    assert.equal(listSpeakingB2FixturePack('full-mixed').length, 6);
    const spoken = await resolveSpeakingB2FixtureAudio('q01-developed', {
      synthesize: async () => ({ base64: Buffer.from('mp3').toString('base64'), mime: 'audio/mpeg' }),
    });
    assert.equal(spoken.synthesized, true);
    assert.equal(spoken.mimeType, 'audio/mpeg');
  });

  it('handles transcription failure and uncertain text without inventing scores', async () => {
    const failed = await resolveSpeakingB2AnswerAudio({
      buffer: Buffer.from('fake-mp3-bytes-not-a-wav-header'),
      mimeType: 'audio/mpeg',
      speakingMs: 4000,
      transcribe: async () => {
        throw new Error('whisper down');
      },
    });
    assert.equal(failed.ok, false);
    assert.equal(failed.code, 'STT_FAILED');

    const uncertain = isUncertainTranscript('[inaudible] ...', 0.2);
    assert.equal(uncertain, true);
    assert.ok(estimateSttConfidence('[unclear]', 'STT') < 0.55);
  });

  it('skips quota charges on fixture evaluation and still rejects expired or foreign sessions', async () => {
    const quota = createSpeakingB2FixtureQuota();
    const session = {
      id: 'fix-1',
      userId: null,
      state: 'FINISHING',
      fixtureMode: true,
      evaluationCharged: false,
      evaluationInFlight: false,
      report: null,
      pendingReport: null,
    };
    const result = await completeSpeakingB2Session({
      session,
      userId: 'fixture-local',
      quota,
      evaluate: async () => ({
        scores: {
          grammarVocabulary: 3,
          discourseManagement: 3,
          pronunciation: null,
          interactiveCommunication: null,
          globalAchievement: null,
        },
      }),
      persist: async (current) => current,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.report.scores.pronunciation, null);

    const token = createSpeakingAccessToken();
    const expired = {
      createdAt: '2020-01-01T00:00:00.000Z',
      expiresAt: '2020-01-01T00:00:01.000Z',
      fixtureMode: true,
      accessTokenHash: hashSpeakingAccessToken(token),
      userId: null,
    };
    assert.equal(authorizeSpeakingSession(expired, { accessToken: token }).code, 'EXPIRED');

    const owned = {
      createdAt: new Date().toISOString(),
      expiresAt: speakingSessionExpiresAt(),
      fixtureMode: true,
      accessTokenHash: hashSpeakingAccessToken(token),
      userId: 'owner-1',
    };
    assert.equal(authorizeSpeakingSession(owned, { userId: 'other', accessToken: token }).code, 'FORBIDDEN');

    const reused = await completeSpeakingB2Session({
      session: {
        ...session,
        state: 'COMPLETED',
        evaluationCharged: true,
        report: result.body.report,
      },
      userId: 'fixture-local',
      quota: {
        async check() {
          throw new Error('quota should not run on retry');
        },
        async charge() {
          throw new Error('quota should not run on retry');
        },
      },
      evaluate: async () => {
        throw new Error('evaluate should not run on retry');
      },
      persist: async (current) => current,
    });
    assert.equal(reused.body.reused, true);
  });

  it('compares reference transcripts with detected issues', () => {
    const fixture = getSpeakingB2Fixture('q02-articles');
    const item = compareSpeakingB2FixtureItem({
      fixture,
      whisperTranscript: fixture.referenceTranscript,
      sttSource: 'STT',
      detectedIssueCodes: ['GR-AR', 'VC-WW'],
    });
    assert.equal(item.sttExecuted, true);
    assert.deepEqual(item.missed, []);
    assert.deepEqual(item.falsePositives, ['VC-WW']);
    const run = compareSpeakingB2FixtureRun({
      packId: 'full-mixed',
      items: [item],
      report: {
        scores: { pronunciation: null, interactiveCommunication: null, globalAchievement: null },
        summaryEs: 'Has completado la Part 1.',
        disclaimer: 'Puntuación orientativa de Dralo. No es una nota oficial de Cambridge.',
      },
    });
    assert.equal(run.scores.pronunciation, null);
    assert.equal(run.falsePositives[0].code, 'VC-WW');
  });

  it('keeps the public Speaking page free of fixture controls', () => {
    const practice = readFileSync(path.join(root, 'src/components/b2/B2SpeakingExamPractice.js'), 'utf8');
    assert.equal(practice.includes('SpeakingMotorFixtureHarness'), false);
    assert.equal(practice.includes('fixtureMode'), false);
    assert.equal(practice.includes('/api/speaking-b2/fixtures'), false);

    const page = readFileSync(path.join(root, 'src/app/niveles/b2/exam-speaking/page.js'), 'utf8');
    assert.equal(page.includes('FixtureHarness'), false);
    assert.match(page, /B2SpeakingExamPractice/);
  });
});
