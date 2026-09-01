'use client';

import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import { cefrSlugFromNivelesPath } from '@/lib/placementLevelAccess';
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
  const { planSlug } = usePlanEntitlements();

  const level = cefrSlugFromNivelesPath(pathname);
  const isStudentView = usesStudentContentRestrictions(userRole);
  const isPartTipsRoute = isExamTheoryPartTipsPath(pathname);

  if (!level) {
    return children;
  }

  if (session && isStudentView && !isPartTipsRoute) {
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
