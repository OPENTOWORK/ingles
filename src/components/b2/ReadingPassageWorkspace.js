'use client';

import { useId, useRef, useState } from 'react';
import styles from './ReadingPassageWorkspace.module.css';

export default function ReadingPassageWorkspace({
  passage,
  panel,
  panelTitle,
  openLabel,
  questionNumbers = [],
  sentenceBank = false,
  onPanelClose,
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef(null);
  const panelRef = useRef(null);

  function closePanel() {
    setOpen(false);
    onPanelClose?.();
    trigger.current?.focus();
  }

  function openPanel() {
    setOpen(true);
    requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      if (!sentenceBank && window.matchMedia('(max-width: 899px)').matches) {
        panelRef.current?.scrollIntoView({ block: 'start' });
      }
    });
  }

  function goToQuestion(number) {
    const question = panelRef.current?.querySelector(`[data-question-number="${number}"]`);
    if (!question) return;
    question.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
    question.scrollIntoView({ block: 'start' });
  }

  return (
    <div
      className={styles.workspace}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape' || event.defaultPrevented) return;
        event.stopPropagation();
        closePanel();
      }}
    >
      <div className={styles.toolbar}>
        <button
          ref={trigger}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={open ? closePanel : openPanel}
        >
          {open ? (sentenceBank ? 'Hide sentences' : 'Hide questions') : openLabel}
        </button>
      </div>
      <div className={`${styles.columns} ${open ? styles.open : ''}`}>
        <div className={styles.passage} role="region" aria-label="Reading passage" tabIndex={0}>
          {passage}
        </div>
        <section
          id={panelId}
          ref={panelRef}
          aria-label={panelTitle}
          tabIndex={-1}
          hidden={!open}
          className={`${styles.panel} ${sentenceBank ? styles.sentenceBank : ''}`}
        >
          <header className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <h3>{panelTitle}</h3>
              <button type="button" className={styles.close} onClick={closePanel} aria-label={`Close ${panelTitle.toLowerCase()}`}>×</button>
            </div>
            {questionNumbers.length > 0 && (
              <nav aria-label="Jump to a question" className={styles.questionNumbers}>
                {questionNumbers.map((number) => (
                  <button key={number} type="button" aria-label={`Go to question ${number}`} onClick={() => goToQuestion(number)}>
                    {number}
                  </button>
                ))}
              </nav>
            )}
          </header>
          <div className={styles.panelBody}>{panel}</div>
        </section>
      </div>
    </div>
  );
}
