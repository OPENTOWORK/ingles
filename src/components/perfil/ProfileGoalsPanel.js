'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  DEFAULT_PROFILE_GOALS,
  evaluateGoalItem,
  fetchProfileGoalsProgress,
  GOAL_ITEMS,
  normalizeStoredGoals,
} from '@/lib/profileGoalsProgress';
import styles from './ProfileGoalsPanel.module.css';

function storageKey(userId) {
  return `profile_goals_${userId}`;
}

export default function ProfileGoalsPanel({ userId }) {
  const [targets, setTargets] = useState({ ...DEFAULT_PROFILE_GOALS });
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const p = await fetchProfileGoalsProgress(supabase, userId);
      setProgress(p);
    } catch {
      setProgress({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    const stored = normalizeStoredGoals(
      JSON.parse(localStorage.getItem(storageKey(userId)) || '{}'),
    );
    setTargets(stored);
    loadProgress();
    return undefined;
  }, [userId, loadProgress]);

  const evaluated = useMemo(() => {
    if (!progress) return [];
    return GOAL_ITEMS.map((item) => {
      const current = progress[item.progressKey] ?? 0;
      const target = targets[item.targetKey] ?? DEFAULT_PROFILE_GOALS[item.targetKey];
      return { ...item, ...evaluateGoalItem(progress, target, current), target };
    });
  }, [progress, targets]);

  const completedCount = evaluated.filter((g) => g.done).length;
  const totalGoals = evaluated.length;

  const handleTargetChange = (targetKey, value) => {
    const n = Math.max(0, Number(value) || 0);
    setTargets((prev) => ({ ...prev, [targetKey]: n }));
    setSaveMsg('');
  };

  const handleSave = () => {
    if (!userId) return;
    setSaving(true);
    localStorage.setItem(storageKey(userId), JSON.stringify(targets));
    setSaving(false);
    setSaveMsg('Goals saved successfully.');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (loading) {
    return <div className={styles.loading}>Loading your goal progress…</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>
            {completedCount}/{totalGoals}
          </span>
          <span className={styles.summaryLabel}>Goals completed</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{progress?.weekDays ?? 0}</span>
          <span className={styles.summaryLabel}>Active days (7 d)</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{progress?.weekMinutes ?? 0}</span>
          <span className={styles.summaryLabel}>Minutos (7 d)</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{progress?.weekParts ?? 0}</span>
          <span className={styles.summaryLabel}>Levels (7 d)</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{progress?.monthTheoryCorrect ?? 0}</span>
          <span className={styles.summaryLabel}>Theory (mes)</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{progress?.monthTrainingDone ?? 0}</span>
          <span className={styles.summaryLabel}>Training (mes)</span>
        </div>
      </div>

      <div
        className={`${styles.motivation} ${
          completedCount === totalGoals ? styles.motivationSuccess : styles.motivationProgress
        }`}
      >
        {completedCount === totalGoals
          ? 'Congratulations! You have completed all goals for this period. Raise your targets and keep going.'
          : `${completedCount} of ${totalGoals} goals completed.`}
      </div>

      <div className={styles.grid}>
        {evaluated.map((goal) => (
          <article
            key={goal.id}
            className={`${styles.card} ${goal.done ? styles.cardDone : ''}`}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  {goal.icon} {goal.title}
                </h3>
                <span className={styles.cardPeriod}>{goal.period}</span>
              </div>
              {goal.done ? (
                <span className={goal.over ? styles.badgeOver : styles.badge}>
                  {goal.over ? 'Exceeded' : 'Done'}
                </span>
              ) : null}
            </div>

            <div className={styles.progressRow}>
              <span className={styles.progressFraction}>
                {goal.current} <span>/ {goal.target} {goal.unit}</span>
              </span>
              <span className={styles.progressFraction} style={{ color: '#64748b', fontSize: 14 }}>
                {goal.pct}%
              </span>
            </div>

            <div className={styles.bar}>
              <div
                className={`${styles.barFill} ${goal.done ? styles.barFillDone : ''}`}
                style={{ width: `${goal.pct}%` }}
                role="progressbar"
                aria-valuenow={goal.pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            <p className={styles.hint}>{goal.hint}</p>

            <div className={styles.targetRow}>
              <span className={styles.targetLabel}>Tu meta</span>
              <input
                type="number"
                className={styles.targetInput}
                value={targets[goal.targetKey]}
                min={goal.min}
                max={goal.max}
                step={goal.step || 1}
                onChange={(e) => handleTargetChange(goal.targetKey, e.target.value)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save goals'}
        </button>
        {saveMsg ? <span className={styles.saveMsg}>{saveMsg}</span> : null}
      </div>
    </div>
  );
}
