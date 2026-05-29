'use client';

import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { parseB2KeyWordTransformItems } from '@/utils/b2ExamTextBlocks';

/**
 * Parte 4 — Key Word Transformations: hueco interactivo en la segunda frase (estilo Part 1).
 *
 * @param {{
 *   text?: string,
 *   activeQuestionNumbers?: number[],
 *   getQuestionKey: (questionNumber: number) => string,
 *   openInputs: Record<string, string>,
 *   onInputChange: (questionKey: string, value: string) => void,
 *   openChecks: Record<string, boolean | undefined>,
 *   onCheckGap: (questionNumber: number, questionKey: string, value: string) => void,
 *   openAnswerMap: Map<number, Set<string>>,
 *   hideFeedback?: boolean,
 *   aiHintsByKey?: Record<string, { loading?: boolean, error?: string | null, text?: string | null }>,
 *   labels?: { check?: string, correct?: string, incorrect?: string, correctAnswer?: string, keyWord?: string },
 * }} props
 */
export default function B2ExamInlineKeyWordPassage({
  text = '',
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs,
  onInputChange,
  openChecks,
  onCheckGap,
  openAnswerMap,
  hideFeedback = false,
  aiHintsByKey = {},
  labels = {},
}) {
  const activeSet = new Set(activeQuestionNumbers);
  const items = parseB2KeyWordTransformItems(text);
  const checkLabel = labels.check ?? 'Check';
  const correctLabel = labels.correct ?? 'Correct';
  const incorrectLabel = labels.incorrect ?? 'Incorrect';
  const correctAnswerLabel = labels.correctAnswer ?? 'Correct answer';
  const keyWordLabel = labels.keyWord ?? 'Key word';

  if (!items.length) return null;

  const getInputStateClass = (checkResult, currentValue, isAnswerLocked) => {
    if (typeof checkResult === 'boolean') {
      return checkResult
        ? 'levels-exam-inline-gap__input--correct'
        : 'levels-exam-inline-gap__input--incorrect';
    }
    if (!isAnswerLocked && currentValue.trim()) {
      return 'levels-exam-inline-gap__input--active';
    }
    return '';
  };

  return (
    <div className="levels-exam-kwt-passage">
      {items.map((item) => {
        const { questionNumber, sentence1, keyword, sentence2Before, sentence2After, isExample } =
          item;
        const isActive = !isExample && activeSet.has(questionNumber);
        const questionKey = getQuestionKey(questionNumber);
        const currentValue = openInputs[questionKey] || '';
        const checkResult = openChecks[questionKey];
        const isAnswerLocked = !hideFeedback && typeof checkResult === 'boolean';
        const expected = openAnswerMap.get(questionNumber);
        const expectedList = expected && expected.size > 0 ? [...expected] : [];
        const inputStateClass = getInputStateClass(checkResult, currentValue, isAnswerLocked);

        return (
          <div
            key={`kwt-${questionNumber}`}
            className={`levels-exam-kwt-item${isExample ? ' levels-exam-kwt-item--example' : ''}`}
          >
            <p className="levels-exam-kwt-item__lead">
              <span className="levels-exam-inline-gap__marker">{questionNumber}</span>
              <span className="levels-exam-kwt-item__sentence1">{sentence1}</span>
            </p>
            {keyword ? (
              <p className="levels-exam-kwt-item__keyword">
                {keyWordLabel}: <strong>{keyword.toUpperCase()}</strong>
              </p>
            ) : null}
            <p className="levels-exam-kwt-item__sentence2">
              <span>{sentence2Before}</span>
              {isExample || !isActive ? (
                <span className="levels-exam-inline-gap__blank" aria-hidden>
                  __________________
                </span>
              ) : (
                <span className="levels-exam-inline-gap__group levels-exam-inline-gap__group--kwt">
                  <input
                    type="text"
                    className={`levels-exam-inline-gap__input levels-exam-inline-gap__input--kwt${inputStateClass ? ` ${inputStateClass}` : ''}`}
                    value={currentValue}
                    readOnly={isAnswerLocked}
                    placeholder="2–5 words"
                    aria-label={`Question ${questionNumber}`}
                    onChange={(e) => {
                      if (isAnswerLocked) return;
                      onInputChange(questionKey, e.target.value);
                    }}
                  />
                  {!hideFeedback && !isAnswerLocked ? (
                    <button
                      type="button"
                      className="levels-exam-inline-gap__check"
                      onClick={() => onCheckGap(questionNumber, questionKey, currentValue)}
                    >
                      {checkLabel}
                    </button>
                  ) : null}
                </span>
              )}
              <span>{sentence2After}</span>
            </p>
            {!hideFeedback && isActive && typeof checkResult === 'boolean' ? (
              <div className="levels-exam-inline-gap__feedback">
                <span
                  className={`levels-exam-inline-gap__status${
                    checkResult
                      ? ' levels-exam-inline-gap__status--ok'
                      : ' levels-exam-inline-gap__status--bad'
                  }`}
                >
                  {checkResult ? correctLabel : incorrectLabel}
                </span>
                {!checkResult && expectedList.length > 0 ? (
                  <span className="levels-exam-inline-gap__model">
                    {correctAnswerLabel}: {expectedList.join(' · ')}
                  </span>
                ) : null}
              </div>
            ) : null}
            {!hideFeedback && isActive && aiHintsByKey[questionKey] ? (
              <div className="levels-exam-inline-gap__hint">
                <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
