'use client';

/**
 * What to review next (Doc 04 §8).
 *
 * Plain text in v1. No links, no buttons and no references to DRALO material that
 * does not exist yet: a broken promise is worse pedagogy than a short list.
 */
export default function WritingReviewNext({ items }) {
  if (!items.length) return null;

  return (
    <section className="writing-review" aria-labelledby="writing-review-title">
      <p className="levels-exam-split__section-title" id="writing-review-title">
        What to review next
      </p>
      <ul className="writing-review__list">
        {items.map((item) => (
          <li key={item.id} className="writing-review__item">
            <strong className="writing-review__concept">{item.concept}</strong>
            <span className="writing-review__reason">{item.reason}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
