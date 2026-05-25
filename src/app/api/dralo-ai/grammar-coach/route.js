import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildGrammarCoachSystemPrompt } from '@/lib/grammarCoachPrompt';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 45;
const MAX_USER_CHARS = 2000;
const MAX_HISTORY = 16;
const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/** @type {Map<string, { n: number; reset: number }>} */
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

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const content = String(m?.content || '').trim().slice(0, MAX_USER_CHARS);
    if (!content) continue;
    out.push({ role, content });
  }
  return out;
}

export async function POST(req) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          'Missing OPENAI_API_KEY in .env.local. Grammar Coach uses the same key as Dralo AI.',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const history = sanitizeMessages(body?.messages);
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser?.content) {
    return NextResponse.json({ error: 'Write a question first.' }, { status: 400 });
  }

  const level = String(body?.level || 'B2').toUpperCase();
  const validLevels = ['A2', 'B1', 'B2', 'C1', 'C2'];
  const cefr = validLevels.includes(level) ? level : 'B2';

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.45,
      max_tokens: 900,
      messages: [
        { role: 'system', content: buildGrammarCoachSystemPrompt(cefr) },
        ...history,
      ],
    });

    const reply = (completion.choices?.[0]?.message?.content || '').trim();
    if (!reply) {
      return NextResponse.json({ error: 'No response from the coach.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error('[dralo-ai/grammar-coach]', err);
    return NextResponse.json(
      { error: err?.message || 'Could not connect to ChatGPT.' },
      { status: 500 },
    );
  }
}
