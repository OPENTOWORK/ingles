'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import { useUserRole } from '@/context/UserRoleContext';
import { isStaffRole } from '@/lib/placementLevelAccess';

const DISMISS_KEY_PREFIX = 'dralo_placement_notice_dismissed_';

export default function PlacementTestNotice() {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const { hasPlacementResult, loading } = usePlacementAccess();
  const [dismissed, setDismissed] = useState(true);

  const userId = session?.user?.id;
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const staff = isStaffRole(userRole);

  useEffect(() => {
    if (!userId) {
      setDismissed(true);
      return;
    }
    try {
      setDismissed(localStorage.getItem(`${DISMISS_KEY_PREFIX}${userId}`) === '1');
    } catch {
      setDismissed(false);
    }
  }, [userId]);

  const handleDismiss = () => {
    setDismissed(true);
    if (!userId) return;
    try {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${userId}`, '1');
    } catch {
      /* ignore */
    }
  };

  if (
    loading ||
    !session ||
    !isStudent ||
    staff ||
    hasPlacementResult ||
    dismissed ||
    pathname === '/prueba-nivel'
  ) {
    return null;
  }

  return (
    <div className="placement-notice" role="status" aria-live="polite">
      <div className="placement-notice__inner">
        <p className="placement-notice__text">
          Antes de continuar, necesitas realizar el Placement Test para desbloquear los niveles y
          acceder a tu contenido personalizado de la web.
        </p>
        <button
          type="button"
          className="placement-notice__close"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
        >
          ×
        </button>
      </div>

      <style jsx>{`
        .placement-notice {
          width: 100%;
          background: #fef9c3;
          border-bottom: 1px solid #fde047;
          box-shadow: 0 1px 0 rgba(250, 204, 21, 0.15);
        }

        .placement-notice__inner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.65rem 1.25rem;
        }

        .placement-notice__text {
          flex: 1;
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.45;
          color: #713f12;
        }

        .placement-notice__close {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 8px;
          background: rgba(250, 204, 21, 0.35);
          color: #713f12;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .placement-notice__close:hover {
          background: rgba(250, 204, 21, 0.55);
        }

        .placement-notice__close:focus-visible {
          outline: 2px solid #ca8a04;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
