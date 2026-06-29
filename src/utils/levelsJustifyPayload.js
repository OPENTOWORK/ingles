/**
 * Resolve DB row ids used as cache keys in levels_justificaciones.
 * @param {Array<{ id?: string, respuesta_texto?: string }>} respuestasAbiertas
 * @param {Array<{ id?: string, respuesta?: string, correcta?: boolean }>} respuestas
 * @param {number|string} questionNumber
 * @returns {{ respuestaId?: string, respuestaAbiertaId?: string }}
 */
export function resolveCorrectAnswerRowIds(
  respuestasAbiertas = [],
  respuestas = [],
  questionNumber,
) {
  const qn = Number(questionNumber);
  if (!Number.isFinite(qn)) return {};

  for (const row of respuestasAbiertas) {
    const text = String(row.respuesta_texto || '').trim();
    let match = text.match(/(?:^|[^\d])(\d{1,2})\s+(.+)$/);
    if (!match) match = text.match(/^(\d{1,2})[\.\)]\s*(.+)$/);
    if (!match) match = text.match(/^(\d{1,2})([A-Za-z].+)$/);
    if (match && Number(match[1]) === qn && row.id) {
      return { respuestaAbiertaId: String(row.id) };
    }
  }

  for (const row of respuestas) {
    if (row.correcta !== true) continue;
    const text = String(row.respuesta || '').trim();
    const match = text.match(/^(\d{1,2})\s+(.+)$/i);
    if (match && Number(match[1]) === qn && row.id) {
      return { respuestaId: String(row.id) };
    }
  }

  return {};
}

/**
 * @param {object} params
 * @returns {Record<string, unknown>}
 */
export function buildLevelsJustificationPayload({
  preguntaId,
  respuestaId,
  respuestaAbiertaId,
  questionNumber,
  level,
  partLabel,
  partNumber,
  exerciseType,
  style,
  questionLabel,
  questionText,
  contextSnippet,
  answerOptions,
  answersFromDatabase,
  correctChoiceText,
  userChoiceText,
  isCorrect,
}) {
  const itemNum =
    questionNumber != null && questionNumber !== '' ? Number(questionNumber) : null;

  return {
    preguntaId: preguntaId || undefined,
    respuestaId: respuestaId || undefined,
    respuestaAbiertaId: respuestaAbiertaId || undefined,
    questionNumber: Number.isFinite(itemNum) ? itemNum : undefined,
    level: level ? String(level).toUpperCase() : undefined,
    partLabel: partLabel || undefined,
    partNumber: partNumber != null ? Number(partNumber) : undefined,
    exerciseType: exerciseType || style || undefined,
    questionLabel: questionLabel || undefined,
    questionText: questionText || contextSnippet || undefined,
    contextSnippet: contextSnippet || undefined,
    answerOptions: answerOptions || answersFromDatabase || undefined,
    correctChoiceText: correctChoiceText || undefined,
    userChoiceText: userChoiceText || undefined,
    isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
  };
}
