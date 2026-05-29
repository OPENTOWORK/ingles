'use client';

import { useEffect, useState } from 'react';
import styles from './StudyActivityHeatmap.module.css';

function formatTooltip(day) {
  if (!day?.date) return '';
  const d = new Date(`${day.date}T12:00:00`);
  const label = d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (day.minutes <= 0) return `${label}: no study logged`;
  const sessions =
    day.sessions > 0 ? ` · ${day.sessions} session${day.sessions === 1 ? '' : 's'}` : '';
  const mins =
    day.minutes < 60
      ? `${day.minutes} min`
      : `${Math.floor(day.minutes / 60)} h ${day.minutes % 60} min`;
  return `${label}: ${mins}${sessions}`;
}

export default function StudyActivityHeatmap({ accessToken }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    if (!accessToken) {
      setState({ status: 'empty', data: null, error: null });
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/perfil/actividad', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'error', data: null, error: json.error || 'Failed to load' });
          return;
        }
        setState({ status: 'ready', data: json, error: null });
      } catch {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: 'Could not connect' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (state.status === 'loading') {
    return <div className={styles.loading}>Loading your study activity…</div>;
  }

  if (state.status === 'error') {
    return (
      <div className={styles.empty}>
        {state.error}. Please try again later.
      </div>
    );
  }

  const { summary, weeks, monthLabels, weekdayLabels } = state.data || {};
  const hasActivity = summary?.activeDays > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary?.streak ?? 0}</span>
          <span className={styles.statLabel}>Current streak</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary?.activeDays ?? 0}</span>
          <span className={styles.statLabel}>Active days</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary?.last7MinutesLabel ?? '0 min'}</span>
          <span className={styles.statLabel}>This week</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{summary?.last90MinutesLabel ?? '0 min'}</span>
          <span className={styles.statLabel}>Last 90 days</span>
        </div>
      </div>

      {!hasActivity ? (
        <p className={styles.hint}>
          No activity logged yet. Start practising or take an exam — each session will show up
          here automatically.
        </p>
      ) : null}

      <div className={styles.chartScroll}>
        <div className={styles.chart}>
          <div className={styles.weekdayCol}>
            {(weekdayLabels || []).map((label, i) => (
              <span
                key={`wd-${i}`}
                className={`${styles.weekdayLabel}${[1, 3, 5].includes(i) ? '' : ` ${styles.weekdayLabelMuted}`}`}
              >
                {[1, 3, 5].includes(i) ? label : ''}
              </span>
            ))}
          </div>
          <div className={styles.gridArea}>
            <div className={styles.monthRow}>
              {(weeks || []).map((week, weekIndex) => {
                const month = monthLabels?.find((m) => m.weekIndex === weekIndex);
                return (
                  <div key={`m-${weekIndex}`} className={styles.monthSlot}>
                    {month ? <span className={styles.monthLabel}>{month.label}</span> : null}
                  </div>
                );
              })}
            </div>
            <div className={styles.weeks}>
              {(weeks || []).map((week, weekIndex) => (
                <div key={`w-${weekIndex}`} className={styles.week}>
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <span
                          key={`e-${weekIndex}-${dayIndex}`}
                          className={`${styles.day} ${styles.dayEmpty}`}
                          aria-hidden
                        />
                      );
                    }
                    return (
                      <span
                        key={day.date}
                        className={`${styles.day} ${styles[`dayLevel${day.level}`]}`}
                        title={formatTooltip(day)}
                        aria-label={formatTooltip(day)}
                        role="img"
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span>Less</span>
        <div className={styles.legendSquares}>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`${styles.legendSquare} ${styles[`legendSquare${level}`]}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
