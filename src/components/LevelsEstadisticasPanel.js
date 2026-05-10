'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export default function LevelsEstadisticasPanel({ userId, displayName = '' }) {
  const [rows, setRows] = useState([]);
  const [partNames, setPartNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setPartNames({});
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');

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
        setLoading(false);
        return;
      }

      const list = data || [];
      setRows(list);

      const partIds = [...new Set(list.map((r) => r.parte_id).filter(Boolean))];
      if (partIds.length === 0) {
        setPartNames({});
        setLoading(false);
        return;
      }

      const { data: parts, error: pErr } = await supabase
        .from('levels_partes')
        .select('id, nombre_parte')
        .in('id', partIds);

      if (cancelled) return;

      if (!pErr && parts?.length) {
        const map = {};
        parts.forEach((p) => {
          map[p.id] = formatLevelsPartDisplayName(p.nombre_parte) || p.id;
        });
        setPartNames(map);
      } else {
        setPartNames({});
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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
        <h2>📘 Levels (B2) — tu práctica{displayName ? ` (${displayName})` : ''}</h2>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#555', maxWidth: '52rem' }}>
          Resumen de accesos, aciertos y fallos en ejercicios B2 (Reading y Use of English). Solo tú
          ves esta información: en la base de datos solo se devuelven tus filas cuando estás
          identificado (mismo id que en tu cuenta).
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#666', padding: '1rem 0' }}>Cargando estadísticas…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c', padding: '0.75rem 0' }}>{error}</p>
      ) : rows.length === 0 ? (
        <p style={{ color: '#666', padding: '0.75rem 0' }}>
          Aún no hay datos. Practica en{' '}
          <a href="/niveles/b2/exam-reading" style={{ color: '#0070f3' }}>
            B2 Reading
          </a>{' '}
          o{' '}
          <a href="/niveles/b2/exam-useofenglish" style={{ color: '#0070f3' }}>
            B2 Use of English
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

          <div
            style={{
              overflowX: 'auto',
              border: '1px solid #eaeaea',
              borderRadius: 12,
              background: '#fff',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Parte</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Ejercicio</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Accesos</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Eval.</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>✓</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>✗</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Último %</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Mejor %</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const partLabel = r.parte_id ? partNames[r.parte_id] || '—' : '—';
                  const pid = r.pregunta_id || '';
                  const ejShort = pid.length > 10 ? `${pid.slice(0, 8)}…` : pid || '—';
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid #eaeaea' }}>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>{partLabel}</td>
                      <td style={{ padding: '10px 12px', verticalAlign: 'top', fontFamily: 'monospace' }}>
                        {ejShort}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{r.accesos ?? 0}</td>
                      <td style={{ padding: '10px 12px' }}>{r.respuestas_evaluadas ?? 0}</td>
                      <td style={{ padding: '10px 12px', color: '#15803d' }}>
                        {r.respuestas_correctas ?? 0}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#b91c1c' }}>
                        {r.respuestas_incorrectas ?? 0}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {r.ultimo_porcentaje != null ? `${Number(r.ultimo_porcentaje).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {r.mejor_porcentaje != null ? `${Number(r.mejor_porcentaje).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {formatDate(r.ultima_interaccion)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
