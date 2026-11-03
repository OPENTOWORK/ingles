'use client';

import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

/** On by default: corrections appear as soon as an answer is chosen. */
export default function ReadingInstantFeedbackToggle({ lang = 'en' }) {
  const session = useReadingPracticeSession();
  const en = lang === 'en';
  const on = session.instantFeedback !== false;

  return (
    <button
      type="button"
      className={`practice-instant-feedback${on ? ' is-on' : ''}`}
      aria-pressed={on}
      onClick={session.toggleInstantFeedback}
      title={
        on
          ? en
            ? 'Corrections appear as you answer. Click to turn them off.'
            : 'La corrección sale al responder. Pulsa para apagarla.'
          : en
            ? 'Corrections stay hidden until Check. Click to turn them on.'
            : 'La corrección espera a Check. Pulsa para encenderla.'
      }
    >
      <span>{en ? 'Instant feedback' : 'Feedback instantáneo'}</span>
      <strong>{on ? 'On' : 'Off'}</strong>
    </button>
  );
}
