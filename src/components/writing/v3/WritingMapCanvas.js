'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  initialSelectionState,
  isOpen,
  selectionReducer,
  WRITING_MAP_MOBILE_BREAKPOINT,
} from '@/features/writing/ui/annotation-selection';
import WritingMapAnnotation from './WritingMapAnnotation';
import WritingMapBubble from './WritingMapBubble';
import WritingMapBottomSheet from './WritingMapBottomSheet';

/**
 * The Interactive Writing Map (Doc 04 §4).
 *
 * The learner's response is the page. It is rendered from deterministic segments
 * built by `buildAnnotationSegments`, so a 190-word essay costs a handful of nodes
 * rather than one React element per character, and the words themselves are copied
 * straight from `candidate_response`: no rewrite, no model-generated HTML, no
 * markup parser.
 */
export default function WritingMapCanvas({ map, initialViewportWidth = 1280 }) {
  const [state, dispatch] = useReducer(selectionReducer, initialViewportWidth, initialSelectionState);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const markRefs = useRef(new Map());
  const [bubbleTop, setBubbleTop] = useState(0);

  const activeItems = state.active_group_id ? map.groups[state.active_group_id] : null;
  const surfaceId = state.active_group_id
    ? `writing-map-feedback-${state.active_group_id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : undefined;

  const activate = useCallback((groupId) => dispatch({ type: 'activate', group_id: groupId }), []);
  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), []);

  useEffect(() => {
    const onResize = () => dispatch({ type: 'viewport', width: window.innerWidth });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!state.active_group_id) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };
    const onPointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      dismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [state.active_group_id, dismiss]);

  // Focus returns to the mark the learner opened, so closing a sheet on a phone
  // does not drop the keyboard user back at the top of the document.
  const previousActive = useRef(null);
  useEffect(() => {
    if (state.active_group_id) {
      previousActive.current = state.active_group_id;
      return;
    }
    if (!previousActive.current) return;
    if (state.presentation === 'sheet') {
      markRefs.current.get(state.return_focus_group_id)?.focus();
    }
    previousActive.current = null;
  }, [state.active_group_id, state.presentation, state.return_focus_group_id]);

  // The bubble sits beside the text, level with the highlighted sentence.
  useLayoutEffect(() => {
    if (!state.active_group_id || state.presentation !== 'bubble') return;
    const mark = markRefs.current.get(state.active_group_id);
    const text = textRef.current;
    if (!mark || !text) return;
    const top = mark.getBoundingClientRect().top - text.getBoundingClientRect().top;
    setBubbleTop(Math.max(0, top));
  }, [state.active_group_id, state.presentation]);

  const registerMark = useCallback((groupId) => (node) => {
    if (node) markRefs.current.set(groupId, node);
    else markRefs.current.delete(groupId);
  }, []);

  const nodes = useMemo(
    () =>
      map.segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <span key={`t-${segment.start}-${index}`}>{segment.text}</span>;
        }
        const items = map.groups[segment.group_id] ?? [];
        const open = isOpen(state, segment.group_id);
        return (
          <WritingMapAnnotation
            key={`m-${segment.start}-${segment.group_id}`}
            ref={registerMark(segment.group_id)}
            segment={segment}
            items={items}
            open={open}
            bubbleId={surfaceId}
            onActivate={activate}
          />
        );
      }),
    [map.segments, map.groups, state, surfaceId, activate, registerMark],
  );

  const showSideBubble = Boolean(activeItems && state.presentation === 'bubble');

  return (
    <section className="writing-map" aria-labelledby="writing-map-title">
      <h2 className="writing-map__title" id="writing-map-title">
        Your corrected writing
      </h2>
      <div
        className={`writing-map__canvas${showSideBubble ? ' writing-map__canvas--with-bubble' : ''}`}
        ref={containerRef}
      >
        <WritingMapLegend legend={map.legend} />
        <div className="writing-map__text" ref={textRef}>{nodes}</div>
        {showSideBubble ? (
          <div className="writing-map__aside">
            <WritingMapBubble
              id={surfaceId}
              items={activeItems}
              top={bubbleTop}
              onClose={dismiss}
            />
          </div>
        ) : null}
        {activeItems && state.presentation === 'sheet' ? (
          <WritingMapBottomSheet id={surfaceId} items={activeItems} onClose={dismiss} />
        ) : null}
      </div>
    </section>
  );
}

/**
 * Every colour category is listed, even when this essay does not use all of them.
 */
export function WritingMapLegend({ legend }) {
  if (!legend.length) return null;
  return (
    <ul className="writing-map__legend" aria-label="Mark categories in your writing">
      {legend.map((token) => (
        <li
          key={token.key}
          className="writing-map__legend-item"
          aria-label={`${token.label}. ${token.hint}`}
        >
          <span className={`writing-map__legend-swatch ${token.className}`} aria-hidden="true">
            {token.marker}
          </span>
          <span className="writing-map__legend-label">{token.label}</span>
        </li>
      ))}
    </ul>
  );
}

export { WRITING_MAP_MOBILE_BREAKPOINT };
