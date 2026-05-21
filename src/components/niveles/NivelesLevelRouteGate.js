'use client';

import { usePathname } from 'next/navigation';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import { useUserRole } from '@/context/UserRoleContext';
import { cefrSlugFromNivelesPath, isStaffRole } from '@/lib/placementLevelAccess';
import PlacementLevelLockedNotice from '@/components/niveles/PlacementLevelLockedNotice';

/**
 * Bloquea rutas /niveles/{cefr}/… según placement_results (solo estudiantes).
 */
export default function NivelesLevelRouteGate({ children }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const { loading, isLevelLocked } = usePlacementAccess();

  const level = cefrSlugFromNivelesPath(pathname);
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const staff = isStaffRole(userRole);

  if (!level) {
    return children;
  }

  if (session && isStudent && !staff && loading) {
    return <RouteLoadingMascot label="Comprobando tu nivel" variant={3} />;
  }

  if (session && isStudent && !staff && isLevelLocked(level)) {
    return <PlacementLevelLockedNotice level={level} />;
  }

  return children;
}
