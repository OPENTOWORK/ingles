import { NextResponse } from 'next/server';
import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { examinerLineIsAuthorised } from '@/features/speaking-b2-motor/services/coordinator';
import {
  SPEAKING_B2_EXAM_CODE,
  getSpeakingB2Examiner,
} from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';
import { SPEAKING_B2_EXAMINER_VOICE_INSTRUCTIONS } from '@/features/speaking-b2-motor/domain/examiner-script';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';

export const runtime = 'nodejs';

const TTS_MODEL = process.env.SPEAKING_B2_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TIMEOUT_MS = Number(process.env.SPEAKING_B2_TTS_TIMEOUT_MS || 8000);
const EDGE_TIMEOUT_MS = Number(process.env.SPEAKING_B2_EDGE_TIMEOUT_MS || 4000);
const AUDIO_CACHE_LIMIT = 120;

/** Per server instance. Concurrent requests for the same line share one synthesis. */
const audioCache = new Map();

function withTimeout(promise, ms) {
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
      const result = await withTimeout(attempt.run(), attempt.timeoutMs);
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

function cachedExaminerLine(text, examiner) {
  const key = `${examiner.id}|${TTS_MODEL}|${text}`;
  const hit = audioCache.get(key);
  if (hit) {
    audioCache.delete(key);
    audioCache.set(key, hit);
    return hit;
  }
  // Fallback audio is not kept, so the examiner's own voice is retried next time.
  const pending = synthesizeExaminerLine(text, examiner).then((result) => {
    if (!result || result.fallback) audioCache.delete(key);
    return result;
  });
  audioCache.set(key, pending);
  if (audioCache.size > AUDIO_CACHE_LIMIT) {
    audioCache.delete(audioCache.keys().next().value);
  }
  return pending;
}

export async function POST(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const text = String(body?.text || '').trim();
    const examCode = body?.examCode || SPEAKING_B2_EXAM_CODE;
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    if (!examinerLineIsAuthorised(examCode, text)) {
      return NextResponse.json({ error: 'Text is not an authorised examiner line' }, { status: 400 });
    }

    const examiner = getSpeakingB2Examiner(body?.examinerId);
    const started = Date.now();
    const spoken = await cachedExaminerLine(text.slice(0, 500), examiner);
    if (!spoken?.audio?.length) {
      return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
    }

    console.info('[speaking-b2/tts] used', {
      examiner: examiner.id,
      engine: spoken.engine,
      voice: spoken.voice,
      model: spoken.model,
      fallback: spoken.fallback,
      elapsedMs: Date.now() - started,
    });

    return new NextResponse(spoken.audio, {
      status: 200,
      headers: {
        'Content-Type': spoken.mime,
        'Cache-Control': 'no-store',
        'x-speaking-tts-engine': spoken.engine,
        'x-speaking-tts-voice': spoken.voice,
        'x-speaking-tts-fallback': spoken.fallback ? '1' : '0',
      },
    });
  } catch (error) {
    console.error('[speaking-b2/tts]', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }
}
