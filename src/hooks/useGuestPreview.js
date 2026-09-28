'use client';

import { useEffect, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { supabase } from '@/utils/supabaseClient';

/** Distingue invitado de sesión aún hidratándose. */
export function useGuestPreview() {
  const { session } = useUserRole();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(() => {
      if (active) setChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const ready = checked || Boolean(session);

  return {
    ready,
    isGuest: ready && !session,
    session,
  };
}

export default useGuestPreview;
