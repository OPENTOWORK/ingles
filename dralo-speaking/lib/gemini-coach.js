// gemini-coach.js
// Gemini API integration for Cambridge speaking coach
// FREE tier: 1500 requests/day — plenty for an MVP
//
// SETUP:
// 1. Go to https://aistudio.google.com/app/apikey
// 2. Create a free API key
// 3. Add to your .env.local file: NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

import { SYSTEM_PROMPTS } from '../prompts/cambridge-prompts.js';

// Main function: send message to Gemini and get response
export async function sendToGemini({ userMessage, level, mode, conversationHistory = [] }) {
  const response = await fetch('/api/gemini-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userMessage,
      level,
      mode,
      conversationHistory,
    }),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const payload = await response.json();
      errorMessage = payload?.error || payload?.details || errorMessage;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(`Coach API error: ${errorMessage}`);
  }

  const data = await response.json();
  const text = data?.text;

  if (!text) {
    throw new Error('No response from coach API');
  }

  // Parse JSON for correction mode
  if (mode === 'correction') {
    return parseCorrectionResponse(text);
  }

  return { type: 'conversation', text };
}

// Parse structured JSON feedback from correction mode
function parseCorrectionResponse(text) {
  try {
    // Strip markdown code blocks if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return { type: 'correction', data: parsed };
  } catch {
    // Fallback: return as plain text if JSON parsing fails
    return { type: 'correction_text', text };
  }
}

function splitTextIntoChunks(text, maxLength = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLength) {
      current += sentence;
    } else {
      if (current) chunks.push(current.trim());
      current = sentence;
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

let currentAudio = null;
let openAiTtsAbortController = null;
let openAiObjectUrl = null;

const BP =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH
    ? String(process.env.NEXT_PUBLIC_BASE_PATH).replace(/\/$/, '')
    : '';

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return BP ? `${BP}${p}` : p;
}

async function playSpeechPipeline(cleanText, options = {}) {
  const controller = new AbortController();
  openAiTtsAbortController = controller;
  const { signal } = controller;

  try {
    const res = await fetch(apiUrl('/api/coach-tts/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText }),
      signal,
    });

    if (signal.aborted) return;

    if (!res.ok) {
      throw new Error(`coach-tts ${res.status}`);
    }

    const blob = await res.blob();
    if (signal.aborted) return;

    if (openAiObjectUrl) {
      URL.revokeObjectURL(openAiObjectUrl);
      openAiObjectUrl = null;
    }
    openAiObjectUrl = URL.createObjectURL(blob);
    const audio = new Audio(openAiObjectUrl);
    currentAudio = audio;

    audio.onended = () => {
      if (openAiObjectUrl) {
        URL.revokeObjectURL(openAiObjectUrl);
        openAiObjectUrl = null;
      }
      openAiTtsAbortController = null;
      currentAudio = null;
      options.onEnd?.();
    };

    audio.onerror = () => {
      if (openAiObjectUrl) {
        URL.revokeObjectURL(openAiObjectUrl);
        openAiObjectUrl = null;
      }
      currentAudio = null;
      openAiTtsAbortController = null;
      playChunks(splitTextIntoChunks(cleanText, 200), 0, options, true);
    };

    options.onStart?.();
    await audio.play();
  } catch (e) {
    if (signal.aborted) return;
    if (openAiObjectUrl) {
      URL.revokeObjectURL(openAiObjectUrl);
      openAiObjectUrl = null;
    }
    openAiTtsAbortController = null;
    currentAudio = null;
    playChunks(splitTextIntoChunks(cleanText, 200), 0, options, true);
  }
}

