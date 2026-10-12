'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { isRoleConfirmedForSession } from '@/lib/userRoleResolution';
import { isWelcomeFormDone, isWelcomeFormEligible } from '@/lib/welcomeFormState';
import {
  TUTORIAL_SEEN_METADATA_KEY,
  isTutorialAutoOpenPath,
  rememberTutorialSeenOnDevice,
  shouldAutoOpenTutorial,
  wasTutorialSeenOnDevice,
} from '@/lib/tutorialState';
import { supabase } from '@/utils/supabaseClient';

const loadOverlay = () => import('@/components/tutorial/TutorialOverlay');
const TutorialOverlay = dynamic(loadOverlay, { ssr: false });

/** Margen para que la página termine de pintarse antes de abrir el tutorial. */
const AUTO_OPEN_DELAY_MS = 900;
const AUTO_OPEN_RETRY_MS = 800;
const BLOCKING_LAYERS = '[aria-modal="true"], .cookie-banner';

const TutorialContext = createContext(null);

/** El formulario de bienvenida, el aviso de cookies o cualquier modal van antes. */
function hasBlockingLayer() {
  return Array.from(document.querySelectorAll(BLOCKING_LAYERS)).some(
    (el) => el.getClientRects().length > 0,
  );
}

export function TutorialProvider({ children }) {
  const { session, userRole, roleConfirmedForUserId } = useUserRole();
  const pathname = usePathname();
  const user = session?.user || null;
  const roleConfirmed = isRoleConfirmedForSession(session, roleConfirmedForUserId);
  const [run, setRun] = useState(null);
  /** Una sola apertura automática por cuenta y carga, aunque no se pueda guardar el aviso. */
  const autoOpenedForRef = useRef(null);
  const isOpen = Boolean(user && run?.userId === user.id);

  const start = useCallback(() => {
    if (!user) return;
    setRun({ key: Date.now(), userId: user.id });
    rememberTutorialSeenOnDevice(user.id);
    if (!user.user_metadata?.[TUTORIAL_SEEN_METADATA_KEY]) {
      void supabase.auth
        .updateUser({ data: { [TUTORIAL_SEEN_METADATA_KEY]: new Date().toISOString() } })
        .catch(() => {});
    }
  }, [user]);

  const close = useCallback(() => setRun(null), []);

  useEffect(() => {
    if (!user || !roleConfirmed || isOpen || autoOpenedForRef.current === user.id) return undefined;
    if (!isTutorialAutoOpenPath(pathname, window.location.search)) return undefined;
    if (!shouldAutoOpenTutorial(user, { seenOnDevice: wasTutorialSeenOnDevice(user.id) })) {
      return undefined;
    }
    void loadOverlay();

    let timer = 0;
    const attempt = () => {
      if (!isTutorialAutoOpenPath(window.location.pathname, window.location.search)) return;
      const welcomeFormPending =
        isWelcomeFormEligible(user, userRole) && !isWelcomeFormDone(user.id);
      if (welcomeFormPending || hasBlockingLayer()) {
        timer = window.setTimeout(attempt, AUTO_OPEN_RETRY_MS);
        return;
      }
      autoOpenedForRef.current = user.id;
      start();
    };
    timer = window.setTimeout(attempt, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [user, userRole, roleConfirmed, pathname, isOpen, start]);

  const value = useMemo(() => ({ openTutorial: start, isTutorialOpen: isOpen }), [start, isOpen]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isOpen ? <TutorialOverlay key={run.key} onClose={close} /> : null}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return ctx;
}
