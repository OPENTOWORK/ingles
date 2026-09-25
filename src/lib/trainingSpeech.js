import { trainingSpeechText } from '@/lib/trainingItemFormats';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/** text → Promise<object URL | null>, one request per text for the whole visit. */
const requests = new Map();
/** text → object URL once it has arrived, so a tap can start playback without waiting. */
const ready = new Map();

let audio = null;
let token = 0;
let active = null;
const listeners = new Set();

function setActive(next) {
  active = next;
  listeners.forEach((listener) => listener(active));
}

/** `listener(key | null)` whenever playback starts or stops. Returns the unsubscribe function. */
export function subscribeTrainingSpeech(listener) {
  listeners.add(listener);
  listener(active);
  return () => listeners.delete(listener);
}

export function trainingSpeechKey(text, slow = false) {
  return `${slow ? 'slow' : 'normal'}|${trainingSpeechText(text)}`;
}

function requestVoice(spoken) {
  if (!requests.has(spoken)) {
    const request = fetch(buildClientApiUrl('/api/coach-tts/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spoken }),
    })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob?.size ? URL.createObjectURL(blob) : null))
      .catch(() => null)
      .then((url) => {
        if (url) ready.set(spoken, url);
        else requests.delete(spoken);
        return url;
      });
    requests.set(spoken, request);
  }
  return requests.get(spoken);
}

/** Starts downloading the voice for `text` so the first tap plays at once. */
export function prefetchTrainingSpeech(text) {
  const spoken = trainingSpeechText(text);
  if (spoken && typeof window !== 'undefined') void requestVoice(spoken);
}

export function stopTrainingSpeech() {
  token += 1;
  if (audio) audio.pause();
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  setActive(null);
}

function speakWithBrowser(spoken, slow, mine, key) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.lang = 'en-GB';
  utterance.rate = slow ? 0.72 : 0.92;
  const voices = window.speechSynthesis.getVoices();
  const british = voices.find((voice) => /^en[-_]GB$/i.test(voice.lang));
  if (british) utterance.voice = british;
  utterance.onend = () => {
    if (mine === token) setActive(null);
  };
  utterance.onerror = utterance.onend;
  setActive(key);
  window.speechSynthesis.speak(utterance);
  return true;
}

function playUrl(url, slow, mine, key) {
  if (!audio) audio = new Audio();
  audio.src = url;
  audio.playbackRate = slow ? 0.8 : 1;
  audio.onended = () => {
    if (mine === token) setActive(null);
  };
  setActive(key);
  return audio.play();
}

/**
 * Reads `text` aloud in a British voice (the coach voice, or the browser’s if that fails).
 * `slow` plays it at about 80% speed.
 */
export async function playTrainingSpeech(text, { slow = false } = {}) {
  const spoken = trainingSpeechText(text);
  if (!spoken || typeof window === 'undefined') return false;
  stopTrainingSpeech();
  const mine = token;
  const key = trainingSpeechKey(text, slow);

  try {
    const cached = ready.get(spoken);
    if (cached) {
      await playUrl(cached, slow, mine, key);
      return true;
    }
    setActive(key);
    const url = await requestVoice(spoken);
    if (mine !== token) return false;
    if (url) {
      await playUrl(url, slow, mine, key);
      return true;
    }
  } catch {
    if (mine !== token) return false;
  }
  return speakWithBrowser(spoken, slow, mine, key);
}
