import { NextResponse } from 'next/server';
import { isOpenAIConfigured, getDefaultModel } from '@/lib/ai/draloAiEngine';
import { runExamCoach, isValidExamCoachTaskType } from '@/lib/ai/services/examCoachService';
import { runRealLifeCoach, isValidRealLifeTaskType } from '@/lib/ai/services/realLifeCoachService';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 60;

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

function clipInput(text, max = 12000) {
  const t = String(text || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function normalizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content != null)
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: clipInput(m.content, 4000),
    }));
}

/** Estado del motor (sin exponer la API key). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    openaiConfigured: isOpenAIConfigured(),
    model: getDefaultModel(),
    assistantsEnabled: process.env.DRALO_USE_OPENAI_ASSISTANTS === 'true',
    integration: 'chat-completions-prompts',
  });
}

export async function POST(request) {
  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { success: false, error: 'OPENAI_API_KEY is not configured on the server.' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const {
      assistantType,
      taskType,
      level = 'B2',
      situation = '',
      userInput,
      conversationHistory = [],
    } = body || {};

    const input = clipInput(userInput);
    const levelNormPreview = String(level || 'B2').trim().toUpperCase();

    if (process.env.NODE_ENV === 'development') {
      console.log('DRALO AI request', {
        assistantType,
        taskType,
        level: levelNormPreview,
        openaiConfigured: isOpenAIConfigured(),
        model: getDefaultModel(),
        inputLength: input.length,
      });
    }

    if (!assistantType || !taskType || !input) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: assistantType, taskType, userInput' },
        { status: 400 },
      );
    }

    const history = normalizeHistory(conversationHistory);
    const levelNorm = levelNormPreview;

    let result;

    if (assistantType === 'exam') {
      if (!isValidExamCoachTaskType(taskType)) {
        return NextResponse.json(
          { success: false, error: `Invalid exam taskType: ${taskType}` },
          { status: 400 },
        );
      }
      result = await runExamCoach({
        taskType,
        level: levelNorm,
        userInput: input,
        conversationHistory: history,
      });
    } else if (assistantType === 'realLife') {
      if (!isValidRealLifeTaskType(taskType)) {
        return NextResponse.json(
          { success: false, error: `Invalid realLife taskType: ${taskType}` },
          { status: 400 },
        );
      }
      result = await runRealLifeCoach({
        taskType,
        level: levelNorm,
        situation: clipInput(situation, 2000),
        userInput: input,
        conversationHistory: history,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid assistantType. Use "exam" or "realLife".' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      assistantType,
      taskType,
      level: levelNorm,
      result,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('DRALO AI API ERROR', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      });
    } else {
      console.error('DRALO AI API ERROR:', error?.message || error);
    }
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'AI request failed',
      },
      { status: 500 },
    );
  }
}
