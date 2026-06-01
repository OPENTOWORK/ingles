import { draloChatCompletion } from '@/lib/ai/draloAiEngine';
import { realLifeCoachPrompt } from '@/lib/ai/prompts/realLifeCoachPrompt';

export const REAL_LIFE_TASK_TYPES = [
  'role_play',
  'travel',
  'work',
  'sales',
  'customer_service',
  'job_interview',
  'whatsapp_message',
  'real_life_email',
  'social_conversation',
];

const CONVERSATIONAL_TASKS = new Set(['role_play', 'social_conversation', 'job_interview']);

export function isValidRealLifeTaskType(taskType) {
  return REAL_LIFE_TASK_TYPES.includes(String(taskType || ''));
}

export async function runRealLifeCoach({
  taskType,
  level = 'B1',
  situation = '',
  userInput,
  conversationHistory = [],
  max_tokens,
}) {
  if (!isValidRealLifeTaskType(taskType)) {
    throw new Error(`Invalid realLife taskType: ${taskType}`);
  }

  const history = Array.isArray(conversationHistory) ? conversationHistory : [];
  const studentTurns = history.filter((m) => m.role === 'user').length;

  const rolePlayHint =
    taskType === 'role_play'
      ? studentTurns === 0
        ? `
IMPORTANT: First turn of role play. Reply ONLY with your first in-character line (1–3 sentences, realistic, not theatrical).
No meta setup, no "---", no feedback yet. For a difficult sales client use a polite-but-busy tone, e.g. "Hi, I'm quite busy, so please be quick. What is this about?" — not "What do you want?"
Then stop and wait for the student.
`
        : studentTurns < 4
          ? `
IMPORTANT: Role play in progress (${studentTurns} student message(s) so far). Stay in character only — no feedback yet unless the user asked for it.
`
          : `
IMPORTANT: The student has contributed enough turns. You may pause the role play and give brief, practical feedback if appropriate, or continue in character if the flow still needs practice.
`
      : '';

  const userMessage = `
Assistant mode: DRALO REAL-LIFE ENGLISH COACH
Section: DRALO AI
Task type: ${taskType}
Target level: ${level}
Situation: ${String(situation || '').trim() || 'general'}
${rolePlayHint}

User message:
${String(userInput || '').trim()}
`;

  return draloChatCompletion({
    systemPrompt: realLifeCoachPrompt,
    userMessage,
    conversationHistory: history,
    temperature: taskType === 'role_play' && studentTurns === 0 ? 0.65 : CONVERSATIONAL_TASKS.has(taskType) ? 0.7 : 0.4,
    max_tokens,
  });
}
