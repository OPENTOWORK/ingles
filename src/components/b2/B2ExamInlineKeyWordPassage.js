'use client';

import ReadingQuestionFlagButton from '@/components/exam/ReadingQuestionFlagButton';
import ReadingConfidenceSelector from '@/components/exam/ReadingConfidenceSelector';
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
 *   openGrades?: Record<string, { score?: number, maxScore?: number, reason?: string } | undefined>,
 *   scoringV2Part4?: boolean,
 *   onCheckGap: (questionNumber: number, questionKey: string, value: string) => void,
 *   openAnswerMap: Map<number, Set<string>>,
 *   hideFeedback?: boolean,
 *   aiHintsByKey?: Record<string, { loading?: boolean, error?: string | null, text?: string | null }>,
 *   labels?: { check?: string, correct?: string, incorrect?: string, correctAnswer?: string, keyWord?: string },
 *   onRequestExplanation?: (info: { questionKey: string, questionNumber: number }) => void,
 * }} props
 */
export default function B2ExamInlineKeyWordPassage({
  text = '',
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs,
  onInputChange,
  openChecks,
  openGrades = {},
  scoringV2Part4 = false,
  onCheckGap,
  openAnswerMap,
  hideFeedback = false,
  aiHintsByKey = {},
  labels = {},
  onRequestExplanation,
}) {
  const activeSet = new Set(activeQuestionNumbers);
  const items = parseB2KeyWordTransformItems(text);
  const checkLabel = labels.check ?? 'Check';
  const keyWordLabel = labels.keyWord ?? 'Key word';

  if (!items.length) return null;

  const getInputStateClass = (checkResult, grade, currentValue, isAnswerLocked) => {
    if (scoringV2Part4 && grade && typeof grade.score === 'number') {
      if (grade.score === 2) return 'levels-exam-inline-gap__input--correct';
      if (grade.score === 1) return 'levels-exam-inline-gap__input--partial';
      return 'levels-exam-inline-gap__input--incorrect';
    }
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
        const grade = scoringV2Part4 ? openGrades[questionKey] : null;
        const hasV2Grade = scoringV2Part4 && grade && typeof grade.score === 'number';
        const isAnswerLocked =
          !hideFeedback &&
          (hasV2Grade || typeof checkResult === 'boolean');
        const inputStateClass = getInputStateClass(checkResult, grade, currentValue, isAnswerLocked);

        return (
          <div
            key={`kwt-${questionNumber}`}
            className={`levels-exam-kwt-item${isExample ? ' levels-exam-kwt-item--example' : ''}`}
          >
            <p className="levels-exam-kwt-item__lead">
              <span className="levels-exam-inline-gap__marker">{questionNumber}.</span>{' '}
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
          </div>
        );
      })}

      {hideFeedback && activeQuestionNumbers.some((qn) => openInputs[getQuestionKey(qn)]?.trim()) ? (
        <div className="reading-question-meta-list">
          {activeQuestionNumbers.map((questionNumber) => {
            const questionKey = getQuestionKey(questionNumber);
            if (!openInputs[questionKey]?.trim()) return null;
            return (
              <div key={`meta-kwt-${questionNumber}`} className="reading-question-meta">
                <span className="reading-question-meta__label">Q{questionNumber}</span>
                <ReadingQuestionFlagButton questionKey={questionKey} questionNumber={questionNumber} />
                <ReadingConfidenceSelector questionKey={questionKey} />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
