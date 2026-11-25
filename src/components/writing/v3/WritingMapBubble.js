'use client';

/**
 * Desktop annotation feedback (Doc 04 §5.1).
 *
 * The canvas portals this into a fixed card beside the mark, so the writing
 * column keeps its width. The mark points here with aria-controls.
 * The bubble grows with its content: a spelling slip gets two lines, a content
 * prompt gets a paragraph. There is no fixed large layout for every issue.
 */
export default function WritingMapBubble({ id, items, onClose }) {
  const first = items[0];

  return (
    <span
      id={id}
      className="writing-map__bubble"
      role="dialog"
      aria-label={`Feedback on “${first.quote}”`}
    >
      <span className="writing-map__bubble-head">
        <button
          type="button"
          className="writing-map__bubble-close"
          onClick={onClose}
          aria-label="Close this feedback"
        >
          ×
        </button>
      </span>
      <WritingMapFeedbackList items={items} />
    </span>
  );
}

/**
 * Shared by the bubble and the bottom sheet: one response, one way of writing
 * feedback, two surfaces.
 */
export function WritingMapFeedbackList({ items }) {
  return (
    <span className="writing-map__feedback-list">
      {items.map((item) => (
        <span key={item.annotation_id} className="writing-map__feedback">
          <span className="writing-map__feedback-tag">
            <span className={`writing-map__feedback-tag-label ${item.category.className}`}>
              {item.category.label}
            </span>
            <span className="writing-result__sr-only">{item.kind_label}</span>
          </span>
          <span className="writing-map__feedback-fix-label">Why</span>
          <span className="writing-map__feedback-text">{item.explanation}</span>
          {item.suggested_change ? (
            <span className="writing-map__feedback-fix">
              <span className="writing-map__feedback-fix-label">Suggestion</span>
              <span className="writing-map__feedback-fix-value">{item.suggested_change}</span>
            </span>
          ) : null}
          {item.teaching_prompt ? (
            <span className="writing-map__feedback-prompt">{item.teaching_prompt}</span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
