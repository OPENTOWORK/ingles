'use client';

import { useState } from 'react';
import LevelsAnswerJustification from '@/components/levels/LevelsAnswerJustification';

/** Marcador `(N) ___` / `(N) …` en pasajes Open Cloze, Word Formation, etc. */
export const OPEN_GAP_MARKER_RE = /\((\d{1,2})\)\s*(?:_+|\.{2,}|…{2,})/g;

/**
 * @param {string} line
 * @returns {Array<{ type: 'text', text: string } | { type: 'gap', questionNumber: number }>}
 */
export function parseLineWithOpenGaps(line = '') {
  const parts = [];
  let lastIndex = 0;
  for (const match of line.matchAll(OPEN_GAP_MARKER_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', text: line.slice(lastIndex, index) });
    }
    parts.push({ type: 'gap', questionNumber: Number(match[1]) });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < line.length) {
    parts.push({ type: 'text', text: line.slice(lastIndex) });
  }
  if (parts.length === 0 && line) {
    parts.push({ type: 'text', text: line });
  }
  return parts;
}

/**
 * Pasaje con huecos interactivos en línea (Partes 2–4 Use of English).
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
 *   inputPlaceholder?: string,
 *   aiHintsByKey?: Record<string, { loading?: boolean, error?: string | null, text?: string | null }>,
 *   labels?: { check?: string, correct?: string, incorrect?: string, correctAnswer?: string },
 *   onRequestExplanation?: (info: { questionKey: string, questionNumber: number }) => void,
 *   showInlineExample?: boolean,
 *   exampleGap0Word?: string,
 * }} props
 */
export default function B2ExamInlineOpenClozePassage({
  text = '',
  activeQuestionNumbers = [],
  getQuestionKey,
  openInputs,
  onInputChange,
  openChecks,
  onCheckGap,
  openAnswerMap,
  hideFeedback = false,
  inputPlaceholder = 'Write one word',
  aiHintsByKey = {},
  labels = {},
  onRequestExplanation,
  showInlineExample = false,
  exampleGap0Word = '',
}) {
  /** Explicaciones ocultas por defecto: solo se muestran (y se piden) al pulsar 💡. */
  const [openExplanations, setOpenExplanations] = useState({});
  const lazyExplanations = typeof onRequestExplanation === 'function';

  const toggleExplanation = (questionKey, questionNumber) => {
    const isOpen = !!openExplanations[questionKey];
    if (!isOpen) {
      const hint = aiHintsByKey[questionKey];
      if (!hint?.text && !hint?.loading) {
        onRequestExplanation({ questionKey, questionNumber });
      }
    }
    setOpenExplanations((prev) => ({ ...prev, [questionKey]: !isOpen }));
  };

  const activeSet = new Set(activeQuestionNumbers);
  const checkLabel = labels.check ?? 'Check';
  const correctLabel = labels.correct ?? 'Correct';
  const incorrectLabel = labels.incorrect ?? 'Incorrect';
  const correctAnswerLabel = labels.correctAnswer ?? 'Correct answer';

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

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
    <div className="levels-exam-inline-passage">
      {lines.map((line, lineIdx) => {
        const img = line.match(/^IMAGE:\s*(\S+)/i);
        if (img) {
          return (
            <img
              key={`inline-passage-img-${lineIdx}`}
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
            <p key={`inline-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
              {line}
            </p>
          );
        }

        return (
          <p key={`inline-passage-line-${lineIdx}`} className="levels-exam-inline-passage__line">
            {segments.map((segment, segIdx) => {
              if (segment.type === 'text') {
                return (
                  <span key={`seg-text-${lineIdx}-${segIdx}`}>{segment.text}</span>
                );
              }

              const questionNumber = segment.questionNumber;
              const isExampleGap = questionNumber === 0;
              const isActiveGap = activeSet.has(questionNumber);
              const questionKey = getQuestionKey(questionNumber);
              const currentValue = openInputs[questionKey] || '';
              const checkResult = openChecks[questionKey];
              const isAnswerLocked = !hideFeedback && typeof checkResult === 'boolean';
              const expected = openAnswerMap.get(questionNumber);
              const expectedList = expected && expected.size > 0 ? [...expected] : [];

              if (isExampleGap || !isActiveGap) {
                const exampleAnswers = openAnswerMap.get(questionNumber);
                const exampleWord =
                  showInlineExample && isExampleGap
                    ? exampleGap0Word ||
                      (exampleAnswers && exampleAnswers.size > 0 ? [...exampleAnswers][0] : '')
                    : exampleAnswers && exampleAnswers.size > 0
                      ? [...exampleAnswers][0]
                      : '';
                return (
                  <span
                    key={`seg-gap-static-${lineIdx}-${segIdx}`}
                    className="levels-exam-inline-gap levels-exam-inline-gap--example"
                  >
                    <span className="levels-exam-inline-gap__marker">({questionNumber})</span>
                    <span
                      className={`levels-exam-inline-gap__blank${exampleWord ? ' levels-exam-inline-gap__blank--filled' : ''}`}
                      aria-hidden
                    >
                      {exampleWord || '_______'}
                    </span>
                  </span>
                );
              }

              const inputStateClass = getInputStateClass(
                checkResult,
                currentValue,
                isAnswerLocked,
              );

              return (
                <span
                  key={`seg-gap-${lineIdx}-${segIdx}`}
                  className="levels-exam-inline-gap"
                >
                  <span className="levels-exam-inline-gap__group">
                    <span className="levels-exam-inline-gap__marker">({questionNumber})</span>
                    <input
                      type="text"
                      className={`levels-exam-inline-gap__input${inputStateClass ? ` ${inputStateClass}` : ''}`}
                      value={currentValue}
                      readOnly={isAnswerLocked}
                      placeholder={inputPlaceholder}
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
                  {!hideFeedback && typeof checkResult === 'boolean' ? (
                    <span className="levels-exam-inline-gap__feedback">
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
                      {lazyExplanations ? (
                        <button
                          type="button"
                          className={`levels-exam-mcq-explanations__toggle${
                            openExplanations[questionKey]
                              ? ' levels-exam-mcq-explanations__toggle--open'
                              : ''
                          }`}
                          aria-expanded={!!openExplanations[questionKey]}
                          onClick={() => toggleExplanation(questionKey, questionNumber)}
                        >
                          💡 Explanation
                        </button>
                      ) : null}
                    </span>
                  ) : null}
                  {!hideFeedback &&
                  aiHintsByKey[questionKey] &&
                  (!lazyExplanations || openExplanations[questionKey]) ? (
                    <span className="levels-exam-inline-gap__hint">
                      <LevelsAnswerJustification hint={aiHintsByKey[questionKey]} />
                    </span>
                  ) : null}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
