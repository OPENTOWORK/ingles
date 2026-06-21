'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseLineWithOpenGaps } from '@/components/b2/B2ExamInlineOpenClozePassage';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import ReadingQuestionFlagButton from '@/components/exam/ReadingQuestionFlagButton';
import ReadingConfidenceSelector from '@/components/exam/ReadingConfidenceSelector';

function getOptionWord(option) {
  const text = option?.formattedText || option?.respuesta || '';
  const letterMatch = text.match(/^[A-D]\)\s*(.+)$/i);
  if (letterMatch) return letterMatch[1].trim();
  const numberedMatch = text.match(/^\d+\s+[A-D]\b\s*\)?\s*(.+)$/i);
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
  showInlineExample = false,
  exampleGap0Word = '',
}) {
  const [openQuestionNumber, setOpenQuestionNumber] = useState(null);
  const [openMenuStyle, setOpenMenuStyle] = useState(null);
  const session = useReadingPracticeSession();

  const estimateMenuHeight = useCallback((optionCount = 4) => Math.max(168, optionCount * 44 + 24), []);

  const openGapMenu = useCallback(
    (questionNumber, triggerEl, optionCount) => {
      if (!triggerEl) return;
      const rect = triggerEl.getBoundingClientRect();
      const menuHeight = estimateMenuHeight(optionCount);
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensAbove = spaceBelow < menuHeight + 10;
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - 236);
      setOpenMenuStyle({
        position: 'fixed',
        left,
        top: opensAbove ? Math.max(8, rect.top - menuHeight - 6) : rect.bottom + 6,
        minWidth: Math.max(rect.width, 220),
        maxWidth: Math.min(320, window.innerWidth - 16),
        zIndex: 10000,
      });
      setOpenQuestionNumber(questionNumber);
    },
    [estimateMenuHeight],
  );

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

    const closeMenu = () => {
      setOpenQuestionNumber(null);
      setOpenMenuStyle(null);
    };

    const onPointerDown = (event) => {
      if (event.target?.closest?.('.levels-exam-inline-mcq-gap')) return;
      closeMenu();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
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

  let startIdx = 0;
  if (lines[0]?.toLowerCase() === 'text') startIdx = 1;
  const titleLine =
    startIdx < lines.length &&
    !/\(\d{1,2}\)/.test(lines[startIdx]) &&
    !parseLineWithOpenGaps(lines[startIdx]).some((s) => s.type === 'gap') &&
    lines[startIdx].length < 120 &&
    !/^IMAGE:/i.test(lines[startIdx])
      ? lines[startIdx]
      : null;
  const bodyStart = titleLine ? startIdx + 1 : startIdx;

  const getTriggerStateClass = (questionKey, isChecked, selectedOption, group) => {
    if (hideFeedback || !isChecked || !selectedOption) return '';
    if (selectedOption.correcta) return 'levels-exam-inline-mcq-gap__trigger--correct';
    return 'levels-exam-inline-mcq-gap__trigger--incorrect';
  };

  return (
    <div className="levels-exam-inline-passage levels-exam-inline-mcq-cloze">
      {titleLine ? <h3 className="levels-exam-passage-title">{titleLine}</h3> : null}
      {lines.slice(bodyStart).map((line, lineIdx) => {
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

        const passageLine = (
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
                let exampleLabel = '_______';
                if (isExampleGap && showInlineExample) {
                  if (exampleGap0Word) {
                    exampleLabel = exampleGap0Word;
                  } else {
                    const correctOpt = group?.options?.find((o) => o.correcta);
                    if (correctOpt) {
                      exampleLabel = getOptionWord(correctOpt);
                    } else {
                      const exampleWord =
                        group?.options?.find((o) => o.correcta)?.formattedText ||
                        group?.options?.[0]?.formattedText ||
                        '';
                      if (exampleWord) {
                        exampleLabel = getOptionWord({ formattedText: exampleWord });
                      }
                    }
                  }
                } else if (isExampleGap && group) {
                  const exampleWord =
                    group?.options?.find((o) => o.correcta)?.formattedText ||
                    group?.options?.[0]?.formattedText ||
                    '';
                  if (exampleWord) {
                    exampleLabel = getOptionWord({ formattedText: exampleWord });
                  }
                }
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
              const isFlagged = hideFeedback && !!session.flaggedQuestions[questionKey];

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
                    disabled={!hideFeedback && isChecked}
                    onClick={(event) => {
                      if (!hideFeedback && isChecked) return;
                      if (openQuestionNumber === questionNumber) {
                        setOpenQuestionNumber(null);
                        setOpenMenuStyle(null);
                        return;
                      }
                      openGapMenu(questionNumber, event.currentTarget, group.options?.length || 4);
                    }}
                  >
                    <span className="levels-exam-inline-mcq-gap__marker">({questionNumber})</span>
                    <span className="levels-exam-inline-mcq-gap__value">
                      {displayWord || '________'}
                    </span>
                  </button>

                  {isOpen ? (
                    <span
                      className="levels-exam-inline-mcq-gap__menu levels-exam-inline-mcq-gap__menu--fixed"
                      style={openMenuStyle || undefined}
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
                              setOpenMenuStyle(null);
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

        return passageLine;
      })}

      {hideFeedback &&
      mcqGroups.some((g) => {
        if (g?.questionNumber == null || g.questionNumber === 0) return false;
        return Boolean(selectedOptions[getQuestionKey(g.questionNumber)]);
      }) ? (
        <div className="reading-question-meta-list">
          {mcqGroups
            .filter((g) => g?.questionNumber != null && g.questionNumber !== 0)
            .map((group) => {
              const questionKey = getQuestionKey(group.questionNumber);
              if (!selectedOptions[questionKey]) return null;
              return (
                <div key={`meta-${group.questionNumber}`} className="reading-question-meta">
                  <span className="reading-question-meta__label">Q{group.questionNumber}</span>
                  <ReadingQuestionFlagButton questionKey={questionKey} questionNumber={group.questionNumber} />
                  <ReadingConfidenceSelector questionKey={questionKey} />
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
