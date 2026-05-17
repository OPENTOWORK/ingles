import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 50;
const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function clip(s, max = 8000) {
  const t = String(s || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function buildGeneratePrompt(mode, activity, level) {
  const L = level || 'B2';
  if (mode === 'use-of-english') {
    if (activity === 'key-word') {
      return `You are a Cambridge ${L} Use of English examiner. Create ONE key word transformation item.
Return ONLY valid JSON:
{"stem":"Complete the second sentence so it has a similar meaning to the first, using the word given.","sentence1":"...","keyword":"GIVEN","sentence2Start":"...","maxWords":5,"modelAnswer":"full second sentence","briefTip":"one line in English"}`;
    }
    if (activity === 'word-formation') {
      return `Create ONE ${L} word formation gap. Return ONLY JSON:
{"instruction":"Use the word in capitals to form ONE word that fits the gap.","textBefore":"...","stem":"HAPPY","textAfter":"...","modelAnswer":"one word","briefTip":"morphology hint"}`;
    }
    return `Create ONE ${L} open cloze (single gap, no options). Return ONLY JSON:
{"instruction":"Read the sentence and write ONE word for the gap.","textBefore":"She couldn't ","textAfter":" the meeting because of the storm.","modelAnswer":"one word","briefTip":"grammar hint without giving answer"}`;
  }

  if (mode === 'reading') {
    const focus =
      activity === 'gist'
        ? 'gist and writer attitude (2 questions)'
        : activity === 'vocabulary'
          ? 'vocabulary in context (2 questions)'
          : 'specific detail (2 questions)';
    return `Create a ${L} reading task: short passage (120-180 words) + ${focus}.
Return ONLY JSON:
{"title":"...","passage":"...","questions":[{"id":"q1","prompt":"...","type":"mcq|short","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."}]}
For short answers omit options array.`;
  }

  if (mode === 'listening') {
    const kind =
      activity === 'monologue'
        ? 'a 90-120 word monologue'
        : activity === 'note-taking'
          ? 'a short talk with 4 note-completion gaps'
          : 'a 70-100 word dialogue between two speakers';
    return `Create a ${L} listening task: ${kind} (script for TTS) + comprehension.
Return ONLY JSON:
{"title":"...","setting":"one line context","script":"full text to read aloud","questions":[{"id":"q1","prompt":"...","type":"mcq|short|gap","options":["A)...","B)..."]}],"modelAnswers":[{"id":"q1","answer":"..."}],"noteTemplate":"optional for note-taking: lines with (1) ___ gaps"}`;
  }

  if (mode === 'writing') {
    const genre =
      activity === 'email'
        ? 'formal or semi-formal email'
        : activity === 'article'
          ? 'article or review for a magazine'
          : 'essay giving opinion';
    return `Create ONE ${L} ${genre} writing task (Cambridge style). Return ONLY JSON:
{"taskTitle":"...","instructions":"bullet points what candidate must include","inputNotes":"optional stimulus","wordMin":140,"wordMax":190,"register":"formal|neutral","checklist":["point1","point2"]}`;
  }

  return 'Return JSON {"error":"unknown mode"}';
}

function buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId) {
  const L = level || 'B2';
  const ex = clip(JSON.stringify(exercise), 5000);
  const ans = clip(userAnswer, 1200);

  if (mode === 'use-of-english') {
    return `Cambridge ${L} examiner. Exercise JSON: ${ex}
Student answer: "${ans}"
Compare to modelAnswer. Return ONLY JSON:
{"correct":true|false,"scorePercent":0-100,"feedback":"2-4 sentences English","modelAnswer":"..."}`;
  }

  if (mode === 'reading' || mode === 'listening') {
    return `Cambridge ${L} ${mode} examiner. Full task JSON: ${ex}
Question id: ${questionId || 'q1'}
Student answer: "${ans}"
Use modelAnswers in JSON. Return ONLY JSON:
{"correct":true|false,"feedback":"2-3 sentences","correctAnswer":"..."}`;
  }

  return `Feedback for: ${ans}`;
}

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Invalid JSON from model');
  }
}

export async function POST(req) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          'Falta OPENAI_API_KEY en .env.local. Dralo AI usa ChatGPT (OpenAI). Opcional: OPENAI_MODEL=gpt-4o-mini',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un momento.' }, { status: 429 });
  }

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI no configurado.' }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const { action, mode, activity, level, exercise, userAnswer, questionId } = body || {};

  if (!mode || !action) {
    return NextResponse.json({ error: 'Faltan mode o action.' }, { status: 400 });
  }

  const systemBase =
    'You are Dralo, a friendly Cambridge English coach powered by ChatGPT. Be concise, accurate, and exam-focused. Always follow the JSON-only output format requested.';

  try {
    if (action === 'generate') {
      const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: 0.75,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemBase },
          { role: 'user', content: buildGeneratePrompt(mode, activity, level) },
        ],
      });
      const text = completion.choices?.[0]?.message?.content || '{}';
      const data = parseJsonFromModel(text);
      return NextResponse.json({ ok: true, exercise: data });
    }

    if (action === 'check') {
      const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemBase },
          {
            role: 'user',
            content: buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId),
          },
        ],
      });
      const text = completion.choices?.[0]?.message?.content || '{}';
      const result = parseJsonFromModel(text);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[dralo-ai/chat]', err);
    return NextResponse.json(
      { error: err?.message || 'Error al conectar con ChatGPT.' },
      { status: 500 },
    );
  }
}
