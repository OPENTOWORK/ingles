'use client';

import { parseLineWithOpenGaps } from '@/components/b2/B2ExamInlineOpenClozePassage';
import B2ListeningPracticeFeedback from '@/components/b2/B2ListeningPracticeFeedback';

/**
 * Listening Part 2 (sentence completion): input inline at (N) gap in the sentence.
 */
export default function B2ListeningInlineGapCard({
  questionNumber,
  displayLines = [],
  currentValue = '',
  checkResult,
  hideFeedback = false,
  onInputChange,
  onCheck,
  openAnswerMap,
  aiHint,
  studyTip,
  lang,
}) {
  const inputStateClass = (() => {
    if (typeof checkResult === 'boolean') {
      return checkResult
        ? 'levels-exam-inline-gap__input--correct'
        : 'levels-exam-inline-gap__input--incorrect';
    }
    if (currentValue.trim()) return 'levels-exam-inline-gap__input--active';
    return '';
  })();

  const renderInlineInput = () => (
    <span className="levels-exam-inline-gap__group">
      <span className="levels-exam-inline-gap__marker">({questionNumber})</span>
      <input
        type="text"
        className={`levels-exam-inline-gap__input levels-exam-inline-gap__input--listening${inputStateClass ? ` ${inputStateClass}` : ''}`}
        value={currentValue}
        onChange={(event) => onInputChange?.(event.target.value)}
        placeholder="answer"
        aria-label={`Question ${questionNumber}`}
      />
    </span>
  );

  const hasInlineGap = displayLines.some((line) =>
    parseLineWithOpenGaps(line).some(
      (segment) => segment.type === 'gap' && segment.questionNumber === questionNumber,
    ),
  );

  const renderLine = (line, lineIndex) => {
    const segments = parseLineWithOpenGaps(line);
    const hasGap = segments.some((segment) => segment.type === 'gap');

    if (!hasGap) {
      return (
        <p key={`line-${lineIndex}`} className="levels-listening-gap-prompt">
          {line}
        </p>
      );
    }

    return (
      <p
        key={`line-${lineIndex}`}
        className="levels-listening-gap-prompt levels-listening-gap-prompt--inline"
      >
        {segments.map((segment, segmentIndex) => {
          if (segment.type === 'text') {
            return <span key={`text-${segmentIndex}`}>{segment.text}</span>;
          }

          if (segment.questionNumber !== questionNumber) {
            return (
              <span key={`gap-static-${segmentIndex}`}>
                ({segment.questionNumber}) ______
              </span>
            );
          }

          return (
            <span key={`gap-${segmentIndex}`} className="levels-exam-inline-gap">
              {renderInlineInput()}
            </span>
          );
        })}
      </p>
    );
  };

  const correctLabel = (() => {
    const expected = openAnswerMap?.get?.(questionNumber);
    const list = expected && expected.size > 0 ? [...expected] : [];
    return list.length > 0 ? list.join(' · ') : null;
  })();

  return (
    <div className="levels-listening-question-card">
      <p className="levels-listening-question-card__title">Question {questionNumber}</p>
      {displayLines.length ? (
        <div className="levels-listening-context-box levels-listening-context-box--inline-gap">
          {displayLines.map((line, lineIndex) => renderLine(line, lineIndex))}
          {!hasInlineGap ? (
            <p className="levels-listening-gap-prompt levels-listening-gap-prompt--inline">
              <span className="levels-exam-inline-gap">{renderInlineInput()}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="levels-listening-context-box levels-listening-context-box--inline-gap">
          <p className="levels-listening-gap-prompt levels-listening-gap-prompt--inline">
            <span className="levels-exam-inline-gap">{renderInlineInput()}</span>
          </p>
        </div>
      )}
      {!hideFeedback ? (
        <div className="levels-listening-inline-gap-actions">
          <button
            type="button"
            className="levels-listening-inline-gap-actions__check"
            onClick={() => onCheck?.()}
          >
            Check
          </button>
        </div>
      ) : null}
      {!hideFeedback && typeof checkResult === 'boolean' ? (
        <B2ListeningPracticeFeedback
          isCorrect={checkResult}
          correctLabel={correctLabel}
          hint={aiHint}
          studyTip={studyTip}
          lang={lang}
        />
      ) : null}
    </div>
  );
}
