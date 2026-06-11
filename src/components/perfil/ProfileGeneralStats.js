'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Dumbbell,
  Flame,
  TrendingUp,
} from 'lucide-react';
import styles from './ProfileGeneralStats.module.css';

const KPI_CARDS = [
  { key: 'completedExams', Icon: ClipboardList, tone: 'blue', label: 'Activities completed' },
  { key: 'totalCorrect', Icon: CheckCircle2, tone: 'green', label: 'Correct answers' },
  { key: 'trainingCount', Icon: Dumbbell, tone: 'slate', label: 'Training sessions' },
  { key: 'levelEstimate', Icon: TrendingUp, tone: 'violet', label: 'Estimated level' },
  { key: 'studyStreak', Icon: Flame, tone: 'amber', label: 'Day streak' },
  { key: 'totalStudyMinutes', Icon: Clock, tone: 'cyan', label: 'Study time', format: 'time' },
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
          setState({ status: 'error', data: null, error: json.error || 'Failed to load' });
          return;
        }
        setState({ status: 'ready', data: json, error: null });
        onSummaryLoaded?.(json.summary);
      } catch {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: 'Could not connect' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, onSummaryLoaded]);

  if (state.status === 'loading') {
    return <div className={styles.loading}>Loading stats from your progress data…</div>;
  }

  if (state.status === 'error') {
    return <div className={styles.error}>{state.error}</div>;
  }

  if (state.status === 'empty') {
    return <div className={styles.loading}>Sign in to view your statistics.</div>;
  }

  const summary = state.data?.summary || {};

  return (
    <>
      <p className={styles.sourceNote}>
        Live totals from your practice in Levels, Theory and Training (Supabase).
      </p>
      <div className={styles.grid}>
        {KPI_CARDS.map(({ key, Icon, tone, label, format }) => (
          <div key={key} className={styles.card}>
            <div className={`${styles.iconWrap} ${styles[`iconWrap--${tone}`]}`} aria-hidden>
              <Icon className={styles.icon} strokeWidth={2} />
            </div>
            <div className={styles.content}>
              <div className={styles.value}>{formatValue(key, summary[key], format)}</div>
              <div className={styles.label}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
