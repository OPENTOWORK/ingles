'use client';

import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';
import type { MicroFeedback } from '@/features/speaking/domain/types';
import { formatB2SpeakingScoreLine } from '@/features/speaking/domain/b2-speaking-score';

type Props = {
  micro?: MicroFeedback | null;
  report?: CorrectionReportPayload | null;
};

export function FeedbackCards({ micro, report }: Props) {
  if (!micro && !report) return null;

  if (report) {
    const b2 = report.b2Speaking;

    return (
      <section className="speaking-feedback-report" aria-label="Speaking feedback">
        {b2 ? (
          <div className="speaking-feedback-report__summary">
            <div className="speaking-feedback-report__score-head">
              <p className="speaking-feedback-report__score-label">
                Speaking score:{' '}
                <strong>
                  {b2.total}/{b2.maxTotal}
                </strong>
              </p>
              <p className="speaking-feedback-report__level">
                Estimated level: <strong>{b2.estimatedLevel}</strong>
              </p>
            </div>
            <ul className="speaking-feedback-report__b2-criteria">
              {b2.criteria.map((c) => (
                <li key={c.key}>
                  <span className="speaking-feedback-report__b2-criterion-label">{c.label}</span>
                  <span className="speaking-feedback-report__b2-criterion-score">
                    {formatB2SpeakingScoreLine(c.score)}
                  </span>
                </li>
              ))}
            </ul>
            {b2.partFeedback?.length ? (
              <div className="speaking-feedback-report__part-notes">
                <p className="speaking-feedback-report__part-notes-title">Part feedback</p>
                <ul>
                  {b2.partFeedback.map((item) => (
                    <li key={item.part}>
                      <strong>{item.part}:</strong> {item.note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {report.criteria.length > 0 ? (
          <div className="speaking-feedback-report__metrics">
            {report.criteria.map((c) => (
              <article key={c.criterion} className="speaking-feedback-report__metric-card">
                <h3 className="speaking-feedback-report__metric-title">{c.criterion}</h3>
                <p className="speaking-feedback-report__metric-score">{c.score}/5</p>
                {c.errors.length > 0 ? (
                  <ul className="speaking-feedback-report__metric-errors">
                    {c.errors.slice(0, 3).map((e, i) => (
                      <li key={i}>
                        <em>{e.excerpt}</em> — {e.suggestion}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        <div className="speaking-feedback-report__text-columns">
          <article className="speaking-feedback-report__text-card">
            <h3 className="speaking-feedback-report__text-title">Corrected version</h3>
            <p className="speaking-feedback-report__text-body">{report.correctedVersion}</p>
          </article>
          <article className="speaking-feedback-report__text-card">
            <h3 className="speaking-feedback-report__text-title">Model answer</h3>
            <p className="speaking-feedback-report__text-body">{report.modelAnswer}</p>
          </article>
        </div>

        <footer className="speaking-feedback-report__footer">
          <p>{report.shortExplanation}</p>
          {report.isPartialEvaluation && report.partialEvaluationNote ? (
            <p className="speaking-feedback-report__partial">{report.partialEvaluationNote}</p>
          ) : null}
          {report.strengths?.length ? (
            <div className="speaking-feedback-report__list-block">
              <p className="speaking-feedback-report__list-title">Strengths</p>
              <ul>
                {report.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.mainErrors?.length ? (
            <div className="speaking-feedback-report__list-block">
              <p className="speaking-feedback-report__list-title">Main errors</p>
              <ul>
                {report.mainErrors.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.improvedPhrases?.length ? (
            <div className="speaking-feedback-report__list-block">
              <p className="speaking-feedback-report__list-title">Improved phrases</p>
              <ul>
                {report.improvedPhrases.map((item, i) => (
                  <li key={i}>
                    <em>{item.original}</em> → {item.improved}
                    {item.note ? ` (${item.note})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.recommendations?.length ? (
            <div className="speaking-feedback-report__list-block">
              <p className="speaking-feedback-report__list-title">Recommendations</p>
              <ul>
                {report.recommendations.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.practicePlan?.length ? (
            <div className="speaking-feedback-report__list-block">
              <p className="speaking-feedback-report__list-title">Practice plan</p>
              <ul>
                {report.practicePlan.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="speaking-feedback-report__pronunciation">
            Pronunciation: {report.pronunciation.score}/5 — {report.pronunciation.feedback}{' '}
            {report.pronunciation.isEstimated ? '(estimated from transcript)' : ''}
          </p>
        </footer>
      </section>
    );
  }

  return (
    <section className="speaking-feedback-report speaking-feedback-report--micro" aria-label="Quick feedback">
      <div className="speaking-feedback-report__metrics">
        <article className="speaking-feedback-report__metric-card">
          <h3 className="speaking-feedback-report__metric-title">Grammar</h3>
          <p className="speaking-feedback-report__text-body">{micro?.grammarCorrection}</p>
        </article>
        <article className="speaking-feedback-report__metric-card">
          <h3 className="speaking-feedback-report__metric-title">Vocabulary</h3>
          <p className="speaking-feedback-report__text-body">{micro?.vocabularyImprovement}</p>
        </article>
        <article className="speaking-feedback-report__metric-card">
          <h3 className="speaking-feedback-report__metric-title">Natural alternative</h3>
          <p className="speaking-feedback-report__text-body">{micro?.naturalAlternative}</p>
        </article>
        <article className="speaking-feedback-report__metric-card">
          <h3 className="speaking-feedback-report__metric-title">Estimated CEFR fit</h3>
          <p className="speaking-feedback-report__text-body">{micro?.estimatedCefrFit}</p>
          {micro?.pronunciationNote ? (
            <p className="speaking-feedback-report__pronunciation">{micro.pronunciationNote}</p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
