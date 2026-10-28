import { NextResponse } from 'next/server';
import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { examinerLineIsAuthorised } from '@/features/speaking-b2-motor/services/coordinator';
import { SPEAKING_B2_EXAM_CODE } from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';

export const runtime = 'nodejs';

const EDGE_GB = process.env.SPEAKING_B2_EDGE_VOICE || 'en-GB-SoniaNeural';
const EDGE_TIMEOUT_MS = Number(process.env.SPEAKING_B2_EDGE_TIMEOUT_MS || 8000);

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

    const spokenText = text.slice(0, 500);
    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TTS timeout')), ms);
        }),
      ]);

    const started = Date.now();
    let spoken = null;
    let fallback = false;
    let fallbackReason = null;
    try {
      spoken = await withTimeout(
        synthesizeExamTtsMp3(spokenText, { edgeVoice: EDGE_GB, preferEdge: true, edgeOnly: true }),
        EDGE_TIMEOUT_MS,
      );
    } catch (error) {
      fallback = true;
      fallbackReason = error.message || 'edge_failed';
      console.warn('[speaking-b2/tts] fallback', {
        from: EDGE_GB,
        to: 'nova',
        reason: fallbackReason,
        elapsedMs: Date.now() - started,
      });
      spoken = await synthesizeExamTtsMp3(spokenText, { openaiOnly: true, openaiVoice: 'nova' });
    }
    if (!spoken?.base64) {
      return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
    }

    const engine = spoken.engine || (fallback ? 'openai' : 'edge');
    const voice = spoken.voice || (fallback ? 'nova' : EDGE_GB);
    console.info('[speaking-b2/tts] used', {
      engine,
      voice,
      fallback,
      fallbackReason,
      elapsedMs: Date.now() - started,
    });

    return new NextResponse(Buffer.from(spoken.base64, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': spoken.mime || 'audio/mpeg',
        'Cache-Control': 'no-store',
        'x-speaking-tts-engine': engine,
        'x-speaking-tts-voice': voice,
        'x-speaking-tts-fallback': fallback ? '1' : '0',
      },
    });
  } catch (error) {
    console.error('[speaking-b2/tts]', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }
}
