'use client';

import { cloneElement, isValidElement } from 'react';

export default function TheoryExerciseShell({
  typeLabel,
  colloquialLabel,
  children,
  isCompleted,
  onComplete,
  onAdvance,
  engagementMode = false,
  isLastStep = false,
  reportExerciseId = '',
  reportQuestion = '',
  topicHref = '',
  cefrLevel = '',
}) {
  const exercise =
    isValidElement(children) &&
    (onComplete != null || onAdvance != null || isCompleted != null || engagementMode)
      ? cloneElement(children, {
          isCompleted,
          onComplete,
          onAdvance,
          engagementMode,
          isLastStep,
          reportExerciseId,
          reportQuestion,
          topicHref,
          cefrLevel,
        })
      : children;

  return (
    <div className="theory-exercise-item">
      {typeLabel ? (
        <p className="theory-exercise-item__type" aria-label="Exercise type">
          {typeLabel}
        </p>
      ) : null}
      {exercise}
    </div>
  );
}
