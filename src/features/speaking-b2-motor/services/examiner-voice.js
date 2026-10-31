import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { SPEAKING_B2_EXAMINER_VOICE_INSTRUCTIONS } from '../domain/examiner-script.js';

const TTS_MODEL = process.env.SPEAKING_B2_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TIMEOUT_MS = Number(process.env.SPEAKING_B2_TTS_TIMEOUT_MS || 8000);
const EDGE_TIMEOUT_MS = Number(process.env.SPEAKING_B2_EDGE_TIMEOUT_MS || 4000);
const AUDIO_CACHE_LIMIT = 120;
const MAX_TEXT_CHARS = 500;

/** Per server instance. Concurrent requests for the same line share one synthesis. */
const audioCache = new Map();

export function withSpeakingB2Timeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('TTS timeout')), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

function examinerAttempts(text, examiner) {
  return [
    {
      engine: 'openai',
      voice: examiner.openaiVoice,
      timeoutMs: OPENAI_TIMEOUT_MS,
      run: () =>
        synthesizeExamTtsMp3(text, {
          openaiOnly: true,
          openaiVoice: examiner.openaiVoice,
          openaiModel: TTS_MODEL,
          openaiInstructions: SPEAKING_B2_EXAMINER_VOICE_INSTRUCTIONS,
        }),
    },
    {
      engine: 'edge',
      voice: examiner.edgeVoice,
      timeoutMs: EDGE_TIMEOUT_MS,
      run: () => synthesizeExamTtsMp3(text, { edgeVoice: examiner.edgeVoice, preferEdge: true, edgeOnly: true }),
    },
    {
      engine: 'openai',
      voice: examiner.legacyOpenaiVoice,
      timeoutMs: OPENAI_TIMEOUT_MS,
      run: () =>
        synthesizeExamTtsMp3(text, {
          openaiOnly: true,
          openaiVoice: examiner.legacyOpenaiVoice,
          openaiModel: 'tts-1',
        }),
    },
  ];
}

async function synthesizeExaminerLine(text, examiner) {
  const started = Date.now();
  const failures = [];
  for (const [index, attempt] of examinerAttempts(text, examiner).entries()) {
    try {
      const result = await withSpeakingB2Timeout(attempt.run(), attempt.timeoutMs);
      if (!result?.base64) throw new Error('empty');
      if (index > 0) {
        console.warn('[speaking-b2/tts] fallback', {
          examiner: examiner.id,
          to: `${attempt.engine}:${attempt.voice}`,
          failures,
          elapsedMs: Date.now() - started,
        });
      }
      return {
        audio: Buffer.from(result.base64, 'base64'),
        mime: result.mime || 'audio/mpeg',
        engine: attempt.engine,
        voice: attempt.voice,
        model: result.model || null,
        fallback: index > 0,
      };
    } catch (error) {
      failures.push(`${attempt.engine}:${attempt.voice}:${error?.message || 'failed'}`);
    }
  }
  console.error('[speaking-b2/tts] all engines failed', { examiner: examiner.id, failures });
  return null;
}

/** The examiner's own voice for `text`. Resolves to null when every engine fails. */
export function voiceSpeakingB2ExaminerLine(text, examiner) {
  const line = String(text || '').slice(0, MAX_TEXT_CHARS);
  const key = `${examiner.id}|${TTS_MODEL}|${line}`;
  const hit = audioCache.get(key);
  if (hit) {
    audioCache.delete(key);
    audioCache.set(key, hit);
    return hit;
  }
  // Fallback audio is not kept, so the examiner's own voice is retried next time.
  const pending = synthesizeExaminerLine(line, examiner).then((result) => {
    if (!result || result.fallback) audioCache.delete(key);
    return result;
  });
  audioCache.set(key, pending);
  if (audioCache.size > AUDIO_CACHE_LIMIT) {
    audioCache.delete(audioCache.keys().next().value);
  }
  return pending;
}
