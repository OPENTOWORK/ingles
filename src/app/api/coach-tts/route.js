import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const MAX_CHARS = 4000;

/** Server TTS — works where translate.google TTS / WebSpeech fail (Cursor browser, CSP, autoplay quirks). */
export async function POST(req) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 503 });
    }

    const body = await req.json();
    const raw = String(body?.text ?? '').trim();
    if (!raw) {
      return NextResponse.json({ error: 'Missing text.' }, { status: 400 });
    }

    const input = raw.slice(0, MAX_CHARS);
    const client = new OpenAI({ apiKey: key });

    let speed = Number(body?.speed);
    if (!Number.isFinite(speed)) {
      speed = Number(process.env.OPENAI_TTS_SPEED || 1.08);
    }
    speed = Math.min(2, Math.max(0.5, speed));

    const mp3 = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1',
      voice: process.env.OPENAI_TTS_VOICE || 'shimmer',
      input,
      speed,
    });

    const buf = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[coach-tts]', e?.message || e);
    return NextResponse.json({ error: 'TTS failed', details: e?.message }, { status: 502 });
  }
}
