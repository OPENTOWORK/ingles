import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { callExplainMistakeFromDb } from '@/lib/ai/draloAiClient';

/**
 * Explain Mistake — V1 uses pre-stored explanations (no OpenAI).
 * @param {Record<string, unknown>} body
 * @returns {Promise<string>}
 */
export async function postLevelsAnswerJustification(body) {
  const result = await callExplainMistakeFromDb({
    questionId: body.questionId || body.preguntaId,
    wrongAnswer: body.userChoiceText || body.wrongAnswer,
    userAnswer: body.userChoiceText,
  });

  if (!result?.found) {
    return (
      result?.message ||
      'Explanation coming soon. For now, review the correct answer and try again.'
    );
  }

  const parts = [result.explanation, result.shortExplanation, result.example].filter(Boolean);
  return parts.join('\n\n') || '—';
}

/**
 * @deprecated Use postLevelsAnswerJustification — kept for imports that expect fetch shape.
 */
export async function postLevelsAnswerJustificationLegacy(body) {
  const res = await fetch(buildClientApiUrl('/api/dralo-ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      action: 'explain_mistake_from_db',
      questionId: body.questionId || body.preguntaId,
      wrongAnswer: body.userChoiceText,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.error === true) {
    throw new Error(data.message || 'Could not load explanation.');
  }
  const result = data.result || {};
  if (!result.found) {
    return result.message || 'Explanation coming soon. For now, review the correct answer and try again.';
  }
  return result.explanation || result.shortExplanation || '—';
}
