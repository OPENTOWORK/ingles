'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { reloadExamNamesBySlot } from '@/hooks/useLevelsExamAdminFlow';
import LevelsPartTimePerformanceSection from '@/components/LevelsPartTimePerformanceSection';
import { buildPracticePerformanceSummary } from '@/utils/partTimePerformanceSummary';

const LEVEL_SLUGS = ['a2', 'b1', 'b2', 'c1', 'c2'];

export default function LevelsPartTimePerformancePanel({ userId }) {
  const [estadisticasRows, setEstadisticasRows] = useState([]);
  const [puntuacionesRows, setPuntuacionesRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examNamesBySlot, setExamNamesBySlot] = useState({});

  useEffect(() => {
    if (!userId) {
      setEstadisticasRows([]);
      setPuntuacionesRows([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;

    (async () => {
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
            .select('pregunta_id, descripcion, created_at, score_source')
            .eq('uuid_usuario', userId)
            .order('created_at', { ascending: false })
            .limit(500),
        ]);

        if (cancelled) return;

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
        if (!cancelled) {
          setError(err?.message || 'Could not load practice times.');
          setEstadisticasRows([]);
          setPuntuacionesRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    void Promise.all(LEVEL_SLUGS.map((slug) => reloadExamNamesBySlot(slug))).then((results) => {
      const merged = {};
      LEVEL_SLUGS.forEach((slug, index) => {
        merged[slug] = results[index]?.names || {};
      });
      setExamNamesBySlot(merged);
    });
  }, []);

  const summary = useMemo(
    () => buildPracticePerformanceSummary(estadisticasRows, { puntuacionesRows }),
    [estadisticasRows, puntuacionesRows],
  );

  if (!userId) return null;

  if (loading) {
    return (
      <div className="lsp-part-times-panel__loading">
        <span className="lsp-part-times-panel__spinner" aria-hidden />
        Loading practice times…
        <style jsx>{`
          .lsp-part-times-panel__loading {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0 16px;
            color: #64748b;
            font-size: 0.9375rem;
          }
          .lsp-part-times-panel__spinner {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #e2e8f0;
            border-top-color: #2563eb;
            animation: lsp-part-times-spin 0.7s linear infinite;
          }
          @keyframes lsp-part-times-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <p className="lsp-part-times-panel__error">{error}</p>
        <style jsx>{`
          .lsp-part-times-panel__error {
            margin: 0;
            padding: 8px 0 16px;
            color: #b91c1c;
            font-size: 0.9375rem;
          }
        `}</style>
      </>
    );
  }

  if (!summary.hasAnyData) {
    return (
      <>
        <p className="lsp-part-times-panel__empty">
          No part times recorded yet. Practise any skill in{' '}
          <a href="/niveles">Levels</a> (A2–C2) in Skills mode or Exam mode with the session timer
          running while signed in. Your time and score for each part will appear here.
        </p>
        <style jsx>{`
          .lsp-part-times-panel__empty {
            margin: 0;
            padding: 8px 0 16px;
            color: #64748b;
            font-size: 0.9375rem;
            line-height: 1.55;
          }
          .lsp-part-times-panel__empty :global(a) {
            color: #2563eb;
            font-weight: 600;
            text-decoration: none;
          }
          .lsp-part-times-panel__empty :global(a:hover) {
            text-decoration: underline;
          }
        `}</style>
      </>
    );
  }

  return (
    <LevelsPartTimePerformanceSection
      estadisticasRows={estadisticasRows}
      puntuacionesRows={puntuacionesRows}
      examNamesBySlot={examNamesBySlot}
    />
  );
}
