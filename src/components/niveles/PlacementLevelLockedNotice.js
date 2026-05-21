'use client';

import Link from 'next/link';
import { getPlacementLockReason } from '@/lib/placementLevelAccess';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import { useUserRole } from '@/context/UserRoleContext';

export default function PlacementLevelLockedNotice({ level }) {
  const { userRole } = useUserRole();
  const { hasPlacementResult, assignedLevel } = usePlacementAccess();
  const isStudent = userRole === 'student' || userRole === 'alumno';

  const reason = getPlacementLockReason({
    isStudent,
    hasPlacementResult,
    assignedLevel,
    targetLevel: level,
  });

  return (
    <main className="shell placement-locked-page">
      <div className="placement-locked-card">
        <span className="placement-locked-badge" aria-hidden>
          🔒
        </span>
        <h1>Nivel bloqueado</h1>
        <p>{reason?.message || 'No tienes acceso a este nivel.'}</p>
        {reason?.variant === 'no-placement' ? (
          <Link href="/prueba-nivel" className="placement-locked-link">
            Hacer placement test
          </Link>
        ) : (
          <Link href="/niveles" className="placement-locked-link">
            Volver a niveles
          </Link>
        )}
      </div>
      <style jsx>{`
        .placement-locked-page {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
        }
        .placement-locked-card {
          max-width: 440px;
          text-align: center;
          padding: 2rem 1.5rem;
          border-radius: 20px;
          background: var(--card, #fff);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }
        .placement-locked-badge {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        h1 {
          margin: 0 0 0.75rem;
          font-size: 1.75rem;
          color: #334155;
        }
        p {
          margin: 0 0 1.25rem;
          color: #64748b;
          line-height: 1.55;
        }
        .placement-locked-link {
          display: inline-block;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          background: #1cb0f6;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
        }
        .placement-locked-link:hover {
          background: #0ea5e9;
        }
      `}</style>
    </main>
  );
}
