'use client';

import { useEffect, useRef } from 'react';
import { WritingMapFeedbackList } from './WritingMapBubble';

/**
 * Mobile annotation feedback (Doc 04 §5.2).
 *
 * A floating bubble positioned next to a word does not survive a 360px viewport,
 * so below the mobile breakpoint the same feedback slides up from the bottom. The
 * writing stays visible above the sheet, and the quoted words are repeated inside
 * it so the learner can still see what was selected.
 */
export default function WritingMapBottomSheet({ id, items, onClose }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);
  const first = items[0];

  useEffect(() => {
    // Focus moves into the sheet because on mobile the mark it belongs to may sit
    // behind the panel. `WritingMapCanvas` returns focus to that mark on dismiss.
    closeRef.current?.focus();
  }, [id]);

  return (
    <div className="writing-map__sheet-layer">
      <button
        type="button"
        className="writing-map__sheet-scrim"
        aria-label="Close this feedback"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        id={id}
        ref={sheetRef}
        className="writing-map__sheet"
        role="dialog"
        aria-modal="false"
        aria-label={`Feedback on “${first.quote}”`}
      >
        <div className="writing-map__sheet-grip" aria-hidden="true" />
        <div className="writing-map__sheet-head">
          <p className="writing-map__sheet-quote">“{first.quote}”</p>
          <button
            type="button"
            ref={closeRef}
            className="writing-map__sheet-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="writing-map__sheet-body">
          <WritingMapFeedbackList items={items} />
        </div>
      </div>
    </div>
  );
}
