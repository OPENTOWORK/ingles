'use client';

import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { cefrSlugFromNivelesPath, isStaffRole } from '@/lib/placementLevelAccess';
import { isNivelesLevelComingSoonForUser } from '@/constants/studentFeatureAccess';
import { isExamTheoryPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';

/**
 * Bloquea rutas /niveles/{cefr}/… con aviso "Coming soon" (solo estudiantes).
 */
export default function NivelesLevelRouteGate({ children }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();

  const level = cefrSlugFromNivelesPath(pathname);
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const staff = isStaffRole(userRole);
  const isPartTipsRoute = isExamTheoryPartTipsPath(pathname);

  if (!level) {
    return children;
  }

  if (
    session &&
    isStudent &&
    !staff &&
    !isPartTipsRoute &&
    isNivelesLevelComingSoonForUser(userRole, level)
  ) {
    return <NivelesComingSoonNotice level={level} />;
  }

  return children;
}
