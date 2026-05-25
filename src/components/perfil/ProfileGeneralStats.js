'use client';

import { useEffect, useState } from 'react';
import styles from './ProfileGeneralStats.module.css';

const KPI_CARDS = [
  { key: 'completedExams', icon: '📝', label: 'Actividades completadas' },
  { key: 'totalCorrect', icon: '✅', label: 'Respuestas correctas' },
  { key: 'trainingCount', icon: '💪', label: 'Sesiones de entrenamiento' },
  { key: 'levelEstimate', icon: '🎯', label: 'Nivel estimado' },
  { key: 'studyStreak', icon: '🔥', label: 'Días consecutivos' },
  { key: 'totalStudyMinutes', icon: '⏱️', label: 'Tiempo de estudio', format: 'time' },
];

function formatValue(key, value, format) {
  if (format === 'time') {
    const mins = Math.max(0, Number(value) || 0);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }
  return value ?? 0;
}

export default function ProfileGeneralStats({ accessToken, onSummaryLoaded }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    if (!accessToken) {
      setState({ status: 'empty', data: null, error: null });
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/perfil/estadisticas-generales', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'error', data: null, error: json.error || 'Error al cargar' });
          return;
        }
        setState({ status: 'ready', data: json, error: null });
        onSummaryLoaded?.(json.summary);
      } catch {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: 'No se pudo conectar' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (state.status === 'loading') {
    return <div className={styles.loading}>Cargando estadísticas desde tus tablas de progreso…</div>;
  }

  if (state.status === 'error') {
    return <div className={styles.error}>{state.error}</div>;
  }

  if (state.status === 'empty') {
    return <div className={styles.loading}>Inicia sesión para ver tus estadísticas.</div>;
  }

  const summary = state.data?.summary || {};

  return (
    <div className={styles.grid}>
      {KPI_CARDS.map(({ key, icon, label, format }) => (
        <div key={key} className={styles.card}>
          <div className={styles.icon}>{icon}</div>
          <div className={styles.content}>
            <div className={styles.value}>{formatValue(key, summary[key], format)}</div>
            <div className={styles.label}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
