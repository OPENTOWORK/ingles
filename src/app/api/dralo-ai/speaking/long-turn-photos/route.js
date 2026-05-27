import { NextResponse } from 'next/server';
import { generateLongTurnPhotoSet } from '@/lib/draloAiLongTurnPhotos';
import { isDraloOpenAIConfigured } from '@/lib/draloAiEngine';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 12;

/** @type {Map<string, { n: number, reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64) || 'unknown';
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

function tryConsumeRate(ip) {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

export async function POST(req) {
  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured on the server.' },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json(
      { error: 'Too many photo requests. Please try again in an hour.' },
      { status: 429 },
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const level = String(body.level || 'B2').trim().slice(0, 8) || 'B2';
  const excludeTheme = String(body.excludeTheme || '').trim().slice(0, 120);

  try {
    const set = await generateLongTurnPhotoSet({ level, excludeTheme });
    return NextResponse.json({ ok: true, ...set });
  } catch (err) {
    console.error('[dralo-ai/speaking/long-turn-photos]', err);
    return NextResponse.json(
      { error: err?.message || 'Could not generate photographs.' },
      { status: 500 },
    );
  }
}
