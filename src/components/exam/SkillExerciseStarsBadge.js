'use client';

import Link from 'next/link';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';

/** Up to 3 stars (with halves) for the current skill exercise; links to Stars way when `href` is set. */
export default function SkillExerciseStarsBadge({ stars = 0, href = null, lang = 'en' }) {
  const en = lang === 'en';
  const value = Math.min(3, Math.max(0, Number(stars) || 0));

  const ariaLabel = href
    ? en
      ? `${value} of 3 stars on this exercise. Open Stars way to B2 at this exercise.`
      : `${value} de 3 estrellas en este ejercicio. Abrir Stars way to B2 en este ejercicio.`
    : en
      ? `${value} of 3 stars earned on this exercise`
      : `${value} de 3 estrellas conseguidas en este ejercicio`;

  const content = (
    <>
      <span className="skill-exercise-stars-badge__label">
        {en ? 'Exercise stars' : 'Estrellas del ejercicio'}
      </span>
      <TheoryLevelStars stars={value} size="md" variant="gold" />
      {href ? (
        <span className="skill-exercise-stars-badge__hint">
          {en ? 'Stars way to B2' : 'Stars way to B2'}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="skill-exercise-stars-badge skill-exercise-stars-badge--link"
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="skill-exercise-stars-badge" aria-label={ariaLabel}>
      {content}
    </div>
  );
}
