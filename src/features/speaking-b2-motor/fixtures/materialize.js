import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildReferenceWav } from '../domain/audio-diagnostics.js';
import { SPEAKING_B2_AUDIO_MAX_BYTES } from '../services/audio/persist.js';
import { getSpeakingB2Fixture } from './catalog.js';

const audioDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'audio');

function readFixtureFile(name, mimeType) {
  try {
    return { buffer: readFileSync(path.join(audioDir, name)), mimeType, fromDisk: true };
  } catch {
    return null;
  }
}

export function materializeSpeakingB2Fixture(fixtureOrId) {
  const fixture = typeof fixtureOrId === 'string' ? getSpeakingB2Fixture(fixtureOrId) : fixtureOrId;
  if (!fixture) return null;

  if (fixture.audioFile) {
    const disk = readFixtureFile(fixture.audioFile, fixture.mimeType || 'audio/wav');
    if (disk) return { fixture, ...disk, available: true, synthesized: false };
  }

  if (fixture.kind === 'empty') {
    return { fixture, buffer: Buffer.alloc(0), mimeType: 'audio/wav', available: true, synthesized: false };
  }
  if (fixture.kind === 'invalid') {
    return {
      fixture,
      buffer: Buffer.from('this-is-not-audio'),
      mimeType: 'application/octet-stream',
      available: true,
      synthesized: false,
    };
  }
  if (fixture.kind === 'too-long') {
    return {
      fixture,
      buffer: Buffer.alloc(SPEAKING_B2_AUDIO_MAX_BYTES + 1),
      mimeType: 'audio/wav',
      available: true,
      synthesized: false,
    };
  }
  if (fixture.kind === 'unintelligible' || fixture.kind === 'non-linguistic') {
    const seconds = Math.max(0.2, (fixture.durationMs || 800) / 1000);
    return {
      fixture,
      buffer: buildReferenceWav({ seconds, frequency: 90 }),
      mimeType: 'audio/wav',
      available: true,
      synthesized: false,
      speech: false,
    };
  }
  if (fixture.kind === 'speech') {
    return {
      fixture,
      buffer: null,
      mimeType: null,
      available: false,
      reason: 'NO_SPEECH_AUDIO',
      synthesized: false,
    };
  }

  return { fixture, buffer: null, available: false, reason: 'UNKNOWN_KIND', synthesized: false };
}

export async function materializeSpeakingB2SpeechAudio(fixtureOrId, { synthesize, timeoutMs = 12000 } = {}) {
  const fixture = typeof fixtureOrId === 'string' ? getSpeakingB2Fixture(fixtureOrId) : fixtureOrId;
  const base = materializeSpeakingB2Fixture(fixture);
  if (!base || base.available) return base;
  if (base.fixture.kind !== 'speech' || typeof synthesize !== 'function') return base;
  try {
    const spoken = await Promise.race([
      synthesize(base.fixture.referenceTranscript),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FIXTURE_TTS_TIMEOUT')), timeoutMs);
      }),
    ]);
    if (!spoken?.base64) return base;
    return {
      ...base,
      buffer: Buffer.from(spoken.base64, 'base64'),
      mimeType: spoken.mime || 'audio/mpeg',
      available: true,
      synthesized: true,
    };
  } catch {
    return base;
  }
}

export async function resolveSpeakingB2FixtureAudio(fixtureId, { synthesize } = {}) {
  const fixture = getSpeakingB2Fixture(fixtureId);
  if (!fixture) return null;
  if (fixture.kind === 'speech') {
    return materializeSpeakingB2SpeechAudio(fixture, { synthesize });
  }
  return materializeSpeakingB2Fixture(fixture);
}

export function speakingB2AnswerFilename(mimeType) {
  const mime = String(mimeType || '');
  if (mime.includes('wav')) return 'answer.wav';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'answer.mp3';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'answer.m4a';
  return 'answer.webm';
}
