'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from './CustomerJourneyPanel.module.css';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTouchLabel(step) {
  if (step.type === 'first_touch') return step.label || 'First touch';
  if (step.type === 'revenue') return 'Revenue';
  if (step.type === 'conversion') {
    const map = {
      generate_lead: 'Lead',
      lead_qualified: 'Lead cualificado',
      meeting_booked: 'Reunión',
      proposal_sent: 'Propuesta',
      customer_created: 'Cliente',
      purchase: 'Compra',
    };
    return map[step.label] || step.label;
  }
  return step.label || 'Touchpoint';
}

function stepClass(step) {
  if (step.type === 'first_touch') return `${styles.step} ${styles.stepFirstTouch}`;
  if (step.type === 'revenue') return `${styles.step} ${styles.stepRevenue}`;
  return styles.step;
}

export default function CustomerJourneyPanel({ userId, allowMockPreview = true }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showMock, setShowMock] = useState(false);

  const loadJourney = useCallback(
    async (mock = false) => {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const qs = mock ? '?mock=1' : '';
        const res = await fetch(`/api/admin/marketing/customer-journey/${userId}${qs}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error || 'No se pudo cargar el customer journey.');
          setData(null);
          return;
        }
        setData(json);
      } catch (err) {
        console.error('[CustomerJourneyPanel]', err);
        setError('Error al cargar el customer journey.');
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    void loadJourney(false);
  }, [loadJourney]);

  const profile = data?.profile;
  const journey = data?.journey || [];

  return (
    <section className={styles.wrap} aria-labelledby="customer-journey-heading">
      <div className={styles.header}>
        <h2 id="customer-journey-heading" className={styles.title}>
          Marketing / Customer Journey
        </h2>
        {data?.mock ? <span className={styles.mockBadge}>Vista demo</span> : null}
        {allowMockPreview && !data?.hasData && !loading ? (
          <button
            type="button"
            className="text-sm text-indigo-700 hover:underline"
            onClick={() => {
              setShowMock(true);
              void loadJourney(true);
            }}
          >
            Ver ejemplo (mock)
          </button>
        ) : null}
      </div>

      {loading ? <p className={styles.empty}>Cargando journey…</p> : null}
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}

      {!loading && !error && data && !data.hasData && !showMock ? (
        <p className={styles.empty}>
          Sin datos de marketing para este usuario. Los touchpoints se registrarán cuando la web o
          formularios envíen eventos a la API interna.
        </p>
      ) : null}

      {!loading && data?.hasData ? (
        <>
          <div className={styles.grid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>First touch</p>
              <p className={styles.statValue}>
                {[profile?.first_source, profile?.first_medium].filter(Boolean).join(' / ') || '—'}
              </p>
              <p className={styles.stepDate}>{formatDate(profile?.first_timestamp)}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Last touch</p>
              <p className={styles.statValue}>
                {[profile?.last_source, profile?.last_medium].filter(Boolean).join(' / ') || '—'}
              </p>
              <p className={styles.stepDate}>{formatDate(profile?.last_timestamp)}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Lead</p>
              <p className={styles.statValue}>{formatDate(profile?.lead_created_at)}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Cliente</p>
              <p className={styles.statValue}>{formatDate(profile?.customer_created_at)}</p>
            </div>
          </div>

          <div className={styles.timeline}>
            {journey.map((step, index) => (
              <div key={`${step.type}-${step.timestamp}-${index}`} className={stepClass(step)}>
                <div className={styles.stepLabel}>{formatTouchLabel(step)}</div>
                {step.detail ? <div className={styles.stepMeta}>{step.detail}</div> : null}
                <div className={styles.stepDate}>{formatDate(step.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
