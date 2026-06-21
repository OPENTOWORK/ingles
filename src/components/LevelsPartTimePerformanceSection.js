'use client';

import { useMemo } from 'react';
import { buildPracticePerformanceSummary } from '@/utils/partTimePerformanceSummary';

function ExerciseBreakdown({ exercises }) {
  if (!exercises?.length) return <span className="pt-muted">—</span>;

  return (
    <ul className="pt-exam-list">
      {exercises.map((exercise) => (
        <li key={`${exercise.examSlot}-${exercise.scoreLabel || exercise.elapsedLabel || 'empty'}`}>
          <span className="pt-exam-list__name">{exercise.exerciseLabel}</span>
          {exercise.scoreLabel ? (
            <span className="pt-exam-list__score">{exercise.scoreLabel}</span>
          ) : (
            <span className="pt-exam-list__score pt-exam-list__score--muted">—</span>
          )}
          {exercise.elapsedLabel ? (
            <span className="pt-exam-list__time">{exercise.elapsedLabel}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ScoreBadge({ label, passed }) {
  if (!label) return <span className="pt-score pt-score--muted">—</span>;
  return (
    <span
      className={`pt-score${passed === true ? ' pt-score--pass' : passed === false ? ' pt-score--fail' : ''}`}
    >
      {label}
    </span>
  );
}

function BudgetCell({ percent }) {
  const safe = Math.max(0, Math.min(999, Number(percent) || 0));
  return <span className="pt-budget-cell__pct">{safe}%</span>;
}

function PartModeRow({ part, mode }) {
  const comparison = mode.lastComparison;

  return (
    <tr>
      <td className="pt-td pt-td--part">
        <span className="pt-part-name">{part.partLabel}</span>
      </td>
      <td className="pt-td pt-td--mode">
        <span className="pt-mode-pill">{mode.modeLabel}</span>
      </td>
      <td className="pt-td pt-td--num">{comparison?.elapsedLabel ?? '—'}</td>
      <td className="pt-td pt-td--num">{mode.bestComparison?.elapsedLabel ?? '—'}</td>
      <td className="pt-td pt-td--score">
        <ScoreBadge label={mode.lastScoreLabel} passed={mode.lastPassed} />
      </td>
      <td className="pt-td pt-td--budget">
        {comparison ? <BudgetCell percent={comparison.percentOfBudget} /> : '—'}
      </td>
      <td className="pt-td pt-td--exams">
        <ExerciseBreakdown exercises={mode.exerciseComparisons} />
      </td>
    </tr>
  );
}

/**
 * @param {object} props
 * @param {Array} props.estadisticasRows
 * @param {Array} [props.puntuacionesRows]
 * @param {Record<string, Record<string, string>>} [props.examNamesBySlot]
 */
export default function LevelsPartTimePerformanceSection({
  estadisticasRows = [],
  puntuacionesRows = [],
  examenIdsByLevel = {},
}) {
  const summary = useMemo(
    () =>
      buildPracticePerformanceSummary(estadisticasRows, {
        puntuacionesRows,
        examenIdsByLevel,
      }),
    [estadisticasRows, puntuacionesRows, examenIdsByLevel],
  );

  if (!summary.hasAnyData) return null;

  return (
    <div className="pt-sections">
      {summary.levels.map((level) => (
        <section
          key={level.levelSlug}
          className="pt-level"
          aria-labelledby={`pt-level-${level.levelSlug}`}
        >
          <header className="pt-level__head">
            <h3 id={`pt-level-${level.levelSlug}`} className="pt-level__title">
              {level.levelLabel}
            </h3>
            <span className="pt-level__badge">
              {level.sections.reduce((sum, section) => sum + section.parts.length, 0)} parts tracked
            </span>
          </header>

          {level.sections.map((section) => (
            <div key={`${level.levelSlug}-${section.sectionTitle}`} className="pt-skill-block">
              <div className="pt-skill-block__head">
                <h4 className="pt-skill-block__title">{section.sectionTitle}</h4>
              </div>

              <div className="pt-table-wrap">
                <table className="pt-table">
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="pt-th--part">Part</th>
                      <th scope="col">Mode</th>
                      <th scope="col" className="pt-th--num">Last</th>
                      <th scope="col" className="pt-th--num">Best</th>
                      <th scope="col" className="pt-th--score">Score</th>
                      <th scope="col" className="pt-th--budget">Completed</th>
                      <th scope="col" className="pt-th--exam">By exercise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.parts.flatMap((part) =>
                      part.modes.map((mode) => (
                        <PartModeRow
                          key={`${level.levelSlug}-${section.sectionTitle}-${part.partNumber}-${mode.scoreSource}`}
                          part={part}
                          mode={mode}
                        />
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}

      <style jsx global>{`
        .pt-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #fafbfc;
        }

        .pt-table {
          display: table !important;
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .pt-table col {
          width: calc(100% / 7);
        }

        .pt-table thead {
          display: table-header-group !important;
          background: #f1f5f9;
        }

        .pt-table tbody {
          display: table-row-group !important;
        }

        .pt-table tr {
          display: table-row !important;
        }

        .pt-table th,
        .pt-table td {
          display: table-cell !important;
          vertical-align: middle;
          padding: 11px 16px;
          line-height: 1.4;
        }

        .pt-table th {
          text-align: center;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .pt-table td {
          color: #334155;
          border-bottom: 1px solid #eef2f6;
          text-align: center;
        }

        .pt-table tbody tr:last-child td {
          border-bottom: none;
        }

        .pt-table tbody tr:hover td {
          background: #ffffff;
        }

        .pt-table td.pt-td--num {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #1e40af;
        }

        .pt-budget-cell__pct {
          font-size: 0.8125rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: #64748b;
          white-space: nowrap;
        }

        .pt-mode-pill {
          display: inline-block;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
          font-size: 0.625rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pt-muted {
          color: #94a3b8;
        }

        .pt-score {
          display: inline-block;
          padding: 0.2rem 0.45rem;
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          line-height: 1.3;
        }

        .pt-score--pass {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .pt-score--fail {
          background: #fef2f2;
          border-color: #fecaca;
          color: #b91c1c;
        }

        .pt-score--muted {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 500;
          padding: 0;
        }

        .pt-table th.pt-th--part,
        .pt-table td.pt-td--part {
          text-align: left;
        }

        .pt-table td.pt-td--part {
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
        }

        .pt-table td.pt-td--mode,
        .pt-table td.pt-td--num,
        .pt-table td.pt-td--score {
          white-space: nowrap;
        }

        .pt-exam-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 4px;
        }

        .pt-exam-list li {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px 8px;
          font-size: 0.75rem;
          line-height: 1.35;
        }

        .pt-exam-list__name {
          color: #64748b;
          font-weight: 500;
        }

        .pt-exam-list__time {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #1e40af;
        }

        .pt-exam-list__score {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #0f172a;
        }

        .pt-exam-list__score--muted {
          color: #94a3b8;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .pt-table-wrap {
            overflow-x: auto;
          }

          .pt-table {
            min-width: 640px;
          }

          .pt-table th,
          .pt-table td {
            padding: 10px 14px;
          }
        }
      `}</style>
      <style jsx>{`
        .pt-sections {
          display: grid;
          gap: 20px;
        }

        .pt-level {
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .pt-level__head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pt-level__title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.03em;
        }

        .pt-level__badge {
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .pt-skill-block + .pt-skill-block {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px dashed #e2e8f0;
        }

        .pt-skill-block__head {
          margin-bottom: 12px;
        }

        .pt-skill-block__title {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0f172a;
        }

        .pt-skill-block__meta {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.45;
        }

        @media (max-width: 640px) {
          .pt-level {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}
