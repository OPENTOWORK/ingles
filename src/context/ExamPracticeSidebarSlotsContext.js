'use client';



import { createContext, useContext, useMemo } from 'react';



const ExamPracticeSidebarSlotsContext = createContext({

  exerciseStars: null,

  sideRailMountRef: null,

  overlayContainerRef: null,

  portSideRailToToolbar: false,

});



export function ExamPracticeSidebarSlotsProvider({

  exerciseStars = null,

  overlayContainerRef = null,

  sideRailMountRef = null,

  portSideRailToToolbar = false,

  children,

}) {

  const value = useMemo(

    () => ({

      exerciseStars,

      sideRailMountRef,

      overlayContainerRef,

      portSideRailToToolbar,

    }),

    [exerciseStars, sideRailMountRef, overlayContainerRef, portSideRailToToolbar],

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


