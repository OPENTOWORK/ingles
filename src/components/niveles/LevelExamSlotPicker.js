'use client';

import { LEVEL_EXAM_VARIANTS } from '@/data/nivelesLevelHub';

/** Selector Test 1–5 (foto 2). */
export default function LevelExamSlotPicker({ value, onSelect }) {
  return (
    <div className="level-exam-switch">
      <p className="level-exam-switch__label">Change exam</p>
      <div className="level-exam-switch__grid">
        {LEVEL_EXAM_VARIANTS.map((exam) => (
          <button
            key={exam.id}
            type="button"
            className={`level-exam-chip${exam.id === value ? ' level-exam-chip--active' : ''}`}
            onClick={() => onSelect(exam.id)}
            aria-pressed={exam.id === value}
          >
            {exam.label}
          </button>
        ))}
      </div>
      <style jsx>{`
        .level-exam-switch {
          width: 100%;
          max-width: min(100%, 960px);
          margin: 0 auto 1.5rem;
          padding: 1rem 1.15rem;
          border-radius: 1.15rem;
          border: 1px solid #e2e8f0;
          background: #fff;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
        }
        .level-exam-switch__label {
          margin: 0 0 0.65rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }
        .level-exam-switch__grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .level-exam-chip {
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          background: #fff;
          font-size: 0.88rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          transition:
            border-color 0.15s,
            background 0.15s,
            color 0.15s;
        }
        .level-exam-chip:hover {
          border-color: #818cf8;
          color: #4338ca;
        }
        .level-exam-chip--active {
          border-color: #2563eb;
          background: #2563eb;
          color: #fff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }
      `}</style>
    </div>
  );
}
