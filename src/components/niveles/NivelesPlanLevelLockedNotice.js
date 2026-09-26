'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlanUpgradeModal from '@/components/subscriptions/PlanUpgradeModal';

export default function NivelesPlanLevelLockedNotice({
  level,
  requiredPlanName = 'PLUS',
  backHref = '/niveles',
}) {
  const [open, setOpen] = useState(true);
  const message = `El nivel ${level} está incluido en el plan ${requiredPlanName}. Con el plan gratuito no puedes entrar.`;

  return (
    <main className="shell niveles-coming-soon-page">
      <PlanUpgradeModal
        open={open}
        onClose={() => setOpen(false)}
        variant="paid_place"
        lang="es"
        message={message}
      />
      <div className="niveles-coming-soon-card">
        <span className="niveles-coming-soon-badge" aria-hidden>
          🔒
        </span>
        <h1>Esto es de pago</h1>
        <p>{message}</p>
        <Link href="/precios" className="niveles-coming-soon-link">
          Ver precios
        </Link>
        <Link href={backHref} className="niveles-coming-soon-link niveles-coming-soon-link--secondary">
          Volver
        </Link>
      </div>
      <style jsx>{`
        .niveles-coming-soon-page {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
        }
        .niveles-coming-soon-card {
          max-width: 440px;
          text-align: center;
          padding: 2rem 1.5rem;
          border-radius: 20px;
          background: var(--card, #fff);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }
        .niveles-coming-soon-badge {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        h1 {
          margin: 0 0 0.75rem;
          font-size: 1.5rem;
          letter-spacing: 0.04em;
          color: #334155;
        }
        p {
          margin: 0 0 1.25rem;
          color: #64748b;
          line-height: 1.55;
        }
        .niveles-coming-soon-link {
          display: inline-block;
          margin: 0.25rem;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          background: #1cb0f6;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
        }
        .niveles-coming-soon-link:hover {
          background: #0ea5e9;
        }
        .niveles-coming-soon-link--secondary {
          background: #e2e8f0;
          color: #334155;
        }
        .niveles-coming-soon-link--secondary:hover {
          background: #cbd5e1;
        }
      `}</style>
    </main>
  );
}
