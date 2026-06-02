'use client';

import { A2Part14ExamView } from '@/components/a2/A2Part14ExamView';

export default function A2Part14ExamShell({
  showDemoNote = false,
  examSlot = 1,
  directions = '',
  taskInstruction = '',
  photoTitle = '',
  photos = [],
  followUpIntro = '',
  followUpPrompts = [],
}) {
  return (
    <div className="a2-p14-exam-frame">
      {showDemoNote ? (
        <p className="a2-p14-paper__demo-note" role="status">
          Official Cambridge sample format (placeholder pictures). An admin can save this to Supabase
          by regenerating Exam {examSlot} with DRALO AI.
        </p>
      ) : null}
      <A2Part14ExamView
        directions={directions}
        taskInstruction={taskInstruction}
        photoTitle={photoTitle}
        photos={photos}
        followUpIntro={followUpIntro}
        followUpPrompts={followUpPrompts}
      />
    </div>
  );
}
