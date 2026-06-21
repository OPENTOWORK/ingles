'use client';

/**
 * B2 First Writing Part 1 — compulsory essay task card.
 */
export default function B2WritingFirstTaskCard({
  title = 'Writing Part 1 — Essay',
  instructions = '',
  question = '',
  points = [],
  wordMin = 140,
  wordMax = 190,
  hideHeader = false,
  hideInstructions = false,
}) {
  return (
    <div className="b2-writing-task">
      {!hideHeader && title ? <h3 className="b2-writing-task__title">{title}</h3> : null}

      {!hideInstructions && instructions ? (
        <div className="b2-writing-task__instructions">
          <p className="b2-writing-task__label">Instructions</p>
          <p>{instructions}</p>
        </div>
      ) : null}

      {question || points?.length ? (
        <div className="levels-exam-split__passage-panel b2-writing-task__stimulus">
          {question ? (
            <div className="b2-writing-task__question-block">
              {!hideHeader ? <p className="b2-writing-task__label">Question</p> : null}
              <p className="b2-writing-task__question">{question}</p>
            </div>
          ) : null}

          {points?.length ? (
            <div className="b2-writing-task__points">
              <p className="b2-writing-task__label">You should write about:</p>
              <ol className="b2-writing-task__points-list">
                {points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="b2-writing-task__word-note">
        Word limit: <strong>{wordMin}–{wordMax} words</strong>
      </p>
    </div>
  );
}
