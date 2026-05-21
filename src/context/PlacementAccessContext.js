'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  isNivelesLevelLocked,
  isStaffRole,
  parseAssignedCefrLevel,
} from '@/lib/placementLevelAccess';

const PlacementAccessContext = createContext({
  loading: true,
  hasPlacementResult: false,
  assignedLevel: null,
  refreshPlacementAccess: async () => {},
  isLevelUnlocked: () => true,
  isLevelLocked: () => false,
});

export function PlacementAccessProvider({ session, userRole, children }) {
  const [loading, setLoading] = useState(Boolean(session?.user?.id));
  const [hasPlacementResult, setHasPlacementResult] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState(null);

  const isStudent = userRole === 'student' || userRole === 'alumno';
  const staff = isStaffRole(userRole);

  const loadPlacement = useCallback(async (userId) => {
    if (!userId) {
      setHasPlacementResult(false);
      setAssignedLevel(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('placement_results')
        .select('nivel_asignado, fecha')
        .eq('user_id', userId)
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHasPlacementResult(true);
        setAssignedLevel(
          data.nivel_asignado
            ? parseAssignedCefrLevel(data.nivel_asignado) || data.nivel_asignado
            : null,
        );
      } else {
        setHasPlacementResult(false);
        setAssignedLevel(null);
      }
    } catch (err) {
      console.error('[placement] Error loading placement_results:', err);
      setHasPlacementResult(false);
      setAssignedLevel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setHasPlacementResult(false);
      setAssignedLevel(null);
      setLoading(false);
      return;
    }
    void loadPlacement(userId);
  }, [session?.user?.id, loadPlacement]);

  const isLevelLocked = useCallback(
    (targetLevel) => {
      if (staff || !isStudent) return false;
      return isNivelesLevelLocked({
        isStudent: true,
        hasPlacementResult,
        assignedLevel,
        targetLevel,
      });
    },
    [staff, isStudent, hasPlacementResult, assignedLevel],
  );

  const isLevelUnlocked = useCallback(
    (targetLevel) => !isLevelLocked(targetLevel),
    [isLevelLocked],
  );

  const value = useMemo(
    () => ({
      loading,
      hasPlacementResult,
      assignedLevel,
      refreshPlacementAccess: () => loadPlacement(session?.user?.id),
      isLevelUnlocked,
      isLevelLocked,
    }),
    [
      loading,
      hasPlacementResult,
      assignedLevel,
      loadPlacement,
      session?.user?.id,
      isLevelUnlocked,
      isLevelLocked,
    ],
  );

  return (
    <PlacementAccessContext.Provider value={value}>
      {children}
    </PlacementAccessContext.Provider>
  );
}

export function usePlacementAccess() {
  return useContext(PlacementAccessContext);
}
