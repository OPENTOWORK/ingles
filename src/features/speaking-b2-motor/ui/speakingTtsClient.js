import { playExaminerBlob } from '@/utils/playExaminerAudio';
import { speakingB2AuthHeaders } from './speakingB2Client';

const cache = new Map();

/** Audio that arrived with the turn response (`examinerAudio`), so playing it needs no request. */
export function primeSpeakingB2Line(text, examinerId = '', audio = null) {
  const line = String(text || '').trim();
  if (!line || !audio?.base64) return;
  const bytes = Uint8Array.from(atob(audio.base64), (char) => char.charCodeAt(0));
  cache.set(`${examinerId}::${line}`, Promise.resolve(new Blob([bytes], { type: audio.mime || 'audio/mpeg' })));
}

/** `session` ({ sessionId, accessToken }) lets the server voice follow-ups written for this candidate. */
export function prefetchSpeakingB2Line(text, examCode, examinerId = '', session = null) {
  const line = String(text || '').trim();
  if (!line) return Promise.resolve(null);
  const key = `${examinerId}::${line}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = speakingB2AuthHeaders(session?.accessToken || '', { 'Content-Type': 'application/json' })
    .then((headers) =>
      fetch('/api/speaking-b2/tts/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: line,
          examCode,
          examinerId: examinerId || undefined,
          sessionId: session?.sessionId || undefined,
        }),
      }),
    )
    .then(async (res) => {
      if (!res.ok) throw new Error('No se pudo reproducir la pregunta. (TTS_FAILED)');
      return res.blob();
    });
  cache.set(key, pending);
  pending.catch(() => {
    cache.delete(key);
  });
  return pending;
}

export async function playSpeakingB2Line(text, examCode, examinerId = '', session = null) {
  const blob = await prefetchSpeakingB2Line(text, examCode, examinerId, session);
  if (!blob) throw new Error('No se pudo reproducir la pregunta. (TTS_FAILED)');
  return playExaminerBlob(blob);
}
