'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { reloadExamNamesBySlot } from '@/hooks/useLevelsExamAdminFlow';
import LevelsPartTimePerformanceSection from '@/components/LevelsPartTimePerformanceSection';
import { buildPracticePerformanceSummary } from '@/utils/partTimePerformanceSummary';

const LEVEL_SLUGS = ['a2', 'b1', 'b2', 'c1', 'c2'];

const PRACTICE_ENTRY_LINKS = [
  {
    level: 'B2',
    label: 'Reading & Use of English',
    href: '/niveles/b2/exam-reading-and-use-of-english',
    accent: '#7c3aed',
  },
  {
    level: 'B2',
    label: 'Use of English',
    href: '/niveles/b2/exam-useofenglish',
    accent: '#6366f1',
  },
  {
    level: 'B2',
    label: 'Listening',
    href: '/niveles/b2/exam-listening',
    accent: '#d97706',
  },
  {
    level: 'B2',
    label: 'Writing',
    href: '/niveles/b2/exam-writing',
    accent: '#059669',
  },
  {
    level: 'B2',
    label: 'Speaking',
    href: '/niveles/b2/exam-speaking',
    accent: '#e11d48',
  },
  {
    level: 'All',
    label: 'Browse all levels',
    href: '/niveles',
    accent: '#2563eb',
  },
];

function PracticeTimesEmptyState() {
  return (
    <div className="pt-panel-empty">
      <div className="pt-panel-empty__hero">
        <div className="pt-panel-empty__icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h4 className="pt-panel-empty__title">No part times recorded yet</h4>
          <p className="pt-panel-empty__lead">
            Start a Cambridge practice session with the session timer running. Your time and score
            for each part will appear here automatically.
          </p>
        </div>
      </div>

      <ol className="pt-panel-empty__steps">
        <li>
          <span className="pt-panel-empty__step-num">1</span>
          <span>Open a skill in Levels (A2–C2) in Skills or Exam mode.</span>
        </li>
        <li>
          <span className="pt-panel-empty__step-num">2</span>
          <span>Make sure the session timer is running while you practise.</span>
        </li>
        <li>
          <span className="pt-panel-empty__step-num">3</span>
          <span>Finish a part or leave the page — your time and score are saved.</span>
        </li>
      </ol>

      <div className="pt-panel-empty__links-head">Quick start</div>
      <div className="pt-panel-empty__links">
        {PRACTICE_ENTRY_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="pt-panel-empty__link"
            style={{ '--pt-accent': item.accent }}
          >
            <span className="pt-panel-empty__link-level">{item.level}</span>
            <span className="pt-panel-empty__link-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .pt-panel-empty {
          display: grid;
          gap: 18px;
          padding: 4px 0 8px;
        }

        .pt-panel-empty__hero {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
        }

        .pt-panel-empty__icon {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
        }

        .pt-panel-empty__title {
          margin: 0 0 6px;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .pt-panel-empty__lead {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.55;
          color: #475569;
        }

        .pt-panel-empty__steps {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }

        .pt-panel-empty__steps li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #334155;
        }

        .pt-panel-empty__step-num {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .pt-panel-empty__links-head {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
        }

        .pt-panel-empty__links {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }

        .pt-panel-empty__link {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          text-decoration: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.15s ease;
          border-left: 3px solid var(--pt-accent, #2563eb);
        }

        .pt-panel-empty__link:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }

        .pt-panel-empty__link-level {
          font-size: 0.6875rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--pt-accent, #2563eb);
        }

        .pt-panel-empty__link-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.35;
        }

        @media (max-width: 640px) {
          .pt-panel-empty__hero {
            flex-direction: column;
          }

          .pt-panel-empty__links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function LevelsPartTimePerformancePanel({ userId }) {
  const [estadisticasRows, setEstadisticasRows] = useState([]);
  const [puntuacionesRows, setPuntuacionesRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examenIdsByLevel, setExamenIdsByLevel] = useState({});
  const [reloadToken, setReloadToken] = useState(0);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const [statsRes, puntRes] = await Promise.all([
        supabase
          .from('levels_estadisticas')
          .select('pregunta_id, tiempo_segundos_total, metadata')
          .eq('usuario_id', userId),
        supabase
          .from('levels_puntuaciones')
          .select(
            'pregunta_id, descripcion, created_at, score_source, examen_id, parte_numero, correctas, total_preguntas, aprobado, scoring_version, puntos_obtenidos, puntos_maximos',
          )
          .eq('uuid_usuario', userId)
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      if (statsRes.error) {
        setError(statsRes.error.message || 'Could not load practice times.');
        setEstadisticasRows([]);
        setPuntuacionesRows([]);
        return;
      }

      setEstadisticasRows(statsRes.data || []);
      setPuntuacionesRows(puntRes.error ? [] : puntRes.data || []);
      if (puntRes.error) {
        console.warn('levels_puntuaciones (practice times panel):', puntRes.error.message);
      }
    } catch (err) {
      setError(err?.message || 'Could not load practice times.');
      setEstadisticasRows([]);
      setPuntuacionesRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setEstadisticasRows([]);
      setPuntuacionesRows([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    void loadData();
    return undefined;
  }, [userId, reloadToken, loadData]);

  useEffect(() => {
    if (!userId || typeof document === 'undefined') return undefined;

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        setReloadToken((token) => token + 1);
      }
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [userId]);

  useEffect(() => {
    void Promise.all(LEVEL_SLUGS.map((slug) => reloadExamNamesBySlot(slug))).then((results) => {
      const mergedIds = {};
      LEVEL_SLUGS.forEach((slug, index) => {
        mergedIds[slug] = results[index]?.ids || {};
      });
      setExamenIdsByLevel(mergedIds);
    });
  }, []);

  const summary = useMemo(
    () =>
      buildPracticePerformanceSummary(estadisticasRows, {
        puntuacionesRows,
        examenIdsByLevel,
      }),
    [estadisticasRows, puntuacionesRows, examenIdsByLevel],
  );

  if (!userId) return null;

  return (
    <div className="pt-panel">
      <div className="pt-panel__toolbar">
        <p className="pt-panel__hint">
          Times and scores per part, level and mode (Skills / Exam).
        </p>
        <button
          type="button"
          className="pt-panel__refresh"
          onClick={() => setReloadToken((token) => token + 1)}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading && !summary.hasAnyData ? (
        <div className="pt-panel__loading">
          <span className="pt-panel__spinner" aria-hidden />
          Loading practice times…
        </div>
      ) : null}

      {!loading && error ? <p className="pt-panel__error">{error}</p> : null}

      {!loading && !error && !summary.hasAnyData ? <PracticeTimesEmptyState /> : null}

      {!loading && !error && summary.hasAnyData ? (
        <LevelsPartTimePerformanceSection
          estadisticasRows={estadisticasRows}
          puntuacionesRows={puntuacionesRows}
          examenIdsByLevel={examenIdsByLevel}
        />
      ) : null}

      <style jsx>{`
        .pt-panel {
          display: grid;
          gap: 12px;
        }

        .pt-panel__toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px 16px;
        }

        .pt-panel__hint {
          margin: 0;
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.45;
          max-width: 36rem;
        }

        .pt-panel__refresh {
          flex-shrink: 0;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .pt-panel__refresh:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .pt-panel__refresh:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .pt-panel__loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          color: #64748b;
          font-size: 0.9375rem;
        }

        .pt-panel__spinner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          border-top-color: #2563eb;
          animation: pt-panel-spin 0.7s linear infinite;
        }

        @keyframes pt-panel-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .pt-panel__error {
          margin: 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
