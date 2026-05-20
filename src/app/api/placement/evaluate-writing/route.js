import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { writingPercentToOutcomesScore } from '@/lib/placementOutcomesScoring';

const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : raw;
  return JSON.parse(body);
}

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const taskPrompt = String(body.taskPrompt || '').trim();
    const selectedTopic = String(body.selectedTopic || '').trim();
    const essay = String(body.essay || '').trim();
    const wordMin = Number(body.wordMin) > 0 ? Number(body.wordMin) : 150;
    const wordMax = Number(body.wordMax) > 0 ? Number(body.wordMax) : 200;

    if (!essay || essay.length < 20) {
      return NextResponse.json(
        { error: 'Escribe tu texto antes de enviar la corrección.' },
        { status: 400 },
      );
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY no configurada para corregir el writing.' },
        { status: 503 },
      );
    }

    const words = countWords(essay);

    const system = `You are an experienced Outcomes Placement Test examiner.
Score writing using the official 0–10 scale (Writing Assessment Guidelines):
0–1 Elementary, 2–3 Pre-Intermediate, 4–5 Intermediate, 6–7 Upper Intermediate,
8–9 Advanced, 10 Higher level.
Be fair, constructive, and concise. Respond ONLY with valid JSON (no markdown fences).`;

    const user = `TASK PROMPT (full instructions shown to the student):
${taskPrompt}

SELECTED TOPIC (if any): ${selectedTopic || 'Not specified'}

TARGET LENGTH: ${wordMin}–${wordMax} words (student wrote ${words} words).

STUDENT TEXT:
${essay}

Return JSON:
{
  "writingScore10": <integer 0-10 per Outcomes Writing Placement Test>,
  "scorePercent": <0-100 overall quality, should align with writingScore10 * 10>,
  "countsAsCorrect": <true if writingScore10 >= 4>,
  "wordCount": ${words},
  "withinWordLimit": <true if word count is between ${Math.max(80, wordMin - 30)} and ${wordMax + 40}>,
  "feedback": "<3-5 sentences in English explaining level and main issues>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    let parsed;
    try {
      parsed = parseJsonFromModel(raw);
    } catch {
      return NextResponse.json(
        { error: 'No se pudo interpretar la corrección de la IA.' },
        { status: 502 },
      );
    }

    const scorePercent = Math.min(100, Math.max(0, Number(parsed.scorePercent) || 0));
    let writingScore10 = Math.min(
      10,
      Math.max(0, Math.round(Number(parsed.writingScore10))),
    );
    if (Number.isNaN(writingScore10)) {
      writingScore10 = writingPercentToOutcomesScore(scorePercent);
    }
    const countsAsCorrect =
      parsed.countsAsCorrect === true || writingScore10 >= 4;

    return NextResponse.json({
      writingScore10,
      scorePercent,
      countsAsCorrect,
      wordCount: words,
      withinWordLimit: Boolean(parsed.withinWordLimit),
      feedback: String(parsed.feedback || '').trim(),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    });
  } catch (err) {
    console.error('[placement/evaluate-writing]', err);
    return NextResponse.json(
      { error: err.message || 'Error al corregir el writing.' },
      { status: 500 },
    );
  }
}
