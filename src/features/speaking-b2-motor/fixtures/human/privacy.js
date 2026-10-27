const AUDIO_KEYS = new Set([
  'buffer',
  'base64',
  'audio',
  'audioBytes',
  'bytes',
  'audioPath',
  'path',
  'signedUrl',
  'filePath',
  'absolutePath',
]);

function looksLikeAudioPayload(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('data:audio')) return true;
  if (value.length > 80 && /^(UklGR|SUQz|AAAA|GkXfo)/.test(value)) return true;
  return false;
}

export function redactSpeakingB2AudioValue(value, { keepSampleId = true } = {}) {
  if (value == null) return value;
  if (Buffer.isBuffer(value)) return '[redacted-audio]';
  if (Array.isArray(value)) return value.map((item) => redactSpeakingB2AudioValue(item, { keepSampleId }));
  if (typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      if (AUDIO_KEYS.has(key) && key !== 'id') {
        next[key] = '[redacted]';
        continue;
      }
      if (!keepSampleId && key === 'audioFile') {
        next[key] = item ? '[local-file]' : '';
        continue;
      }
      next[key] = redactSpeakingB2AudioValue(item, { keepSampleId });
    }
    return next;
  }
  if (looksLikeAudioPayload(value)) return '[redacted-audio]';
  return value;
}

export function speakingB2PublicHumanSample(sample) {
  if (!sample) return null;
  return {
    id: sample.id,
    questionId: sample.questionId,
    question: sample.question,
    durationMs: sample.durationMs,
    language: sample.language,
    estimatedLevel: sample.estimatedLevel,
    levelVerified: sample.levelVerified,
    microphone: sample.microphone,
    notes: sample.notes,
    setVersion: sample.setVersion,
    captureKind: sample.captureKind,
    authenticity: 'human-authorized',
    humanRecording: true,
    authorized: true,
  };
}

export function assertSpeakingB2NoAudioLeak(payload) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  if (/data:audio/i.test(text)) return { ok: false, reason: 'data-audio-uri' };
  if (/"buffer"\s*:\s*\{/.test(text)) return { ok: false, reason: 'buffer-object' };
  if (/UklGR/.test(text)) return { ok: false, reason: 'wav-base64' };
  return { ok: true };
}
