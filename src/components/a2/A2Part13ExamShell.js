'use client';

import { A2Part13ExamView } from '@/components/a2/A2Part13ExamView';

export default function A2Part13ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  interviewIntro = '',
  interviewPrompts = [],
  photoTitle = '',
  photos = [],
}) {
  return (
    <div className="a2-p13-exam-frame">
      {showDemoNote ? (
        <p className="a2-p13-paper__demo-note" role="status">
          Official Cambridge sample format (placeholder pictures). An admin can save this to Supabase
          by regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part13ExamView
        directions={directions}
        interviewIntro={interviewIntro}
        interviewPrompts={interviewPrompts}
        photoTitle={photoTitle}
        photos={photos}
      />
    </div>
  );
}
