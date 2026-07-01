/**
 * Fachada legacy — delega en src/lib/ai/draloAiEngine.js (Chat Completions + prompts propios).
 * Los Assistants de ChatGPT solo se usan si DRALO_USE_OPENAI_ASSISTANTS=true (laboratorio).
 */
import OpenAI from 'openai';
import {
  draloChatCompletion as draloChatCompletionCore,
  draloChatCompletionResult,
  draloChatCompletionStream as draloChatCompletionStreamCore,
  getDefaultModel,
  getFastModel,
  isOpenAIConfigured,
} from '@/lib/ai/draloAiEngine';
import { examCoachPrompt } from '@/lib/ai/prompts/examCoachPrompt';
import { realLifeCoachPrompt } from '@/lib/ai/prompts/realLifeCoachPrompt';
import {
  DRALO_AI_ENGINE,
  mergeEngineSystem,
  mergeRealLifeSystem,
  mergeCambridgeSystem,
  DRALO_REAL_LIFE_CORE_SYSTEM,
  CAMBRIDGE_EXAMS_CORE_SYSTEM,
} from '@/lib/draloAiSystemPrompt';

export {
  DRALO_AI_ENGINE,
  mergeEngineSystem,
  mergeRealLifeSystem,
  mergeCambridgeSystem,
  DRALO_REAL_LIFE_CORE_SYSTEM as DRALO_AI_CORE_SYSTEM,
  mergeRealLifeSystem as mergeDraloSystem,
};

export function getDraloModel() {
  return getDefaultModel();
}

export function getDraloFastModel() {
  return getFastModel();
}

function assistantsEnabled() {
  return process.env.DRALO_USE_OPENAI_ASSISTANTS === 'true';
}

/** ID del Assistant API del GPT «Examenes de cambridge» (asst_…, no el g-… de la URL de ChatGPT). */
export function getCambridgeExamsAssistantId() {
  return (
    process.env.OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS?.trim() ||
    process.env.DRALO_OPENAI_ASSISTANT_CAMBRIDGE?.trim() ||
    process.env.OPENAI_ASSISTANT_ID_CAMBRIDGE?.trim() ||
    ''
  );
}

export function isCambridgeExamsAssistantConfigured() {
  return Boolean(getCambridgeExamsAssistantId());
}

export function getAssistantIdForEngine(engine = DRALO_AI_ENGINE.REAL_LIFE) {
  if (!assistantsEnabled()) {
    if (engine === DRALO_AI_ENGINE.CAMBRIDGE) return '';
    return '';
  }
  if (engine === DRALO_AI_ENGINE.CAMBRIDGE) {
    return getCambridgeExamsAssistantId();
  }
  return (
    process.env.OPENAI_ASSISTANT_ID_REAL_LIFE?.trim() ||
    process.env.DRALO_OPENAI_ASSISTANT_REAL_LIFE?.trim() ||
    process.env.DRALO_OPENAI_ASSISTANT_ID_REAL_LIFE?.trim() ||
    process.env.OPENAI_ASSISTANT_ID?.trim() ||
    process.env.DRALO_OPENAI_ASSISTANT_ID?.trim() ||
    ''
  );
}

export function getDraloAssistantId() {
  return getAssistantIdForEngine(DRALO_AI_ENGINE.REAL_LIFE);
}

export function getDraloOpenAI() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function isDraloOpenAIConfigured() {
  return isOpenAIConfigured();
}

function resolveEngine(options = {}) {
  const e = options.engine;
  if (e === DRALO_AI_ENGINE.CAMBRIDGE || e === DRALO_AI_ENGINE.REAL_LIFE) return e;
  return DRALO_AI_ENGINE.REAL_LIFE;
}

function coreSystemForEngine(engine) {
  return engine === DRALO_AI_ENGINE.CAMBRIDGE ? examCoachPrompt : realLifeCoachPrompt;
}

async function pollAssistantRun(client, threadId, runId, maxMs = 120000) {
  const start = Date.now();
  let run = await client.beta.threads.runs.retrieve(threadId, runId);
  while (run.status === 'queued' || run.status === 'in_progress') {
    if (Date.now() - start > maxMs) {
      throw new Error('OpenAI assistant timeout.');
    }
    await new Promise((r) => setTimeout(r, 600));
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }
  if (run.status !== 'completed') {
    throw new Error(`OpenAI assistant run failed: ${run.status}`);
  }
  return run;
}

