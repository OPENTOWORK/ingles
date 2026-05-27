import { NextResponse } from 'next/server';
import { draloChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { SITE_ASSISTANT_SYSTEM_PROMPT } from '@/lib/siteHelpKnowledge';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 40;
const MAX_USER_CHARS = 2000;
const MAX_HISTORY = 14;

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
  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      {
        error:
          'El asistente no está configurado. Añade OPENAI_API_KEY en .env.local (motor DRALO AI GPT).',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas preguntas. Espera un minuto e inténtalo de nuevo.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const history = sanitizeMessages(body?.messages);
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser?.content) {
    return NextResponse.json({ error: 'Escribe una pregunta.' }, { status: 400 });
  }

  try {
    const { text: reply } = await draloChatCompletion({
      system: SITE_ASSISTANT_SYSTEM_PROMPT,
      messages: history,
      temperature: 0.4,
      max_tokens: 700,
    });
    if (!reply) {
      return NextResponse.json({ error: 'No hubo respuesta del asistente.' }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[site-assistant/chat]', err);
    const msg = err?.message || 'Error al conectar con ChatGPT.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
