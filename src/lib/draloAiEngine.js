import OpenAI from 'openai';
import { DRALO_AI_CORE_SYSTEM, mergeDraloSystem } from '@/lib/draloAiSystemPrompt';

/** Modelo GPT (mismo motor que el GPT personalizado DRALO AI en ChatGPT). */
export function getDraloModel() {
  return (
    process.env.DRALO_OPENAI_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    'gpt-4o'
  );
}

export function getDraloOpenAI() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function isDraloOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** ID del Assistant de OpenAI si clonaste el GPT "DRALO AI" en platform.openai.com */
export function getDraloAssistantId() {
  return (
    process.env.OPENAI_ASSISTANT_ID?.trim() ||
    process.env.DRALO_OPENAI_ASSISTANT_ID?.trim() ||
    ''
  );
}

export { mergeDraloSystem, DRALO_AI_CORE_SYSTEM };

async function pollAssistantRun(client, threadId, runId, maxMs = 120000) {
  const start = Date.now();
  let run = await client.beta.threads.runs.retrieve(threadId, runId);
  while (run.status === 'queued' || run.status === 'in_progress') {
    if (Date.now() - start > maxMs) {
      throw new Error('DRALO AI assistant timeout.');
    }
    await new Promise((r) => setTimeout(r, 600));
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }
  if (run.status !== 'completed') {
    throw new Error(`DRALO AI assistant run failed: ${run.status}`);
  }
  return run;
}

async function draloAssistantCompletion(client, assistantId, options) {
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
    throw new Error('Empty user message for DRALO AI assistant.');
  }
  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: String(userContent),
  });
  const run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });
  await pollAssistantRun(client, thread.id, run.id);
  const listed = await client.beta.threads.messages.list(thread.id, { order: 'desc', limit: 1 });
  const text =
    listed.data[0]?.content?.find((c) => c.type === 'text')?.text?.value?.trim() || '';
  return {
    text,
    raw: listed,
    provider: 'openai-assistant',
    model: assistantId,
  };
}

/**
 * Chat completion unificado con motor DRALO AI (GPT).
 * Si OPENAI_ASSISTANT_ID está definido, usa el Assistant clonado del GPT.
 */
export async function draloChatCompletion(options = {}) {
  const client = getDraloOpenAI();
  if (!client) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add the same API key you use for the DRALO AI GPT in ChatGPT.',
    );
  }

  const assistantId = getDraloAssistantId();
  if (assistantId && options.useAssistant !== false) {
    return draloAssistantCompletion(client, assistantId, options);
  }

  const incoming = Array.isArray(options.messages) ? options.messages : [];
  const taskSystem =
    options.system ||
    incoming.find((m) => m.role === 'system')?.content ||
    '';
  const systemContent = mergeDraloSystem(taskSystem);
  const chatMessages = [
    { role: 'system', content: systemContent },
    ...incoming.filter((m) => m.role !== 'system'),
  ];

  if (options.userMessage) {
    chatMessages.push({ role: 'user', content: String(options.userMessage) });
  }

  const params = {
    model: getDraloModel(),
    messages: chatMessages,
    temperature: options.temperature ?? 0.7,
  };
  if (options.max_tokens != null) params.max_tokens = options.max_tokens;
  if (options.response_format) params.response_format = options.response_format;
  if (options.top_p != null) params.top_p = options.top_p;

  const completion = await client.chat.completions.create(params);
  const text = (completion.choices?.[0]?.message?.content || '').trim();

  return {
    text,
    raw: completion,
    provider: 'openai',
    model: getDraloModel(),
  };
}
