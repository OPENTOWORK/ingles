import { NextResponse } from 'next/server';
import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { examinerLineIsAuthorised } from '@/features/speaking-b2-motor/services/coordinator';
import { SPEAKING_B2_EXAM_CODE } from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';

export const runtime = 'nodejs';

const EDGE_GB = process.env.SPEAKING_B2_EDGE_VOICE || 'en-GB-SoniaNeural';

export async function POST(req) {
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

    let spoken = null;
    try {
      spoken = await withTimeout(
        synthesizeExamTtsMp3(spokenText, { edgeVoice: EDGE_GB, preferEdge: true }),
        8000,
      );
    } catch (error) {
      console.warn('[speaking-b2/tts] Edge unavailable, trying OpenAI:', error.message);
      spoken = await synthesizeExamTtsMp3(spokenText, { openaiOnly: true, openaiVoice: 'nova' });
    }
    if (!spoken?.base64) {
      return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
    }

    return new NextResponse(Buffer.from(spoken.base64, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': spoken.mime || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[speaking-b2/tts]', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }
}
