import { draloChatCompletion, getFastModel } from '@/lib/ai/draloAiEngine';
import { getSpeakingB2Examiner } from '../domain/question-bank/sp-ex001-part1.js';
import {
  SPEAKING_B2_FOLLOW_UP_SYSTEM,
  buildSpeakingB2FollowUpMessage,
  readSpeakingB2FollowUpMove,
} from '../domain/contextual-follow-up.js';

const FOLLOW_UP_TIMEOUT_MS = Number(process.env.SPEAKING_B2_FOLLOW_UP_TIMEOUT_MS || 2800);

export function speakingB2ContextualFollowUpsEnabled(env = process.env) {
  const flag = String(env.SPEAKING_B2_CONTEXTUAL_FOLLOW_UPS || '').trim().toLowerCase();
  if (['0', 'false', 'off', 'no'].includes(flag)) return false;
  return Boolean(env.OPENAI_API_KEY?.trim());
}

function completeWithOpenAI({ system, user }) {
  return draloChatCompletion({
    systemPrompt: system,
    userMessage: user,
    model: process.env.SPEAKING_B2_FOLLOW_UP_MODEL?.trim() || getFastModel(),
    temperature: 0.6,
    max_tokens: 80,
    response_format: { type: 'json_object' },
  });
}

/**
 * The examiner model's next move for `context` (see speakingB2FollowUpContext), or null
 * when the script should decide: feature off, no context, timeout, error or a rejected line.
 */
export async function composeSpeakingB2ExaminerMove(
  context,
  {
    complete = completeWithOpenAI,
    timeoutMs = FOLLOW_UP_TIMEOUT_MS,
    enabled = speakingB2ContextualFollowUpsEnabled(),
  } = {},
) {
  if (!context || !enabled) return null;
  const started = Date.now();
  let timer;
  try {
    const raw = await Promise.race([
      complete({
        system: SPEAKING_B2_FOLLOW_UP_SYSTEM,
        user: buildSpeakingB2FollowUpMessage({
          ...context,
          examinerName: getSpeakingB2Examiner(context.examinerId).name,
        }),
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
      }),
    ]);
    const move = readSpeakingB2FollowUpMove(raw, context);
    console.info('[speaking-b2/follow-up]', {
      action: move.action,
      reason: move.reason,
      elapsedMs: Date.now() - started,
    });
    return move.action === 'invalid' ? null : move;
  } catch (error) {
    console.warn('[speaking-b2/follow-up] script fallback', {
      reason: error?.message || 'failed',
      elapsedMs: Date.now() - started,
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
