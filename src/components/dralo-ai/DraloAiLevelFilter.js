'use client';

import { THEORY_CEFR_LEVELS } from '@/lib/theoryExerciseLevelConfig';

export default function DraloAiLevelFilter({
  levels = THEORY_CEFR_LEVELS,
  selectedLevel,
  onChange,
}) {
  return (
    <div className="dralo-ai-level-filter" role="group" aria-label="CEFR level">
      {levels.map((level) => {
        const active = selectedLevel === level;
        return (
          <button
            key={level}
            type="button"
            className={`dralo-ai-level-filter__btn${active ? ' is-active' : ''}`}
            onClick={() => onChange(level)}
            aria-pressed={active}
            title={`Level ${level}`}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
