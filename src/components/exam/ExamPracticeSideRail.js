'use client';

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
  const { compactToolbar, portSideRailToToolbar, menuHeaderTools, menuExerciseStars, lang } = useExamPracticeSidebarSlots();

  if (!topRail && !strategy && !progress && !tools && !dictionary && !finishNotice) return null;

  if (compactToolbar && portSideRailToToolbar) {
    return (
      <ExamPracticeSideColumnAnchor>
        <div className="practice-compact-actions">
          {topRail}
          {strategy}
          <details className="practice-more-tools">
            <summary>{lang === 'es' ? 'Herramientas' : 'Tools'} <span aria-hidden>⌄</span></summary>
            <div className="practice-more-tools__menu">
              {menuHeaderTools}
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
