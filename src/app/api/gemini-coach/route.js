import { NextResponse } from 'next/server';
import { realLifeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { SYSTEM_PROMPTS } from '../../../../dralo-speaking/prompts/cambridge-prompts';

function mapHistoryToOpenAIMessages(conversationHistory) {
  const out = [];
  for (const msg of conversationHistory || []) {
    if (!msg?.text?.trim()) continue;
    const role = msg.role === 'ai' ? 'assistant' : 'user';
    out.push({ role, content: String(msg.text) });
  }
  return out;
}

function coachMaxTokens(mode) {
  if (mode === 'correction') {
    return Number(process.env.COACH_CORRECTION_MAX_TOKENS || 900);
  }
  return Number(process.env.COACH_CHAT_MAX_TOKENS || 340);
}

async function callDraloCoachDualMode({ systemPrompt, mode, conversationHistory, userMessage }) {
  const taskSystem =
    mode === 'correction'
      ? `${systemPrompt}\n\nReturn only valid JSON, no markdown or code fences.`
      : systemPrompt;

  const messages = mapHistoryToOpenAIMessages(conversationHistory);
  messages.push({ role: 'user', content: String(userMessage) });

  try {
    if (mode === 'correction') {
      const jsonResult = await realLifeChatCompletion({
        system: taskSystem,
        messages,
        temperature: 0.2,
        max_tokens: coachMaxTokens(mode),
        top_p: 0.9,
        response_format: { type: 'json_object' },
      });
      if (jsonResult.text) return jsonResult.text;
      const plain = await realLifeChatCompletion({
        system: taskSystem,
        messages,
        temperature: 0.2,
        max_tokens: coachMaxTokens(mode),
        top_p: 0.9,
      });
      return plain.text || '';
    }

    const result = await realLifeChatCompletion({
      system: taskSystem,
      messages,
      temperature: 0.75,
      max_tokens: coachMaxTokens(mode),
      top_p: 0.9,
    });
    return result.text || '';
  } catch (e) {
    console.error('[gemini-coach] DRALO AI (OpenAI) error:', e?.message || e);
    return '';
  }
}

async function callGeminiNoThrow({
  apiKey,
  model,
  systemPrompt,
  mode,
  contents,
}) {
  try {
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const maxGem =
      mode === 'correction'
        ? Number(process.env.COACH_GEMINI_CORRECTION_TOKENS || 768)
        : Number(process.env.COACH_GEMINI_CHAT_TOKENS || 320);

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: mode === 'correction' ? 0.2 : 0.75,
        maxOutputTokens: maxGem,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await fetch(`${geminiApiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) return '';

    const data = await response.json();
    return (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
  } catch (e) {
    console.error('[gemini-coach] Gemini error:', e?.message || e);
    return '';
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userMessage,
      level,
      mode,
      conversationHistory = [],
      scenarioPrompt,
      customSituation,
    } = body || {};

    if (!userMessage || !level || !mode) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const openAiAvailable = isDraloOpenAIConfigured();
    const allowGeminiFallback = process.env.DRALO_ALLOW_GEMINI_FALLBACK === 'true';

    if (!openAiAvailable && !geminiKey) {
      return NextResponse.json(
        {
          error:
            'No AI configured. Add OPENAI_API_KEY in .env.local (DRALO AI GPT engine). Optional fallback: GEMINI_API_KEY with DRALO_ALLOW_GEMINI_FALLBACK=true.',
        },
        { status: 500 },
      );
    }

    let systemPrompt = SYSTEM_PROMPTS[level]?.[mode];

    if (mode === 'roleplay') {
      if (scenarioPrompt?.trim()) {
        systemPrompt = `${scenarioPrompt.trim()}\n\nStudent CEFR level: ${level}. Stay in character. Short replies (2–4 sentences). One question per turn.`;
      } else if (customSituation?.trim()) {
        systemPrompt = `You are a role-play partner for an English learner (${level} level). The student wants to practise this situation: "${customSituation.trim()}". Play the appropriate role (receptionist, officer, colleague, etc.). Stay in character. Short natural English. One question at a time. Start by setting the scene briefly.`;
      } else {
        return NextResponse.json({ error: 'Missing scenario for role play.' }, { status: 400 });
      }
    }

    if (!systemPrompt) {
      return NextResponse.json({ error: `No prompt found for level ${level}, mode ${mode}` }, { status: 400 });
    }

    const speedHint =
      mode === 'correction'
        ? ''
        : '\n\nSPEED: Reply in two short sentences (under ~45 words total) plus one follow-up question. No long intros or greetings unless it is the first message in the conversation.';
    const systemPromptResolved = `${systemPrompt}${speedHint}`;

    const contents = [];
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    const ctx = {
      systemPrompt: systemPromptResolved,
      mode,
      conversationHistory,
      userMessage,
    };

    let text = '';
    let source = '';

    /** Motor principal: DRALO AI (OpenAI / GPT personalizado). */
    if (openAiAvailable) {
      text = await callDraloCoachDualMode(ctx);
      if (text) source = 'dralo-ai';
    }

    if (!text && geminiKey && allowGeminiFallback) {
      const geminiText = await callGeminiNoThrow({
        apiKey: geminiKey,
        model,
        systemPrompt: systemPromptResolved,
        mode,
        contents,
      });
      if (geminiText) {
        text = geminiText;
        source = 'gemini';
      }
    }

    if (!text) {
      const fallbackText = buildFallbackResponse({ mode, level, userMessage });
      return NextResponse.json({
        text: fallbackText,
        fallback: true,
        warning: 'AI providers unavailable. Using local fallback.',
      });
    }

    return NextResponse.json({ text, source: source || undefined });
  } catch (error) {
    console.error('[gemini-coach] POST:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

function buildFallbackResponse({ mode, level, userMessage }) {
  if (mode === 'correction') {
    return JSON.stringify({
      overall_band: level,
      scores: {
        grammar: 62,
        vocabulary: 64,
        communication: 68,
        fluency: 60,
      },
      corrections: [
        {
          original: userMessage || 'your sentence',
          corrected: userMessage || 'your sentence',
          explanation: 'Fallback mode active. Full AI correction unavailable right now.',
        },
      ],
      positive: 'You are communicating and practicing consistently.',
      tip: 'Keep speaking in complete sentences and add one concrete example.',
    });
  }

  return `I'm temporarily in offline coach mode, but we can keep practicing. You said: "${userMessage}". Please expand your answer with one reason and one example.`;
}
