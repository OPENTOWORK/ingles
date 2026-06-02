import { buildClientApiUrl } from '@/utils/clientApiUrl';

/**
 * Cliente browser → POST /api/dralo-ai (nunca expone OPENAI_API_KEY).
 */
export async function callDraloAi({
  action,
  assistantType,
  taskType,
  level,
  situation = '',
  userInput,
  conversationHistory = [],
  mode,
  mission,
  missionTitle,
  scenario,
  objectives,
  character,
  conversation,
  userMessage,
  finish,
  source,
  userText,
  correctedText,
  error,
}) {
  let payload;
  if (action === 'extract_errors') {
    payload = {
      action: 'extract_errors',
      level,
      source,
      userText,
      correctedText,
    };
  } else if (action === 'generate_error_exercises') {
    payload = {
      action: 'generate_error_exercises',
      level,
      error,
    };
  } else if (action === 'speaking_ai') {
    payload = {
      action: 'speaking_ai',
      level,
      mode,
      mission,
      missionTitle,
      scenario,
      objectives,
      character,
      conversation,
      userMessage,
      finish,
    };
  } else {
    payload = {
      assistantType,
      taskType,
      level,
      situation,
      userInput,
      conversationHistory,
    };
  }

  const res = await fetch(buildClientApiUrl('/api/dralo-ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `AI request failed (${res.status})`);
  }
  return data.result;
}
