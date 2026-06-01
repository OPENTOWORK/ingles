import OpenAI from 'openai';

/**
 * Motor central OpenAI (Chat Completions).
 * Producción: solo API + prompts propios. Los Assistants/GPT clonados son opcionales en laboratorio.
 */

export function getDefaultModel() {
  return (
    process.env.DRALO_OPENAI_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    'gpt-4o'
  );
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** @deprecated alias */
export function isDraloOpenAIConfigured() {
  return isOpenAIConfigured();
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function normalizeHistory(conversationHistory = []) {
  return (Array.isArray(conversationHistory) ? conversationHistory : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content != null)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

/**
 * @param {object} options
 * @param {string} options.systemPrompt
 * @param {string} [options.userMessage]
 * @param {Array<{role:'user'|'assistant',content:string}>} [options.conversationHistory]
 * @param {Array<{role:string,content:string}>} [options.messages] — compat legacy
 * @param {string} [options.model]
 * @param {number} [options.temperature]
 * @param {number} [options.max_tokens]
 * @param {object} [options.response_format]
 * @returns {Promise<string>}
 */
export async function draloChatCompletion({
  systemPrompt,
  userMessage,
  conversationHistory = [],
  messages,
  model = getDefaultModel(),
  temperature = 0.3,
  max_tokens,
  response_format,
}) {
  if (!isOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const client = getClient();
  let history = normalizeHistory(conversationHistory);
  let userContent = userMessage != null ? String(userMessage) : '';

  if (Array.isArray(messages) && messages.length) {
    const nonSystem = messages.filter((m) => m?.role !== 'system');
    const systemFromMessages = messages.find((m) => m?.role === 'system')?.content;
    if (!systemPrompt && systemFromMessages) {
      systemPrompt = String(systemFromMessages);
    }
    const turns = nonSystem.filter((m) => m.role === 'user' || m.role === 'assistant');
    if (turns.length) {
      const last = turns[turns.length - 1];
      if (last.role === 'user' && !userContent.trim()) {
        userContent = String(last.content);
        history = normalizeHistory(turns.slice(0, -1));
      } else {
        history = normalizeHistory(turns);
      }
    }
  }

  if (!String(systemPrompt || '').trim()) {
    throw new Error('systemPrompt is required');
  }
  if (!userContent.trim()) {
    throw new Error('userMessage is required');
  }

  const chatMessages = [
    { role: 'system', content: String(systemPrompt).trim() },
    ...history,
    { role: 'user', content: userContent.trim() },
  ];

  const params = {
    model,
    temperature,
    messages: chatMessages,
  };
  if (max_tokens != null) params.max_tokens = max_tokens;
  if (response_format) params.response_format = response_format;

  const response = await client.chat.completions.create(params);
  return response.choices?.[0]?.message?.content?.trim() || '';
}

/** Misma llamada con metadatos (compatibilidad con código legacy). */
export async function draloChatCompletionResult(options = {}) {
  const text = await draloChatCompletion(options);
  return {
    text,
    raw: null,
    provider: 'openai',
    model: options.model || getDefaultModel(),
  };
}
