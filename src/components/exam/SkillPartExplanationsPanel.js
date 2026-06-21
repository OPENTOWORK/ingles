'use client';

import { useState } from 'react';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';

/**
 * Bottom-of-passage feedback block (Part 1 UOE style).
 *
 * @param {object} props
 * @param {Array<{
 *   questionNumber: number,
 *   questionKey: string,
 *   isCorrect?: boolean,
 *   isPartial?: boolean,
 *   verdictLabel?: string,
 *   userAnswer?: string,
 *   correctAnswer?: string,
 *   detail?: string,
 *   scoreLabel?: string,
 * }>} props.entries
 * @param {Record<string, object>} [props.aiHintsByKey]
 * @param {(info: { questionKey: string, questionNumber: number }) => void} [props.onRequestExplanation]
 * @param {string} [props.title]
 */
export default function SkillPartExplanationsPanel({
  entries = [],
  aiHintsByKey = {},
  onRequestExplanation,
  title = 'Explanations',
}) {
  const [openExplanations, setOpenExplanations] = useState({});
  const sorted = [...entries].sort((a, b) => a.questionNumber - b.questionNumber);

  if (!sorted.length) return null;

  const toggleExplanation = (entry) => {
    const isOpen = !!openExplanations[entry.questionKey];
    if (!isOpen && onRequestExplanation) {
      const hint = aiHintsByKey[entry.questionKey];
      if (!hint?.text && !hint?.loading) {
        onRequestExplanation({
          questionKey: entry.questionKey,
          questionNumber: entry.questionNumber,
          ...(entry.group != null ? { group: entry.group } : {}),
        });
      }
    }
    setOpenExplanations((prev) => ({ ...prev, [entry.questionKey]: !isOpen }));
  };

  return (
    <div className="levels-exam-mcq-explanations">
      <p className="levels-exam-mcq-explanations__title">{title}</p>
      {sorted.map((entry) => {
        const isOpen = !!openExplanations[entry.questionKey];
        const isCorrect = entry.isCorrect === true;
        const isPartial = entry.isPartial === true;
        const verdict =
          entry.verdictLabel ||
          (isCorrect ? 'Correct' : isPartial ? 'Partly correct' : 'Incorrect');
        const itemClass = isCorrect
          ? ' levels-exam-mcq-explanations__item--correct'
          : isPartial
            ? ' levels-exam-mcq-explanations__item--partial'
            : ' levels-exam-mcq-explanations__item--incorrect';
        const verdictClass = isCorrect
          ? 'levels-exam-mcq-explanations__verdict levels-exam-mcq-explanations__verdict--correct'
          : isPartial
            ? 'levels-exam-mcq-explanations__verdict levels-exam-mcq-explanations__verdict--partial'
            : 'levels-exam-mcq-explanations__verdict levels-exam-mcq-explanations__verdict--incorrect';

        return (
          <div
            key={`skill-explanation-${entry.questionKey}`}
            className={`levels-exam-mcq-explanations__item${itemClass}`}
          >
            <p className="levels-exam-mcq-explanations__head">
              <span className="levels-exam-mcq-explanations__number">({entry.questionNumber})</span>{' '}
              <span className={verdictClass}>{verdict}</span>
              {entry.scoreLabel ? (
                <span className="levels-exam-mcq-explanations__score"> · {entry.scoreLabel}</span>
              ) : null}
              {entry.userAnswer ? (
                <span>
                  {' — '}
                  Your answer: <strong>{entry.userAnswer}</strong>
                </span>
              ) : null}
              {!isCorrect && entry.correctAnswer ? (
                <span>
                  {' · '}Correct answer: <strong>{entry.correctAnswer}</strong>
                </span>
              ) : null}
              {onRequestExplanation ? (
                <button
                  type="button"
                  className={`levels-exam-mcq-explanations__toggle${
                    isOpen ? ' levels-exam-mcq-explanations__toggle--open' : ''
                  }`}
                  aria-expanded={isOpen}
                  onClick={() => toggleExplanation(entry)}
                >
                  💡 Explanation
                </button>
              ) : null}
            </p>
            {entry.detail ? (
              <p className="levels-exam-mcq-explanations__detail">{entry.detail}</p>
            ) : null}
            {isOpen && aiHintsByKey[entry.questionKey] ? (
              <LevelsAnswerJustification hint={aiHintsByKey[entry.questionKey]} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
