'use client';

import ReadingPracticeFeedbackToggle from '@/components/exam/ReadingPracticeFeedbackToggle';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

function HeaderToolButton({ active, onClick, ariaPressed, title, titleLabel, lang = 'en' }) {
  const en = lang === 'en';
  const stateLabel = active ? (en ? 'On' : 'Activado') : en ? 'Off' : 'Desactivado';

  return (
    <button
      type="button"
      className={`reading-practice-header-tools__btn${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={ariaPressed}
      title={title}
    >
      <span className="reading-practice-header-tools__btn-title">{titleLabel}</span>
      <span className="reading-practice-header-tools__btn-state">{stateLabel}</span>
    </button>
  );
}

/** Focus mode + instant feedback + answer eliminator — skill practice header toolbar. */
export default function ReadingPracticeHeaderTools({ lang = 'en', showInstantFeedback = true }) {
  const session = useReadingPracticeSession();
  const en = lang === 'en';

  const labels = {
    focus: en ? 'Focus mode' : 'Modo concentración',
    eliminator: en ? 'Answer eliminator' : 'Eliminador de respuestas',
    clearEliminated: en ? 'Clear eliminated' : 'Quitar eliminadas',
    focusHint: en ? 'Hide distractions and focus on the exercise.' : 'Oculta distracciones y céntrate en el ejercicio.',
    eliminatorHint: en
      ? 'Cross out answer options you think are wrong.'
      : 'Tacha las opciones que creas incorrectas.',
  };

  return (
    <div className="reading-practice-header-tools" role="group" aria-label={en ? 'Study tools' : 'Herramientas de estudio'}>
      <div className="reading-practice-header-tools__main">
        <HeaderToolButton
          active={session.focusMode}
          onClick={session.toggleFocusMode}
          ariaPressed={session.focusMode}
          title={labels.focusHint}
          titleLabel={labels.focus}
          lang={lang}
        />
        {showInstantFeedback ? (
          <ReadingPracticeFeedbackToggle lang={lang} variant="header-tools" />
        ) : null}
        <HeaderToolButton
          active={session.answerEliminatorEnabled}
          onClick={session.toggleAnswerEliminator}
          ariaPressed={session.answerEliminatorEnabled}
          title={labels.eliminatorHint}
          titleLabel={labels.eliminator}
          lang={lang}
        />
      </div>
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
