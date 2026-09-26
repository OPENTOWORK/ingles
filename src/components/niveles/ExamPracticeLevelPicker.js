'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PlanUpgradeModal from '@/components/subscriptions/PlanUpgradeModal';
import { useUserRole } from '@/context/UserRoleContext';
import { hasFullNivelesLevelAccess, usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { isLevelIncludedInPlan } from '@/data/financialPlanConfig';
import { EXAM_PRACTICE_LEVELS } from '@/data/examPracticeLevels';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import { getNivelesLevelPlanLock } from '@/lib/nivelesPlanLevelAccess';
import { userHasRole } from '@/utils/authRoles';

const STAFF_LEVEL_ROLES = [
  'admin',
  'administrador',
  'teacher',
  'profesor',
  'coordinator',
  'coordinador',
  'informatico',
  'it',
  'Resp.marketing',
];

function resolveLevelLock({
  level,
  userRole,
  email = '',
  staffUnlock = false,
  planSlug = 'free',
  applyLimits = false,
}) {
  if (staffUnlock || hasFullNivelesLevelAccess(userRole, email)) {
    return { locked: false, reason: null, label: null };
  }

  if (
    applyLimits &&
    usesStudentContentRestrictions(userRole) &&
    !isLevelIncludedInPlan(level.slug, planSlug)
  ) {
    return { locked: true, reason: 'plan', label: 'De pago' };
  }

  if (level.nivel !== 'B2') {
    return { locked: true, reason: 'soon', label: 'Coming soon' };
  }

  return { locked: false, reason: null, label: null };
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
  const { userRole, session } = useUserRole();
  const { planSlug, applyLimits, loading: planLoading } = usePlanEntitlements();
  const userEmail = session?.user?.email || '';
  const [paywall, setPaywall] = useState(null);
  const [staffUnlock, setStaffUnlock] = useState(() =>
    hasFullNivelesLevelAccess(userRole, userEmail),
  );
  const activeSlug = String(activeLevel || '').toLowerCase();

  useEffect(() => {
    if (hasFullNivelesLevelAccess(userRole, userEmail)) {
      setStaffUnlock(true);
      return undefined;
    }
    const uid = session?.user?.id;
    if (!uid) {
      setStaffUnlock(false);
      return undefined;
    }
    let cancelled = false;
    void userHasRole(uid, STAFF_LEVEL_ROLES, userEmail).then((ok) => {
      if (!cancelled) setStaffUnlock(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [userRole, userEmail, session?.user?.id]);

  const openPaywall = (level) => {
    const lock = getNivelesLevelPlanLock(level.slug, planSlug);
    setPaywall({
      level: level.nivel,
      requiredPlanName: lock?.requiredPlanName || 'PLUS',
    });
  };

  const paywallModal = (
    <PlanUpgradeModal
      open={Boolean(paywall)}
      onClose={() => setPaywall(null)}
      variant="paid_place"
      lang="es"
      message={
        paywall
          ? `El nivel ${paywall.level} está incluido en el plan ${paywall.requiredPlanName}. Con el plan gratuito no puedes entrar.`
          : null
      }
    />
  );

  if (variant === 'strip') {
    return (
      <div className="exam-practice-level-strip" role="navigation" aria-label="CEFR level">
        <span className="exam-practice-level-strip__label">Level</span>
        <ul className="exam-practice-level-strip__list">
          {EXAM_PRACTICE_LEVELS.map((level) => {
            const { locked, reason, label } = resolveLevelLock({
              level,
              userRole,
              email: userEmail,
              staffUnlock,
              planSlug,
              applyLimits: applyLimits && !planLoading,
            });
            const href = locked
              ? null
              : linkForLevel(level) || `/niveles/${level.slug}`;
            const isActive = activeSlug === level.slug;

            return (
              <li key={level.slug}>
                {locked && reason === 'plan' ? (
                  <button
                    type="button"
                    className={`exam-practice-level-strip__pill exam-practice-level-strip__pill--paywall${
                      isActive ? ' exam-practice-level-strip__pill--active' : ''
                    }`}
                    onClick={() => openPaywall(level)}
                    aria-label={`${level.nivel}, de pago`}
                  >
                    <LevelLockIcon className="exam-practice-level-strip__lock" />
                    {level.nivel}
                  </button>
                ) : locked ? (
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
        {paywallModal}
      </div>
    );
  }

  return (
    <>
    <ul className="area-grid niveles-grid">
      {EXAM_PRACTICE_LEVELS.map((level) => {
        const { locked, reason, label } = resolveLevelLock({
          level,
          userRole,
          email: userEmail,
          staffUnlock,
          planSlug,
          applyLimits: applyLimits && !planLoading,
        });
        const href = locked
          ? null
          : linkForLevel(level) || `/niveles/${level.slug}`;
        const isActive = activeSlug === level.slug;
        const lockLabel = label || 'Coming soon';

        return (
          <li key={level.slug} className={locked ? 'level-item is-locked' : 'level-item'}>
            {locked && reason === 'plan' ? (
              <button
                type="button"
                className="area-card area-card--paywall"
                onClick={() => openPaywall(level)}
              >
                <LevelLockBadge label="De pago" />
                <LevelCardContent level={level} locked />
              </button>
            ) : locked ? (
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
    {paywallModal}
    </>
  );
}
