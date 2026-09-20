'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExamPracticeSidebarSlots } from '@/context/ExamPracticeSidebarSlotsContext';
import { useFloatingOverlayTransition } from '@/hooks/useFloatingOverlayTransition';

const PANEL_MAX_WIDTH = 360;
const VIEWPORT_GUTTER = 12;

function computePanelStyle(trigger) {
  if (!trigger) return null;
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(PANEL_MAX_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
  let left = rect.left;
  if (left + width > window.innerWidth - VIEWPORT_GUTTER) {
    left = window.innerWidth - VIEWPORT_GUTTER - width;
  }
  left = Math.max(VIEWPORT_GUTTER, left);
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GUTTER;
  const maxHeight = Math.max(160, Math.min(window.innerHeight * 0.7, spaceBelow));
  return {
    top: rect.bottom + 8,
    left,
    width,
    maxHeight,
  };
}

function useOverlayRoot(overlayContainerRefProp, watchOpen) {
  const { overlayContainerRef: overlayFromContext } = useExamPracticeSidebarSlots();
  const ref = overlayContainerRefProp ?? overlayFromContext;
  const [root, setRoot] = useState(null);

  useLayoutEffect(() => {
    const panel = ref?.current ?? null;
    const body = typeof document !== 'undefined' ? document.body : null;
    setRoot(panel ?? body);
  }, [ref, watchOpen]);

  return root;
}

/**
 * Toggle del rail de práctica: el contenido se abre en capa flotante (sin empujar el layout).
 */
export default function ExamPracticeRailDisclosure({
  title,
  asideClassName = 'levels-listening-strategy',
  toggleClassName = 'levels-listening-strategy__toggle',
  panelClassName = '',
  overlayContainerRef = null,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const overlayRoot = useOverlayRoot(overlayContainerRef, open);
  const { mounted: layerMounted, layerClassName } = useFloatingOverlayTransition(open);

  const syncPanelPosition = useCallback(() => {
    const next = computePanelStyle(triggerRef.current);
    if (next) setPanelStyle(next);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    syncPanelPosition();
    let raf = 0;
    const onScrollOrResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncPanelPosition);
    };
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, syncPanelPosition]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (panel?.contains(event.target)) return;
      if (trigger?.contains(event.target)) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  const toggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setPanelStyle(computePanelStyle(triggerRef.current));
      }
      return next;
    });
  }, []);

  const resolvedStyle =
    open || layerMounted ? panelStyle ?? computePanelStyle(triggerRef.current) : null;

  const floatingLayer =
    layerMounted && overlayRoot && resolvedStyle
      ? createPortal(
          <div
            className={`exam-practice-rail-disclosure__layer ${layerClassName}`.trim()}
            role="presentation"
          >
            <div className="exam-practice-rail-disclosure__backdrop" aria-hidden />
            <div
              ref={panelRef}
              id={panelId}
              className={`levels-listening-strategy__body exam-practice-rail-disclosure__panel exam-practice-rail-disclosure__panel--floating ${panelClassName}`.trim()}
              style={resolvedStyle}
              role="dialog"
              aria-modal="false"
              aria-label={title}
            >
              {children}
            </div>
          </div>,
          overlayRoot,
        )
      : null;

  return (
    <aside
      className={`${asideClassName} exam-practice-rail-disclosure${open ? ' exam-practice-rail-disclosure--open' : ''}`.trim()}
    >
      <button
        ref={triggerRef}
        type="button"
        className={toggleClassName}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{title}</span>
        <span className="exam-practice-rail-disclosure__chevron" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {floatingLayer}
    </aside>
  );
}
