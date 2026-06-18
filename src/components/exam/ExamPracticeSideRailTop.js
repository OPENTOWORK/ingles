'use client';

import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';

/**
 * Top of the practice side rail: exercise stars + study notes.
 */
export default function ExamPracticeSideRailTop({
  exerciseStars = null,
  studyNotes = null,
}) {
  const { exerciseStars: exerciseStarsFromContext } = useExamPracticeSidebarSlots();
  const stars = exerciseStars ?? exerciseStarsFromContext;

  if (!stars && !studyNotes) return null;

  return (
    <div className="levels-listening-practice-side__top">
      {stars ? (
        <div className="levels-listening-practice-side__top-stars">{stars}</div>
      ) : null}
      {studyNotes ? (
        <div className="levels-listening-practice-side__top-notes">{studyNotes}</div>
      ) : null}
    </div>
  );
}
