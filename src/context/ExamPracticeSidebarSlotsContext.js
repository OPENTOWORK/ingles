'use client';

import { createContext, useContext } from 'react';

const ExamPracticeSidebarSlotsContext = createContext({ exerciseStars: null });

export function ExamPracticeSidebarSlotsProvider({ exerciseStars = null, children }) {
  return (
    <ExamPracticeSidebarSlotsContext.Provider value={{ exerciseStars }}>
      {children}
    </ExamPracticeSidebarSlotsContext.Provider>
  );
}

export function useExamPracticeSidebarSlots() {
  return useContext(ExamPracticeSidebarSlotsContext);
}
