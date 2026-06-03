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
}) {
  return (
    <div className="b2-writing-task">
      <h3 className="b2-writing-task__title">{title}</h3>

      {instructions ? (
        <div className="b2-writing-task__instructions">
          <p className="b2-writing-task__label">Instructions</p>
          <p>{instructions}</p>
        </div>
      ) : null}

      {question ? (
        <div className="b2-writing-task__question-block">
          <p className="b2-writing-task__label">Question</p>
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

      <p className="b2-writing-task__word-note">
        Word limit: <strong>{wordMin}–{wordMax} words</strong>
      </p>
    </div>
  );
}
