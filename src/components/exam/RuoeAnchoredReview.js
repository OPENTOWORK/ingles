'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './RuoeAnswerReview.module.css';

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

export default function RuoeAnchoredReview({ selection, onClose, children }) {
  const [position, setPosition] = useState(null);
  const titleId = useId();
  const regionRef = useRef(null);
  const selectedKey = selection?.key;

  useLayoutEffect(() => {
    if (!selectedKey) return;
    const anchor = document.querySelector(`[data-ruoe-review-key="${CSS.escape(selectedKey)}"]`);
    if (!anchor) return;
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const width = Math.min(416, viewportWidth - 24);
      const left = Math.max(12, Math.min(rect.left, viewportWidth - width - 12));
      const next = { key: selectedKey, top: Math.round(rect.bottom + window.scrollY + 8), left: Math.round(left + window.scrollX), width };
      setPosition((previous) => previous?.key === next.key && previous.top === next.top
        && previous.left === next.left && previous.width === next.width ? previous : next);
    };
    if (selection.scroll) anchor.scrollIntoView({ block: 'center', inline: 'nearest' });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [selectedKey, selection?.scroll]);

  useLayoutEffect(() => {
    if (!selectedKey) return;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose(selectedKey);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedKey, onClose]);

  const visible = Boolean(selectedKey && position?.key === selectedKey);
  useLayoutEffect(() => {
    if (visible) regionRef.current?.focus({ preventScroll: true });
  }, [selectedKey, visible]);

  if (!visible) return null;
  const { top, left, width } = position;
  return createPortal(
    <div ref={regionRef} tabIndex={-1} className={styles.anchored} style={{ top, left, width }} role="region" aria-labelledby={titleId}>
      <span className="sr-only" id={titleId}>Answer feedback</span>
      <button type="button" className={styles.close} aria-label="Close answer feedback" onClick={() => onClose(selectedKey)}>×</button>
      {children}
    </div>,
    document.body,
  );
}
