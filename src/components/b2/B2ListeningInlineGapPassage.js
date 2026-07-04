'use client';

import { parseLineWithOpenGaps } from '@/components/b2/B2ExamInlineOpenClozePassage';

/**
 * Listening Part 2: all sentence-completion items in one continuous passage.
 */
export default function B2ListeningInlineGapPassage({
  lines = [],
  questionNumbers = [],
  getQuestionKey,
  openInputs = {},
  openChecks = {},
  hideFeedback = false,
  hideCheck = false,
  onInputChange,
  onCheckGap,
}) {
  const activeSet = new Set(questionNumbers);

  const getInputStateClass = (checkResult, currentValue) => {
    if (typeof checkResult === 'boolean') {
      return checkResult
        ? 'levels-exam-inline-gap__input--correct'
        : 'levels-exam-inline-gap__input--incorrect';
    }
    if (currentValue.trim()) return 'levels-exam-inline-gap__input--active';
    return '';
  };

  if (!lines.length) return null;

  return (
    <div className="levels-listening-context-box levels-listening-context-box--inline-gap levels-listening-gap-passage">
      {lines.map((line, lineIdx) => {
        const segments = parseLineWithOpenGaps(line);
        const hasGap = segments.some((s) => s.type === 'gap');

        if (!hasGap) {
          return (
            <p
              key={`listen-gap-line-${lineIdx}`}
              className={`levels-listening-gap-prompt${lineIdx === 0 ? ' levels-listening-gap-prompt--setting' : ''}`}
            >
              {line}
            </p>
          );
        }

        return (
          <p
            key={`listen-gap-line-${lineIdx}`}
            className="levels-listening-gap-prompt levels-listening-gap-prompt--inline"
          >
            {segments.map((segment, segIdx) => {
              if (segment.type === 'text') {
                return <span key={`seg-text-${lineIdx}-${segIdx}`}>{segment.text}</span>;
              }

              const questionNumber = segment.questionNumber;
              if (!activeSet.has(questionNumber)) {
                return (
                  <span key={`seg-gap-static-${lineIdx}-${segIdx}`}>
                    ({questionNumber}) ______
                  </span>
                );
              }

              const questionKey = getQuestionKey(questionNumber);
              const currentValue = openInputs[questionKey] || '';
              const checkResult = openChecks[questionKey];
              const inputStateClass = getInputStateClass(checkResult, currentValue);

              return (
                <span key={`seg-gap-${lineIdx}-${segIdx}`} className="levels-exam-inline-gap">
                  <span className="levels-exam-inline-gap__group">
                    <span className="levels-exam-inline-gap__marker">({questionNumber})</span>
                    <input
                      type="text"
                      className={`levels-exam-inline-gap__input levels-exam-inline-gap__input--listening${inputStateClass ? ` ${inputStateClass}` : ''}`}
                      value={currentValue}
                      aria-label={`Gap ${questionNumber}`}
                      onChange={(e) => onInputChange?.(questionKey, e.target.value)}
                    />
                    {!hideFeedback && !hideCheck ? (
                      <button
                        type="button"
                        className="levels-exam-inline-gap__check"
                        onClick={() => onCheckGap?.(questionNumber, questionKey, currentValue)}
                      >
                        Check
                      </button>
                    ) : null}
                  </span>
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
