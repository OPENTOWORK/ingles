'use client';

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

/** Focus mode in the practice header; answers are checked from the footer. */
export default function ReadingPracticeHeaderTools({ lang = 'en' }) {
  const session = useReadingPracticeSession();
  const en = lang === 'en';

  const labels = {
    focus: en ? 'Focus mode' : 'Modo concentración',
    focusHint: en ? 'Hide distractions and focus on the test.' : 'Oculta distracciones y céntrate en el test.',
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
      </div>
    </div>
  );
}
