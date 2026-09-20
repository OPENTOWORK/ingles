'use client';

import ExamPracticeRailDisclosure from '@/components/exam/ExamPracticeRailDisclosure';

/**
 * Collapsible strategy guidance for Listening part practice.
 */
export default function B2ListeningStrategyPanel({ pack }) {
  if (!pack) return null;

  return (
    <ExamPracticeRailDisclosure title="Strategy and tips">
      <section>
        <h3 className="levels-listening-strategy__heading">Strategy</h3>
        <p>{pack.strategy}</p>
      </section>
      {pack.commonTraps?.length ? (
        <section>
          <h3 className="levels-listening-strategy__heading">Common traps</h3>
          <ul>
            {pack.commonTraps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {pack.listenFor?.length ? (
        <section>
          <h3 className="levels-listening-strategy__heading">What to listen for</h3>
          <ul>
            {pack.listenFor.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {pack.studyTip ? (
        <section className="levels-listening-strategy__tip">
          <h3 className="levels-listening-strategy__heading">Study tip</h3>
          <p>{pack.studyTip}</p>
        </section>
      ) : null}
    </ExamPracticeRailDisclosure>
  );
}
