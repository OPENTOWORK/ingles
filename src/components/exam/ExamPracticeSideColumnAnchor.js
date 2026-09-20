'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';

/**
 * En modo toolbar: portal del rail a la franja horizontal bajo la barra.
 * En modo columna lateral: render normal en el grid.
 */
export default function ExamPracticeSideColumnAnchor({ children }) {
  const { sideRailMountRef, portSideRailToToolbar } = useExamPracticeSidebarSlots();
  const [mountNode, setMountNode] = useState(null);

  useLayoutEffect(() => {
    if (!portSideRailToToolbar) {
      setMountNode(null);
      return undefined;
    }

    const syncMount = () => setMountNode(sideRailMountRef?.current ?? null);
    syncMount();
    const raf = requestAnimationFrame(syncMount);
    return () => cancelAnimationFrame(raf);
  }, [portSideRailToToolbar, sideRailMountRef, children]);

  if (!portSideRailToToolbar) {
    return children;
  }

  if (!mountNode) {
    return null;
  }

  return createPortal(children, mountNode);
}
