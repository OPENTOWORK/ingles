'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabaseClient';
import { useExamModeProfileCharts } from '@/hooks/useExamModeProfileCharts';

const LevelsStatsChartsCarousel = dynamic(
  () => import('@/components/perfil/LevelsStatsChartsCarousel'),
  {
    ssr: false,
    loading: () => (
      <div className="lsp-loading">
        <span className="lsp-loading__spinner" aria-hidden />
        Loading charts…
      </div>
    ),
  },
);

function KpiIcon({ type }) {
  if (type === 'correct') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M16.5 5.5L8 14.5 3.5 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'incorrect') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function LevelsEstadisticasPanel({ userId, embedded = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const { data, error: qErr } = await supabase
          .from('levels_estadisticas')
          .select(
            'id, parte_id, pregunta_id, accesos, intentos_completados, respuestas_evaluadas, respuestas_correctas, respuestas_incorrectas, mejor_porcentaje, ultimo_porcentaje, ultima_interaccion',
          )
          .eq('usuario_id', userId)
          .order('ultima_interaccion', { ascending: false });

        if (cancelled) return;

        if (qErr) {
          setError(qErr.message || 'Could not load statistics.');
          setRows([]);
          setLoading(false);
          return;
        }

        setRows(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load statistics.');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const {
    charts: examModeCharts,
    loading: examModeChartsLoading,
    error: examModeChartsError,
  } = useExamModeProfileCharts(userId);

  const hasAnyLevelData = rows.length > 0;

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        evaluadas: acc.evaluadas + (r.respuestas_evaluadas || 0),
        correctas: acc.correctas + (r.respuestas_correctas || 0),
        incorrectas: acc.incorrectas + (r.respuestas_incorrectas || 0),
      }),
      { evaluadas: 0, correctas: 0, incorrectas: 0 },
    );
  }, [rows]);

  const pctGlobal =
    totals.evaluadas > 0 ? Math.round((100 * totals.correctas) / totals.evaluadas) : null;

  if (!userId) return null;

  const showAccuracyRing = !loading && !error && rows.length > 0 && pctGlobal != null;
  const showLspHeader = !embedded || showAccuracyRing;

  const kpis = [
    {
      key: 'correct',
      tone: 'green',
      value: totals.correctas,
      label: 'Correct answers',
      icon: 'correct',
    },
    {
      key: 'incorrect',
      tone: 'red',
      value: totals.incorrectas,
      label: 'Incorrect answers',
      icon: 'incorrect',
    },
    {
      key: 'accuracy',
      tone: 'blue',
      value: pctGlobal != null ? `${pctGlobal}%` : '—',
      label: 'Overall accuracy',
      icon: 'accuracy',
      ring: pctGlobal,
    },
  ];

  return (
    <section
      className={`lsp${embedded ? ' lsp--embedded' : ''}`}
      aria-labelledby={embedded ? undefined : 'levels-stats-title'}
    >
      {showLspHeader ? (
        <header className="lsp-header">
          {!embedded ? (
            <div className="lsp-header__copy">
              <h2 id="levels-stats-title" className="lsp-header__title">
                Your practice
              </h2>
            </div>
          ) : null}
          {showAccuracyRing ? (
            <div
              className="lsp-header__ring"
              style={{
                background: `conic-gradient(#2563eb ${pctGlobal * 3.6}deg, var(--lsp-ring-track, #e2e8f0) 0deg)`,
              }}
              aria-label={`Overall accuracy: ${pctGlobal}%`}
            >
              <div className="lsp-header__ring-inner">
                <span className="lsp-header__ring-value">{pctGlobal}%</span>
                <span className="lsp-header__ring-label">accuracy</span>
              </div>
            </div>
          ) : null}
        </header>
      ) : null}

      {loading ? (
        <div className="lsp-loading">
          <span className="lsp-loading__spinner" aria-hidden />
          Loading statistics…
        </div>
      ) : error ? (
        <p className="lsp-message lsp-message--error">{error}</p>
      ) : (
        <>
          {!hasAnyLevelData ? (
            <p className="lsp-message lsp-message--empty">
              No data in Supabase yet. Practise in{' '}
              <a href="/niveles">Levels</a> (A2, B1, B2, C1 or C2) and you will see your results by
              part here. For now you can explore each level structure below.
            </p>
          ) : null}

          <div className="lsp-kpis">
            {kpis.map((kpi) => (
              <article key={kpi.key} className={`lsp-kpi lsp-kpi--${kpi.tone}`}>
                <div className="lsp-kpi__icon">
                  <KpiIcon type={kpi.icon} />
                </div>
                <div className="lsp-kpi__body">
                  <p className="lsp-kpi__value">{kpi.value}</p>
                  <p className="lsp-kpi__label">{kpi.label}</p>
                </div>
              </article>
            ))}
          </div>

          {examModeChartsLoading ? (
            <div className="lsp-loading lsp-loading--inline">
              <span className="lsp-loading__spinner" aria-hidden />
              Loading exam mode chart…
            </div>
          ) : examModeChartsError ? (
            <p className="lsp-message lsp-message--error">{examModeChartsError}</p>
          ) : (
            <LevelsStatsChartsCarousel charts={examModeCharts} variant="exam-mode" />
          )}
        </>
      )}

      <style jsx>{`
        .lsp {
          margin: 22px 0;
          padding: 28px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .lsp--embedded {
          margin: 28px 0 0;
          padding: 28px 0 0;
          border: none;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          border-top: 1px solid #e2e8f0;
        }

        .lsp--embedded .lsp-header {
          margin-bottom: 20px;
          padding-bottom: 0;
          border-bottom: none;
          justify-content: flex-end;
        }

        .lsp-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .lsp-header__copy {
          flex: 1 1 280px;
          min-width: 0;
        }

        .lsp-header__title {
          margin: 0 0 8px;
          font-size: 1.375rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.025em;
          line-height: 1.25;
        }

        .lsp-header__subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.55;
          max-width: 36rem;
        }

        .lsp-header__ring {
          flex-shrink: 0;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.15);
        }

        .lsp-header__ring-inner {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .lsp-header__ring-value {
          font-size: 1.125rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        .lsp-header__ring-label {
          margin-top: 2px;
          font-size: 0.625rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .lsp-kpis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .lsp-kpis {
            grid-template-columns: 1fr;
          }
        }

        .lsp-kpi {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }

        .lsp-kpi:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .lsp-kpi__icon {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: grid;
          place-items: center;
        }

        .lsp-kpi--green .lsp-kpi__icon {
          background: #ecfdf5;
          color: #15803d;
        }

        .lsp-kpi--red .lsp-kpi__icon {
          background: #fef2f2;
          color: #b91c1c;
        }

        .lsp-kpi--blue .lsp-kpi__icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .lsp-kpi__body {
          min-width: 0;
        }

        .lsp-kpi__value {
          margin: 0;
          font-size: 1.625rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .lsp-kpi__label {
          margin: 4px 0 0;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #64748b;
          line-height: 1.4;
        }

        .lsp-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 0;
          color: #64748b;
          font-size: 0.9375rem;
        }

        .lsp-loading__spinner {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          border-top-color: #2563eb;
          animation: lsp-spin 0.7s linear infinite;
        }

        @keyframes lsp-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .lsp-message {
          margin: 0;
          padding: 16px 0;
          font-size: 0.9375rem;
          line-height: 1.55;
        }

        .lsp-message--empty {
          color: #64748b;
        }

        .lsp-message--empty :global(a) {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }

        .lsp-message--empty :global(a:hover) {
          text-decoration: underline;
        }

        .lsp-message--error {
          color: #b91c1c;
        }

        .lsp-loading--inline {
          padding: 12px 0 0;
        }
      `}</style>
    </section>
  );
}
