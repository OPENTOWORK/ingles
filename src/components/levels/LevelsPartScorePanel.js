'use client';

/**
 * @param {{ correctCount: number, totalSlots: number, passingCount: number, lang?: 'es' | 'en' }} props
 */
export default function LevelsPartScorePanel({ correctCount, totalSlots, passingCount, lang = 'es' }) {
  if (!totalSlots || totalSlots < 1) return null;

  const en = lang === 'en';

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
