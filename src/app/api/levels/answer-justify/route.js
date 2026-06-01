import { NextResponse } from 'next/server';
import { cambridgeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 40;

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

const MAX_CONTEXT = 6000;

function clip(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  return t.length > MAX_CONTEXT ? `${t.slice(0, MAX_CONTEXT)}\n\n[…]` : t;
}

/** Normalise for comparing model tail vs official key. */
function normalizeKeyCompare(s) {
  return String(s || '')
    .trim()
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Strip trailing "The correct answer is: <key>" (or Spanish equivalent) when the UI already shows the key.
 * @param {string} line
 * @param {string} key
 */
function stripRedundantKeyedSuffix(line, key) {
  const keyNorm = normalizeKeyCompare(key);
  if (!keyNorm || !line) return line;

  const markers = ['the correct answer is:', 'la respuesta correcta es:'];
  let out = line;
  for (const needle of markers) {
    const lower = out.toLowerCase();
    let search = lower.length;
    while (search > 0) {
      const pos = lower.lastIndexOf(needle, search - 1);
      if (pos === -1) break;
      const rest = normalizeKeyCompare(out.slice(pos + needle.length));
      if (rest === keyNorm) {
        out = out
          .slice(0, pos)
          .trim()
          .replace(/\s*[,;]?\s*$/, '')
          .trim();
        break;
      }
      search = pos;
    }
  }
  return out.trim();
}

export async function POST(req) {
  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      {
        error:
          'Falta OPENAI_API_KEY en el servidor. Añádela en .env.local (motor DRALO AI GPT).',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Prueba más tarde.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const partLabel = clip(body?.partLabel);
  const questionLabel = clip(body?.questionLabel);
  const contextSnippet = clip(body?.contextSnippet);
  const userChoiceText = clip(body?.userChoiceText);
  const correctChoiceText = clip(body?.correctChoiceText);
  const answersFromDatabase = clip(body?.answersFromDatabase);
  const isCorrect = Boolean(body?.isCorrect);

  if (!contextSnippet || !String(userChoiceText || '').trim()) {
    return NextResponse.json({ error: 'Faltan datos para justificar.' }, { status: 400 });
  }
  if (!isCorrect && !String(correctChoiceText || '').trim()) {
    return NextResponse.json(
      { error: 'Falta la clave correcta del ejercicio para el caso incorrecto.' },
      { status: 400 },
    );
  }

  const system = isCorrect
    ? `You are an experienced English teacher (CEFR) for exam-style reading and use-of-English tasks.
The student's answer is CORRECT according to the task key.

Write in English only, professional and coherent with the CONTEXT you are given (instructions + passage, or gap sentence).

Give a substantive rationale: explain which idea, reference, collocation, contrast, time/place link, or grammatical pattern in the CONTEXT supports the keyed answer. Paraphrase evidence in your own words; do not invent facts not supported by the CONTEXT.

Forbidden: circular reasoning ("because it is the correct option"), empty praise ("good job"), or answering only "because it fits the text" without saying how. Do not open with "The correct answer is" or "Option B is correct because B".

You may mention a name or short phrase from the keyed option if it clarifies the referent. Do not list all distractors. Do not mention the model provider.

Two sentences maximum (or one longer sentence if it stays clear). Max 420 characters. No quotation marks. Single line, no line breaks.`
    : `You are an experienced English teacher (CEFR) for exam-style tasks.
The student's answer is WRONG according to the task key.

Write in English only, professional and tied to the CONTEXT.

1) Briefly explain why the student's choice misaligns with the passage or rubric (specific mismatch: referent, time, attitude, collocation, etc.—not vague).
2) Give ONE short sentence with the positive rationale for the official keyed answer: which detail in the CONTEXT supports it (no circular "because it is correct").
3) Do NOT end with "The correct answer is:" or repeat the full CLAVE_OFICIAL line; the app already shows the correct answer separately. You may refer to the idea in words (e.g. many activities) without restating the option label.

Do not mention the model provider.
Max 520 characters in total. No quotation marks. Single line, no line breaks.`;

  const user = `Parte: ${partLabel || '—'}
Ítem: ${questionLabel || '—'}
Resultado según la base de datos del ejercicio: ${isCorrect ? 'ACIERTO' : 'FALLO'}

Contexto (extracto del enunciado o texto):
${contextSnippet}

${answersFromDatabase ? `Respuestas / opciones registradas en la base de datos para este ítem:\n${answersFromDatabase}\n\n` : ''}Lo que respondió el alumno: ${userChoiceText}
${
  isCorrect
    ? String(correctChoiceText || '').trim()
      ? `OFFICIAL_KEYED_ANSWER (verbatim; the student's response matches this): ${String(correctChoiceText).trim()}`
      : ''
    : `CLAVE_OFICIAL (official key from DB—use only for reasoning; do NOT paste this full string or "The correct answer is:" in your reply; the UI shows the key): ${correctChoiceText}`
}`;

  try {
    const { text: raw } = await cambridgeChatCompletion({
      system,
      messages: [{ role: 'user', content: user }],
      temperature: 0.35,
      max_tokens: isCorrect ? 200 : 280,
    });
    let oneLine = raw.replace(/\s+/g, ' ').trim();

    if (!isCorrect && String(correctChoiceText || '').trim()) {
      const key = String(correctChoiceText).trim();
      oneLine = stripRedundantKeyedSuffix(oneLine, key);
      oneLine = oneLine.slice(0, 560);
    } else {
      oneLine = oneLine.slice(0, isCorrect ? 460 : 520);
    }

    return NextResponse.json({ justification: oneLine || 'Could not generate an explanation.' });
  } catch (e) {
    const msg = e?.message || 'Error al generar la justificación.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
