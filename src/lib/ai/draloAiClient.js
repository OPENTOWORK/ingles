import { buildClientApiUrl } from '@/utils/clientApiUrl';

/**
 * Cliente browser → POST /api/dralo-ai (nunca expone OPENAI_API_KEY).
 */
export async function callDraloAi({
  assistantType,
  taskType,
  level,
  situation = '',
  userInput,
  conversationHistory = [],
}) {
  const res = await fetch(buildClientApiUrl('/api/dralo-ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      assistantType,
      taskType,
      level,
      situation,
      userInput,
      conversationHistory,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `AI request failed (${res.status})`);
  }
  return data.result;
}
