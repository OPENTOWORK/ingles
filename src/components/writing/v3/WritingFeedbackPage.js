'use client';

import { useMemo } from 'react';
import { buildFeedbackViewModel } from '@/features/writing/ui/feedback-view-model';
import WritingCriterionCard from './WritingCriterionCard';
import WritingMapCanvas from './WritingMapCanvas';

/**
 * After Check, the learner sees their own writing with colour marks, then the
 * four Cambridge criterion cards. The draft, the task and the extra result
 * blocks stay off this screen.
 */
export default function WritingFeedbackPage({
  candidateResponse,
  feedbackPayload,
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
    <div className="writing-v3">
      <WritingMapCanvas map={view.map} initialViewportWidth={initialViewportWidth} />

      <section className="writing-v3__criteria" aria-labelledby="writing-criteria-title">
        <p className="levels-exam-split__section-title" id="writing-criteria-title">
          Cambridge criteria
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

      {onWriteAnother ? (
        <div className="writing-v3__edit">
          <button type="button" className="writing-v3__edit-button" onClick={onWriteAnother}>
            Edit your answer
          </button>
        </div>
      ) : null}
    </div>
  );
}
