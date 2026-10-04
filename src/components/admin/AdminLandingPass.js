'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/utils/supabaseClient';
import panelStyles from './AdminAnalyticsPanels.module.css';
import styles from './AdminLandingPass.module.css';

export default function AdminLandingPass() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [summary, setSummary] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    if (!open || started.current) return undefined;
    started.current = true;
    let ignore = false;
    let finished = false;
    setState('loading');

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch('/api/admin/visitors/landing-pass/', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const body = await res.json().catch(() => ({}));
        if (ignore) return;
        if (!res.ok) {
          started.current = false;
          setState('error');
          return;
        }
        setSummary(body);
        finished = true;
        setState('ready');
      } catch {
        if (!ignore) {
          started.current = false;
          setState('error');
        }
      }
    })();

    return () => {
      ignore = true;
      if (!finished) started.current = false;
    };
  }, [open]);

  const stayed = summary?.stayed || 0;
  const passed = summary?.passed || 0;
  const destinations = Array.isArray(summary?.destinations) ? summary.destinations : [];
  const chart = [
    { name: 'No pasa', total: stayed, fill: '#f59e0b' },
    { name: 'Sí pasa', total: passed, fill: '#10b981' },
  ];

  return (
    <div className={`${panelStyles.chartCard} ${open ? '' : panelStyles.chartCardCollapsed}`}>
      <button
        type="button"
        className={panelStyles.chartCardToggle}
        aria-expanded={open}
        aria-controls="admin-landing-charts"
        onClick={() => setOpen((current) => !current)}
      >
        <h3 className={panelStyles.chartCardTitle}>Gráficos</h3>
        <span className={panelStyles.panelChevron} aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open ? (
        <div id="admin-landing-charts">
          <h3 className={styles.chartTitle}>De la landing al resto</h3>
          <p className={styles.subtitle}>
            Visitas que llegan a la landing de B2. No pasa se queda ahí. Sí pasa abre otra página.
          </p>
          {state === 'loading' || state === 'idle' ? <p className={styles.status}>Cargando…</p> : null}
          {state === 'error' ? <p className={styles.error}>No se pudo leer este gráfico.</p> : null}
          {state === 'ready' && summary?.total === 0 ? (
            <p className={styles.status}>Todavía no hay visitas a la landing.</p>
          ) : null}
          {state === 'ready' && summary?.total > 0 ? (
            <>
              <div className={styles.figures}>
                <p>
                  <strong>{stayed.toLocaleString('es-ES')}</strong>
                  <span>No pasa · {summary.stayedRate}%</span>
                </p>
                <p>
                  <strong>{passed.toLocaleString('es-ES')}</strong>
                  <span>Sí pasa · {summary.passedRate}%</span>
                </p>
              </div>
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total" name="Visitas" radius={[6, 6, 0, 0]}>
                      {chart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <h3 className={styles.chartTitle}>A qué otras partes van</h3>
              {destinations.length === 0 ? (
                <p className={styles.status}>Nadie ha abierto otra página después de la landing.</p>
              ) : (
                <div className={styles.chart} style={{ height: Math.max(180, destinations.length * 36 + 24) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={destinations}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={148}
                        tick={{ fill: '#334155', fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="total" name="Visitas" fill="#6366f1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
