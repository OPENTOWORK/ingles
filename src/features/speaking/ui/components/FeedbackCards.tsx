'use client';

import type { CorrectionReportPayload } from '@/features/speaking/domain/schemas';
import type { MicroFeedback } from '@/features/speaking/domain/types';
import { formatB2SpeakingScoreLine } from '@/features/speaking/domain/b2-speaking-score';

type Props = {
  micro?: MicroFeedback | null;
  report?: CorrectionReportPayload | null;
};

type DraloBlock = {
  score?: number;
  analysis?: string;
  examples?: unknown;
  accentNotes?: string;
  mispronouncedWords?: Array<{ word?: string; correctIpa?: string }>;
  audioUsed?: boolean;
  level?: string;
  justification?: string;
  averageScore?: number;
  cefrLevel?: string;
  strengths?: string[];
  priorities?: string[];
};

function formatHalfScore(score: number | undefined) {
  if (score == null || !Number.isFinite(score)) return '—';
  return Number.isInteger(score) ? `${score}/5` : `${score.toFixed(1)}/5`;
}

function DraloBlockCard({
  title,
  block,
  showScore = true,
}: {
  title: string;
  block?: DraloBlock | null;
  showScore?: boolean;
}) {
  if (!block) return null;
  return (
    <article className="speaking-feedback-report__metric-card">
      <h3 className="speaking-feedback-report__metric-title">{title}</h3>
      {showScore && block.score != null ? (
        <p className="speaking-feedback-report__metric-score">{formatHalfScore(block.score)}</p>
      ) : null}
      {block.level ? (
        <p className="speaking-feedback-report__text-body">
          <strong>{block.level}</strong>
          {block.justification ? ` — ${block.justification}` : ''}
        </p>
      ) : null}
      {block.analysis ? <p className="speaking-feedback-report__text-body">{block.analysis}</p> : null}
      {block.accentNotes ? (
        <p className="speaking-feedback-report__pronunciation">{block.accentNotes}</p>
      ) : null}
      {Array.isArray(block.examples) && block.examples.length > 0 ? (
        <ul className="speaking-feedback-report__metric-errors">
          {block.examples.slice(0, 4).map((ex, i) => {
            if (typeof ex === 'string') {
              return <li key={i}>{ex}</li>;
            }
            const item = ex as { student?: string; corrected?: string };
            return (
              <li key={i}>
                <em>{item.student}</em>
                {item.corrected ? ` → ${item.corrected}` : ''}
              </li>
            );
          })}
        </ul>
      ) : null}
      {Array.isArray(block.mispronouncedWords) && block.mispronouncedWords.length > 0 ? (
        <ul className="speaking-feedback-report__metric-errors">
          {block.mispronouncedWords.slice(0, 5).map((w, i) => (
            <li key={i}>
              <strong>{w.word}</strong> — {w.correctIpa}
            </li>
          ))}
        </ul>
      ) : null}
      {block.audioUsed === false ? (
        <p className="speaking-feedback-report__pronunciation">(pronunciation estimated from transcript)</p>
      ) : null}
    </article>
  );
}

export function FeedbackCards({ micro, report }: Props) {
  if (!micro && !report) return null;

  if (report) {
    const b2 = report.b2Speaking;
    const dralo = report.draloB2Feedback as Record<string, DraloBlock> | undefined;
    const grammar = dralo?.grammar;
    const estimatedLevel = dralo?.estimatedLevel;
    const vocabulary = dralo?.vocabulary;
    const discourse = dralo?.discourseManagement;
    const pronunciation = dralo?.pronunciation;
    const interactive = dralo?.interactiveCommunication;
    const overall = dralo?.overallGrade;

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
                Estimated level:{' '}
                <strong>{overall?.cefrLevel || b2.estimatedLevel}</strong>
                {overall?.averageScore != null ? (
                  <> ({formatHalfScore(overall.averageScore)} average)</>
                ) : null}
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

        {dralo ? (
          <div className="speaking-feedback-report__metrics">
            <DraloBlockCard title="1. Grammar used" block={grammar} />
            <DraloBlockCard title="2. Estimated level" block={estimatedLevel} showScore={false} />
            <DraloBlockCard title="3. Vocabulary" block={vocabulary} />
            <DraloBlockCard title="4. Discourse management" block={discourse} />
            <DraloBlockCard title="5. Pronunciation & accent" block={pronunciation} />
            <DraloBlockCard title="6. Interactive communication" block={interactive} />
            {overall ? (
              <article className="speaking-feedback-report__metric-card">
                <h3 className="speaking-feedback-report__metric-title">7. Overall grade</h3>
                {overall.averageScore != null ? (
                  <p className="speaking-feedback-report__metric-score">
                    {formatHalfScore(overall.averageScore)}
                  </p>
                ) : null}
                {overall.strengths?.length ? (
                  <>
                    <p className="speaking-feedback-report__text-title">Strengths</p>
                    <ul className="speaking-feedback-report__metric-errors">
                      {overall.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {overall.priorities?.length ? (
                  <>
                    <p className="speaking-feedback-report__text-title">Priority improvements</p>
                    <ul className="speaking-feedback-report__metric-errors">
                      {overall.priorities.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </article>
            ) : null}
          </div>
        ) : report.criteria.length > 0 ? (
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
          <p className="speaking-feedback-report__pronunciation">
            Pronunciation: {report.pronunciation.score}/5 — {report.pronunciation.feedback}{' '}
            {report.pronunciation.isEstimated ? '(estimated from transcript)' : '(from audio)'}
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
