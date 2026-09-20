'use client';

import { usePathname } from 'next/navigation';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { hasStudySessionPlanAccess } from '@/data/financialPlanConfig';
import { isExamStrategiesPath } from '@/config/appRoutes';
import { isStudentRole } from '@/utils/authRoles';
import StudySessionBar from '@/components/study/StudySessionBar';

/**
 * Muestra el botón de estudio solo a alumnos logueados con plan PLUS o PREMIUM.
 */
export default function StudySessionBarGate({ session, userRole }) {
  const pathname = usePathname() || '';
  const { planSlug, loading } = usePlanEntitlements();

  if (isExamStrategiesPath(pathname)) {
    return null;
  }

  if (!session?.access_token || !isStudentRole(userRole) || loading) {
    return null;
  }

  if (!hasStudySessionPlanAccess(planSlug)) {
    return null;
  }

  return <StudySessionBar session={session} />;
}
