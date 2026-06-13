'use client';

import { useEffect, useMemo, useState } from 'react';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { parseLineWithOpenGaps } from '@/components/b2/B2ExamInlineOpenClozePassage';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import ReadingQuestionFlagButton from '@/components/exam/ReadingQuestionFlagButton';
import ReadingConfidenceSelector from '@/components/exam/ReadingConfidenceSelector';

function getOptionWord(option) {
  const text = option?.formattedText || option?.respuesta || '';
  const letterMatch = text.match(/^[A-D]\)\s*(.+)$/i);
  if (letterMatch) return letterMatch[1].trim();
  const numberedMatch = text.match(/^\d+\s+[A-D]\s+(.+)$/i);
  if (numberedMatch) return numberedMatch[1].trim();
  return text.trim();
}

/**
 * Part 1 multiple-choice cloze — click gap in text to pick A–D (no side panel).
 */
export default function B2ExamInlineMcqClozePassage({
  text = '',
  mcqGroups = [],
  getQuestionKey,
  selectedOptions = {},
  checkedQuestions = {},
  onOptionSelect,
  hideFeedback = false,
  aiHintsByKey = {},
  onRequestExplanation,
}) {
  const [openQuestionNumber, setOpenQuestionNumber] = useState(null);
  const session = useReadingPracticeSession();

  const groupByNumber = useMemo(() => {
    const map = new Map();
    mcqGroups.forEach((group, index) => {
      if (group?.questionNumber != null) {
        map.set(group.questionNumber, { group, groupIndex: index });
      }
    });
    return map;
  }, [mcqGroups]);

  const activeQuestionNumbers = useMemo(
    () => mcqGroups.map((g) => g.questionNumber).filter((n) => n != null && n !== 0),
    [mcqGroups],
  );
  const activeSet = new Set(activeQuestionNumbers);

  useEffect(() => {
    if (openQuestionNumber == null) return undefined;

    const onPointerDown = (event) => {
      if (event.target?.closest?.('.levels-exam-inline-mcq-gap')) return;
      setOpenQuestionNumber(null);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenQuestionNumber(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openQuestionNumber]);

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const getTriggerStateClass = (questionKey, isChecked, selectedOption, group) => {
    if (hideFeedback || !isChecked || !selectedOption) return '';
    if (selectedOption.correcta) return 'levels-exam-inline-mcq-gap__trigger--correct';
    return 'levels-exam-inline-mcq-gap__trigger--incorrect';
  };

  return (
    <div className="levels-exam-inline-passage levels-exam-inline-mcq-cloze">
      {lines.map((line, lineIdx) => {
        const img = line.match(/^IMAGE:\s*(\S+)/i);
        if (img) {
          return (
            <img
              key={`mcq-passage-img-${lineIdx}`}
              src={img[1]}
              alt=""
              style={{
                maxWidth: '100%',
                height: 'auto',
                margin: '0.5rem 0',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            />
          );
        }

        const segments = parseLineWithOpenGaps(line);
        const hasGap = segments.some((s) => s.type === 'gap');

        if (!hasGap) {
          return (
            <p key={`mcq-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
              {line}
            </p>
          );
        }

        return (
          <p key={`mcq-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
            {segments.map((segment, segIdx) => {
              if (segment.type === 'text') {
                return <span key={`mcq-seg-text-${lineIdx}-${segIdx}`}>{segment.text}</span>;
              }

              const questionNumber = segment.questionNumber;
              const entry = groupByNumber.get(questionNumber);
              const isExampleGap = questionNumber === 0;
              const isActiveGap = activeSet.has(questionNumber);
              const group = entry?.group;
              const groupIndex = entry?.groupIndex ?? 0;
              const questionKey = getQuestionKey(questionNumber);
              const selectedId = selectedOptions[questionKey];
              const selectedOption = group?.options?.find((o) => o.id === selectedId);
              const isChecked = checkedQuestions[questionKey];
              const isOpen = openQuestionNumber === questionNumber;

              if (isExampleGap || !isActiveGap || !group) {
                const exampleWord =
                  group?.options?.find((o) => o.correcta)?.formattedText ||
                  group?.options?.[0]?.formattedText ||
                  '';
                const exampleLabel = exampleWord
                  ? getOptionWord({ formattedText: exampleWord })
                  : '_______';
                return (
                  <span
                    key={`mcq-seg-example-${lineIdx}-${segIdx}`}
                    className="levels-exam-inline-mcq-gap levels-exam-inline-mcq-gap--example"
                  >
                    <span className="levels-exam-inline-mcq-gap__marker">({questionNumber})</span>
                    <span className="levels-exam-inline-mcq-gap__trigger levels-exam-inline-mcq-gap__trigger--example">
                      {exampleLabel}
                    </span>
                  </span>
                );
              }

              const displayWord = selectedOption ? getOptionWord(selectedOption) : '';
              const stateClass = getTriggerStateClass(
                questionKey,
                isChecked,
                selectedOption,
                group,
              );
              const isFlagged = !!session.flaggedQuestions[questionKey];

              return (
                <span
                  key={`mcq-seg-gap-${lineIdx}-${segIdx}`}
                  id={`question-${questionNumber}`}
                  data-question-number={questionNumber}
                  className={`levels-exam-inline-mcq-gap${isOpen ? ' levels-exam-inline-mcq-gap--open' : ''}${isFlagged ? ' question-flagged' : ''}`}
                >
                  <button
                    type="button"
                    className={`levels-exam-inline-mcq-gap__trigger${displayWord ? '' : ' levels-exam-inline-mcq-gap__trigger--empty'}${stateClass ? ` ${stateClass}` : ''}`}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-label={
                      displayWord
                        ? `Question ${questionNumber}: ${displayWord}. Click to change.`
                        : `Question ${questionNumber}. Click to choose an answer.`
                    }
                    disabled={hideFeedback && isChecked}
                    onClick={() => {
                      if (hideFeedback && isChecked) return;
                      setOpenQuestionNumber((prev) =>
                        prev === questionNumber ? null : questionNumber,
                      );
                    }}
                  >
                    <span className="levels-exam-inline-mcq-gap__marker">({questionNumber})</span>
                    <span className="levels-exam-inline-mcq-gap__value">
                      {displayWord || '________'}
                    </span>
                  </button>

                  {isOpen ? (
                    <span
                      className="levels-exam-inline-mcq-gap__menu"
                      role="listbox"
                      aria-label={`Options for question ${questionNumber}`}
                    >
                      {group.options.map((option) => {
                        const isSelected = selectedId === option.id;
                        const isEliminated = session.isOptionEliminated(questionKey, option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`levels-exam-inline-mcq-gap__option question-option${isSelected ? ' levels-exam-inline-mcq-gap__option--selected' : ''}${isEliminated ? ' eliminated' : ''}`}
                            onClick={() => {
                              if (session.answerEliminatorEnabled) {
                                session.toggleEliminatedAnswer(questionKey, option.id);
                                return;
                              }
                              setOpenQuestionNumber(null);
                              onOptionSelect?.({
                                group,
                                groupIndex,
                                option,
                                questionKey,
                              });
                            }}
                          >
                            {option.formattedText || option.respuesta}
                          </button>
                        );
                      })}
                    </span>
                  ) : null}

                </span>
              );
            })}
          </p>
        );
      })}

      {!hideFeedback ? (
        <McqClozeExplanations
          mcqGroups={mcqGroups}
          getQuestionKey={getQuestionKey}
          selectedOptions={selectedOptions}
          checkedQuestions={checkedQuestions}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={onRequestExplanation}
        />
      ) : null}

      <div className="reading-question-meta-list">
        {mcqGroups
          .filter((g) => g?.questionNumber != null && g.questionNumber !== 0)
          .map((group) => {
            const questionKey = getQuestionKey(group.questionNumber);
            if (!checkedQuestions[questionKey]) return null;
            return (
              <div key={`meta-${group.questionNumber}`} className="reading-question-meta">
                <span className="reading-question-meta__label">Q{group.questionNumber}</span>
                <ReadingQuestionFlagButton questionKey={questionKey} questionNumber={group.questionNumber} />
                <ReadingConfidenceSelector questionKey={questionKey} />
              </div>
            );
          })}
      </div>
    </div>
  );
}

/**
 * Explanations listed below the passage (one entry per checked gap).
 * Hidden by default: each entry shows a 💡 button that expands the explanation
 * (and lazily requests it from the AI the first time it is opened).
 */
function McqClozeExplanations({
  mcqGroups,
  getQuestionKey,
  selectedOptions,
  checkedQuestions,
  aiHintsByKey,
  onRequestExplanation,
}) {
  const [openExplanations, setOpenExplanations] = useState({});

  const entries = mcqGroups
    .filter((group) => group?.questionNumber != null && group.questionNumber !== 0)
    .map((group) => {
      const questionKey = getQuestionKey(group.questionNumber);
      if (!checkedQuestions[questionKey]) return null;
      const selectedOption = group.options?.find((o) => o.id === selectedOptions[questionKey]);
      if (!selectedOption) return null;
      const correctOption = group.options?.find((o) => o.correcta);
      return {
        questionNumber: group.questionNumber,
        questionKey,
        group,
        isCorrect: !!selectedOption.correcta,
        selectedWord: getOptionWord(selectedOption),
        correctWord: correctOption ? getOptionWord(correctOption) : '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.questionNumber - b.questionNumber);

  if (!entries.length) return null;

  const toggleExplanation = (entry) => {
    const isOpen = !!openExplanations[entry.questionKey];
    if (!isOpen) {
      const hint = aiHintsByKey[entry.questionKey];
      if (!hint?.text && !hint?.loading && onRequestExplanation) {
        onRequestExplanation({ questionKey: entry.questionKey, group: entry.group });
      }
    }
    setOpenExplanations((prev) => ({ ...prev, [entry.questionKey]: !isOpen }));
  };

  return (
    <div className="levels-exam-mcq-explanations">
      <p className="levels-exam-mcq-explanations__title">Explanations</p>
      {entries.map((entry) => {
        const isOpen = !!openExplanations[entry.questionKey];
        return (
          <div
            key={`mcq-explanation-${entry.questionNumber}`}
            className={`levels-exam-mcq-explanations__item${
              entry.isCorrect
                ? ' levels-exam-mcq-explanations__item--correct'
                : ' levels-exam-mcq-explanations__item--incorrect'
            }`}
          >
            <p className="levels-exam-mcq-explanations__head">
              <span className="levels-exam-mcq-explanations__number">({entry.questionNumber})</span>{' '}
              <span
                className={
                  entry.isCorrect
                    ? 'levels-exam-mcq-explanations__verdict levels-exam-mcq-explanations__verdict--correct'
                    : 'levels-exam-mcq-explanations__verdict levels-exam-mcq-explanations__verdict--incorrect'
                }
              >
                {entry.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
              {' — '}
              <span>
                Your answer: <strong>{entry.selectedWord}</strong>
              </span>
              {!entry.isCorrect && entry.correctWord ? (
                <span>
                  {' · '}Correct answer: <strong>{entry.correctWord}</strong>
                </span>
              ) : null}
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
            </p>
            {isOpen ? (
              <LevelsAnswerJustification hint={aiHintsByKey[entry.questionKey]} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
