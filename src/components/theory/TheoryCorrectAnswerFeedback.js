'use client';

/**
 * Muestra el resultado y la respuesta correcta tras comprobar un ejercicio de teoría.
 */
export default function TheoryCorrectAnswerFeedback({
  isCorrect,
  answer,
  label = 'Correct answer',
  explanation = '',
}) {
  if (!answer && !explanation) return null;

  return (
    <div
      className={`theory-correct-answer${isCorrect ? ' theory-correct-answer--ok' : ' theory-correct-answer--wrong'}`}
      role="status"
    >
      <p className="theory-correct-answer__status">{isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
      {answer ? (
        <p className="theory-correct-answer__body">
          <span className="theory-correct-answer__label">{label}:</span>{' '}
          <strong className="theory-correct-answer__text">{answer}</strong>
        </p>
      ) : null}
      {explanation ? <p className="theory-correct-answer__hint">{explanation}</p> : null}
    </div>
  );
}
