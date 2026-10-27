import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { buildReferenceWav } from '../domain/audio-diagnostics.js';
import { analyzeSpeakingB2AudioSignal } from '../domain/audio-signal.js';
import { assessSttGrounding, turnsForSpeakingB2Evaluation } from '../domain/stt-quality.js';
import { resolveSpeakingB2AnswerAudio } from '../services/evaluation/answer-audio.js';
import { materializeSpeakingB2Fixture } from '../fixtures/materialize.js';

const audioDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/audio');

describe('speaking B2 audio grounding and hallucination guards', () => {
  it('labels empty, tone, corrupt and missing speech files without calling them human', () => {
    const silent = analyzeSpeakingB2AudioSignal(buildReferenceWav({ seconds: 0.4, frequency: 0 }), {
      mimeType: 'audio/wav',
    });
    assert.equal(silent.kind, 'empty');
    assert.equal(silent.hasLikelySpeech, false);

    const tone = analyzeSpeakingB2AudioSignal(buildReferenceWav({ seconds: 1.2, frequency: 90 }), {
      mimeType: 'audio/wav',
      declaredKind: 'non-linguistic',
    });
    assert.equal(tone.kind, 'non-linguistic');
    assert.equal(tone.hasLikelySpeech, false);

    const corrupt = analyzeSpeakingB2AudioSignal(Buffer.from('this-is-not-audio'), {
      mimeType: 'application/octet-stream',
      declaredKind: 'invalid',
    });
    assert.equal(corrupt.kind, 'corrupt');

    const speech = materializeSpeakingB2Fixture('q01-developed');
    assert.equal(speech.available, false);
    assert.equal(speech.fixture.authenticity, 'synthetic-technical');
    assert.notEqual(speech.fixture.authenticity, 'human');
  });

  it('does not send a Whisper hallucination from silence, a tone or a too-short clip into pedagogy', async () => {
    const silent = await resolveSpeakingB2AnswerAudio({
      buffer: buildReferenceWav({ seconds: 0.5, frequency: 0 }),
      mimeType: 'audio/wav',
      declaredKind: 'empty',
      transcribe: async () => ({ text: 'If you have any questions, please let me know.', source: 'STT' }),
    });
    assert.equal(silent.stt.text, '');
    assert.equal(silent.stt.uncertain, true);
    assert.equal(silent.stt.hallucination, false, 'silence must not call STT');

    const tone = await resolveSpeakingB2AnswerAudio({
      buffer: buildReferenceWav({ seconds: 1.1, frequency: 90 }),
      mimeType: 'audio/wav',
      declaredKind: 'non-linguistic',
      transcribe: async () => ({ text: 'Thank you for watching.', source: 'STT', confidence: 0.91 }),
    });
    assert.equal(tone.stt.text, '');
    assert.equal(tone.stt.uncertain, true);

    const tooShort = await resolveSpeakingB2AnswerAudio({
      buffer: Buffer.from('fake-mp3-bytes-not-a-wav'),
      mimeType: 'audio/mpeg',
      speakingMs: 200,
      transcribe: async () => ({
        text: 'If you have any questions please let me know about the course today.',
        source: 'STT',
        confidence: 0.88,
      }),
    });
    assert.equal(tooShort.stt.text, '');
    assert.equal(tooShort.stt.hallucination, true);

    const stripped = turnsForSpeakingB2Evaluation([
      { role: 'candidate', transcript: 'Thank you for watching.', uncertain: true, hallucination: true },
    ]);
    assert.equal(stripped[0].transcript, '');
    assert.equal(stripped[0].excludedFromPedagogy, true);
  });

  it('does not declare a hallucination from a known phrase alone when speech evidence exists', () => {
    const grounded = assessSttGrounding({
      transcript: 'If you have any questions, please let me know.',
      confidence: 0.8,
      source: 'STT',
      signal: {
        parseable: true,
        hasLikelySpeech: true,
        isSilent: false,
        isTone: false,
        durationMs: 3200,
        kind: 'speech-like',
      },
      speakingMs: 3200,
    });
    assert.equal(grounded.accept, true);
    assert.equal(grounded.reason, 'grounded');
  });

  it('keeps reusable technical audio files on disk', () => {
    assert.equal(existsSync(path.join(audioDir, 'empty.wav')), true);
    assert.equal(existsSync(path.join(audioDir, 'non-linguistic-tone.wav')), true);
    assert.equal(existsSync(path.join(audioDir, 'corrupt.bin')), true);
    assert.equal(readFileSync(path.join(audioDir, 'empty.wav')).length, 0);
    assert.ok(readFileSync(path.join(audioDir, 'non-linguistic-tone.wav')).length > 44);
    assert.match(readFileSync(path.join(audioDir, 'README.md'), 'utf8'), /not authentic student recordings/i);
  });
});
