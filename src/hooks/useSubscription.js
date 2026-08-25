'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isSubscriptionActive } from '@/lib/stripe/client';
import { supabase } from '@/utils/supabaseClient';

/**
 * Lee la fila de `public.suscripciones` del usuario actual.
 * La tabla solo la escribe el webhook de Stripe; aquí únicamente se consulta
 * a través de la policy de RLS «cada usuario lee su propia fila».
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        if (mountedRef.current) setSubscription(null);
        return null;
      }

      const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (mountedRef.current) setSubscription(data || null);
      return data || null;
    } catch {
      // Sin tabla creada todavía o sin permisos: el usuario sigue en plan free.
      if (mountedRef.current) setSubscription(null);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return {
    subscription,
    loading,
    isActive: isSubscriptionActive(subscription),
    refresh,
  };
}

export default useSubscription;
