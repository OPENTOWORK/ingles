'use client';

/**
 * Positive Reinforcement First (Doc 02 R21, Doc 04 §3).
 *
 * The strengths shown here are the ones Phase 6 selected from evidence. The UI
 * neither invents them nor pads the list: when the payload carries none, this
 * renders nothing at all rather than manufacturing praise, and on a phone it stays
 * a short block so it cannot swallow the first viewport.
 */
export default function WritingOpeningStrengths({ strengths }) {
  if (!strengths.length) return null;

  return (
    <section className="writing-strengths" aria-labelledby="writing-strengths-title">
      <p className="levels-exam-split__section-title" id="writing-strengths-title">
        What you did well
      </p>
      <ul className="writing-strengths__list">
        {strengths.map((strength) => (
          <li key={strength.id} className="writing-strengths__item">
            <span className="writing-strengths__marker" aria-hidden="true">
              ★
            </span>
            <span className="writing-strengths__body">
              <strong className="writing-strengths__headline">{strength.headline}</strong>
              <span className="writing-strengths__explanation">{strength.explanation}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
