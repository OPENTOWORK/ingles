/** @type {HTMLAudioElement | null} */
let activeAudio = null;
/** Incrementa al parar: ignora callbacks de reproducciones antiguas. */
let playGeneration = 0;

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

/** Audio en reproducción (para visualizador con Web Audio API). */
export function getActiveExaminerAudio() {
  return activeAudio;
}

/**
 * Detiene cualquier audio del examinador (MP3 o voz del navegador).
 */
export function stopExaminerAudio() {
  playGeneration += 1;
  notifySpeaking(false);
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * @param {{ base64?: string, mime?: string, text?: string }} opts
 * @returns {Promise<void>}
 */
export function playExaminerAudio({ base64, mime = 'audio/mpeg', text = '' } = {}) {
  stopExaminerAudio();
  const gen = playGeneration;

  const stillActive = () => gen === playGeneration;

  if (base64) {
    return new Promise((resolve) => {
      try {
        const src = `data:${mime};base64,${base64}`;
        const audio = new Audio(src);
        activeAudio = audio;
        const finish = () => {
          if (stillActive()) notifySpeaking(false);
          if (stillActive() && activeAudio === audio) activeAudio = null;
          resolve();
        };
        audio.onplay = () => {
          if (stillActive()) notifySpeaking(true, 'audio');
        };
        audio.onended = finish;
        audio.onerror = () => {
          if (!stillActive()) {
            finish();
            return;
          }
          speakWithBrowser(text, gen).finally(finish);
        };
        void audio.play().catch(() => {
          if (!stillActive()) {
            finish();
            return;
          }
          speakWithBrowser(text, gen).finally(finish);
        });
      } catch {
        if (!stillActive()) return resolve();
        speakWithBrowser(text, gen).finally(resolve);
      }
    });
  }
  return speakWithBrowser(text, gen);
}

function speakWithBrowser(text, gen) {
  const t = String(text || '').trim();
  if (!t || typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve();
  }
  if (gen !== playGeneration) return Promise.resolve();

  notifySpeaking(true, 'synthesis');

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'en-GB';
    u.rate = 0.95;
    const finish = () => {
      if (gen === playGeneration) notifySpeaking(false);
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
  });
}
