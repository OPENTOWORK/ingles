'use client';

import { createContext, useContext, useMemo } from 'react';

const ExamPracticeSidebarSlotsContext = createContext({
  exerciseStars: null,
  sideRailMountRef: null,
  overlayContainerRef: null,
  portSideRailToToolbar: false,
  sideRailToolbarMounted: true,
});

export function ExamPracticeSidebarSlotsProvider({
  exerciseStars = null,
  overlayContainerRef = null,
  sideRailMountRef = null,
  portSideRailToToolbar = false,
  sideRailToolbarMounted = true,
  children,
}) {
  const value = useMemo(
    () => ({
      exerciseStars,
      sideRailMountRef,
      overlayContainerRef,
      portSideRailToToolbar,
      sideRailToolbarMounted,
    }),
    [exerciseStars, sideRailMountRef, overlayContainerRef, portSideRailToToolbar, sideRailToolbarMounted],
  );

  return (
    <ExamPracticeSidebarSlotsContext.Provider value={value}>
      {children}
    </ExamPracticeSidebarSlotsContext.Provider>
  );
}

export function useExamPracticeSidebarSlots() {
  return useContext(ExamPracticeSidebarSlotsContext);
}
