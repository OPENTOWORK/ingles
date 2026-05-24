'use client';

import { THEORY_CEFR_LEVELS } from '@/lib/theoryExerciseLevelConfig';

export default function TheoryExerciseLevelFilter({
  selectedLevel,
  onChange,
}) {
  return (
    <div className="theory-level-filter" role="group" aria-label="Filtrar ejercicios por nivel">
      {THEORY_CEFR_LEVELS.map((level) => {
        const active = selectedLevel === level;

        return (
          <button
            key={level}
            type="button"
            className={`theory-level-filter__btn${
              active ? ' theory-level-filter__btn--active' : ''
            }`}
            onClick={() => onChange(level)}
            aria-pressed={active}
            title={`Ejercicios de nivel ${level}`}
          >
            {level}
          </button>
        );
      })}

      <style jsx>{`
        .theory-level-filter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .theory-level-filter__btn {
          min-width: 42px;
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .theory-level-filter__btn:hover:not(.theory-level-filter__btn--active) {
          background: #f8fafc;
          color: #4338ca;
        }

        .theory-level-filter__btn--active {
          color: #fff;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
        }

        .theory-level-filter__btn:focus-visible {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
