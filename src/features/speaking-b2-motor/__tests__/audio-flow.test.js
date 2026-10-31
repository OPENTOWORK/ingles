import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildReferenceWav,
  classifyMicError,
  computePcmRms,
  shouldEndTurnOnSilence,
} from '../domain/audio-diagnostics.js';
import {
  beginIntroduction,
  createSpeakingB2SessionState,
  resolveSpeakingB2Turn,
  startAudioCheck,
} from '../services/coordinator.js';
import { SPEAKING_B2_EXAM_CODE } from '../domain/question-bank/sp-ex001-part1.js';

const DEVELOPED =
  'I usually spend time with my family and then I study English because I want to travel more next year.';

function answer(session, transcript) {
  return resolveSpeakingB2Turn({
    session: { ...session, state: 'LISTENING' },
    transcript,
    speakingMs: 4000,
  });
}

describe('speaking B2 audio diagnostics and reference flow', () => {
  it('classifies microphone failures without exposing device details', () => {
    assert.equal(classifyMicError({ name: 'NotAllowedError' }), 'MIC_PERMISSION');
    assert.equal(classifyMicError({ name: 'NotFoundError' }), 'MIC_NOT_FOUND');
    assert.equal(classifyMicError({ name: 'NotReadableError' }), 'MIC_IN_USE');
  });

  it('does not end the turn while the candidate is still thinking or pausing naturally', () => {
    const silence = 0.001;
    let state = { speechAt: 0, silentAt: 0, ended: false };
    state = shouldEndTurnOnSilence({ rms: silence, now: 4000, ...state });
    assert.equal(state.ended, false, 'silence before the first word must not close the turn');

    state = shouldEndTurnOnSilence({ rms: 0.2, now: 4100, ...state });
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 4800,
      speechAt: state.speechAt,
      silentAt: state.silentAt,
    });
    assert.equal(state.ended, false, 'a pause before 1.2s of speech must not close the turn');

    state = shouldEndTurnOnSilence({ rms: 0.2, now: 6000, speechAt: 4100, silentAt: 0 });
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 7200,
      speechAt: state.speechAt,
      silentAt: 0,
    });
    assert.equal(state.ended, false, 'a 1.2s thinking pause after speech must not close the turn');
  });

  it('ends a turn only after speech and a natural silence', () => {
    const silence = computePcmRms(Uint8Array.from({ length: 32 }, () => 128));
    const speech = computePcmRms(Uint8Array.from({ length: 32 }, (_, i) => (i % 2 ? 20 : 230)));
    assert.ok(silence < 0.01);
    assert.ok(speech > 0.2);

    let state = { speechAt: 0, silentAt: 0, ended: false };
    state = shouldEndTurnOnSilence({ rms: speech, now: 100, ...state });
    state = shouldEndTurnOnSilence({ rms: silence, now: 200, speechAt: state.speechAt, silentAt: state.silentAt });
    assert.equal(state.ended, false);
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 100 + 1300,
      speechAt: state.speechAt,
      silentAt: 0,
    });
    assert.equal(state.ended, false);
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 100 + 1300 + 1900,
      speechAt: state.speechAt,
      silentAt: 100 + 1300,
    });
    assert.equal(state.ended, true);
  });

  it('does not close a spoken answer on a thinking pause', () => {
    const silence = 0.001;
    let state = shouldEndTurnOnSilence({
      rms: 0.2,
      now: 1000,
      speechAt: 0,
      silentAt: 0,
      silenceMs: 6000,
      minSpeechMs: 1200,
    });
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 5000,
      speechAt: state.speechAt,
      silentAt: 0,
      silenceMs: 6000,
      minSpeechMs: 1200,
    });
    assert.equal(state.ended, false, 'four seconds of silence is still the same answer');
    state = shouldEndTurnOnSilence({
      rms: 0.2,
      now: 5500,
      speechAt: state.speechAt,
      silentAt: state.silentAt,
      silenceMs: 6000,
      minSpeechMs: 1200,
    });
    assert.equal(state.silentAt, 0);
    state = shouldEndTurnOnSilence({
      rms: silence,
      now: 7000,
      speechAt: state.speechAt,
      silentAt: 0,
      silenceMs: 6000,
      minSpeechMs: 1200,
    });
    const closed = shouldEndTurnOnSilence({
      rms: silence,
      now: 13000,
      speechAt: state.speechAt,
      silentAt: state.silentAt,
      silenceMs: 6000,
      minSpeechMs: 1200,
    });
    assert.equal(closed.ended, true);
  });

  it('walks the interview with reference answers until FINISHING', () => {
    let session = startAudioCheck(createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE }));
    const opened = beginIntroduction(session);
    let current = answer(opened.session, 'My name is Alex');
    let guard = 0;
    while (!current.done && guard < 12) {
      current = answer(current.session, DEVELOPED);
      guard += 1;
    }
    assert.equal(current.done, true);
    assert.equal(current.session.state, 'FINISHING');
    assert.match(current.examinerText, /end of Part 1/);
  });

  it('builds a reference WAV without treating it as acoustic pronunciation evidence', () => {
    const wav = buildReferenceWav({ seconds: 0.2, frequency: 220 });
    assert.ok(wav.length > 44);
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  });
});
