'use client';

import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { cefrSlugFromNivelesPath } from '@/lib/placementLevelAccess';
import { isNivelesLevelComingSoonForUser, usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { isExamTheoryPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import NivelesComingSoonNotice from '@/components/niveles/NivelesComingSoonNotice';

/**
 * Bloquea rutas /niveles/{cefr}/… con aviso "Coming soon" (solo estudiantes).
 */
export default function NivelesLevelRouteGate({ children }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();

  const level = cefrSlugFromNivelesPath(pathname);
  const isStudentView = usesStudentContentRestrictions(userRole);
  const isPartTipsRoute = isExamTheoryPartTipsPath(pathname);

  if (!level) {
    return children;
  }

  if (
    session &&
    isStudentView &&
    !isPartTipsRoute &&
    isNivelesLevelComingSoonForUser(userRole, level)
  ) {
    return <NivelesComingSoonNotice level={level} />;
  }

  return children;
}
