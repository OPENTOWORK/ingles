import { buildClientApiUrl } from '@/utils/clientApiUrl';

const FALLBACK_UNAVAILABLE = 'Explanation temporarily unavailable.';

/**
 * Fetch or generate a correct-answer explanation (cached in levels_justificaciones).
 * @param {Record<string, unknown>} body
 * @returns {Promise<string>}
 */
export async function postLevelsAnswerJustification(body) {
  const res = await fetch(buildClientApiUrl('/api/dralo-ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      action: 'explain_correct_answer',
      preguntaId: body.preguntaId || body.pregunta_id || body.questionId,
      respuestaId: body.respuestaId || body.respuesta_id,
      respuestaAbiertaId: body.respuestaAbiertaId || body.respuesta_abierta_id,
      questionNumber: body.questionNumber,
      level: body.level,
      partLabel: body.partLabel,
      partNumber: body.partNumber,
      exerciseType: body.exerciseType || body.style,
      style: body.style,
      questionLabel: body.questionLabel,
      questionText: body.questionText || body.contextSnippet,
      contextSnippet: body.contextSnippet,
      answerOptions: body.answerOptions || body.answersFromDatabase,
      answersFromDatabase: body.answersFromDatabase,
      correctChoiceText: body.correctChoiceText,
      userChoiceText: body.userChoiceText,
      isCorrect: body.isCorrect,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (data?.error === true) {
    if (data.code === 'DAILY_LIMIT_REACHED') {
      throw new Error(data.message || FALLBACK_UNAVAILABLE);
    }
    return FALLBACK_UNAVAILABLE;
  }

  const result = data?.result || {};
  if (result.found && result.explanation) {
    return String(result.explanation).trim();
  }

  return result.message || FALLBACK_UNAVAILABLE;
}

/**
 * @deprecated Legacy explain_mistake_from_db client.
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
    return result.message || FALLBACK_UNAVAILABLE;
  }
  return result.explanation || result.shortExplanation || '—';
}
