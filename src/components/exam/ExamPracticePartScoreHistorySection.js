'use client';

import { collectPartScoresAcrossSlots } from '@/lib/examPracticePartScoreHistory';

/**
 * Recent saved scores for the active part (all exam variants).
 */
export default function ExamPracticePartScoreHistorySection({
  partNumber,
  examSlot,
  progressBySlot = {},
  examLabelsBySlot = {},
  passing = null,
  lang = 'en',
}) {
  const en = lang === 'en';
  const entries = collectPartScoresAcrossSlots(progressBySlot, partNumber, {
    examSlot,
    examLabelsBySlot,
  });

  const labels = {
    heading: en ? 'Recent scores for this part' : 'Últimas notas de esta parte',
    empty: en ? 'No saved scores for this part yet.' : 'Aún no hay notas guardadas para esta parte.',
    current: en ? 'Current test' : 'Examen actual',
    passed: en ? 'Passed' : 'Aprobada',
    notPassed: en ? 'Not passed' : 'No aprobada',
  };

  return (
    <section>
      <h3 className="levels-listening-strategy__heading">{labels.heading}</h3>
      {!entries.length ? (
        <p className="levels-listening-strategy__muted">{labels.empty}</p>
      ) : (
        <ul className="levels-listening-strategy__progress-list">
          {entries.map((entry) => (
            <li
              key={entry.slot}
              className={`levels-listening-strategy__progress-item${
                entry.isCurrent ? ' levels-listening-strategy__progress-item--current' : ''
              }`}
            >
              <span className="levels-listening-strategy__progress-part">
                {entry.label}
                {entry.isCurrent ? ` · ${labels.current}` : ''}
              </span>
              <span
                className={
                  entry.passed
                    ? 'levels-listening-strategy__progress-score levels-listening-strategy__progress-score--pass'
                    : 'levels-listening-strategy__progress-score'
                }
              >
                {entry.correct}/{entry.total}
                {entry.passed ? ` · ${labels.passed}` : ` · ${labels.notPassed}`}
                {passing != null && !entry.passed
                  ? en
                    ? ` (need ${passing})`
                    : ` (necesitas ${passing})`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
