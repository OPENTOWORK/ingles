'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { landingFont } from '@/components/home/landing/landingFont';
import styles from './RuoeAnswerReview.module.css';

const GAP = 10;
const VIEWPORT_EDGE = 12;

function viewportInsets() {
  let bottom = VIEWPORT_EDGE;
  const nodes = document.querySelectorAll(
    '.reading-dictionary-tool, .reading-practice-header-tools, .study-session-float, .site-assistant-fab',
  );
  nodes.forEach((node) => {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    const rect = node.getBoundingClientRect();
    if (rect.height < 8 || rect.top < window.innerHeight * 0.45) return;
    bottom = Math.max(bottom, window.innerHeight - rect.top + 16);
  });
  return { top: VIEWPORT_EDGE, bottom };
}

export function getRuoeReviewTrigger(review, questionKey) {
  return {
    'data-ruoe-review-key': questionKey,
    style: { cursor: 'pointer' },
    'aria-expanded': review.selectedKey === questionKey,
    onClick: () => review.toggle(questionKey),
  };
}

export function RuoeReviewableInput({ review, questionKey, ...inputProps }) {
  if (!review || !inputProps.readOnly) return <input {...inputProps} />;
  return (
    <button
      type="button"
      className={inputProps.className}
      aria-label={`${inputProps['aria-label']}: ${inputProps.value || 'No answer'}. Review answer.`}
      {...getRuoeReviewTrigger(review, questionKey)}
    >
      {inputProps.value || '—'}
    </button>
  );
}

function readBox(anchor, popup, key) {
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const side = viewportWidth < 640 ? 16 : VIEWPORT_EDGE;
  const width = Math.min(416, Math.max(0, viewportWidth - side * 2));
  const insets = viewportInsets();
  const spaceBelow = Math.max(0, viewportHeight - rect.bottom - GAP - insets.bottom);
  const spaceAbove = Math.max(0, rect.top - GAP - insets.top);
  const scroller = popup.querySelector('[data-ruoe-review-scroll]') || popup;
  const natural = scroller.scrollHeight;
  const placement = natural <= spaceBelow || spaceBelow >= spaceAbove ? 'below' : 'above';
  const available = placement === 'below' ? spaceBelow : spaceAbove;
  const nextMax = `${Math.floor(Math.min(natural, Math.max(available, 1)))}px`;
  if (popup.style.maxHeight !== nextMax) popup.style.maxHeight = nextMax;
  if (scroller.style.maxHeight !== nextMax) scroller.style.maxHeight = nextMax;
  const height = popup.getBoundingClientRect().height;
  const top = placement === 'below' ? rect.bottom + GAP : rect.top - GAP - height;
  let left = rect.left;
  left = Math.max(side, Math.min(left, viewportWidth - width - side));
  const anchorCenter = rect.left + rect.width / 2;
  const pointer = Math.round(Math.max(22, Math.min(anchorCenter - left - 6, width - 34)));
  return {
    key,
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(width),
    placement,
    pointer,
  };
}

function sameBox(previous, next) {
  return previous?.key === next.key
    && previous.top === next.top
    && previous.left === next.left
    && previous.width === next.width
    && previous.placement === next.placement
    && previous.pointer === next.pointer;
}

export default function RuoeAnchoredReview({ selection, onClose, children }) {
  const [box, setBox] = useState(null);
  const titleId = useId();
  const regionRef = useRef(null);
  const selectedKey = selection?.key;
  const placed = Boolean(selectedKey && box?.key === selectedKey);

  useEffect(() => {
    if (!selectedKey) return undefined;
    document.body.classList.add('ruoe-answer-review-open');
    return () => document.body.classList.remove('ruoe-answer-review-open');
  }, [selectedKey]);

  useLayoutEffect(() => {
    if (!selectedKey) {
      setBox(null);
      return undefined;
    }
    const anchor = document.querySelector(`[data-ruoe-review-key="${CSS.escape(selectedKey)}"]`);
    const popup = regionRef.current;
    if (!anchor || !popup) return undefined;

    const measure = () => {
      const next = readBox(anchor, popup, selectedKey);
      setBox((previous) => (sameBox(previous, next) ? previous : next));
    };

    if (selection?.scroll) anchor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    observer.observe(popup);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', measure);
    viewport?.addEventListener('scroll', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      viewport?.removeEventListener('resize', measure);
      viewport?.removeEventListener('scroll', measure);
    };
  }, [selectedKey, selection?.scroll]);

  useLayoutEffect(() => {
    if (!selectedKey) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose(selectedKey);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedKey, onClose]);

  useLayoutEffect(() => {
    if (placed) regionRef.current?.focus({ preventScroll: true });
  }, [selectedKey, placed]);

  if (!selectedKey || typeof document === 'undefined') return null;

  const side = window.innerWidth < 640 ? 16 : VIEWPORT_EDGE;
  const width = placed ? box.width : Math.min(416, window.innerWidth - side * 2);

  return createPortal(
    <div
      ref={regionRef}
      tabIndex={-1}
      className={`${styles.anchored} ${landingFont.variable}${placed ? ` ${styles[box.placement]}` : ''}`}
      style={{
        top: placed ? box.top : 0,
        left: placed ? box.left : side,
        width,
        visibility: placed ? 'visible' : 'hidden',
      }}
      role="region"
      aria-labelledby={titleId}
    >
      {placed ? (
        <span className={styles.pointer} style={{ left: box.pointer }} aria-hidden="true" />
      ) : null}
      <span className="sr-only" id={titleId}>Answer feedback</span>
      <button
        type="button"
        className={styles.close}
        aria-label="Close answer feedback"
        onClick={() => onClose(selectedKey)}
      >
        <span aria-hidden="true">×</span>
      </button>
      {children}
    </div>,
    document.body,
  );
}
