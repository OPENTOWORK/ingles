'use client';

import ExamPracticeRailDisclosure from '@/components/exam/ExamPracticeRailDisclosure';

/**
 * Collapsible strategy guidance for Speaking part practice.
 */
export default function B2SpeakingStrategyPanel({ pack }) {
  if (!pack) return null;

  return (
    <ExamPracticeRailDisclosure
      title="Strategy and tips"
      asideClassName="levels-listening-strategy levels-speaking-strategy"
      toggleClassName="levels-listening-strategy__toggle levels-listening-strategy__toggle--speaking"
    >
      <section>
        <h3 className="levels-listening-strategy__heading">Strategy</h3>
        <p>{pack.strategy}</p>
      </section>
      {pack.commonMistakes?.length ? (
        <section>
          <h3 className="levels-listening-strategy__heading">Common mistakes</h3>
          <ul>
            {pack.commonMistakes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {pack.focusOn?.length ? (
        <section>
          <h3 className="levels-listening-strategy__heading">What to focus on</h3>
          <ul>
            {pack.focusOn.map((t) => (
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
