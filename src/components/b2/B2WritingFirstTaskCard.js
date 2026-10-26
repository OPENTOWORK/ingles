'use client';

/** B2 First Writing Part 1 — instructions, essay topic and notes in one panel. */
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

      <div className="levels-exam-split__enunciado b2-writing-essay-instructions">
        {!hideInstructions ? (
          <>
            <p className="levels-exam-split__section-title">Instructions</p>
            {instructions.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => (
              <p key={index}>
                {line.split(/(using\s+all\s+the\s+notes)/gi).map((text, segment) => (
                  /^using\s+all\s+the\s+notes$/i.test(text)
                    ? <span key={segment} className="b2-writing-essay-instructions__emphasis">{text}</span>
                    : text
                ))}
              </p>
            ))}
          </>
        ) : null}

        {question || points?.length ? (
          <div className="b2-writing-essay-instructions__task">
            {question ? (
              <p className="b2-writing-task__question">{question}</p>
            ) : null}

            {points?.length ? (
              <div className="b2-writing-task__points">
                <p className="b2-writing-task__label">You should write about:</p>
                <ol className="b2-writing-task__points-list">
                  {points.map((point, i) => <li key={i}>{point}</li>)}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="b2-writing-task__word-note">
          Word limit: <strong>{wordMin}–{wordMax} words</strong>
        </p>
      </div>
    </div>
  );
}
