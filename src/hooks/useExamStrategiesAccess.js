'use client';

import { useMemo } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import {
  hasFullNivelesLevelAccess,
  isExamStrategiesLockedForUser,
} from '@/constants/studentFeatureAccess';
import { isExamStrategiesFirstPartOnlyPlan } from '@/lib/examStrategiesPlanAccess';

/**
 * Exam Strategies access for the logged-in student (plan entitlements).
 * Pass `session` / `userRole` when used outside UserRoleProvider (e.g. AppNav).
 */
export function useExamStrategiesAccess({ userRole: roleOverride, session: sessionOverride } = {}) {
  const ctx = useUserRole();
  const userRole = roleOverride ?? ctx.userRole;
  const session = sessionOverride ?? ctx.session;
  const { applyLimits, planSlug, loading } = usePlanEntitlements();

  return useMemo(() => {
    if (!session) {
      return { locked: false, firstPartOnly: false, loading: false };
    }
    if (hasFullNivelesLevelAccess(userRole)) {
      return { locked: false, firstPartOnly: false, loading: false };
    }
    if (!applyLimits) {
      return { locked: false, firstPartOnly: false, loading: false };
    }
    if (loading) {
      return { locked: false, firstPartOnly: false, loading: true };
    }
    const slug = planSlug || 'free';
    const locked = isExamStrategiesLockedForUser(userRole, slug);
    return {
      locked,
      firstPartOnly: !locked && isExamStrategiesFirstPartOnlyPlan(slug),
      loading: false,
    };
  }, [session, userRole, applyLimits, planSlug, loading]);
}
