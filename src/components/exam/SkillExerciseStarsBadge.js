'use client';

import Link from 'next/link';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';

/** Up to 3 stars (with halves) for the current skill test; links to Stars way when `href` is set. */
export default function SkillExerciseStarsBadge({
  stars = 0,
  href = null,
  lang = 'en',
  variant = 'default',
}) {
  const en = lang === 'en';
  const toolbar = variant === 'toolbar';
  const value = Math.min(3, Math.max(0, Number(stars) || 0));
  const badgeClass = `skill-exercise-stars-badge${toolbar ? ' skill-exercise-stars-badge--toolbar' : ''}`;

  const ariaLabel = href
    ? en
      ? `${value} of 3 stars on this test. Open Stars way to B2 at this test.`
      : `${value} de 3 estrellas en este test. Abrir Stars way to B2 en este test.`
    : en
      ? `${value} of 3 stars earned on this test`
      : `${value} de 3 estrellas conseguidas en este test`;

  const content = (
    <>
      <span className="skill-exercise-stars-badge__label">
        {en ? 'Test stars' : 'Estrellas del test'}
      </span>
      <TheoryLevelStars stars={value} size={toolbar ? 'lg' : 'md'} variant="gold" />
      {href && !toolbar ? (
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
        className={`${badgeClass} skill-exercise-stars-badge--link`}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={badgeClass} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
