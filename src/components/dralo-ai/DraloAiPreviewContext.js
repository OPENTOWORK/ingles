'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';

const DraloAiPreviewContext = createContext({
  active: false,
  openPremium: () => {},
});

export function DraloAiPreviewProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openPremium = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <DraloAiPreviewContext.Provider value={{ active: true, openPremium }}>
      {children}
      {open ? <DraloAiPremiumDialog onClose={close} /> : null}
    </DraloAiPreviewContext.Provider>
  );
}

export function useDraloAiPreview() {
  return useContext(DraloAiPreviewContext).active;
}

/** Returns true when the action must stop and the Premium dialog is open. */
export function useDraloAiPremiumGate() {
  const { active, openPremium } = useContext(DraloAiPreviewContext);
  return useCallback(() => {
    if (!active) return false;
    openPremium();
    return true;
  }, [active, openPremium]);
}

function DraloAiPremiumDialog({ onClose }) {
  return (
    <div className="dralo-ai-premium-dialog" role="presentation" onClick={onClose}>
      <div
        className="dralo-ai-premium-dialog__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dralo-ai-premium-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="dralo-ai-premium-dialog__kicker">Plan Premium</p>
        <h2 id="dralo-ai-premium-dialog-title">Esta función es Premium</h2>
        <p>
          Puedes ver cómo está hecha la herramienta. Para usarla, pasa al plan Premium.
        </p>
        <div className="dralo-ai-premium-dialog__actions">
          <Link href="/precios" className="dralo-ai-premium-dialog__primary">
            Ver el plan Premium
          </Link>
          <button type="button" className="dralo-ai-premium-dialog__ghost" onClick={onClose}>
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}

export function buildDraloAiPreviewExercise(skillId, activity) {
  const label = activity?.label || 'Practice';
  const hint = activity?.hint || '';

  if (skillId === 'listening') {
    return {
      script: 'preview',
      questions: [
        {
          id: 'preview-q1',
          number: 1,
          prompt: 'What is the main point of this recording?',
          options: [
            'A) A change of time',
            'B) A change of place',
            'C) A request for help',
            'D) A description of a person',
          ],
        },
        {
          id: 'preview-q2',
          number: 2,
          prompt: 'What should the listener do next?',
          options: [
            'A) Wait where they are',
            'B) Go to another desk',
            'C) Call someone',
            'D) Leave a message',
          ],
        },
      ],
    };
  }

  if (skillId === 'writing') {
    return {
      instructions: hint && hint !== label ? hint : 'Write a short text for this situation.',
      wordMin: 40,
      wordMax: 90,
    };
  }

  return null;
}
