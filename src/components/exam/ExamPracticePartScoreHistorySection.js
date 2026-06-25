'use client';

import Link from 'next/link';
import {
  collectPartScoresAcrossSlots,
  getSkillPartExerciseHref,
} from '@/lib/examPracticePartScoreHistory';

/**
 * Lowest saved scores for the active part (skill-practice test variants).
 */
export default function ExamPracticePartScoreHistorySection({
  partNumber,
  examSlot,
  progressBySlot = {},
  slug = 'b2',
  skillRoute = null,
  lang = 'en',
}) {
  const en = lang === 'en';
  const entries = collectPartScoresAcrossSlots(progressBySlot, partNumber, {
    examSlot,
    lang,
  });

  const labels = {
    heading: en ? 'Recent scores for this part' : 'Últimas notas de esta parte',
    empty: en ? 'No saved scores for this part yet.' : 'Aún no hay notas guardadas para esta parte.',
    passed: en ? 'Passed' : 'Aprobada',
    notPassed: en ? 'Not passed' : 'No aprobada',
    openExercise: en ? 'Open test' : 'Abrir test',
  };

  return (
    <section>
      <h3 className="levels-listening-strategy__heading">{labels.heading}</h3>
      {!entries.length ? (
        <p className="levels-listening-strategy__muted">{labels.empty}</p>
      ) : (
        <ul className="levels-listening-strategy__progress-list">
          {entries.map((entry) => {
            const href = getSkillPartExerciseHref({
              levelSlug: slug,
              skillRoute,
              partNumber,
              examSlot: entry.slot,
            });
            const itemClassName = `levels-listening-strategy__progress-item${
              entry.isCurrent ? ' levels-listening-strategy__progress-item--current' : ''
            }`;
            const content = (
              <>
                <span className="levels-listening-strategy__progress-part">{entry.label}</span>
                <span
                  className={
                    entry.passed
                      ? 'levels-listening-strategy__progress-score levels-listening-strategy__progress-score--pass'
                      : 'levels-listening-strategy__progress-score levels-listening-strategy__progress-score--fail'
                  }
                >
                  {entry.correct}/{entry.total}
                  {entry.passed ? ` · ${labels.passed}` : ` · ${labels.notPassed}`}
                </span>
              </>
            );

            return (
              <li key={entry.slot}>
                {href ? (
                  <Link
                    href={href}
                    className={`${itemClassName} levels-listening-strategy__progress-item--link`}
                    aria-label={`${entry.label}. ${labels.openExercise}.`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={itemClassName}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
