'use client';

import { useMemo } from 'react';
import { buildPracticePerformanceSummary } from '@/utils/partTimePerformanceSummary';

function formatExamSlotLabel(examSlot, examNamesBySlot, levelSlug) {
  if (examSlot == null || examSlot === 'unknown') return 'Unknown exam';
  const key = String(examSlot);
  const byLevel = examNamesBySlot?.[levelSlug] || examNamesBySlot;
  return byLevel?.[key] || byLevel?.[Number(key)] || `Test ${key}`;
}

function ScoreBadge({ label, passed }) {
  if (!label) return <span className="lsp-part-times__muted">—</span>;
  return (
    <span
      className={`lsp-part-times__score${passed === true ? ' lsp-part-times__score--pass' : passed === false ? ' lsp-part-times__score--fail' : ''}`}
    >
      {label}
    </span>
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
  examNamesBySlot = {},
}) {
  const summary = useMemo(
    () => buildPracticePerformanceSummary(estadisticasRows, { puntuacionesRows }),
    [estadisticasRows, puntuacionesRows],
  );

  if (!summary.hasAnyData) return null;

  return (
    <div className="lsp-part-times-root">
      {summary.levels.map((level) => (
        <section
          key={level.levelSlug}
          className="lsp-part-times"
          aria-labelledby={`lsp-part-times-${level.levelSlug}`}
        >
          <header className="lsp-part-times__header">
            <h3 id={`lsp-part-times-${level.levelSlug}`} className="lsp-part-times__level-title">
              {level.levelLabel}
            </h3>
          </header>

          {level.sections.map((section) => (
            <div key={`${level.levelSlug}-${section.sectionTitle}`} className="lsp-part-times__section">
              <div className="lsp-part-times__section-head">
                <h4 className="lsp-part-times__title">{section.sectionTitle}</h4>
                <p className="lsp-part-times__subtitle">
                  Section budget: {section.budgetComparison.elapsedLabel}. Tracked total:{' '}
                  {section.totalComparison.elapsedLabel} ({section.totalComparison.percentOfBudget}% of
                  section).
                </p>
              </div>

              <div className="lsp-part-times__table-wrap">
                <table className="lsp-part-times__table">
                  <thead>
                    <tr>
                      <th scope="col">Part</th>
                      <th scope="col">Mode</th>
                      <th scope="col">Last time</th>
                      <th scope="col">Best</th>
                      <th scope="col">Last score</th>
                      <th scope="col">By exam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.parts.flatMap((part) =>
                      part.modes.map((mode) => (
                        <tr key={`${level.levelSlug}-${section.sectionTitle}-${part.partNumber}-${mode.scoreSource}`}>
                          <td>
                            <span className="lsp-part-times__part-label">{part.partLabel}</span>
                          </td>
                          <td>
                            <span className="lsp-part-times__mode">{mode.modeLabel}</span>
                          </td>
                          <td>{mode.lastComparison?.elapsedLabel ?? '—'}</td>
                          <td>{mode.bestComparison?.elapsedLabel ?? '—'}</td>
                          <td>
                            <ScoreBadge label={mode.lastScoreLabel} passed={mode.lastPassed} />
                          </td>
                          <td>
                            {mode.examComparisons.length ? (
                              <ul className="lsp-part-times__exam-list">
                                {mode.examComparisons.map((exam) => (
                                  <li key={`${part.partNumber}-${mode.scoreSource}-${exam.examSlot}`}>
                                    <span className="lsp-part-times__exam-name">
                                      {formatExamSlotLabel(exam.examSlot, examNamesBySlot, level.levelSlug)}
                                    </span>
                                    <span className="lsp-part-times__exam-time">{exam.elapsedLabel}</span>
                                    {exam.scoreLabel ? (
                                      <span className="lsp-part-times__exam-score">{exam.scoreLabel}</span>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}

      <style jsx>{`
        .lsp-part-times-root {
          display: grid;
          gap: 16px;
        }

        .lsp-part-times {
          margin: 0;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .lsp-part-times__header {
          margin-bottom: 12px;
        }

        .lsp-part-times__level-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.04em;
        }

        .lsp-part-times__section + .lsp-part-times__section {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        .lsp-part-times__section-head {
          margin-bottom: 12px;
        }

        .lsp-part-times__title {
          margin: 0 0 4px;
          font-size: 0.98rem;
          font-weight: 700;
          color: #0f172a;
        }

        .lsp-part-times__subtitle {
          margin: 0;
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
        }

        .lsp-part-times__table-wrap {
          overflow-x: auto;
        }

        .lsp-part-times__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .lsp-part-times__table th,
        .lsp-part-times__table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }

        .lsp-part-times__table th {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #64748b;
          background: #ffffff;
        }

        .lsp-part-times__part-label {
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
        }

        .lsp-part-times__mode {
          display: inline-block;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #334155;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .lsp-part-times__score {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }

        .lsp-part-times__score--pass {
          color: #15803d;
        }

        .lsp-part-times__score--fail {
          color: #b91c1c;
        }

        .lsp-part-times__muted {
          color: #94a3b8;
        }

        .lsp-part-times__exam-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 6px;
        }

        .lsp-part-times__exam-list li {
          display: grid;
          gap: 2px;
        }

        .lsp-part-times__exam-name {
          color: #475569;
          font-weight: 600;
        }

        .lsp-part-times__exam-time {
          font-weight: 700;
          color: #1e40af;
          font-variant-numeric: tabular-nums;
        }

        .lsp-part-times__exam-score {
          font-size: 0.75rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
