'use client';

import { getReadingPracticeStrategyTips } from '@/data/readingPracticeStrategyTips';
import ExamPracticeRailDisclosure from '@/components/exam/ExamPracticeRailDisclosure';

/**
 * Collapsible Strategy & tips sidebar for Reading and Use of English part practice.
 */
export default function B2ReadingStrategyPanel({ pack, partNumber }) {
  const tips = getReadingPracticeStrategyTips(partNumber) || null;

  if (!pack && !tips) return null;

  return (
    <ExamPracticeRailDisclosure title="Strategy and tips">
      {tips ? (
        <>
          <section>
            <h3 className="levels-listening-strategy__heading">{tips.title}</h3>
            <ul>
              {tips.strategyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          {tips.commonTraps?.length ? (
            <section>
              <h3 className="levels-listening-strategy__heading">Common traps</h3>
              <ul>
                {tips.commonTraps.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {tips.timing ? (
            <section>
              <h3 className="levels-listening-strategy__heading">Timing</h3>
              <p>{tips.timing}</p>
            </section>
          ) : null}

          {tips.exampleExplanation ? (
            <section className="levels-listening-strategy__tip">
              <h3 className="levels-listening-strategy__heading">Example explanation</h3>
              <p>{tips.exampleExplanation}</p>
            </section>
          ) : null}
        </>
      ) : (
        <>
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
        </>
      )}

      {tips?.lookFor?.length || pack?.lookFor?.length ? (
        <section>
          <h3 className="levels-listening-strategy__heading">What to look for</h3>
          <ul>
            {(tips?.lookFor || pack?.lookFor || []).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {tips?.studyTip || pack?.studyTip ? (
        <section className="levels-listening-strategy__tip">
          <h3 className="levels-listening-strategy__heading">Study tip</h3>
          <p>{tips?.studyTip || pack?.studyTip}</p>
        </section>
      ) : null}
    </ExamPracticeRailDisclosure>
  );
}
