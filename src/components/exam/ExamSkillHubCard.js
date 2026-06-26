'use client';

import Link from 'next/link';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';

/** @param {string} slug */
export function getExamSkillKindFromSlug(slug) {
  if (slug === 'writing') return 'writing';
  if (slug === 'listening') return 'listening';
  if (slug === 'speaking') return 'speaking';
  return 'reading';
}

export function ExamSkillHubCardInner({ kind, label, hint, badge }) {
  return (
    <>
      <span className="exam-practice-hub__icon-wrap" aria-hidden>
        <ExamSkillIcon theme={kind} size="md" />
      </span>
      <span className="exam-practice-hub__label">{label}</span>
      <div className="exam-practice-hub__card-foot">
        {badge ? (
          <span className="exam-practice-hub__badge">{badge}</span>
        ) : hint ? (
          <span className="exam-practice-hub__hint">{hint}</span>
        ) : (
          <span aria-hidden />
        )}
        {!badge ? (
          <span className="exam-practice-hub__arrow" aria-hidden>
            →
          </span>
        ) : null}
      </div>
    </>
  );
}

export function ExamSkillHubBannerInner({ kind, label, hint, badge }) {
  return (
    <div className="exam-practice-hub__banner-inner">
      <span className="exam-practice-hub__icon-wrap" aria-hidden>
        <ExamSkillIcon theme={kind} size="md" />
      </span>
      <div className="exam-practice-hub__banner-copy">
        <span className="exam-practice-hub__label">{label}</span>
        {badge ? (
          <span className="exam-practice-hub__badge">{badge}</span>
        ) : hint ? (
          <span className="exam-practice-hub__hint">{hint}</span>
        ) : null}
      </div>
      {!badge ? (
        <span className="exam-practice-hub__arrow exam-practice-hub__arrow--banner" aria-hidden>
          →
        </span>
      ) : null}
    </div>
  );
}

export default function ExamSkillHubCard({
  href,
  kind = 'reading',
  label,
  hint = 'Practise',
  badge = null,
  disabled = false,
  featured = false,
  banner = false,
  className = '',
  ...rest
}) {
  const cardClass = [
    'exam-practice-hub__card',
    `exam-practice-hub__card--${kind}`,
    banner ? 'exam-practice-hub__card--banner' : '',
    featured ? 'exam-practice-hub__card--featured' : '',
    disabled ? 'exam-practice-hub__card--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = banner ? (
    <ExamSkillHubBannerInner kind={kind} label={label} hint={hint} badge={badge} />
  ) : (
    <ExamSkillHubCardInner kind={kind} label={label} hint={hint} badge={badge} />
  );

  if (disabled || !href) {
    return (
      <div className={cardClass} aria-disabled="true" {...rest}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className={cardClass} {...rest}>
      {inner}
    </Link>
  );
}
