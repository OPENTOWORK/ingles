'use client';

import { useMemo } from 'react';
import { buildFeedbackViewModel } from '@/features/writing/ui/feedback-view-model';
import WritingCriterionCard from './WritingCriterionCard';
import WritingGlobalResult from './WritingGlobalResult';
import WritingMapCanvas from './WritingMapCanvas';
import WritingOpeningStrengths from './WritingOpeningStrengths';
import WritingReviewNext from './WritingReviewNext';

/**
 * The Writing v3 learner surface (Doc 04).
 *
 * Order is the whole argument: the discreet result, then the genuine strengths, then
 * the learner's own writing as the dominant element, then the four criterion cards,
 * then what to review, then one action. Nothing here reproduces the legacy blocks —
 * no estimated CEFR level, no pass badge, no pass mark, no study plan, no improved
 * version of the response. The legacy path keeps those; this path does not have them.
 *
 * The component receives an already-validated `feedback_payload`. It never calls a
 * model, never reads the database and never recomputes a mark.
 */
export default function WritingFeedbackPage({
  candidateResponse,
  feedbackPayload,
  taskPrompt = null,
  initialViewportWidth = 1280,
  expandedCriterion = null,
  onWriteAnother = null,
}) {
  const view = useMemo(
    () =>
      buildFeedbackViewModel({
        candidate_response: candidateResponse,
        feedback_payload: feedbackPayload,
      }),
    [candidateResponse, feedbackPayload],
  );

  return (
    <div className="writing-v3 levels-exam-split-card">
      <header className="writing-v3__header">
        <p className="levels-exam-split__section-title">Dralo writing feedback</p>
        <h2 className="writing-v3__title">Your corrected task</h2>
        {taskPrompt ? (
          <details className="writing-v3__task">
            <summary>The task you answered</summary>
            <pre className="writing-v3__task-text">{taskPrompt}</pre>
          </details>
        ) : null}
      </header>

      <WritingGlobalResult result={view.result} />
      <WritingOpeningStrengths strengths={view.strengths} />
      <WritingMapCanvas map={view.map} initialViewportWidth={initialViewportWidth} />

      <section className="writing-v3__criteria" aria-labelledby="writing-criteria-title">
        <p className="levels-exam-split__section-title" id="writing-criteria-title">
          How each criterion was assessed
        </p>
        <div className="writing-v3__criteria-grid">
          {view.criteria.map((criterion) => (
            <WritingCriterionCard
              key={criterion.key}
              criterion={criterion}
              defaultExpanded={criterion.key === expandedCriterion}
            />
          ))}
        </div>
      </section>

      <WritingReviewNext items={view.review_next} />

      <div className="writing-v3__cta">
        <button
          type="button"
          className="writing-v3__cta-button"
          onClick={onWriteAnother ?? undefined}
        >
          {view.cta_label}
        </button>
      </div>
    </div>
  );
}
