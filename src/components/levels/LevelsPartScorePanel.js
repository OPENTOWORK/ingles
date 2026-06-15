'use client';

/**
 * @param {{ correctCount: number, totalSlots: number, passingCount: number, lang?: 'es' | 'en', variant?: 'default' | 'speaking' | 'practice' }} props
 */
export default function LevelsPartScorePanel({
  correctCount,
  totalSlots,
  passingCount,
  lang = 'es',
  variant = 'default',
}) {
  if (!totalSlots || totalSlots < 1) return null;

  const en = lang === 'en';

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
