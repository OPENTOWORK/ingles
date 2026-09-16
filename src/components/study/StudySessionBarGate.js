'use client';

import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { hasStudySessionPlanAccess } from '@/data/financialPlanConfig';
import { isStudentRole } from '@/utils/authRoles';
import StudySessionBar from '@/components/study/StudySessionBar';

/**
 * Muestra el botón de estudio solo a alumnos logueados con plan PLUS o PREMIUM.
 */
export default function StudySessionBarGate({ session, userRole }) {
  const { planSlug, loading } = usePlanEntitlements();

  if (!session?.access_token || !isStudentRole(userRole) || loading) {
    return null;
  }

  if (!hasStudySessionPlanAccess(planSlug)) {
    return null;
  }

  return <StudySessionBar session={session} />;
}
