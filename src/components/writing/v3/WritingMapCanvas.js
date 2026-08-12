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
  const markRefs = useRef(new Map());
  const [flipped, setFlipped] = useState(false);

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

  // The bubble opens to the right of the mark unless that would leave the reading
  // column, in which case it is flipped. Measured, never guessed from the index.
  useLayoutEffect(() => {
    if (!state.active_group_id || state.presentation !== 'bubble') {
      setFlipped(false);
      return;
    }
    const mark = markRefs.current.get(state.active_group_id);
    const container = containerRef.current;
    if (!mark || !container) return;
    const markBox = mark.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();
    setFlipped(markBox.left + 360 > containerBox.right);
  }, [state.active_group_id, state.presentation, setFlipped]);

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
          <span className="writing-map__anchor" key={`m-${segment.start}-${segment.group_id}`}>
            <WritingMapAnnotation
              ref={registerMark(segment.group_id)}
              segment={segment}
              items={items}
              open={open}
              bubbleId={surfaceId}
              onActivate={activate}
            />
            {open && state.presentation === 'bubble' ? (
              <WritingMapBubble
                id={surfaceId}
                items={items}
                labelId={`${surfaceId}-quote`}
                flipped={flipped}
                onClose={dismiss}
              />
            ) : null}
          </span>
        );
      }),
    [map.segments, map.groups, state, surfaceId, flipped, activate, dismiss, registerMark],
  );

  return (
    <section className="writing-map" aria-labelledby="writing-map-title">
      <div className="writing-map__header">
        <p className="levels-exam-split__section-title" id="writing-map-title">
          Your writing
        </p>
        <p className="writing-map__hint">
          {map.annotation_count} marked{' '}
          {map.annotation_count === 1 ? 'moment' : 'moments'} in your text. Select any
          highlighted words to read the feedback.
        </p>
      </div>

      <WritingMapLegend legend={map.legend} />

      <div className="writing-map__canvas" ref={containerRef}>
        <div className="writing-map__text">{nodes}</div>
        {activeItems && state.presentation === 'sheet' ? (
          <WritingMapBottomSheet id={surfaceId} items={activeItems} onClose={dismiss} />
        ) : null}
      </div>
    </section>
  );
}

/**
 * The legend names every category present in this response. It is what makes the
 * marks readable without relying on colour perception at all.
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
