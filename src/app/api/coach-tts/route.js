import { NextResponse } from 'next/server';
import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';

export const runtime = 'nodejs';

const MAX_CHARS = 4000;

/** Speaking coach TTS — OpenAI with Edge fallback (British examiner voice). */
export async function POST(req) {
  try {
    let body = {};
    try {
      const text = await req.text();
      if (text.trim()) body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const raw = String(body?.text ?? '').trim();
    if (!raw) {
      return NextResponse.json({ error: 'Missing text.' }, { status: 400 });
    }

    const spoken = await synthesizeExamTtsMp3(raw.slice(0, MAX_CHARS));
    if (!spoken?.base64) {
      return NextResponse.json({ error: 'TTS unavailable.' }, { status: 503 });
    }

    const buf = Buffer.from(spoken.base64, 'base64');

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': spoken.mime || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[coach-tts]', e?.message || e);
    return NextResponse.json({ error: 'TTS failed', details: e?.message }, { status: 502 });
  }
}
