'use client';

/**
 * Cambridge-style instructions + practice-mode note for B2 Listening parts.
 */
export default function B2ListeningPartInstructions({ instructions, practiceNote }) {
  if (!instructions) return null;
  return (
    <div className="levels-listening-instructions">
      <p className="levels-listening-instructions__text">{instructions}</p>
      {practiceNote ? (
        <p className="levels-listening-instructions__practice-note">{practiceNote}</p>
      ) : null}
    </div>
  );
}
