import { NextResponse } from 'next/server';
import { buildExamGeneratePrompt } from '@/lib/draloAiExamPrompts';
import { realLifeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { buildSituationalGeneratePrompt } from '@/lib/draloAiSituationalPrompts';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 50;

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

function clip(s, max = 8000) {
  const t = String(s || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId) {
  const L = level || 'B2';
  const ex = clip(JSON.stringify(exercise), 5000);
  const ans = clip(userAnswer, 1200);

  if (mode === 'use-of-english') {
    const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
    const official =
      modelAnswers.find((m) => m.id === questionId)?.answer ||
      exercise?.modelAnswer ||
      '';
    return `Cambridge ${L} examiner. Exercise JSON: ${ex}
Question id: ${questionId || 'q1'}
Official answer: "${official}"
Student answer: "${ans}"
Compare strictly to the official answer (accept minor spelling if meaning clear). Return ONLY JSON:
{"correct":true|false,"scorePercent":0-100,"feedback":"REQUIRED: 2-4 sentences in English ALWAYS — if correct, praise and explain why; if wrong, explain the mistake clearly","modelAnswer":"repeat official answer when correct is false; empty string when correct is true"}`;
  }

  if (mode === 'reading' || mode === 'listening') {
    return `Cambridge ${L} ${mode} examiner. Full task JSON: ${ex}
Question id: ${questionId || 'q1'}
Student answer: "${ans}"
Use modelAnswers in JSON. Return ONLY JSON:
{"correct":true|false,"feedback":"REQUIRED: 2-4 sentences in English ALWAYS — if correct, explain why the answer fits the text/audio; if wrong, explain the mistake and point to evidence","correctAnswer":"official answer when correct is false; empty string when correct is true"}`;
  }

  return `Feedback for: ${ans}`;
}

function normalizeRlCheckResult(result, exercise, questionId) {
  const correct = Boolean(result?.correct);
  const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
  const official =
    modelAnswers.find((m) => m.id === questionId)?.answer ||
    result?.correctAnswer ||
    '';
  let feedback = String(result?.feedback || '').trim();
  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. See the correct answer below.';
  }
  return {
    correct,
    feedback,
    correctAnswer: correct ? '' : String(official).trim(),
  };
}

function normalizeUoeCheckResult(result, exercise, questionId) {
  const correct = Boolean(result?.correct);
  const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
  const modelAnswer = String(
    result?.modelAnswer ||
      modelAnswers.find((m) => m.id === questionId)?.answer ||
      exercise?.modelAnswer ||
      '',
  ).trim();
  const tip = String(exercise?.briefTip || '').trim();
  let feedback = String(result?.feedback || '').trim();

  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. See the model answer below.';
  }
  if (correct && tip && !feedback.toLowerCase().includes(tip.toLowerCase().slice(0, 12))) {
    feedback = `${feedback} ${tip}`;
  }
  if (!correct && tip && !feedback.toLowerCase().includes(tip.toLowerCase().slice(0, 12))) {
    feedback = `${feedback} ${tip}`;
  }

  return {
    correct,
    scorePercent:
      typeof result?.scorePercent === 'number' ? result.scorePercent : correct ? 100 : 0,
    feedback,
    modelAnswer: correct ? '' : modelAnswer,
  };
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
  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      {
        error:
          'Missing OPENAI_API_KEY in .env.local. Dralo AI uses the DRALO AI GPT engine (OpenAI). Optional: OPENAI_MODEL=gpt-4o',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const {
    action,
    mode,
    activity,
    level,
    exercise,
    userAnswer,
    questionId,
    varietySeed,
    recentFingerprints,
    topic,
    track,
    customBrief,
  } = body || {};

  if (!mode || !action) {
    return NextResponse.json({ error: 'Missing mode or action.' }, { status: 400 });
  }

  const taskSystem =
    'For this request only: be concise, accurate, and exam-focused. All feedback and tips must be in English. Always follow the JSON-only output format requested.';

  const isSituational = track === 'situational';

  try {
    if (action === 'generate') {
      const userPrompt = isSituational
        ? buildSituationalGeneratePrompt(mode, activity, level, { varietySeed, customBrief })
        : buildExamGeneratePrompt(mode, activity, level, {
            varietySeed,
            recentFingerprints,
            topic,
          });

      const { text } = await realLifeChatCompletion({
        system: taskSystem,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 8192,
        temperature: ['use-of-english', 'reading', 'listening', 'writing'].includes(mode)
          ? 0.92
          : 0.75,
        response_format: { type: 'json_object' },
      });
      const data = parseJsonFromModel(text || '{}');
      return NextResponse.json({ ok: true, exercise: data });
    }

    if (action === 'check') {
      const { text } = await realLifeChatCompletion({
        system: taskSystem,
        messages: [
          {
            role: 'user',
            content: buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId),
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });
      const result = parseJsonFromModel(text);
      let normalized = result;
      if (mode === 'use-of-english') {
        normalized = normalizeUoeCheckResult(result, exercise, questionId);
      } else if (mode === 'reading' || mode === 'listening') {
        normalized = normalizeRlCheckResult(result, exercise, questionId);
      }
      return NextResponse.json({ ok: true, result: normalized });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('[dralo-ai/chat]', err);
    return NextResponse.json(
      { error: err?.message || 'Could not connect to ChatGPT.' },
      { status: 500 },
    );
  }
}
