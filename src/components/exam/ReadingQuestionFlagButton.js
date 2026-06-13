'use client';

import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

export default function ReadingQuestionFlagButton({ questionKey, questionNumber, lang = 'en' }) {
  const { flaggedQuestions, toggleFlagQuestion } = useReadingPracticeSession();
  const flagged = !!flaggedQuestions[questionKey];
  const en = lang === 'en';

  return (
    <button
      type="button"
      className={`reading-question-flag tool-button${flagged ? ' active' : ''}`}
      onClick={() => toggleFlagQuestion(questionKey)}
      aria-pressed={flagged}
      aria-label={
        flagged
          ? en
            ? `Question ${questionNumber} marked for review`
            : `Pregunta ${questionNumber} marcada para revisar`
          : en
            ? `Mark question ${questionNumber} for review`
            : `Marcar pregunta ${questionNumber} para revisar`
      }
    >
      <span aria-hidden>⚑</span> {flagged ? (en ? 'Marked' : 'Marcada') : en ? 'Mark for review' : 'Marcar'}
    </button>
  );
}
