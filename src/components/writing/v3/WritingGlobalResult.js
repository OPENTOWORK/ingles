'use client';

/**
 * The result strip (Doc 04 §2).
 *
 * Discreet on purpose: four marks out of five, one raw total out of twenty, and a
 * disclaimer. There is no pass, no fail, no pass mark, no CEFR estimate, no
 * Cambridge English Scale number and no readiness judgement, because a single task
 * cannot support any of them — and because the writing below is what the learner
 * came for.
 */
export default function WritingGlobalResult({ result }) {
  return (
    <section className="writing-result" aria-labelledby="writing-result-title">
      <p className="levels-exam-split__section-title" id="writing-result-title">
        Cambridge criteria
      </p>
      <div className="writing-result__row">
        <ul className="writing-result__criteria">
          {result.criteria.map((criterion) => (
            <li key={criterion.key} className="writing-result__criterion">
              <span className="writing-result__criterion-label">{criterion.label}</span>
              <span className="writing-result__criterion-mark">
                <span className="writing-result__sr-only">Mark </span>
                {criterion.mark}
                <span aria-hidden="true">/{criterion.max}</span>
                <span className="writing-result__sr-only"> out of {criterion.max}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="writing-result__total">
          <span className="writing-result__total-label">Total</span>
          <span className="writing-result__total-value">
            {result.raw_total}
            <span aria-hidden="true">/{result.max_total}</span>
            <span className="writing-result__sr-only"> out of {result.max_total}</span>
          </span>
        </p>
      </div>
      <p className="writing-result__disclaimer">{result.disclaimer}</p>
    </section>
  );
}
