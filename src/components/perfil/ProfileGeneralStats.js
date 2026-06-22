'use client';

import { useEffect, useState } from 'react';
import styles from './ProfileGeneralStats.module.css';

const KPI_CARDS = [
  { key: 'studyStreak', tone: 'amber', label: 'Day streak', icon: 'flame' },
  { key: 'totalStudyMinutes', tone: 'cyan', label: 'Study time', format: 'time', icon: 'clock' },
];

function EpicFlameIcon() {
  return (
    <svg
      className={styles.epicFlame}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="pg-flame-outer" x1="24" y1="44" x2="24" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="0.55" stopColor="#ef4444" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="pg-flame-inner" x1="24" y1="38" x2="24" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <radialGradient id="pg-flame-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 28) rotate(90) scale(10)">
          <stop stopColor="#fff7ed" />
          <stop offset="1" stopColor="#fcd34d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className={styles.epicFlame__glow} cx="24" cy="30" rx="14" ry="10" fill="url(#pg-flame-core)" opacity="0.85" />
      <path
        d="M24 4c-2 8-8 10-8 18 0 6.627 3.582 12 8 12s8-5.373 8-12c0-8-6-10-8-18Z"
        fill="url(#pg-flame-outer)"
      />
      <path
        d="M24 16c-1.2 4.5-4.5 6-4.5 10.5 0 3.59 2.015 6.5 4.5 6.5s4.5-2.91 4.5-6.5c0-4.5-3.3-6-4.5-10.5Z"
        fill="url(#pg-flame-inner)"
      />
      <path
        d="M24 22c-.8 2.8-2.2 3.8-2.2 6.2 0 2.1 1 3.8 2.2 3.8s2.2-1.7 2.2-3.8c0-2.4-1.4-3.4-2.2-6.2Z"
        fill="#fffbeb"
        opacity="0.95"
      />
    </svg>
  );
}

function EpicClockIcon() {
  return (
    <svg
      className={styles.epicClock}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="pg-clock-ring" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="pg-clock-face" x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0f9ff" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <circle className={styles.epicClock__halo} cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="17" fill="url(#pg-clock-face)" stroke="url(#pg-clock-ring)" strokeWidth="3" />
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="10"
          x2="24"
          y2="12.5"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${deg} 24 24)`}
          opacity="0.55"
        />
      ))}
      <circle cx="24" cy="24" r="2.25" fill="#4338ca" />
      <line
        className={styles.epicClock__handHour}
        x1="24"
        y1="24"
        x2="24"
        y2="16"
        stroke="#4338ca"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        className={styles.epicClock__handMin}
        x1="24"
        y1="24"
        x2="31"
        y2="24"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatIcon({ icon, tone }) {
  const wrapClass = `${styles.iconWrap} ${styles[`iconWrap--${tone}`]} ${
    icon === 'flame' ? styles.iconWrapEpicFlame : styles.iconWrapEpicClock
  }`;

  return (
    <div className={wrapClass} aria-hidden>
      {icon === 'flame' ? <EpicFlameIcon /> : <EpicClockIcon />}
    </div>
  );
}

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
    <div className={styles.grid}>
      {KPI_CARDS.map(({ key, tone, label, format, icon }) => (
        <div key={key} className={styles.card}>
          <StatIcon icon={icon} tone={tone} />
          <div className={styles.content}>
            <div className={styles.value}>{formatValue(key, summary[key], format)}</div>
            <div className={styles.label}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
