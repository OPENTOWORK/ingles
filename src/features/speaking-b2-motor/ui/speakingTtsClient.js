import { playExaminerBlob } from '@/utils/playExaminerAudio';

const cache = new Map();

export function prefetchSpeakingB2Line(text, examCode, examinerId = '') {
  const line = String(text || '').trim();
  if (!line) return Promise.resolve(null);
  const key = `${examinerId}::${line}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = fetch('/api/speaking-b2/tts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: line, examCode, examinerId: examinerId || undefined }),
  }).then(async (res) => {
    if (!res.ok) throw new Error('No se pudo reproducir la pregunta. (TTS_FAILED)');
    return res.blob();
  });
  cache.set(key, pending);
  pending.catch(() => {
    cache.delete(key);
  });
  return pending;
}

export async function playSpeakingB2Line(text, examCode, examinerId = '') {
  const blob = await prefetchSpeakingB2Line(text, examCode, examinerId);
  if (!blob) throw new Error('No se pudo reproducir la pregunta. (TTS_FAILED)');
  return playExaminerBlob(blob);
}
