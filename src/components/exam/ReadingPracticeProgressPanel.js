'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getWeakAreas, getWeakAreaTheoryHref } from '@/lib/readingPracticeWeakAreas';
import ExamPracticePartScoreHistorySection from '@/components/exam/ExamPracticePartScoreHistorySection';

function getChipState({
  question,
  checkedQuestions,
  selectedOptions,
  groupedAnswers,
  flaggedQuestions,
  hideFeedback,
  openChecks,
}) {
  const { questionKey, questionNumber } = question;
  const isFlagged = hideFeedback && !!flaggedQuestions[questionKey];

  if (openChecks && typeof openChecks[questionKey] === 'boolean') {
    if (!hideFeedback) {
      if (openChecks[questionKey]) return isFlagged ? 'flagged-correct' : 'correct';
      return isFlagged ? 'flagged-incorrect' : 'incorrect';
    }
    return isFlagged ? 'flagged' : 'answered';
  }

  const isChecked = !!checkedQuestions[questionKey];

  if (!isChecked) {
    return isFlagged ? 'flagged' : 'unanswered';
  }

  const group = groupedAnswers.find((g) => g.questionNumber === questionNumber);
  const selectedId = selectedOptions[questionKey];
  const selectedOption = group?.options?.find((o) => o.id === selectedId);

  if (!hideFeedback && selectedOption) {
    if (selectedOption.correcta) return isFlagged ? 'flagged-correct' : 'correct';
    return isFlagged ? 'flagged-incorrect' : 'incorrect';
  }

  return isFlagged ? 'flagged' : 'answered';
}

/**
 * Progreso de sesión: chips por pregunta, puntuación actual, confianza y weak areas.
 */
