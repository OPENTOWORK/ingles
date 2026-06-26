'use client';

import { SkillPartInstructionsPanel } from '@/components/b2/B2ExamPracticeContent';

/**
 * Listening part practice briefing — same Instructions panel as Reading / Writing.
 */
export default function B2ListeningPracticeBriefing({
  whatYouWillHear,
  whatYouNeedToDo,
  practiceNote,
  examSimulation = false,
}) {
  if (!whatYouNeedToDo && !whatYouWillHear) return null;

  /** @type {Array<{ type: string, text: string }>} */
  const blocks = [];

  if (whatYouWillHear) {
    blocks.push({ type: 'paragraph', text: whatYouWillHear });
  }
  if (whatYouNeedToDo) {
    blocks.push({ type: 'paragraph', text: whatYouNeedToDo });
  }
  if (!examSimulation && practiceNote) {
    blocks.push({ type: 'paragraph', text: practiceNote });
  }
  if (examSimulation) {
    blocks.push({
      type: 'paragraph',
      text:
        'Exam simulation: each recording will play twice when strict playback is enabled. Do not check answers until you finish the section.',
    });
  }

  return <SkillPartInstructionsPanel label="Instructions" blocks={blocks} />;
}
