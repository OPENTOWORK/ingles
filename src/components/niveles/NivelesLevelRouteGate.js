'use client';

import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import { cefrSlugFromNivelesPath } from '@/lib/placementLevelAccess';
import { isLevelIncludedInPlan } from '@/data/financialPlanConfig';
import { getNivelesLevelPlanLock } from '@/lib/nivelesPlanLevelAccess';
import { isNivelesLevelComingSoonForUser, usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { getStudentBlockedExamSkillFromPath } from '@/data/nivelesLevelHub';
import { isExamTheoryPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';
import NivelesPlanLevelLockedNotice from '@/components/niveles/NivelesPlanLevelLockedNotice';

/**
 * Bloquea rutas /niveles/{cefr}/… con aviso "Coming soon" (solo estudiantes).
 */
export default function NivelesLevelRouteGate({ children }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const { planSlug, loading: planLoading, applyLimits } = usePlanEntitlements();

  const level = cefrSlugFromNivelesPath(pathname);
  const isStudentView = usesStudentContentRestrictions(userRole);
  const isPartTipsRoute = isExamTheoryPartTipsPath(pathname);

  if (!level) {
    return children;
  }

  const levelOutsideFreePlan = !isLevelIncludedInPlan(level, 'free');
  if (session && isStudentView && !isPartTipsRoute && levelOutsideFreePlan && planLoading) {
    return (
      <main className="shell" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p>Cargando…</p>
      </main>
    );
  }

  if (session && isStudentView && !isPartTipsRoute && applyLimits && !planLoading) {
    const planLock = getNivelesLevelPlanLock(level, planSlug);
    if (planLock) {
      return (
        <NivelesPlanLevelLockedNotice
          level={planLock.level}
          requiredPlanName={planLock.requiredPlanName}
        />
      );
    }
  }

  if (
    session &&
    isStudentView &&
    !isPartTipsRoute &&
    isNivelesLevelComingSoonForUser(userRole, level, session?.user?.email)
  ) {
    return <NivelesComingSoonNotice level={level} />;
  }

  const blockedSkill =
    session && isStudentView && !isPartTipsRoute
      ? getStudentBlockedExamSkillFromPath(pathname)
      : null;

  if (blockedSkill) {
    return (
      <NivelesComingSoonNotice
        level={blockedSkill.cefr}
        skillLabel={blockedSkill.label}
        backHref={blockedSkill.backHref}
      />
    );
  }

  return children;
}
