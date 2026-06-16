'use client';

import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

/** Focus mode + answer eliminator — prominent controls in skill practice header. */
export default function ReadingPracticeHeaderTools({ lang = 'en' }) {
  const session = useReadingPracticeSession();
  const en = lang === 'en';

  const labels = {
    focus: en ? 'Focus mode' : 'Modo concentración',
    exitFocus: en ? 'Exit focus mode' : 'Salir del modo concentración',
    eliminator: en ? 'Answer eliminator' : 'Eliminador de respuestas',
    clearEliminated: en ? 'Clear eliminated' : 'Quitar eliminadas',
  };

  return (
    <div className="reading-practice-header-tools" role="group" aria-label={en ? 'Study tools' : 'Herramientas de estudio'}>
      <button
        type="button"
        className={`reading-practice-header-tools__btn${session.focusMode ? ' is-active' : ''}`}
        onClick={session.toggleFocusMode}
        aria-pressed={session.focusMode}
      >
        {session.focusMode ? labels.exitFocus : labels.focus}
      </button>
      <button
        type="button"
        className={`reading-practice-header-tools__btn${session.answerEliminatorEnabled ? ' is-active' : ''}`}
        onClick={session.toggleAnswerEliminator}
        aria-pressed={session.answerEliminatorEnabled}
      >
        {labels.eliminator}
      </button>
      {session.answerEliminatorEnabled ? (
        <button
          type="button"
          className="reading-practice-header-tools__btn reading-practice-header-tools__btn--ghost"
          onClick={session.clearEliminatedAnswers}
        >
          {labels.clearEliminated}
        </button>
      ) : null}
    </div>
  );
}
