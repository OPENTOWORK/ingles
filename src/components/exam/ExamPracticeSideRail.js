'use client';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';
import ExamPracticeSideColumnAnchor from '@/components/exam/ExamPracticeSideColumnAnchor';

/**
 * Columna lateral: top (stats + notes) + Strategy + Progress + Tools.
 */
export default function ExamPracticeSideRail({
  topRail = null,
  strategy = null,
  progress = null,
  tools = null,
  dictionary = null,
  finishNotice = null,
}) {
  const { compactToolbar, portSideRailToToolbar, menuHeaderTools, menuTimerTools, menuExerciseStars, lang } = useExamPracticeSidebarSlots();

  if (!topRail && !strategy && !progress && !tools && !dictionary && !finishNotice) return null;

  if (compactToolbar && portSideRailToToolbar) {
    return (
      <ExamPracticeSideColumnAnchor>
        <div className="practice-compact-actions">
          {topRail}
          {strategy}
          <details className="practice-more-tools">
            <summary><SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden="true" />{lang === 'es' ? 'Herramientas' : 'Tools'}<ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" /></summary>
            <div className="practice-more-tools__menu">
              {menuHeaderTools}
              {menuTimerTools}
              {menuExerciseStars}
              {progress}
              {tools}
              {dictionary}
            </div>
          </details>
          {finishNotice}
        </div>
      </ExamPracticeSideColumnAnchor>
    );
  }

  const rail = (
    <div className="levels-listening-practice-side">
      {topRail}
      {strategy || progress || tools || dictionary || finishNotice ? (
        <div className="levels-listening-practice-side__panels">
          {strategy}
          {progress}
          {tools}
          {dictionary}
          {finishNotice}
        </div>
      ) : null}
    </div>
  );

  return <ExamPracticeSideColumnAnchor>{rail}</ExamPracticeSideColumnAnchor>;
}