// Text-to-speech: OpenAI mp3 via /api/coach-tts → Google Translate URL → Web Speech
export function speakText(text, options = {}) {
  const cleanText = String(text || '')
    .replace(/[`*_#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleanText) {
    return;
  }

  stopSpeaking();
  void playSpeechPipeline(cleanText, options);
}

function playChunks(chunks, index, options = {}, allowWebSpeechFallback = true) {
  if (index >= chunks.length) {
    options.onEnd?.();
    return;
  }

  if (index === 0) options.onStart?.();

  const chunk = encodeURIComponent(chunks[index]);
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${chunk}&tl=en-GB&client=gtx&ttsspeed=0.9`;

  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => playChunks(chunks, index + 1, options, allowWebSpeechFallback);
  audio.onerror = () => {
    if (allowWebSpeechFallback) {
      fallbackSpeak(chunks.slice(index).join(' '), options);
    } else {
      options.onEnd?.();
    }
  };
  audio.play().catch(() => {
    if (allowWebSpeechFallback) {
      fallbackSpeak(chunks.slice(index).join(' '), options);
    } else {
      options.onEnd?.();
    }
  });
}

/** True if browser exposes at least one English voice (en-*). Avoid Helena/es-ES reading English. */
function hasEnglishSpeechVoice() {
  if (!('speechSynthesis' in window)) return false;
  return window.speechSynthesis.getVoices().some((v) => String(v?.lang || '').toLowerCase().startsWith('en'));
}

function fallbackSpeak(text, options = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    options.onEnd?.();
    return;
  }

  // Cursor / some Windows setups only register es-ES voices: never use Web Speech for English then.
  if (!hasEnglishSpeechVoice()) {
    const retryChunks = splitTextIntoChunks(trimmed, 100);
    playChunks(retryChunks, 0, options, false);
    return;
  }

  if (!('speechSynthesis' in window)) {
    const retryChunks = splitTextIntoChunks(trimmed, 100);
    playChunks(retryChunks, 0, options, false);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = options.lang || 'en-GB';
  utterance.rate = options.rate || 0.92;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1;
  utterance.onstart = options.onStart || null;
  utterance.onend = options.onEnd || null;
  speakWithBestBritishVoice(utterance, options.voiceName);
}

let cachedVoices = [];
let preferredVoiceName = null;
let voicesReadyPromise = null;
let lastSpokenVoiceName = null;

function refreshVoicesCacheFromBrowser() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const next = window.speechSynthesis.getVoices();
  if (next.length) cachedVoices = next;
}

/** Prefer live `getVoices()` so new Windows language packs show up without stale cache. */
function resolveVoicesList() {
  refreshVoicesCacheFromBrowser();
  return cachedVoices.length ? cachedVoices : [];
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  const onVoices = () => refreshVoicesCacheFromBrowser();
  window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
  window.speechSynthesis.onvoiceschanged = onVoices;
}

function getStoredPreferredVoiceName() {
  try {
    return window.localStorage.getItem('dralo_preferred_voice_name');
  } catch {
    return null;
  }
}

function setStoredPreferredVoiceName(name) {
  try {
    if (name) {
      window.localStorage.setItem('dralo_preferred_voice_name', name);
    } else {
      window.localStorage.removeItem('dralo_preferred_voice_name');
    }
  } catch {
    /* ignore storage errors */
  }
}

function pickBritishVoice(voices, forceName = null) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const nameHas = (v, terms) => {
    const n = String(v?.name || '').toLowerCase();
    return terms.some((t) => n.includes(t));
  };

  const isUkLang = (v) => String(v?.lang || '').toLowerCase().startsWith('en-gb');
  const ukByLang = voices.filter(isUkLang);

  const exactName = forceName || preferredVoiceName || getStoredPreferredVoiceName();
  if (exactName) {
    const explicit = voices.find((v) => v.name === exactName);
    if (explicit) return explicit;
  }

  // Prioritize natural UK voices commonly available on Windows/macOS/Chrome.
  const byPriority = [
    'microsoft sonia online (natural) - english (united kingdom)',
    'microsoft maisie online (natural) - english (united kingdom)',
    'google uk english female',
    'microsoft aria online (natural)',
    'microsoft jenny online (natural)',
    'microsoft ava online (natural)',
    'google us english',
    'microsoft ryan online (natural) - english (united kingdom)',
    'microsoft libby online (natural) - english (united kingdom)',
    'google uk english male',
    'sonia',
    'maisie',
    'ryan',
    'libby',
    'hazel',
    'daniel',
  ];
  const lowerVoices = voices.map((v) => ({ v, n: String(v.name || '').toLowerCase() }));
  for (const token of byPriority) {
    const found = lowerVoices.find(({ n, v }) => n.includes(token) && isUkLang(v));
    if (found) return found.v;
  }

  // Prefer natural online/system voices commonly available in UK English.
  const preferredUk = ukByLang.find((v) =>
    nameHas(v, ['online', 'natural', 'sonia', 'ryan', 'libby', 'hazel', 'google uk english female', 'google uk english male']),
  );
  if (preferredUk) return preferredUk;

  // Any clearly UK-labelled voice.
  const labelledUk = ukByLang.find((v) =>
    nameHas(v, ['uk', 'british', 'united kingdom', 'england']),
  );
  if (labelledUk) return labelledUk;

  // Any en-GB voice as final UK fallback.
  if (ukByLang.length > 0) return ukByLang[0];

  // Last resort: any English voice.
  return voices.find((v) => String(v?.lang || '').toLowerCase().startsWith('en')) || null;
}

