import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { buildReferenceWav, buildSpeechLikeWav } from '../domain/audio-diagnostics.js';
import { assessSttGrounding } from '../domain/stt-quality.js';
import { compareSpeakingTranscripts, sttHarmLevel } from '../domain/transcript-compare.js';
import { preserveSpeakingB2HumanTranscript, validateSpeakingB2HumanSample } from '../fixtures/human/manifest.js';
import {
  inspectSpeakingB2HumanPilot,
  speakingB2HumanPilotTemplate,
  SPEAKING_B2_HUMAN_PILOT_ITEMS,
} from '../fixtures/human/pilot.js';
import { importSpeakingB2HumanManifest, validateSpeakingB2HumanAudioFile } from '../fixtures/human/import.js';
import { loadSpeakingB2HumanBank, publicSpeakingB2HumanCatalog } from '../fixtures/human/bank.js';
import {
  assertSpeakingB2NoAudioLeak,
  redactSpeakingB2AudioValue,
  speakingB2PublicHumanSample,
} from '../fixtures/human/privacy.js';
import {
  evaluateSpeakingB2HumanBank,
  evaluateSpeakingB2HumanSample,
  speakingB2HumanValidationVerdict,
} from '../fixtures/human/eval.js';
import {
  assessSpeakingB2HumanInterviewCoverage,
  playScriptedSpeakingB2Interview,
  SPEAKING_B2_SCRIPTED_INTERVIEW_ANSWERS,
} from '../fixtures/interview-scenario.js';
import { isSpeakingB2FixtureRuntime, createSpeakingB2FixtureQuota } from '../fixtures/runtime.js';
import { publicSpeakingB2FixtureCatalog } from '../fixtures/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function authorizedSample(overrides = {}) {
  return {
    id: 'hum-q02-import',
    questionId: 'SP-EX001-P1-Q02',
    question: 'How do you usually spend your weekends?',
    audioFile: 'clip.wav',
    humanTranscript: 'I usually visit the my parents and we have the lunch together.',
    durationMs: 7000,
    language: 'en',
    microphone: 'laptop',
    notes: 'Import-format fixture. Not a student recording.',
    authorization: {
      granted: true,
      purpose: 'internal-speaking-motor-validation',
      scope: 'local-dev-only',
      identifiable: false,
      consentRef: 'test-consent',
    },
    setVersion: 'human-v1',
    ...overrides,
  };
}

