'use client';

import { useId, useRef, useState } from 'react';
import styles from './RuoeTestSelector.module.css';

export default function RuoeTestSelector({ currentSlot, slots, planLockedSlots, isSlotUnlocked, onSelect }) {
  const dialogId = useId();
  const dialogRef = useRef(null);
  const currentOptionRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function openSelector(event) {
    const dialog = dialogRef.current;
    const { left, top, bottom } = event.currentTarget.getBoundingClientRect();
    const roomBelow = window.innerHeight - bottom;
    const opensAbove = roomBelow < 300 && top > roomBelow;
    dialog.style.setProperty('--picker-left', `${left}px`);
    dialog.style.setProperty('--picker-top', opensAbove ? 'auto' : `${bottom + 6}px`);
    dialog.style.setProperty('--picker-bottom', opensAbove ? `${window.innerHeight - top + 6}px` : 'auto');
    dialog.style.setProperty('--picker-room', `${Math.max(0, (opensAbove ? top : roomBelow) - 14)}px`);
    dialog.showModal();
    setOpen(true);
    currentOptionRef.current?.focus();
  }

  async function selectSlot(slot) {
    dialogRef.current.close();
    if (slot === currentSlot) return;
    setPending(true);
    try {
      await onSelect(slot);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        disabled={pending}
        onClick={openSelector}
      >
        Test {currentSlot} <span className={styles.chevron} aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.dialog}
        aria-labelledby={`${dialogId}-label`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.header}>
          <span id={`${dialogId}-label`}>Choose a test</span>
          <button type="button" className={styles.close} aria-label="Close test selector" onClick={() => dialogRef.current.close()}>×</button>
        </div>
        <ul className={styles.list}>
          {slots.map((slot) => {
            const current = slot === currentSlot;
            const planLocked = !current && planLockedSlots.includes(slot);
            const progressLocked = !current && !planLocked && !isSlotUnlocked(slot);
            return (
              <li key={slot}>
                <button
                  ref={current ? currentOptionRef : undefined}
                  type="button"
                  className={styles.option}
                  aria-current={current ? 'true' : undefined}
                  disabled={progressLocked}
                  onClick={() => void selectSlot(slot)}
                >
                  <span>Test {slot}</span>
                  {current || planLocked || progressLocked ? (
                    <span className={styles.status}>{current ? 'Current' : 'Locked'}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </dialog>
    </>
  );
}
