const STORAGE_PREFIX = 'dralo-vocabulary:';

export function vocabularyStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export function loadVocabulary(userId) {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = window.localStorage.getItem(vocabularyStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.word) : [];
  } catch {
    return [];
  }
}

export function saveVocabulary(userId, entries) {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(vocabularyStorageKey(userId), JSON.stringify(entries));
}

export function createVocabularyEntry({ word, meaning, translation, pronunciation } = {}) {
  const cleanWord = String(word || '').trim();
  if (!cleanWord) return null;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `vocab-${Date.now()}`;
  return {
    id,
    word: cleanWord,
    meaning: String(meaning || '').trim(),
    translation: String(translation || '').trim(),
    pronunciation: String(pronunciation || '').trim(),
    createdAt: new Date().toISOString(),
  };
}

/** Speaks the English word. The pronunciation field is the written sound, not the audio. */
export function speakVocabularyWord(word, audioUrl) {
  const audio = String(audioUrl || '').trim();
  if (audio && typeof Audio !== 'undefined') {
    const player = new Audio(audio);
    player.play().catch(() => {
      speakWithVoice(word);
    });
    return true;
  }
  return speakWithVoice(word);
}

function speakWithVoice(word) {
  const text = String(word || '').trim();
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-GB';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
  return true;
}

/** English meaning and pronunciation for a single word, when the public dictionary has it. */
export async function lookupVocabularySound(word) {
  const text = String(word || '').trim();
  if (!text || /\s/.test(text)) return null;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) return null;
    const phonetic =
      entry.phonetic ||
      (entry.phonetics || []).find((item) => item?.text)?.text ||
      '';
    const audioUrl = (entry.phonetics || []).find((item) => item?.audio)?.audio || '';
    const meaning = entry.meanings?.[0]?.definitions?.[0]?.definition || '';
    return {
      pronunciation: String(phonetic || '').trim(),
      audioUrl: String(audioUrl || '').trim(),
      meaning: String(meaning || '').trim(),
    };
  } catch {
    return null;
  }
}
