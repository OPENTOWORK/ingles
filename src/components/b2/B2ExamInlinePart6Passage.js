'use client';

import { useMemo, useState } from 'react';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';
import { parseLineWithOpenGaps } from '@/components/b2/B2ExamInlineOpenClozePassage';
import ReadingQuestionFlagButton from '@/components/exam/ReadingQuestionFlagButton';
import ReadingConfidenceSelector from '@/components/exam/ReadingConfidenceSelector';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

function getOptionLetter(option) {
  const text = option?.formattedText || option?.respuesta || '';
  const letterMatch = text.match(/^([A-G])\)?/i);
  if (letterMatch) return letterMatch[1].toUpperCase();
  if (option?.compactLabel) return String(option.compactLabel).toUpperCase();
  return text.trim();
}

/**
 * Part 6 gapped text — letter dropdown (A–G) inline at each gap, like Part 1 MCQ cloze.
 */
export default function B2ExamInlinePart6Passage({
  text = '',
  mcqGroups = [],
  sentencePool = {},
  getQuestionKey,
  selectedOptions = {},
  checkedQuestions = {},
  onOptionSelect,
  hideFeedback = false,
  aiHintsByKey = {},
  onRequestExplanation,
}) {
  const session = useReadingPracticeSession();

  const groupByNumber = useMemo(() => {
    const map = new Map();
    mcqGroups.forEach((group, groupIndex) => {
      if (group?.questionNumber != null) {
        map.set(group.questionNumber, { group, groupIndex });
      }
    });
    return map;
  }, [mcqGroups]);

  const activeQuestionNumbers = useMemo(
    () => mcqGroups.map((g) => g.questionNumber).filter((n) => n != null),
    [mcqGroups],
  );
  const activeSet = new Set(activeQuestionNumbers);

  const poolEntries = useMemo(() => {
    const letters = [...'ABCDEFG'];
    return letters
      .map((L) => ({ letter: L, text: sentencePool[L] || mcqGroups[0]?.options?.find((o) => getOptionLetter(o) === L)?.optionText || '' }))
      .filter((entry) => entry.text && String(entry.text).trim());
  }, [sentencePool, mcqGroups]);

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  return (
    <div className="levels-exam-inline-part6">
      {poolEntries.length > 0 ? (
        <div className="levels-exam-part6-pool-sticky levels-exam-part6-pool--inline-passage">
          <p className="levels-exam-part6-pool__title">Sentences A–G (choose one per gap)</p>
          <div className="levels-exam-part6-pool__list">
            {poolEntries.map(({ letter, text: sentenceText }) => (
              <p key={letter} className="levels-exam-part6-pool__item">
                <span className="levels-exam-part6-pool__letter">{letter}</span>
                <span>{sentenceText}</span>
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="levels-exam-inline-passage levels-exam-inline-part6__passage">
        {lines.map((line, lineIdx) => {
          const img = line.match(/^IMAGE:\s*(\S+)/i);
          if (img) {
            return (
              <img
                key={`part6-passage-img-${lineIdx}`}
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
              <p key={`part6-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
                {line}
              </p>
            );
          }

          return (
            <p key={`part6-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
              {segments.map((segment, segIdx) => {
                if (segment.type === 'text') {
                  return <span key={`part6-seg-text-${lineIdx}-${segIdx}`}>{segment.text}</span>;
                }

                const questionNumber = segment.questionNumber;
                const entry = groupByNumber.get(questionNumber);
                const isActiveGap = activeSet.has(questionNumber);
                const group = entry?.group;
                const groupIndex = entry?.groupIndex ?? 0;

                if (!isActiveGap || !group) {
                  return (
                    <span
                      key={`part6-seg-static-${lineIdx}-${segIdx}`}
                      className="levels-exam-inline-part6-gap levels-exam-inline-part6-gap--static"
                    >
                      <span className="levels-exam-inline-part6-gap__marker">({questionNumber})</span>
                      <span className="levels-exam-inline-part6-gap__placeholder">________</span>
                    </span>
                  );
                }

                const questionKey = getQuestionKey(questionNumber);
                const selectedId = selectedOptions[questionKey] || '';
                const selectedOption = group.options?.find((o) => o.id === selectedId);
                const isChecked = checkedQuestions[questionKey];
                const isFlagged = hideFeedback && !!session.flaggedQuestions[questionKey];

                let stateClass = '';
                if (!hideFeedback && isChecked && selectedOption) {
                  stateClass = selectedOption.correcta
                    ? 'levels-exam-inline-part6-gap__select--correct'
                    : 'levels-exam-inline-part6-gap__select--incorrect';
                }

                return (
                  <span
                    key={`part6-seg-gap-${lineIdx}-${segIdx}`}
                    id={`question-${questionNumber}`}
                    data-question-number={questionNumber}
                    className={`levels-exam-inline-part6-gap${isFlagged ? ' question-flagged' : ''}`}
                  >
                    <label className="levels-exam-inline-part6-gap__label">
                      <span className="levels-exam-inline-part6-gap__marker">({questionNumber})</span>
                      <select
                        className={`levels-exam-inline-part6-gap__select${stateClass ? ` ${stateClass}` : ''}${selectedId ? '' : ' levels-exam-inline-part6-gap__select--empty'}`}
                        value={selectedId}
                        disabled={hideFeedback && isChecked}
                        aria-label={`Choose sentence for gap ${questionNumber}`}
                        onChange={(event) => {
                          const option = group.options.find((o) => o.id === event.target.value);
                          if (!option) return;
                          onOptionSelect?.({
                            group,
                            groupIndex,
                            option,
                            questionKey,
                          });
                        }}
                      >
                        <option value="">—</option>
                        {group.options.map((option) => {
                          const letter = getOptionLetter(option);
                          const sentence = option.optionText || '';
                          return (
                            <option key={option.id} value={option.id} title={sentence}>
                              {letter}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {!hideFeedback ? (
        <Part6Explanations
          mcqGroups={mcqGroups}
          getQuestionKey={getQuestionKey}
          selectedOptions={selectedOptions}
          checkedQuestions={checkedQuestions}
          aiHintsByKey={aiHintsByKey}
          onRequestExplanation={onRequestExplanation}
        />
      ) : null}

      {hideFeedback ? (
        <div className="reading-question-meta-list">
          {mcqGroups
            .filter((g) => g?.questionNumber != null)
            .map((group) => {
              const questionKey = getQuestionKey(group.questionNumber);
              if (!checkedQuestions[questionKey]) return null;
              return (
                <div key={`part6-meta-${group.questionNumber}`} className="reading-question-meta">
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

function Part6Explanations({
  mcqGroups,
  getQuestionKey,
  selectedOptions,
  checkedQuestions,
  aiHintsByKey,
  onRequestExplanation,
}) {
  const [openExplanations, setOpenExplanations] = useState({});

  const entries = mcqGroups
    .filter((group) => group?.questionNumber != null)
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
        selectedLetter: getOptionLetter(selectedOption),
        correctLetter: correctOption ? getOptionLetter(correctOption) : '',
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
      {entries.map((entry) => (
        <div
          key={`part6-explanation-${entry.questionNumber}`}
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
              Your answer: <strong>{entry.selectedLetter}</strong>
            </span>
            {!entry.isCorrect && entry.correctLetter ? (
              <span>
                {' · '}Correct answer: <strong>{entry.correctLetter}</strong>
              </span>
            ) : null}
            <button
              type="button"
              className={`levels-exam-mcq-explanations__toggle${
                openExplanations[entry.questionKey] ? ' levels-exam-mcq-explanations__toggle--open' : ''
              }`}
              aria-expanded={!!openExplanations[entry.questionKey]}
              onClick={() => toggleExplanation(entry)}
            >
              💡 Explanation
            </button>
          </p>
          {openExplanations[entry.questionKey] ? (
            <LevelsAnswerJustification hint={aiHintsByKey[entry.questionKey]} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
