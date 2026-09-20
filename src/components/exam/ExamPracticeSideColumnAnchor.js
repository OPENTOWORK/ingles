'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';

/**
 * En modo toolbar: portal del rail a la franja horizontal bajo la barra.
 * En modo columna lateral: render normal en el grid.
 */
export default function ExamPracticeSideColumnAnchor({ children }) {
  const { sideRailMountRef, portSideRailToToolbar, sideRailToolbarMounted } =
    useExamPracticeSidebarSlots();
  const [mountNode, setMountNode] = useState(null);

  useLayoutEffect(() => {
    if (!portSideRailToToolbar || !sideRailToolbarMounted) {
      setMountNode(null);
      return;
    }
    setMountNode(sideRailMountRef?.current ?? null);
  }, [portSideRailToToolbar, sideRailToolbarMounted, sideRailMountRef]);

  if (!portSideRailToToolbar) {
    return children;
  }

  if (!mountNode) {
    return null;
  }

  return createPortal(children, mountNode);
}