function normalizeAssistantHistory(conversationHistory = []) {
  return (Array.isArray(conversationHistory) ? conversationHistory : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content != null)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

function buildCambridgeAssistantUserMessage(options = {}) {
  const incoming = Array.isArray(options.messages) ? options.messages : [];
  const taskSystem = String(
    options.system || incoming.find((m) => m?.role === 'system')?.content || '',
  ).trim();
  const userPrompt =
    options.userMessage != null
      ? String(options.userMessage)
      : incoming.filter((m) => m?.role === 'user').pop()?.content || '';

  return taskSystem
    ? `${taskSystem}\n\n${String(userPrompt).trim()}`
    : String(userPrompt).trim();
}

/**
 * DRALO EXAM CAMBRIDGE assistant when OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS is set;
 * otherwise Chat Completions + examCoachPrompt.
 */
async function cambridgeViaAssistantOrChat(options = {}) {
  const assistantId = getCambridgeExamsAssistantId();
  const client = getDraloOpenAI();

  if (options.requireAssistant && (!assistantId || !client)) {
    throw new Error(
      'OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS is required for B2 speaking (DRALO EXAM CAMBRIDGE assistant).',
    );
  }

  if (assistantId && client && options.useAssistant !== false) {
    const fullUserMessage = buildCambridgeAssistantUserMessage(options);
    if (!fullUserMessage.trim()) {
      throw new Error('Empty prompt for DRALO EXAM CAMBRIDGE assistant.');
    }

    return assistantCompletion(client, assistantId, {
      ...options,
      userMessage: fullUserMessage,
      messages: normalizeAssistantHistory(options.conversationHistory || []),
      engine: DRALO_AI_ENGINE.CAMBRIDGE,
      assistantTimeoutMs: options.assistantTimeoutMs ?? 120000,
    });
  }

  return draloChatCompletion({
    ...options,
    engine: DRALO_AI_ENGINE.CAMBRIDGE,
    useAssistant: false,
    system: options.system ? mergeCambridgeSystem(options.system) : options.system,
  });
}

async function assistantCompletion(client, assistantId, options) {
  const thread = await client.beta.threads.create();
  const history = Array.isArray(options.messages) ? options.messages : [];
  for (const m of history) {
    if (!m?.content || m.role === 'system') continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    await client.beta.threads.messages.create(thread.id, {
      role,
      content: String(m.content),
    });
  }
  const userContent =
    options.userMessage ||
    history.filter((m) => m.role === 'user').pop()?.content ||
    '';
  if (!String(userContent).trim()) {
    throw new Error('Empty user message for OpenAI assistant.');
  }
  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: String(userContent),
  });
  const runParams = { assistant_id: assistantId };
  if (options.response_format) {
    runParams.response_format = options.response_format;
  }
  const run = await client.beta.threads.runs.create(thread.id, runParams);
  await pollAssistantRun(client, thread.id, run.id, options.assistantTimeoutMs);
  const listed = await client.beta.threads.messages.list(thread.id, { order: 'desc', limit: 1 });
  const text =
    listed.data[0]?.content?.find((c) => c.type === 'text')?.text?.value?.trim() || '';
  return {
    text,
    raw: listed,
    provider: 'openai-assistant',
    model: assistantId,
    engine: options.engine,
  };
}

/**
 * Chat completion unificado (producción: prompts propios vía Chat Completions).
 */
