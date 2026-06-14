import { buildClientApiUrl } from '@/utils/clientApiUrl';

/** Structured error from /api/dralo-ai (spec format). */
export class DraloAiError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {Record<string, unknown>} [extra]
   */
  constructor(code, message, extra = {}) {
    super(message);
    this.name = 'DraloAiError';
    this.code = code;
    this.extra = extra;
  }
}

/**
 * Cliente browser → POST /api/dralo-ai (nunca expone OPENAI_API_KEY).
 */
export async function callDraloAi(payload) {
  const res = await fetch(buildClientApiUrl('/api/dralo-ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (data?.error === true || (!res.ok && !data?.success)) {
    throw new DraloAiError(
      data.code || 'AI_ERROR',
      data.message || data.error || `AI request failed (${res.status})`,
      data,
    );
  }

  if (!data.success) {
    throw new DraloAiError('AI_ERROR', data.error || `AI request failed (${res.status})`, data);
  }

  return data.result;
}

/** Exam writing correction via canonical action. */
export async function callExamWritingCorrection({
  essay,
  level = 'b2',
  wordMin,
  wordMax,
  taskContext,
  structuredExamContext,
}) {
  return callDraloAi({
    action: 'exam_writing_correction',
    essay,
    level,
    wordMin,
    wordMax,
    taskContext,
    structuredExamContext,
  });
}

/** Explain mistake from DB — no OpenAI. */
export async function callExplainMistakeFromDb({ questionId, wrongAnswer, userAnswer }) {
  return callDraloAi({
    action: 'explain_mistake_from_db',
    questionId,
    wrongAnswer,
    userAnswer,
  });
}

/** Fetch visible alpha daily limits for writing + speaking exam (students + teachers). */
export async function fetchAiUsageStatus() {
  const res = await fetch(buildClientApiUrl('/api/ai/usage-status'), {
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export function isDailyLimitError(err) {
  return (
    err instanceof DraloAiError &&
    (err.code === 'DAILY_LIMIT_REACHED' || err.code === 'LIMIT_CHECK_FAILED')
  );
}

export function dailyLimitMessage(err, fallback) {
  if (err instanceof DraloAiError && err.message) return err.message;
  return fallback;
}
