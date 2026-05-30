'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import GuidedTourOverlay from '@/components/guided-tour/GuidedTourOverlay';
import { useUserRole } from '@/context/UserRoleContext';
import { resetTutorialForReplay } from '@/lib/homeTutorialStorage';

const GuidedTourContext = createContext(null);

export function GuidedTourProvider({ children }) {
  const { session } = useUserRole();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    if (!session?.user) return;
    resetTutorialForReplay();
    setStepIndex(0);
    setActive(true);
  }, [session?.user]);

  const endTour = useCallback(() => {
    setActive(false);
    setStepIndex(0);
  }, []);

  const value = useMemo(
    () => ({
      startTour,
      isActive: active,
    }),
    [active, startTour],
  );

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
      {session?.user && active ? (
        <GuidedTourOverlay
          stepIndex={stepIndex}
          onStepIndexChange={setStepIndex}
          onClose={endTour}
        />
      ) : null}
    </GuidedTourContext.Provider>
  );
}

export function useGuidedTour() {
  const ctx = useContext(GuidedTourContext);
  if (!ctx) {
    throw new Error('useGuidedTour must be used within GuidedTourProvider');
  }
  return ctx;
}