function pickAlternativeEnglishVoice(voices, currentName) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const english = voices.filter((v) => String(v?.lang || '').toLowerCase().startsWith('en'));
  if (english.length <= 1) return english[0] || null;
  const alternative = english.find((v) => v.name !== currentName);
  return alternative || english[0] || null;
}

function loadVoicesOnce() {
  if (!('speechSynthesis' in window)) return Promise.resolve([]);
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const initial = synth.getVoices();
    if (initial.length > 0) {
      cachedVoices = initial;
      resolve(initial);
      return;
    }

    const onVoicesChanged = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        synth.removeEventListener?.('voiceschanged', onVoicesChanged);
        resolve(voices);
      }
    };

    synth.addEventListener?.('voiceschanged', onVoicesChanged);
    synth.onvoiceschanged = onVoicesChanged;

    // Fallback timeout: resolve even if browser never fires voiceschanged.
    setTimeout(() => {
      const voices = synth.getVoices();
      cachedVoices = voices;
      resolve(voices);
    }, 800);
  });

  return voicesReadyPromise;
}

async function speakWithBestBritishVoice(utterance, forceVoiceName = null) {
  await loadVoicesOnce();
  const voices = resolveVoicesList();
  let selectedVoice = pickBritishVoice(voices, forceVoiceName);

  // If browser keeps reusing the same voice, force a different English voice when available.
  if (
    !forceVoiceName &&
    selectedVoice?.name &&
    lastSpokenVoiceName &&
    selectedVoice.name === lastSpokenVoiceName
  ) {
    const alternative = pickAlternativeEnglishVoice(voices, selectedVoice.name);
    if (alternative) {
      selectedVoice = alternative;
    }
  }

  if (!selectedVoice) {
    const done = utterance.onend;
    if (typeof done === 'function') done();
    return;
  }

  utterance.voice = selectedVoice;
  lastSpokenVoiceName = selectedVoice.name;
  window.speechSynthesis.speak(utterance);
}

export async function getBritishVoices() {
  await loadVoicesOnce();
  const voices = resolveVoicesList();
  const isEnglish = (v) => String(v.lang || '').toLowerCase().startsWith('en');
  const isUk = (v) => String(v.lang || '').toLowerCase().startsWith('en-gb');
  const name = (v) => String(v?.name || '').toLowerCase();
  const score = (v) => {
    const n = name(v);
    if (n.includes('microsoft sonia online (natural)')) return 100;
    if (n.includes('microsoft maisie online (natural)')) return 98;
    if (n.includes('google uk english female')) return 95;
    if (n.includes('microsoft ryan online (natural)')) return 93;
    if (n.includes('microsoft libby online (natural)')) return 92;
    if (isUk(v) && n.includes('natural')) return 90;
    if (isUk(v)) return 80;
    if (n.includes('google us english') || n.includes('microsoft') || n.includes('natural')) return 60;
    return 20;
  };

  return voices
    .filter(isEnglish)
    .sort((a, b) => score(b) - score(a))
    .map((v) => ({
      name: v.name,
      lang: v.lang,
      recommended: isUk(v),
    }));
}

export function setPreferredBritishVoice(name) {
  preferredVoiceName = name || null;
  setStoredPreferredVoiceName(preferredVoiceName);
}

// Stop TTS
export function stopSpeaking() {
  if (openAiTtsAbortController) {
    try {
      openAiTtsAbortController.abort();
    } catch {
      /* ignore */
    }
    openAiTtsAbortController = null;
  }
  if (openAiObjectUrl) {
    URL.revokeObjectURL(openAiObjectUrl);
    openAiObjectUrl = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
