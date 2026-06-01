'use client';

import { cloneElement, isValidElement } from 'react';

export default function TheoryExerciseShell({ typeLabel, children, isCompleted, onComplete }) {
  const exercise =
    isValidElement(children) && (onComplete != null || isCompleted != null)
      ? cloneElement(children, { isCompleted, onComplete })
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
