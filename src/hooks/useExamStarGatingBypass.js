'use client';

import { bypassesExamStarGating } from '@/constants/studentFeatureAccess';
import { useUserRole } from '@/context/UserRoleContext';

/** Whether the signed-in user can open any exam variant without earning stars first. */
export function useExamStarGatingBypass() {
  const { userRole, session } = useUserRole();
  return bypassesExamStarGating(userRole, session?.user?.email || '');
}