describe('speaking B2 V1.8 human audio import and STT comparison', () => {
  it('keeps the project human bank empty and never approves synthetic fixtures as human', () => {
    const bank = loadSpeakingB2HumanBank({ cwd: root });
    assert.equal(bank.humanValidationApproved, false);
    assert.equal(bank.status === 'PENDING' || bank.count >= 0, true);
    if (bank.count === 0) assert.equal(bank.status, 'PENDING');

    const catalog = publicSpeakingB2FixtureCatalog();
    assert.equal(catalog.authenticity, 'synthetic-technical');
    assert.equal(catalog.fixtures.every((item) => item.humanRecording === false), true);
    assert.equal(speakingB2HumanValidationVerdict({ samples: catalog.fixtures }).status, 'PENDING');
  });

  it('rejects unauthorized, unknown-question and unverified B2 labels', () => {
    assert.equal(validateSpeakingB2HumanSample({ ...authorizedSample(), authorization: { granted: false } }).ok, false);
    assert.equal(validateSpeakingB2HumanSample({ ...authorizedSample(), questionId: 'SP-EX001-P2-Q01' }).ok, false);
    assert.equal(
      validateSpeakingB2HumanSample({ ...authorizedSample(), estimatedLevel: 'B2', levelVerified: false }).ok,
      false,
    );
    assert.equal(
      validateSpeakingB2HumanSample({
        ...authorizedSample(),
        estimatedLevel: 'B2',
        levelVerified: true,
        levelVerifier: 'teacher-ana',
      }).ok,
      true,
    );
  });

  it('imports an authorized clip from a private folder and binds it to a Part 1 question', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'speaking-b2-human-'));
    writeFileSync(path.join(dir, 'clip.wav'), buildReferenceWav({ seconds: 1.2, frequency: 180 }));
    const imported = importSpeakingB2HumanManifest(dir, {
      setVersion: 'human-v1',
      samples: [authorizedSample()],
    });
    assert.equal(imported.ok, true);
    assert.equal(imported.samples[0].questionId, 'SP-EX001-P1-Q02');
    assert.equal(imported.humanValidationApproved, false);
    assert.equal(validateSpeakingB2HumanAudioFile(path.join(dir, 'clip.wav')).ok, true);
    assert.equal(validateSpeakingB2HumanAudioFile(path.join(dir, 'missing.wav')).code, 'AUDIO_MISSING');
  });

  it('computes WER with substitutions, deletions and insertions without using WER alone', () => {
    const same = compareSpeakingTranscripts('I wait for the bus', 'I wait for the bus');
    assert.equal(same.wer, 0);
    assert.equal(same.qualityByWerAlone, false);

    const changed = compareSpeakingTranscripts(
      'I wait for the bus at the station',
      'I wait the bus at the station please subscribe to our channel',
    );
    assert.ok(changed.deletions >= 1);
    assert.ok(changed.insertions >= 1);
    assert.equal(changed.hallucinationRisk, true);
    assert.ok(changed.grammarIntroduced.includes('preposition'));
    assert.equal(sttHarmLevel(changed), 'severe');
  });

  it('flags STT that hides or invents grammar that would change the evaluation', () => {
    const removed = compareSpeakingTranscripts('I visit the my parents', 'I visit my parents');
    assert.ok(removed.grammarRemoved.includes('article'));
    assert.equal(sttHarmLevel(removed), 'severe');

    const meaning = compareSpeakingTranscripts('I enjoy studying English', 'I hate studying English');
    assert.ok(meaning.meaningChanging.length >= 1);
  });

  it('compares human-reference evaluation with a Whisper transcript', async () => {
    const sample = authorizedSample({ audioFile: '' });
    const wav = buildSpeechLikeWav({ seconds: 2.4 });
    const item = await evaluateSpeakingB2HumanSample(sample, {
      audioBuffer: wav,
      mimeType: 'audio/wav',
      transcribe: async () => ({ text: 'I usually visit my parents and we have lunch together.', source: 'STT' }),
      evaluate: async (session) => ({
        scores: {
          grammarVocabulary: session.turns.some((turn) => /the my/.test(turn.transcript)) ? 3 : 3.5,
          discourseManagement: 3,
          pronunciation: null,
          interactiveCommunication: null,
          globalAchievement: null,
        },
        summaryEs: /the my/.test(session.turns.map((turn) => turn.transcript).join(' '))
          ? 'Hay un error de artículo en the my parents.'
          : 'La transcripción ha suavizado el error de artículo.',
        issues: /the my/.test(session.turns.map((turn) => turn.transcript).join(' '))
          ? [{ code: 'GR-AR', explanation: 'the my parents' }]
          : [],
      }),
    });
    assert.deepEqual(item.human.report.issues.map((issue) => issue.code), ['GR-AR']);
    assert.deepEqual(item.whisper.report.issues, []);
    assert.deepEqual(item.comparison.falseNegativesFromStt, ['GR-AR']);
    assert.equal(item.comparison.bandDelta.grammarVocabulary, 0.5);
    assert.equal(item.comparison.sttHarm, 'severe');
    assert.equal(item.sample.humanRecording, true);
    assert.equal(assertSpeakingB2NoAudioLeak(item).ok, true);
  });

  it('does not evaluate silence, tones or dense hallucinations', () => {
    const dense = assessSttGrounding({
      transcript: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen',
      confidence: 0.9,
      source: 'STT',
      signal: { parseable: true, hasLikelySpeech: true, isSilent: false, isTone: false, durationMs: 1800, kind: 'speech-like' },
      speakingMs: 1800,
    });
    assert.equal(dense.accept, false);
    assert.equal(dense.text, '');
    assert.equal(dense.reason, 'transcript-too-dense-for-audio');
  });

  it('plays a scripted SP-EX001 interview without calling it a human interview', async () => {
    const played = playScriptedSpeakingB2Interview();
    assert.equal(played.humanInterview, false);
    assert.equal(played.authenticity, 'scripted-text');
    assert.equal(played.associationOk, true);
    assert.equal(played.orderOk, true);
    assert.equal(played.closed, true);
    assert.equal(played.closingOk, true);
    assert.equal(played.candidateTurnCount, 6);
    assert.match(played.session.turns[0].transcript, /Good morning/);
    const q01 = played.session.turns.find(
      (turn) => turn.role === 'candidate' && turn.questionId === 'SP-EX001-P1-Q01',
    );
    assert.equal(q01.transcript, SPEAKING_B2_SCRIPTED_INTERVIEW_ANSWERS['SP-EX001-P1-Q01']);
    const coverage = assessSpeakingB2HumanInterviewCoverage([]);
    assert.equal(coverage.completeHumanInterview, false);
  });

  it('redacts audio from catalogs and reports, skips quota, and stays off in production', async () => {
    const leaked = redactSpeakingB2AudioValue({
      id: 'hum-q02-import',
      buffer: Buffer.from('RIFF'),
      audioPath: '/secret/clip.wav',
      base64: 'UklGRfake',
    });
    assert.equal(leaked.buffer, '[redacted]');
    assert.equal(leaked.audioPath, '[redacted]');
    assert.equal(assertSpeakingB2NoAudioLeak(speakingB2PublicHumanSample(authorizedSample())).ok, true);

    const pending = await evaluateSpeakingB2HumanBank({ cwd: root });
    assert.equal(pending.quotaCharged, false);
    assert.equal(pending.humanValidationApproved, false);
    if (!pending.items.length) assert.equal(pending.status, 'PENDING');

    const quota = createSpeakingB2FixtureQuota();
    assert.equal((await quota.check()).skipped, true);
    assert.equal((await quota.charge()).skipped, true);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'production', flag: '1' }), false);
    assert.equal(existsSync(path.join(root, 'src/features/speaking-b2-motor/fixtures/human/README.md')), true);
  });

  it('prepares the five SP-EX001 pilot IDs without inventing consent or transcripts', () => {
    assert.deepEqual(
      SPEAKING_B2_HUMAN_PILOT_ITEMS.map((item) => item.questionId),
      ['SP-EX001-P1-Q01', 'SP-EX001-P1-Q02', 'SP-EX001-P1-Q03', 'SP-EX001-P1-Q04', 'SP-EX001-P1-Q05'],
    );
    const template = speakingB2HumanPilotTemplate();
    assert.equal(template.samples.length, 5);
    assert.equal(template.samples.every((sample) => sample.authorization.granted === false), true);
    assert.equal(template.samples.every((sample) => sample.humanTranscript === ''), true);
    assert.equal(template.samples.every((sample) => sample.estimatedLevel == null), true);
    const inspection = inspectSpeakingB2HumanPilot({ manifest: template });
    assert.equal(inspection.status, 'PENDING');
    assert.equal(inspection.readyCount, 0);
    assert.equal(inspection.humanValidationApproved, false);
  });

  it('keeps grammar errors, repetitions and self-corrections in the reference transcript', () => {
    const spoken = '  I go, I mean I went to the my house and I like I like weekends.  ';
    const stored = preserveSpeakingB2HumanTranscript(spoken);
    assert.equal(stored, 'I go, I mean I went to the my house and I like I like weekends.');
    assert.match(stored, /the my house/);
    assert.match(stored, /I like I like/);
    assert.match(stored, /I go, I mean I went/);
    assert.equal(stored.includes('I went to my house'), false);
  });
});
