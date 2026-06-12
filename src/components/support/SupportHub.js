'use client';

import { useState } from 'react';
import SupportTicketsPanel from '@/components/support/SupportTicketsPanel';
import AutomatedEmailsPanel from '@/components/support/AutomatedEmailsPanel';

const TABS = [
  { id: 'tickets', label: 'Tickets' },
  { id: 'emails', label: 'Correos automáticos' },
];

export default function SupportHub() {
  const [tab, setTab] = useState('tickets');

  return (
    <div>
      <div className="support-hub-tabs" role="tablist" aria-label="Secciones de soporte">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`support-hub-tab${tab === t.id ? ' support-hub-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'tickets' ? <SupportTicketsPanel /> : <AutomatedEmailsPanel />}
      </div>

      <style jsx>{`
        .support-hub-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .support-hub-tab {
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }
        .support-hub-tab--active {
          background: #0070f3;
          color: #fff;
          border-color: #0070f3;
        }
      `}</style>
    </div>
  );
}
