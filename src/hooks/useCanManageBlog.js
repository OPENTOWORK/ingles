'use client';

import { useEffect, useState } from 'react';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessBlogAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';

export default function useCanManageBlog() {
  const [canManageBlog, setCanManageBlog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) return;
      const role = await getRoleNameByUserId(user.id, user.email);
      if (!cancelled) setCanManageBlog(canAccessBlogAdminPanel(role));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return canManageBlog;
}
