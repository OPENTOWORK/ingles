'use client';

import { createContext, useContext, useMemo } from 'react';

const UserRoleContext = createContext({
  userRole: 'student',
  session: null,
});

export function UserRoleProvider({ userRole, session, children }) {
  const value = useMemo(() => ({ userRole, session }), [userRole, session]);
  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
