'use client';

/**
 * Title row for skill practice — category + subtitle + optional actions (e.g. favourite).
 * Test variant (Test N) belongs in the category line, like Reading / UoE.
 */
export default function SkillPartPracticeHeader({
  title,
  subtitle = null,
  exerciseLabel = null,
  titleActions = null,
}) {
  if (!title && !subtitle && !exerciseLabel && !titleActions) return null;

  return (
    <div className="levels-exam-split-card__title-row levels-exam-split-card__title-row--title-mode">
      {title || subtitle ? (
        <div className="levels-exam-split-card__part-title-block">
          {title ? (
            <p className="levels-exam-split-card__part-title-category">{title}</p>
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