export default function ReadingPracticeProgressPanel({
  questions = [],
  checkedQuestions = {},
  selectedOptions = {},
  groupedAnswers = [],
  flaggedQuestions = {},
  confidenceByQuestion = {},
  partNumber = 1,
  openChecks = {},
  correctCount = 0,
  totalSlots = 0,
  checkAttempts = 0,
  hideFeedback = false,
  examSlot = 1,
  progressBySlot = null,
  examLabelsBySlot = {},
  passing = null,
  lang = 'en',
  scoringVersion = 1,
  questionsAnswered = null,
  totalQuestions = null,
  correctItems = null,
  pointsEarned = null,
  maxPoints = null,
  accuracyByPoints = null,
}) {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);

  const isV2 = scoringVersion === 2 && maxPoints > 0;
  const answeredCount =
    questionsAnswered ??
    questions.filter((q) => checkedQuestions[q.questionKey] || typeof openChecks?.[q.questionKey] === 'boolean').length;
  const totalQ = totalQuestions ?? totalSlots;
  const fullyCorrect = correctItems ?? correctCount;
  const accuracy = isV2
    ? Math.round((accuracyByPoints ?? (maxPoints ? (pointsEarned / maxPoints) * 100 : 0)) * 10) / 10
    : totalSlots
      ? Math.round((100 * correctCount) / totalSlots)
      : 0;
  const weak = getWeakAreas({
    partNumber,
    questions,
    checkedQuestions,
    selectedOptions,
    confidenceByQuestion,
    groupedAnswers,
  });

  const labels = {
    title: en ? 'Progress' : 'Progreso',
    questions: en ? 'Questions answered' : 'Preguntas respondidas',
    correct: en ? 'Correct' : 'Correctas',
    accuracy: en ? 'Accuracy' : 'Precisión',
    attempts: en ? 'Attempts' : 'Intentos',
    weak: en ? 'Weak areas detected' : 'Áreas débiles detectadas',
    confidence: en ? 'Confidence' : 'Confianza',
    sure: en ? 'Sure' : 'Seguro',
    notSure: en ? 'Not sure' : 'No seguro',
    guess: en ? 'Guess' : 'Adivinanza',
  };

  const scrollToQuestion = (questionNumber) => {
    const el =
      document.getElementById(`question-${questionNumber}`) ||
      document.querySelector(`[data-question-number="${questionNumber}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <aside className="levels-listening-strategy levels-listening-strategy--progress">
      <button
        type="button"
        className="levels-listening-strategy__toggle levels-listening-strategy__toggle--progress"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{labels.title}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="levels-listening-strategy__body">
          {progressBySlot ? (
            <ExamPracticePartScoreHistorySection
              partNumber={partNumber}
              examSlot={examSlot}
              progressBySlot={progressBySlot}
              examLabelsBySlot={examLabelsBySlot}
              passing={passing}
              lang={lang}
            />
          ) : null}

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.questions}</h3>
            <div className="reading-progress-chips" role="list">
              {questions.map((q) => {
                const state = getChipState({
                  question: q,
                  checkedQuestions,
                  selectedOptions,
                  groupedAnswers,
                  flaggedQuestions,
                  hideFeedback,
                  openChecks,
                });
                const flagged = hideFeedback && !!flaggedQuestions[q.questionKey];
                return (
                  <button
                    key={q.questionKey}
                    type="button"
                    role="listitem"
                    className={`progress-chip progress-chip--${state}`}
                    onClick={() => scrollToQuestion(q.questionNumber)}
                    aria-label={
                      en
                        ? `Question ${q.questionNumber}${flagged ? ', marked for review' : ''}`
                        : `Pregunta ${q.questionNumber}${flagged ? ', marcada' : ''}`
                    }
                  >
                    {flagged ? <span className="progress-chip__flag" aria-hidden>⚑</span> : null}
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="levels-listening-strategy__heading">{en ? 'Current score' : 'Puntuación actual'}</h3>
            {isV2 ? (
              <>
                <p className="reading-progress-score">
                  <strong>{en ? 'Questions answered' : 'Preguntas respondidas'}:</strong> {answeredCount}/{totalQ}
                </p>
                {!hideFeedback ? (
                  <>
                    <p className="reading-progress-score">
                      <strong>{en ? 'Fully correct items' : 'Ítems totalmente correctos'}:</strong>{' '}
                      {fullyCorrect}/{totalQ}
                    </p>
                    <p className="reading-progress-score">
                      <strong>{en ? 'Part score' : 'Puntuación de la parte'}:</strong> {pointsEarned}/{maxPoints}
                    </p>
                    <p className="reading-progress-score">
                      <strong>{labels.accuracy}:</strong> {accuracy}%
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <p className="reading-progress-score">
                  <strong>{en ? 'Answered' : 'Respondidas'}:</strong>{' '}
                  {questions.filter((q) => checkedQuestions[q.questionKey]).length}/{totalSlots}
                </p>
                {!hideFeedback ? (
                  <>
                    <p className="reading-progress-score">
                      <strong>{labels.correct}:</strong> {correctCount}/{totalSlots}
                    </p>
                    <p className="reading-progress-score">
                      <strong>{labels.accuracy}:</strong> {accuracy}%
                    </p>
                  </>
                ) : null}
              </>
            )}
            <p className="reading-progress-score">
              <strong>{labels.attempts}:</strong> {checkAttempts}
            </p>
          </section>

          {hideFeedback && questions.some((q) => checkedQuestions[q.questionKey]) ? (
            <section>
              <h3 className="levels-listening-strategy__heading">{labels.confidence}</h3>
              <p className="levels-listening-strategy__tool-hint">
                {en
                  ? 'Set confidence in each question area after answering.'
                  : 'Indica tu confianza en cada pregunta tras responder.'}
              </p>
              <ul className="reading-progress-confidence-list">
                {questions
                  .filter((q) => checkedQuestions[q.questionKey])
                  .map((q) => {
                    const conf = confidenceByQuestion[q.questionKey];
                    const confLabel =
                      conf === 'sure'
                        ? labels.sure
                        : conf === 'not_sure'
                          ? labels.notSure
                          : conf === 'guess'
                            ? labels.guess
                            : '—';
                    return (
                      <li key={q.questionKey} className="reading-progress-confidence-item">
                        <span>Q{q.questionNumber}</span>
                        <span>{confLabel}</span>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.weak}</h3>
            <p className="levels-listening-strategy__tool-hint">{weak.message}</p>
            {weak.areas.length ? (
              <div className="reading-weak-areas">
                {weak.areas.map((area) => {
                  const theoryHref = getWeakAreaTheoryHref(area.name, partNumber);
                  const label = `${area.name} (${area.count})`;
                  if (!theoryHref) {
                    return (
                      <span key={area.name} className="reading-weak-areas__chip">
                        {label}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={area.name}
                      href={theoryHref}
                      className="reading-weak-areas__chip reading-weak-areas__chip--link"
                      title={
                        en
                          ? `Review theory: ${area.name}`
                          : `Repasar teoría: ${area.name}`
                      }
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </aside>
  );
}
