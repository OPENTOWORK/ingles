'use client';

import { useState } from 'react';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { getRuoeAnswerContext } from '@/utils/ruoeAnswerReview';
import { landingFont } from '@/components/home/landing/landingFont';
import reviewStyles from './RuoeAnswerReview.module.css';
import { formatEnglishAnswerForDisplay } from '@/utils/b2ExamPaperShared';

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
  ruoeReview,
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
      {!ruoeReview && <p className="levels-exam-mcq-explanations__title">{title}</p>}
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

        if (ruoeReview) {
          const { part, passage } = ruoeReview;
          const context = getRuoeAnswerContext(part, passage, entry.questionNumber);
          const answers = formatEnglishAnswerForDisplay(entry.correctAnswer).split(' · ');
          const answer = answers[0];
          return (
            <article key={entry.questionKey} className={`${reviewStyles.card} ${landingFont.variable}`}>
              <h3 className={reviewStyles.heading}>Question {entry.questionNumber}</h3>
              <p className={reviewStyles.answerLabel}>
                <span className={reviewStyles.tick} aria-hidden="true">✓</span>
                Correct answer
              </p>
              {part === 1 && entry.group?.options?.length ? (
                <ul className={reviewStyles.options}>
                  {entry.group.options.map((option) => (
                    <li
                      key={option.id}
                      className={option.correcta ? reviewStyles.correct : reviewStyles.distractor}
                    >
                      {option.formattedText || option.respuesta || option.optionText}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={reviewStyles.context}>
                  {context.sentence1 && <p>{context.sentence1}</p>}
                  {context.keyword && part === 4 && <p className={reviewStyles.keyword}>Key word · {context.keyword}</p>}
                  <p>
                    {part === 3 && context.keyword && <>{context.keyword} <span aria-hidden="true">→</span>{' '}</>}
                    {context.sentence2Before}
                    <strong className={reviewStyles.correct}>{answer}</strong>
                    {context.sentence2After}
                  </p>
                  {answers.length > 1 && <p className={reviewStyles.meta}>Also accepted: {answers.slice(1).join(' · ')}</p>}
                </div>
              )}
              {onRequestExplanation && (
                <button
                  type="button"
                  className={reviewStyles.toggle}
                  aria-expanded={isOpen}
                  onClick={() => toggleExplanation(entry)}
                >
                  {isOpen ? 'Hide explanation' : 'Why it’s correct'}
                </button>
              )}
              {isOpen && <LevelsAnswerJustification hint={aiHintsByKey[entry.questionKey]} ruoeReview />}
              {(!isCorrect || entry.scoreLabel) && (
                <p className={reviewStyles.meta}>
                  {verdict}{entry.scoreLabel && ` · ${entry.scoreLabel}`}
                  {entry.userAnswer && ` · Your answer: ${entry.userAnswer}`}
                </p>
              )}
              {entry.detail && <p className={reviewStyles.meta}>{entry.detail}</p>}
            </article>
          );
        }

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
                  {' · '}Correct answer:{' '}
                  <strong>{formatEnglishAnswerForDisplay(entry.correctAnswer)}</strong>
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
