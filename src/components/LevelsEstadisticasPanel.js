'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabaseClient';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import {
  aggregateLevelsStatsByPart,
  buildPreguntaMetaMap,
} from '@/lib/aggregateLevelsStatsByPart';

const LevelsStatsChartsCarousel = dynamic(
  () => import('@/components/perfil/LevelsStatsChartsCarousel'),
  { ssr: false, loading: () => <p style={{ color: '#666', padding: '0.5rem 0' }}>Cargando gráficas…</p> },
);

async function fetchPreguntaMeta(preguntaIds) {
  if (!preguntaIds.length) return {};

  const chunkSize = 80;
  const preguntas = [];

  for (let i = 0; i < preguntaIds.length; i += chunkSize) {
    const chunk = preguntaIds.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('levels_preguntas')
      .select('id, level_id, parte_id')
      .in('id', chunk);
    if (error) throw error;
    if (data?.length) preguntas.push(...data);
  }

  const levelIds = [...new Set(preguntas.map((p) => p.level_id).filter(Boolean))];
  let levels = [];
  if (levelIds.length) {
    const { data: levelRows, error: levelErr } = await supabase
      .from('levels')
      .select('id, nombre')
      .in('id', levelIds);
    if (levelErr) throw levelErr;
    levels = levelRows || [];
  }

  return buildPreguntaMetaMap(preguntas, levels);
}

export default function LevelsEstadisticasPanel({ userId, displayName = '' }) {
  const [rows, setRows] = useState([]);
  const [partNames, setPartNames] = useState({});
  const [preguntaMeta, setPreguntaMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setPartNames({});
      setPreguntaMeta({});
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
          setError(qErr.message || 'No se pudieron cargar las estadísticas.');
          setRows([]);
          setPartNames({});
          setPreguntaMeta({});
          setLoading(false);
          return;
        }

        const list = data || [];
        setRows(list);

        const partIds = [...new Set(list.map((r) => r.parte_id).filter(Boolean))];
        const preguntaIds = [...new Set(list.map((r) => r.pregunta_id).filter(Boolean))];

        const [partsResult, meta] = await Promise.all([
          partIds.length
            ? supabase.from('levels_partes').select('id, nombre_parte').in('id', partIds)
            : Promise.resolve({ data: [], error: null }),
          fetchPreguntaMeta(preguntaIds),
        ]);

        if (cancelled) return;

        if (partsResult.error) {
          setPartNames({});
        } else if (partsResult.data?.length) {
          const map = {};
          partsResult.data.forEach((p) => {
            map[p.id] = formatLevelsPartDisplayName(p.nombre_parte) || p.id;
          });
          setPartNames(map);
        } else {
          setPartNames({});
        }

        setPreguntaMeta(meta);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'No se pudieron cargar las estadísticas.');
          setRows([]);
          setPartNames({});
          setPreguntaMeta({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const chartsByLevel = useMemo(
    () => aggregateLevelsStatsByPart(rows, { partNames, preguntaMeta }),
    [rows, partNames, preguntaMeta],
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        accesos: acc.accesos + (r.accesos || 0),
        evaluadas: acc.evaluadas + (r.respuestas_evaluadas || 0),
        correctas: acc.correctas + (r.respuestas_correctas || 0),
        incorrectas: acc.incorrectas + (r.respuestas_incorrectas || 0),
      }),
      { accesos: 0, evaluadas: 0, correctas: 0, incorrectas: 0 },
    );
  }, [rows]);

  const pctGlobal =
    totals.evaluadas > 0 ? Math.round((100 * totals.correctas) / totals.evaluadas) : null;

  if (!userId) return null;

  return (
    <section className="profile-section">
      <div className="section-head">
        <h2>📘 Levels — tu práctica{displayName ? ` (${displayName})` : ''}</h2>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#555', maxWidth: '52rem' }}>
          Resumen por nivel (A2, B1, B2…) y por parte del examen. Solo tú ves esta información.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#666', padding: '1rem 0' }}>Cargando estadísticas…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c', padding: '0.75rem 0' }}>{error}</p>
      ) : rows.length === 0 ? (
        <p style={{ color: '#666', padding: '0.75rem 0' }}>
          Aún no hay datos. Practica en{' '}
          <a href="/niveles" style={{ color: '#0070f3' }}>
            Levels
          </a>{' '}
          para que aparezcan aquí tus aciertos y fallos.
        </p>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <div className="stat-number">{totals.accesos}</div>
                <div className="stat-label">Accesos a bloques</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{totals.correctas}</div>
                <div className="stat-label">Respuestas correctas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-number">{totals.incorrectas}</div>
                <div className="stat-label">Respuestas incorrectas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{pctGlobal != null ? `${pctGlobal}%` : '—'}</div>
                <div className="stat-label">Acierto global (sobre evaluadas)</div>
              </div>
            </div>
          </div>

          <LevelsStatsChartsCarousel charts={chartsByLevel} />
        </>
      )}
    </section>
  );
}
