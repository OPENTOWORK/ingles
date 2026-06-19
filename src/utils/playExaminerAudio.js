import { speakText, stopSpeaking, getSpeakingCoachAudio } from '../../dralo-speaking/lib/gemini-coach';

/** Incrementa al parar: ignora callbacks de reproducciones antiguas. */
let playToken = 0;

/** @typedef {'idle' | 'audio' | 'synthesis'} ExaminerVoiceMode */

/** @type {{ active: boolean, mode: ExaminerVoiceMode }} */
let speakingState = { active: false, mode: 'idle' };

/** @type {Set<(s: typeof speakingState) => void>} */
const speakingListeners = new Set();

function notifySpeaking(active, mode = 'idle') {
  speakingState = { active, mode: active ? mode : 'idle' };
  speakingListeners.forEach((fn) => fn(speakingState));
}

/**
 * @param {(state: { active: boolean, mode: ExaminerVoiceMode }) => void} listener
 * @returns {() => void}
 */
export function subscribeExaminerSpeaking(listener) {
  listener(speakingState);
  speakingListeners.add(listener);
  return () => speakingListeners.delete(listener);
}

export function getActiveExaminerAudio() {
  return getSpeakingCoachAudio();
}

export function pauseExaminerAudio() {
  const audio = getSpeakingCoachAudio();
  if (audio && !audio.paused) {
    audio.pause();
    notifySpeaking(false);
    return true;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    notifySpeaking(false);
    return true;
  }
  return false;
}

export function resumeExaminerAudio() {
  const audio = getSpeakingCoachAudio();
  if (audio?.paused) {
    void audio.play().then(() => {
      notifySpeaking(true, 'audio');
    }).catch(() => {});
    return true;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
    window.speechSynthesis.resume();
    notifySpeaking(true, 'synthesis');
    return true;
  }
  return false;
}

export function isExaminerAudioPaused() {
  const audio = getSpeakingCoachAudio();
  if (audio?.paused) return true;
  if (typeof window !== 'undefined' && window.speechSynthesis?.paused) return true;
  return false;
}

export function isExaminerSpeaking() {
  return speakingState.active;
}

export function stopExaminerAudio() {
  playToken += 1;
  notifySpeaking(false);
  stopSpeaking();
}

/**
 * Misma cadena que Dralo Speaking Coach: /api/coach-tts → Google TTS → voz del navegador.
 * @param {{ base64?: string, mime?: string, text?: string, speechLang?: string }} opts
 * @returns {Promise<boolean>}
 */
export function playExaminerAudio({ text = '', speechLang = 'en-GB' } = {}) {
  const t = String(text || '').trim();
  if (!t) return Promise.resolve(false);

  stopExaminerAudio();
  const token = playToken;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(ok);
    };

    const timeoutId = window.setTimeout(() => finish(false), 25000);

    speakText(t, {
      lang: speechLang,
      onStart: () => {
        if (token !== playToken) return;
        notifySpeaking(true, 'audio');
        finish(true);
      },
      onEnd: () => {
        if (token === playToken) notifySpeaking(false);
      },
    });
  });
}
