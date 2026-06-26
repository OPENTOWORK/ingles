'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { EXAM_PRACTICE_LEVELS } from '@/data/examPracticeLevels';

function resolveLevelLock({ level, userRole }) {
  if (!usesStudentContentRestrictions(userRole)) {
    return { locked: false, label: null };
  }

  if (level.nivel !== 'B2') {
    return { locked: true, label: 'Coming soon' };
  }

  return { locked: false, label: null };
}

function LevelLockIcon({ size = 11, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LevelCardContent({ level, locked = false }) {
  return (
    <>
      <div className="area-card__head">
        <span className="area-card__icon" style={{ background: level.color }} aria-hidden>
          {level.nivel}
        </span>
        <span className="area-card__title">{level.nombre}</span>
      </div>
      <span className="area-card__desc">{level.descripcion}</span>
      <span className="area-card__meta">
        {locked ? 'Coming soon' : `${level.duracion} →`}
      </span>
    </>
  );
}

function LevelLockBadge({ label }) {
  return (
    <span className="level-item__lock-badge">
      <LevelLockIcon size={12} />
      {label}
    </span>
  );
}

/**
 * @param {{
 *   variant?: 'grid' | 'strip',
 *   activeLevel?: string,
 *   linkForLevel: (level: import('@/data/examPracticeLevels').EXAM_PRACTICE_LEVELS[number]) => string | null,
 * }} props
 */
export default function ExamPracticeLevelPicker({
  variant = 'grid',
  activeLevel = '',
  linkForLevel,
}) {
  const { userRole } = useUserRole();
  const activeSlug = String(activeLevel || '').toLowerCase();

  if (variant === 'strip') {
    return (
      <div className="exam-practice-level-strip" role="navigation" aria-label="CEFR level">
        <span className="exam-practice-level-strip__label">Level</span>
        <ul className="exam-practice-level-strip__list">
          {EXAM_PRACTICE_LEVELS.map((level) => {
            const { locked, label } = resolveLevelLock({
              level,
              userRole,
            });
            const href = !locked ? linkForLevel(level) : null;
            const isActive = activeSlug === level.slug;

            return (
              <li key={level.slug}>
                {locked || !href ? (
                  <span
                    className={`exam-practice-level-strip__pill exam-practice-level-strip__pill--locked${
                      isActive ? ' exam-practice-level-strip__pill--active' : ''
                    }`}
                    title={label || 'Locked'}
                    aria-disabled="true"
                    aria-label={`${level.nivel} locked`}
                  >
                    <LevelLockIcon className="exam-practice-level-strip__lock" />
                    {level.nivel}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className={`exam-practice-level-strip__pill${
                      isActive ? ' exam-practice-level-strip__pill--active' : ''
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    style={{ '--level-accent': level.color }}
                  >
                    {level.nivel}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <ul className="area-grid niveles-grid">
      {EXAM_PRACTICE_LEVELS.map((level) => {
        const { locked, label } = resolveLevelLock({
          level,
          userRole,
        });
        const href = !locked ? linkForLevel(level) : null;
        const isActive = activeSlug === level.slug;
        const lockLabel = label || 'Coming soon';

        return (
          <li key={level.slug} className={locked ? 'level-item is-locked' : 'level-item'}>
            {locked || !href ? (
              <div className="area-card area-card--disabled" aria-disabled="true">
                <LevelLockBadge label={lockLabel} />
                <LevelCardContent level={level} locked />
              </div>
            ) : (
              <Link
                href={href}
                className={`area-card${isActive ? ' area-card--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <LevelCardContent level={level} />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
