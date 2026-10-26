'use client';

import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';

/**
 * Title row for skill practice — category + subtitle + optional actions (e.g. favourite).
 * Test variant (Test N) belongs in the category line, like Reading / UoE.
 */
export default function SkillPartPracticeHeader({
  title,
  subtitle = null,
  exerciseLabel = null,
  titleActions = null,
  unlockHint = null,
}) {
  const { compactToolbar, testLabel } = useExamPracticeSidebarSlots();
  if (compactToolbar) {
    return (
      <div className="levels-exam-split-card__title-row levels-exam-split-card__title-row--title-mode">
        <div className="levels-exam-split-card__part-title-block">
          <h1 className="levels-exam-split-card__part-title">{[title, subtitle].filter(Boolean).join(' - ')}</h1>
          {exerciseLabel || testLabel ? (
            <p className="practice-exercise-test-label" title={unlockHint || undefined}>{exerciseLabel || testLabel}</p>
          ) : null}
        </div>
        {titleActions}
      </div>
    );
  }

  if (!title && !subtitle && !exerciseLabel && !titleActions && !unlockHint) return null;

  return (
    <div className="levels-exam-split-card__title-row levels-exam-split-card__title-row--title-mode">
      {title || subtitle || unlockHint ? (
        <div className="levels-exam-split-card__part-title-block">
          {title ? (
            <p className="levels-exam-split-card__part-title-category">{title}</p>
          ) : null}
          {unlockHint ? (
            <p
              id="skill-next-exercise-hint"
              className="levels-exam-split-card__unlock-hint"
              role="status"
            >
              {unlockHint}
            </p>
          ) : null}
          {subtitle ? (
            <h1 className="levels-exam-split-card__part-title">{subtitle}</h1>
          ) : title ? (
            <h1 className="levels-exam-split-card__part-title">{title}</h1>
          ) : null}
        </div>
      ) : null}
      {exerciseLabel ? (
        <span className="levels-exam-split-card__exercise-label">{exerciseLabel}</span>
      ) : null}
      {titleActions}
    </div>
  );
}
