'use client';

import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

export default function ReadingPracticeFeedbackToggle({ lang = 'en', variant = 'default' }) {
  const en = lang === 'en';
  const session = useReadingPracticeSession();
  const showFeedback = session.readingSettings.showFeedback !== false;

  const labels = {
    on: en ? 'Instant feedback on' : 'Feedback inmediato activo',
    off: en ? 'Instant feedback off' : 'Feedback inmediato desactivado',
    hintOn: en
      ? 'Shows correct/incorrect colours and answers when you respond.'
      : 'Muestra colores y respuestas correctas al responder.',
    hintOff: en
      ? 'Answer without hints. Turn on again to see if you were right.'
      : 'Responde sin pistas. Actívalo de nuevo para ver si acertaste.',
  };

  const toggle = () => {
    const nextShowFeedback = !showFeedback;
    session.updateReadingSettings({ showFeedback: nextShowFeedback });
    if (nextShowFeedback) {
      session.resetAnswersRevealed();
    } else {
      session.resetAnswersRevealed();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('dralo-reading-instant-feedback-changed', {
            detail: { showFeedback: false },
          }),
        );
      }
    }
  };

  if (variant === 'header-tools') {
    const titleLabel = en ? 'Instant feedback' : 'Feedback inmediato';
    const stateLabel = showFeedback ? (en ? 'On' : 'Activado') : en ? 'Off' : 'Desactivado';

    return (
      <button
        type="button"
        className={`reading-practice-header-tools__btn${showFeedback ? ' is-active' : ''}`}
        onClick={toggle}
        aria-pressed={showFeedback}
        title={showFeedback ? labels.hintOn : labels.hintOff}
        aria-label={`${titleLabel} ${stateLabel}`}
      >
        <span className="reading-practice-header-tools__btn-title">{titleLabel}</span>
        <span className="reading-practice-header-tools__btn-state">{stateLabel}</span>
      </button>
    );
  }

  if (variant === 'sidebar-top') {
    return (
      <button
        type="button"
        className={`reading-feedback-toggle__btn reading-feedback-toggle__btn--sidebar-top tool-button${
          showFeedback ? ' active' : ''
        }`}
        onClick={toggle}
        aria-pressed={showFeedback}
        title={showFeedback ? labels.hintOn : labels.hintOff}
      >
        <span className="reading-feedback-toggle__icon" aria-hidden>
          💡
        </span>
        <span className="reading-feedback-toggle__label">
          {showFeedback ? labels.on : labels.off}
        </span>
      </button>
    );
  }

  if (variant === 'title-row') {
    return (
      <button
        type="button"
        className={`reading-feedback-toggle__btn reading-feedback-toggle__btn--title-row tool-button${
          showFeedback ? ' active' : ''
        }`}
        onClick={toggle}
        aria-pressed={showFeedback}
        title={showFeedback ? labels.hintOn : labels.hintOff}
      >
        <span className="reading-feedback-toggle__icon" aria-hidden>
          💡
        </span>
        <span className="reading-feedback-toggle__label">
          {showFeedback ? labels.on : labels.off}
        </span>
      </button>
    );
  }

  return (
    <div className="reading-feedback-toggle">
      <button
        type="button"
        className={`reading-feedback-toggle__btn tool-button${showFeedback ? ' active' : ''}`}
        onClick={toggle}
        aria-pressed={showFeedback}
        title={showFeedback ? labels.on : labels.off}
      >
        <span className="reading-feedback-toggle__icon" aria-hidden>
          💡
        </span>
        <span>{showFeedback ? labels.on : labels.off}</span>
      </button>
      <p className="reading-feedback-toggle__hint">{showFeedback ? labels.hintOn : labels.hintOff}</p>
    </div>
  );
}
