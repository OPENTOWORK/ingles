'use client';

/**
 * @param {{
 *   passed: boolean,
 *   correct: number,
 *   total: number,
 *   passing: number,
 *   error?: string | null,
 *   lang?: 'es' | 'en',
 * }} props
 */
export default function LevelsPartFinishBanner({ passed, correct, total, passing, error = null, lang = 'es' }) {
  const en = lang === 'en';

  if (error) {
    return (
      <div role="alert" className="levels-b2-result levels-b2-result--error">
        {en ? `Could not save your score: ${error}` : `No se pudo guardar la puntuación: ${error}`}
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`levels-b2-result${passed ? ' levels-b2-result--passed' : ' levels-b2-result--failed'}`}
    >
      <p className="levels-b2-result__title">
        {passed
          ? en
            ? 'Part passed'
            : 'Parte aprobada'
          : en
            ? 'Part not passed'
            : 'Parte no aprobada'}
      </p>
      <p className="levels-b2-result__detail">
        {en
          ? `Result: ${correct} / ${total} correct (you need ${passing} to pass)`
          : `Resultado: ${correct} / ${total} correctas (necesitas ${passing} para aprobar)`}
      </p>
    </div>
  );
}
