'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ExamPracticeToolsContext = createContext(null);

const ZOOM_STEPS = [0.9, 1, 1.1, 1.25, 1.4];

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Yellow', labelEs: 'Amarillo' },
  { id: 'green', label: 'Green', labelEs: 'Verde' },
  { id: 'pink', label: 'Pink', labelEs: 'Rosa' },
  { id: 'blue', label: 'Blue', labelEs: 'Azul' },
  { id: 'orange', label: 'Orange', labelEs: 'Naranja' },
];

export function ExamPracticeToolsProvider({ children }) {
  const [zoomIndex, setZoomIndex] = useState(1);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState('yellow');
  const [lineSpacing, setLineSpacing] = useState(false);

  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(0, i - 1));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomIndex(1);
  }, []);

  const toggleHighlightMode = useCallback(() => {
    setHighlightMode((v) => !v);
  }, []);

  const toggleLineSpacing = useCallback(() => {
    setLineSpacing((v) => !v);
  }, []);

  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.exam-practice-text-highlight').forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      parent.normalize();
    });
  }, []);

  const applyHighlightToSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    const root = document.querySelector('.exam-practice-tools-target');
    if (!root || !root.contains(range.commonAncestorContainer)) return false;

    try {
      const mark = document.createElement('mark');
      mark.className = `exam-practice-text-highlight exam-practice-text-highlight--${highlightColor}`;
      range.surroundContents(mark);
      sel.removeAllRanges();
      return true;
    } catch {
      return false;
    }
  }, [highlightColor]);

  const value = useMemo(
    () => ({
      zoom,
      zoomPercent: Math.round(zoom * 100),
      highlightMode,
      highlightColor,
      setHighlightColor,
      lineSpacing,
      zoomIn,
      zoomOut,
      resetZoom,
      toggleHighlightMode,
      toggleLineSpacing,
      clearHighlights,
      applyHighlightToSelection,
    }),
    [
      zoom,
      highlightMode,
      highlightColor,
      lineSpacing,
      zoomIn,
      zoomOut,
      resetZoom,
      toggleHighlightMode,
      toggleLineSpacing,
      clearHighlights,
      applyHighlightToSelection,
    ],
  );

  const style = useMemo(
    () => ({
      '--exam-practice-zoom': String(zoom),
      '--exam-practice-line-height': lineSpacing ? '1.85' : '1.6',
    }),
    [zoom, lineSpacing],
  );

  return (
    <ExamPracticeToolsContext.Provider value={value}>
      <div
        className={`exam-practice-tools-target${highlightMode ? ' exam-practice-tools-target--highlight-mode' : ''}`}
        style={style}
        onMouseUp={() => {
          if (highlightMode) value.applyHighlightToSelection();
        }}
      >
        {children}
      </div>
    </ExamPracticeToolsContext.Provider>
  );
}

export function useExamPracticeTools() {
  const ctx = useContext(ExamPracticeToolsContext);
  if (!ctx) {
    return {
      zoom: 1,
      zoomPercent: 100,
      highlightMode: false,
      highlightColor: 'yellow',
      setHighlightColor: () => {},
      lineSpacing: false,
      zoomIn: () => {},
      zoomOut: () => {},
      resetZoom: () => {},
      toggleHighlightMode: () => {},
      toggleLineSpacing: () => {},
      clearHighlights: () => {},
      applyHighlightToSelection: () => false,
    };
  }
  return ctx;
}
