'use client';

import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';
import type { MicroFeedback } from '@/features/speaking/domain/types';
import { formatB2SpeakingScoreLine } from '@/features/speaking/domain/b2-speaking-score';

const PRONUNCIATION_TRANSCRIPT_DISCLAIMER =
  'Pronunciation is estimated from the transcript and may not reflect actual pronunciation accuracy.';

type Props = {
  micro?: MicroFeedback | null;
  report?: CorrectionReportPayload | null;
};

export function FeedbackCards({ micro, report }: Props) {
  if (!micro && !report) return null;

  if (report) {
    const b2 = report.b2Speaking;
    const canProvideFullScore = report.canProvideFullScore ?? report.speakingEvidence?.canProvideFullScore ?? true;
    const speakingEvidence = report.speakingEvidence;
    const showLegacyCriteria = !b2 && report.criteria.length > 0;
    const showLegacyPronunciationFooter = !b2 && report.pronunciation;

    return (
      <section className="speaking-feedback-report" aria-label="Speaking feedback">
        {!canProvideFullScore ? (
          <div className="speaking-feedback-report__partial-banner" role="status">
            <p className="speaking-feedback-report__partial-title">
              <strong>Partial feedback only</strong>
            </p>
            <p className="speaking-feedback-report__partial">
              {report.partialEvaluationNote ||
                'This is partial feedback. Complete all four parts to receive a full estimated Cambridge-style score.'}
            </p>
            {speakingEvidence?.message ? (
              <p className="speaking-feedback-report__partial">{speakingEvidence.message}</p>
            ) : null}
            {speakingEvidence?.partsMissing?.length ? (
              <p className="speaking-feedback-report__partial">
                Missing parts: {speakingEvidence.partsMissing.join(', ')}.
              </p>
            ) : null}
            {speakingEvidence?.evidenceNotes?.length ? (
              <ul className="speaking-feedback-report__partial-list">
                {speakingEvidence.evidenceNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            ) : null}
            <p className="speaking-feedback-report__partial">
              Complete the full exam to receive a full estimated score.
            </p>
          </div>
        ) : null}

        {b2 ? (
          <div className="speaking-feedback-report__summary">
            <div className="speaking-feedback-report__score-head">
              {canProvideFullScore ? (
                <>
                  <p className="speaking-feedback-report__score-label">
                    Dralo estimated Cambridge-style score:{' '}
                    <strong>
                      {b2.total}/{b2.maxTotal}
                    </strong>
                  </p>
                  <small className="speaking-feedback-report__training-note">
                    This is an estimated training score, not an official Cambridge result.
                  </small>
                </>
              ) : (
                <>
                  <p className="speaking-feedback-report__score-label">
                    Indicative score (partial exam):{' '}
                    <strong>
                      {b2.total}/{b2.maxTotal}
                    </strong>
                  </p>
                  <small className="speaking-feedback-report__training-note">
                    Not a full exam estimate — complete all four parts for a full Cambridge-style score.
                  </small>
                </>
              )}
              <p className="speaking-feedback-report__level">
                Estimated level: <strong>{b2.estimatedLevel}</strong>
              </p>
              {b2.shortSummary ? (
                <p className="speaking-feedback-report__short-summary">{b2.shortSummary}</p>
              ) : null}
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
            {report.pronunciation.isEstimated ? (
              <p className="speaking-feedback-report__pronunciation">
                {PRONUNCIATION_TRANSCRIPT_DISCLAIMER}
              </p>
            ) : null}
            {b2.partFeedback?.length ? (
              <div className="speaking-feedback-report__part-notes">
                <p className="speaking-feedback-report__part-notes-title">Diagnostic feedback by part</p>
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

        {showLegacyCriteria ? (
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
          {!b2 && report.shortExplanation ? <p>{report.shortExplanation}</p> : null}
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
          {showLegacyPronunciationFooter ? (
            <p className="speaking-feedback-report__pronunciation">
              Pronunciation: {report.pronunciation.score}/5 — {report.pronunciation.feedback}{' '}
              {report.pronunciation.isEstimated ? PRONUNCIATION_TRANSCRIPT_DISCLAIMER : ''}
            </p>
          ) : null}
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
