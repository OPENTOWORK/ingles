'use client';

import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';

/**
 * Structured instant feedback for Listening part practice (after Check).
 */
export default function B2ListeningPracticeFeedback({
  isCorrect,
  correctLabel,
  hint,
  studyTip,
  lang = 'en',
}) {
  const en = lang === 'en';

  return (
    <div className="levels-listening-feedback">
      <p
        className={`levels-listening-feedback__verdict${
          isCorrect ? ' levels-listening-feedback__verdict--correct' : ' levels-listening-feedback__verdict--incorrect'
        }`}
      >
        {isCorrect
          ? en
            ? 'Correct'
            : 'Correcta'
          : en
            ? 'Incorrect'
            : 'Incorrecta'}
      </p>
      {correctLabel ? (
        <p className="levels-listening-feedback__correct">
          <span className="levels-listening-feedback__label">
            {en ? 'Correct answer' : 'Respuesta correcta'}:
          </span>{' '}
          {correctLabel}
        </p>
      ) : null}
      <div className="levels-listening-feedback__explain">
        <p className="levels-listening-feedback__label">
          {en ? 'Why this answer is correct' : 'Por qué es correcta'}
        </p>
        <LevelsAnswerJustification hint={hint} />
      </div>
      {studyTip ? (
        <p className="levels-listening-feedback__tip">
          <span className="levels-listening-feedback__label">
            {en ? 'Study tip' : 'Consejo de estudio'}:
          </span>{' '}
          {studyTip}
        </p>
      ) : null}
    </div>
  );
}