export async function draloChatCompletion(options = {}) {
  if (!isOpenAIConfigured()) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add the API key from your OpenAI project.',
    );
  }

  const engine = resolveEngine(options);
  const assistantId = getAssistantIdForEngine(engine);
  const preferAssistant =
    options.useAssistant === true ||
    (options.useAssistant !== false && assistantsEnabled() && Boolean(assistantId));

  if (preferAssistant && assistantId) {
    const client = getDraloOpenAI();
    if (client) {
      return assistantCompletion(client, assistantId, { ...options, engine });
    }
  }

  const incoming = Array.isArray(options.messages) ? options.messages : [];
  const taskSystem = String(
    options.system || incoming.find((m) => m.role === 'system')?.content || '',
  ).trim();

  let systemPrompt = coreSystemForEngine(engine);
  if (options.rawSystem && taskSystem) {
    systemPrompt = taskSystem;
  } else if (taskSystem) {
    systemPrompt = `${systemPrompt}\n\n---\n\n${taskSystem}`;
  }

  const turns = incoming.filter((m) => m.role === 'user' || m.role === 'assistant');
  let userMessage = options.userMessage != null ? String(options.userMessage) : '';
  let conversationHistory = turns;
  if (!userMessage.trim() && turns.length) {
    const last = turns[turns.length - 1];
    if (last.role === 'user') {
      userMessage = String(last.content);
      conversationHistory = turns.slice(0, -1);
    }
  }

  const explicitModel =
    typeof options.model === 'string' && options.model.trim() ? options.model.trim() : null;

  const { text, model } = await draloChatCompletionResult({
    systemPrompt,
    userMessage,
    conversationHistory,
    model:
      explicitModel ||
      (engine === DRALO_AI_ENGINE.CAMBRIDGE
        ? process.env.OPENAI_MODEL_CAMBRIDGE?.trim() ||
          process.env.DRALO_OPENAI_MODEL_CAMBRIDGE?.trim() ||
          getDefaultModel()
        : process.env.OPENAI_MODEL_REAL_LIFE?.trim() ||
          process.env.DRALO_OPENAI_MODEL_REAL_LIFE?.trim() ||
          getDefaultModel()),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens,
    response_format: options.response_format,
  });

  return {
    text,
    raw: null,
    provider: 'openai',
    model,
    engine,
  };
}

/** Live B2 speaking examiner turns (skills + exam mode) — DRALO EXAM CAMBRIDGE assistant only. */
export function cambridgeSpeakingExaminerTurn(options = {}) {
  return cambridgeViaAssistantOrChat({
    ...options,
    requireAssistant: true,
    assistantTimeoutMs: options.assistantTimeoutMs ?? 90000,
  });
}

/** B2 speaking session feedback (skills + exam mode) — DRALO EXAM CAMBRIDGE assistant only. */
export function cambridgeSpeakingFeedbackCompletion(options = {}) {
  return cambridgeViaAssistantOrChat({
    ...options,
    requireAssistant: true,
    assistantTimeoutMs: options.assistantTimeoutMs ?? 120000,
  });
}

/** Writing, speaking feedback, answer justify, etc. — uses DRALO EXAM CAMBRIDGE assistant when configured. */
export function cambridgeChatCompletion(options = {}) {
  return cambridgeViaAssistantOrChat(options);
}

/** Generación/regeneración de exámenes Levels (timeout largo). */
export async function cambridgeExamGenerationCompletion(options = {}) {
  return cambridgeViaAssistantOrChat({
    ...options,
    assistantTimeoutMs: options.assistantTimeoutMs ?? 300000,
  });
}

export function realLifeChatCompletion(options = {}) {
  return draloChatCompletion({ ...options, engine: DRALO_AI_ENGINE.REAL_LIFE, useAssistant: false });
}

/**
 * Streaming para el motor Real-Life (Chat Completions). Construye el mismo system prompt
 * que realLifeChatCompletion y devuelve el stream de OpenAI para consumo incremental.
 */
export function realLifeChatCompletionStream(options = {}) {
  const incoming = Array.isArray(options.messages) ? options.messages : [];
  const taskSystem = String(
    options.system || incoming.find((m) => m.role === 'system')?.content || '',
  ).trim();

  let systemPrompt = realLifeCoachPrompt;
  if (options.rawSystem && taskSystem) {
    systemPrompt = taskSystem;
  } else if (taskSystem) {
    systemPrompt = `${systemPrompt}\n\n---\n\n${taskSystem}`;
  }

  const turns = incoming.filter((m) => m.role === 'user' || m.role === 'assistant');
  let userMessage = options.userMessage != null ? String(options.userMessage) : '';
  let conversationHistory = turns;
  if (!userMessage.trim() && turns.length) {
    const last = turns[turns.length - 1];
    if (last.role === 'user') {
      userMessage = String(last.content);
      conversationHistory = turns.slice(0, -1);
    }
  }

  const explicitModel =
    typeof options.model === 'string' && options.model.trim() ? options.model.trim() : null;

  return draloChatCompletionStreamCore({
    systemPrompt,
    userMessage,
    conversationHistory,
    model:
      explicitModel ||
      process.env.OPENAI_MODEL_REAL_LIFE?.trim() ||
      process.env.DRALO_OPENAI_MODEL_REAL_LIFE?.trim() ||
      getDefaultModel(),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens,
  });
}
