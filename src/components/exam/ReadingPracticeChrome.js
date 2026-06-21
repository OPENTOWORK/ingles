'use client';

import { B2ExamPracticeChrome } from '@/components/b2/B2ExamPracticeChrome';
import ReadingPracticeHeaderTools from '@/components/exam/ReadingPracticeHeaderTools';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';
import { isExamSimulationMode } from '@/lib/examPracticeMode';

/** Puente entre ReadingPracticeSessionContext y B2ExamPracticeChrome. */
export default function ReadingPracticeChrome(props) {
  const session = useReadingPracticeSession();
  const showInstantFeedback = !isExamSimulationMode(props.practiceMode);

  return (
    <B2ExamPracticeChrome
      {...props}
      focusMode={session.focusMode}
      onExitFocusMode={session.focusMode ? session.toggleFocusMode : null}
      timerHidden={session.timerHidden}
      onToggleTimerHidden={() => session.setTimerHidden(!session.timerHidden)}
      headerTools={
        props.compactSkillHeader && !props.suppressChromeHeaderTools ? (
          <ReadingPracticeHeaderTools
            lang={props.lang === 'es' ? 'es' : 'en'}
            showInstantFeedback={showInstantFeedback}
          />
        ) : null
      }
      examModeSaveControls={props.examModeSaveControls ?? null}
    />
  );
}
