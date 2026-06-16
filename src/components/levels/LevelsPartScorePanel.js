'use client';

/**
 * @param {{
 *   scoringVersion?: number,
 *   correctCount?: number,
 *   totalSlots?: number,
 *   passingCount?: number,
 *   questionsAnswered?: number,
 *   totalQuestions?: number,
 *   correctItems?: number,
 *   pointsEarned?: number,
 *   maxPoints?: number,
 *   accuracyByPoints?: number,
 *   completionPercentage?: number,
 *   lang?: 'es' | 'en',
 *   variant?: 'default' | 'speaking' | 'practice',
 * }} props
 */
export default function LevelsPartScorePanel({
  scoringVersion = 1,
  correctCount = 0,
  totalSlots = 0,
  passingCount = 0,
  questionsAnswered = 0,
  totalQuestions = 0,
  correctItems = 0,
  pointsEarned = 0,
  maxPoints = 0,
  accuracyByPoints = 0,
  lang = 'es',
  variant = 'default',
}) {
  const en = lang === 'en';
  const isV2 = scoringVersion === 2 && maxPoints > 0;

  if (variant === 'speaking') {
    return (
      <div className="levels-b2-score">
        <p className="levels-b2-score__main">
          {en ? 'Typed speaking practice' : 'Práctica de speaking por escrito'}
        </p>
        <p className="levels-b2-score__hint">
          {en
            ? 'Assessed on Fluency, Grammar and Vocabulary, Pronunciation, Interactive Communication, and Global Achievement — not on “correct answers”.'
            : 'Se valora Fluidez, Gramática y vocabulario, Pronunciación, Comunicación interactiva y Logro global — no por “respuestas correctas”.'}
        </p>
      </div>
    );
  }

  if (isV2) {
    const accuracyLabel = Number.isFinite(accuracyByPoints)
      ? `${Math.round(accuracyByPoints * 10) / 10}%`
      : '0%';
    return (
      <div className="levels-b2-score levels-b2-score--v2">
        <p className="levels-b2-score__main">
          {en
            ? `Part score: ${pointsEarned} / ${maxPoints}`
            : `Puntuación de la parte: ${pointsEarned} / ${maxPoints}`}
        </p>
        <p className="levels-b2-score__hint">
          {en ? 'Questions answered' : 'Preguntas respondidas'}: {questionsAnswered}/{totalQuestions || totalSlots}
          {' · '}
          {en ? 'Fully correct items' : 'Ítems totalmente correctos'}: {correctItems}/{totalQuestions || totalSlots}
          {' · '}
          {en ? 'Accuracy' : 'Precisión'}: {accuracyLabel}
        </p>
      </div>
    );
  }

  if (!totalSlots || totalSlots < 1) return null;

  if (variant === 'practice') {
    return (
      <div className="levels-b2-score levels-b2-score--practice">
        <p className="levels-b2-score__main">
          {en
            ? `Practice progress: ${correctCount} / ${totalSlots}`
            : `Progreso de práctica: ${correctCount} / ${totalSlots}`}
        </p>
        <p className="levels-b2-score__hint">
          {en
            ? `You need at least ${passingCount} correct answers to pass this part.`
            : `Necesitas al menos ${passingCount} respuestas correctas para aprobar esta parte.`}
        </p>
      </div>
    );
  }

  return (
    <div className="levels-b2-score">
      <p className="levels-b2-score__main">
        {en
          ? `Your score: ${correctCount} / ${totalSlots}`
          : `Tu puntuación: ${correctCount} / ${totalSlots}`}
      </p>
      <p className="levels-b2-score__hint">
        {en
          ? `You need at least ${passingCount} correct answers to pass this part.`
          : `Necesitas al menos ${passingCount} respuestas correctas para aprobar esta parte.`}
      </p>
    </div>
  );
}

/** Build props for LevelsPartScorePanel from computeB2PartScoreMetrics output. */
export function buildLevelsPartScorePanelProps(metrics, { passingCount } = {}) {
  if (!metrics) return null;
  return {
    scoringVersion: metrics.scoringVersion ?? 1,
    correctCount: metrics.correctCount ?? 0,
    totalSlots: metrics.totalSlots ?? 0,
    passingCount: passingCount ?? metrics.passingCount ?? 0,
    questionsAnswered: metrics.questionsAnswered ?? 0,
    totalQuestions: metrics.totalQuestions ?? metrics.totalSlots ?? 0,
    correctItems: metrics.correctItems ?? metrics.correctCount ?? 0,
    pointsEarned: metrics.pointsEarned ?? metrics.correctCount ?? 0,
    maxPoints: metrics.maxPoints ?? metrics.totalSlots ?? 0,
    accuracyByPoints: metrics.accuracyByPoints ?? 0,
    completionPercentage: metrics.completionPercentage ?? 0,
  };
}
