'use client';

import { createContext, useContext, useMemo } from 'react';
import { isRoleConfirmedForSession } from '@/lib/userRoleResolution';

const UserRoleContext = createContext({
  userRole: 'student',
  session: null,
  roleConfirmedForUserId: null,
});

export function UserRoleProvider({ userRole, session, roleConfirmedForUserId = null, children }) {
  const value = useMemo(
    () => ({ userRole, session, roleConfirmedForUserId }),
    [userRole, session, roleConfirmedForUserId],
  );
  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  return useContext(UserRoleContext);
}

/**
 * Rol solo cuando se ha resuelto de verdad para el usuario de la sesión actual.
 * Mientras esté pendiente, falle o pertenezca a otro usuario, `userRole` es ''.
 */
export function useConfirmedUserRole() {
  const { userRole, session, roleConfirmedForUserId } = useContext(UserRoleContext);
  const roleConfirmed = isRoleConfirmedForSession(session, roleConfirmedForUserId);
  return { session, roleConfirmed, userRole: roleConfirmed ? userRole : '' };
}
