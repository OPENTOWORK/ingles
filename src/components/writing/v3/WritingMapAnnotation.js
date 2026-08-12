'use client';

import { forwardRef } from 'react';

/**
 * One clickable region of the Interactive Writing Map.
 *
 * `role="button"` on a span rather than a `<button>` element, for one reason that
 * only shows up on a phone: a real button never breaks across lines, so a six-word
 * annotation becomes a centred block that shatters the paragraph. A span flows with
 * the text. Everything the platform would have given us is therefore given back
 * explicitly — role, tab order, Enter and Space activation, `aria-expanded` and a
 * visible focus ring — so the mark stays fully keyboard operable.
 *
 * There is deliberately no `onMouseEnter`: Doc 04 §5.1 forbids hover-revealed
 * feedback, so reading the essay never opens anything.
 *
 * The accessible label carries the category name and, where spans overlap, every
 * category involved. Category meaning therefore never depends on colour.
 */
const WritingMapAnnotation = forwardRef(function WritingMapAnnotation(
  { segment, items, open, bubbleId, onActivate },
  ref,
) {
  const categories = items.map((item) => item.category.label);
  const label = `${categories.join(' and ')} feedback on “${segment.text}”`;

  const activate = () => onActivate(segment.group_id);

  return (
    <span
      role="button"
      tabIndex={0}
      ref={ref}
      className={[
        'writing-map__mark',
        items[0].category.className,
        segment.overlapping ? 'writing-map__mark--overlapping' : '',
        open ? 'writing-map__mark--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-expanded={open}
      aria-controls={open ? bubbleId : undefined}
      aria-label={label}
      data-annotation-group={segment.group_id}
      data-annotation-ids={items.map((item) => item.annotation_id).join(' ')}
      data-observation-ids={items.map((item) => item.observation_id).join(' ')}
      data-category={items[0].category.key}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          activate();
        }
      }}
    >
      {segment.text}
    </span>
  );
});

export default WritingMapAnnotation;
