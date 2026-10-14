'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AbOrientationQuiz from '@/components/landing/ab/AbOrientationQuiz';
import { isStudentRole } from '@/utils/authRoles';
import { isRoleConfirmedForSession } from '@/lib/userRoleResolution';
import { isWelcomeFormDone, isWelcomeFormEligible } from '@/lib/welcomeFormState';
import { isTutorialAutoOpenPath } from '@/lib/tutorialState';
import {
  markOrientationQuizSeen,
  shouldOfferOrientationQuiz,
  wasOrientationQuizSeen,
} from '@/lib/orientationQuizState';

function welcomeIsClear(user, userRole) {
  return !isWelcomeFormEligible(user, userRole) || isWelcomeFormDone(user?.id);
}

/** Cuestionario de orientación: una vez, al entrar, después de registrarse. */
export default function OrientationQuizGate({ session, userRole, roleConfirmedForUserId }) {
  const pathname = usePathname();
  const user = session?.user || null;
  const [seen, setSeen] = useState(true);
  const [welcomeClear, setWelcomeClear] = useState(false);

  useEffect(() => {
    setSeen(!user?.id || wasOrientationQuizSeen(user.id));
  }, [user?.id]);

  const roleConfirmed = isRoleConfirmedForSession(session, roleConfirmedForUserId);
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const eligible =
    Boolean(user?.id) &&
    roleConfirmed &&
    isStudentRole(userRole) &&
    !seen &&
    shouldOfferOrientationQuiz(user) &&
    isTutorialAutoOpenPath(pathname, search);

  useEffect(() => {
    if (!eligible) {
      setWelcomeClear(false);
      return undefined;
    }
    if (welcomeIsClear(user, userRole)) {
      setWelcomeClear(true);
      return undefined;
    }
    setWelcomeClear(false);
    const timer = window.setInterval(() => {
      if (welcomeIsClear(user, userRole)) setWelcomeClear(true);
    }, 800);
    return () => window.clearInterval(timer);
  }, [eligible, user, userRole]);

  if (!eligible || !welcomeClear) return null;

  return (
    <AbOrientationQuiz
      autoOpen
      onDismiss={() => {
        markOrientationQuizSeen(user.id);
        setSeen(true);
      }}
    />
  );
}
