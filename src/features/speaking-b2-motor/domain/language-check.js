/**
 * Conservative language check for short B2 Part 1 answers.
 * Reject only clearly non-English answers; "I work" must pass.
 */
export function assessB2Part1AnswerLanguage(answer = '') {
  const normalized = String(answer || '')
    .toLowerCase()
    .replace(/[¿¡]/g, ' ')
    .replace(/[^\p{L}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 'uncertain';

  const clearlySpanish =
    /[áéíóúüñ]/u.test(normalized) ||
    /\b(soy|estoy|tengo|trabajo|estudio|vivo|gusta|gustan|encanta|disfruto|juego|hago|voy|porque|pero|también|español|motos?|deportes?|fútbol)\b/u.test(
      normalized,
    ) ||
    /\b(me llamo|mi nombre es|soy de|vivo en|me gusta|no me|yo trabajo|yo estudio)\b/u.test(
      normalized,
    );
  if (clearlySpanish) return 'non-english';

  if (
    /\b(i|i'm|i've|i'd|my|mine|me|we|our|the|a|an|am|is|are|was|were|work|study|live|like|love|enjoy|play|go|do|have|from|because|usually|sometimes|football|sport|sports)\b/i.test(
      normalized,
    )
  ) {
    return 'english';
  }

  return 'uncertain';
}
